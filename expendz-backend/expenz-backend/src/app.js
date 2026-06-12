// src/app.js
'use strict';

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const env = require('./config/env');

// ─── Route modules ────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/authRoutes');
const expenseRoutes   = require('./routes/expenseRoutes');
const incomeRoutes    = require('./routes/incomeRoutes');
const budgetRoutes    = require('./routes/budgetRoutes');
const reportRoutes    = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const { notFound, errorHandler } = require('./middleware/errorHandler');

// ─── ANSI helpers ─────────────────────────────────────────────────────────────
const R       = '\x1b[0m';
const bold    = (s) => `\x1b[1m${s}${R}`;
const red     = (s) => `\x1b[31m${s}${R}`;
const green   = (s) => `\x1b[32m${s}${R}`;
const yellow  = (s) => `\x1b[33m${s}${R}`;
const cyan    = (s) => `\x1b[36m${s}${R}`;
const dim     = (s) => `\x1b[2m${s}${R}`;
const magenta = (s) => `\x1b[35m${s}${R}`;

const tag = cyan('[app]');

const log = {
  info : (msg, meta) => console.log (`${tag} ${green ('✔')}  ${msg}`, meta ? dim(JSON.stringify(meta)) : ''),
  warn : (msg, meta) => console.warn(`${tag} ${yellow('⚠')}  ${msg}`, meta ? dim(JSON.stringify(meta)) : ''),
  error: (msg, meta) => console.error(`${tag} ${red   ('✖')}  ${bold(msg)}`, meta ? dim(JSON.stringify(meta)) : ''),
};

// ─── Safe header setter ───────────────────────────────────────────────────────
const safeSetHeader = (res, name, value) => {
  try {
    if (!res.headersSent && !res.writableEnded) {
      res.setHeader(name, value);
    }
  } catch (_) { /* swallow */ }
};

// ─── Utility ──────────────────────────────────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

// ─── Normalise an origin string ───────────────────────────────────────────────
// Strips trailing slashes so 'https://example.com/' and
// 'https://example.com' both match the same entry.
const normaliseOrigin = (o) => (typeof o === 'string' ? o.replace(/\/+$/, '') : o);

// ═══════════════════════════════════════════════════════════════════════════════
const app = express();

app.set('trust proxy', 1);
app.locals.startedAt = Date.now();
app.locals.version   = '1.0.0';
app.locals.name      = 'Expenz API';

// ══════════════════════════════════════════════════════════════════════════════
// 1. SECURITY HEADERS
// ══════════════════════════════════════════════════════════════════════════════
app.use(helmet({
  crossOriginResourcePolicy : { policy: 'cross-origin' },
  crossOriginOpenerPolicy   : { policy: 'same-origin-allow-popups' },
  contentSecurityPolicy     : env.IS_PRODUCTION ? undefined : false,
  hsts: env.IS_PRODUCTION
    ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
    : false,
}));

// ══════════════════════════════════════════════════════════════════════════════
// 2. CORS
//
// ROOT CAUSE of the original error:
//   'https://expenztracker.vercel.app/' had a trailing slash — browsers send
//   the origin WITHOUT a trailing slash, so the === check always failed.
//
// Fix: normalise every entry with normaliseOrigin() before storing.
// ══════════════════════════════════════════════════════════════════════════════
const ALLOWED_ORIGINS = (() => {
  const base = [
    env.CLIENT_URL,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    // ✅ NO trailing slash — browsers omit it in the Origin header
    'https://expenztracker.vercel.app',
  ].filter(Boolean).map(normaliseOrigin);

  const extra = (process.env.EXTRA_ORIGINS || '')
    .split(',')
    .map((o) => normaliseOrigin(o.trim()))
    .filter(Boolean);

  const all = [...new Set([...base, ...extra])];
  log.info('CORS allowed origins', { origins: all });
  return all;
})();

const corsOptions = {
  origin: (origin, cb) => {
    // No origin = same-origin request, curl, Postman, mobile app → allow
    if (!origin) return cb(null, true);

    // Normalise browser-sent origin before comparing
    const normOrigin = normaliseOrigin(origin);

    if (env.IS_DEVELOPMENT) {
      if (!ALLOWED_ORIGINS.includes(normOrigin)) {
        log.warn('CORS — unlisted origin allowed in dev', { origin: normOrigin });
      }
      return cb(null, true);
    }

    if (ALLOWED_ORIGINS.includes(normOrigin)) return cb(null, true);

    log.warn('CORS — blocked unlisted origin', { origin: normOrigin, allowed: ALLOWED_ORIGINS });
    return cb(
      Object.assign(new Error(`CORS: origin "${normOrigin}" not allowed`), { status: 403 })
    );
  },
  methods        : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders : ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Api-Version'],
  exposedHeaders : ['X-Request-Id', 'X-Response-Time'],
  // ✅ Must be true when the frontend sends Authorization header or cookies
  credentials    : true,
  // Cache preflight for 24 h — reduces OPTIONS round-trips
  maxAge         : 86_400,
  optionsSuccessStatus: 204,
};

// ── Apply CORS BEFORE every other middleware / route ─────────────────────────
app.use(cors(corsOptions));

// ── Explicitly handle every OPTIONS preflight ─────────────────────────────────
// Some browsers send a preflight even for simple requests when
// Authorization is present, so we must respond to OPTIONS on all routes.
app.options('*', cors(corsOptions));

// ══════════════════════════════════════════════════════════════════════════════
// 3. BODY PARSERS
// ══════════════════════════════════════════════════════════════════════════════
app.use(express.json({
  limit  : '10mb',
  strict : true,
  verify : (req, _res, buf) => { req.rawBody = buf; },
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ══════════════════════════════════════════════════════════════════════════════
// 4. REQUEST ENRICHMENT
//    Writes X-Response-Time by wrapping res.end() — headers are still
//    open at that exact moment so it is always safe.
// ══════════════════════════════════════════════════════════════════════════════
app.use((req, res, next) => {
  // ── Request ID ────────────────────────────────────────────────────────────
  const reqId = req.headers['x-request-id'] || generateId();
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);

  // ── Hi-res start time ─────────────────────────────────────────────────────
  const startNs = process.hrtime.bigint();

  // ── Patch res.end to inject timing header BEFORE the socket flushes ───────
  const _end = res.end.bind(res);
  res.end = function patchedEnd(...args) {
    const ms = (Number(process.hrtime.bigint() - startNs) / 1e6).toFixed(2);
    safeSetHeader(res, 'X-Response-Time', `${ms}ms`);
    return _end(...args);
  };

  next();
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. REQUEST LOGGER
// ══════════════════════════════════════════════════════════════════════════════
app.use((req, res, next) => {
  // Suppress health-check noise in production
  if (env.IS_PRODUCTION && req.url === '/api/health') return next();

  const startNs = process.hrtime.bigint();

  res.on('finish', () => {
    const ms  = (Number(process.hrtime.bigint() - startNs) / 1e6).toFixed(2);
    const sc  = res.statusCode;
    const col = sc >= 500 ? red : sc >= 400 ? yellow : sc >= 300 ? cyan : green;

    const line = [
      dim(new Date().toISOString()),
      magenta(req.method.padEnd(7)),
      bold((req.originalUrl || req.url).padEnd(40)),
      col(String(sc)),
      dim(`${ms}ms`),
      dim(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '-'),
      dim(req.id),
    ].join('  ');

    if (sc >= 500)      console.error(line);
    else if (sc >= 400) console.warn(line);
    else                console.log(line);
  });

  next();
});

// ══════════════════════════════════════════════════════════════════════════════
// 6. RATE LIMITER  (Map-backed, no external dependency)
// ══════════════════════════════════════════════════════════════════════════════
const _rlWindows = new Map();

const rateLimiter = ({
  windowMs = env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1_000,
  max      = env.RATE_LIMIT_MAX       ?? 100,
  keyFn    = (req) =>
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress                            ||
    'unknown',
} = {}) => (req, res, next) => {
  const key = keyFn(req);
  const now = Date.now();
  let slot  = _rlWindows.get(key);

  if (!slot || now > slot.resetAt) {
    slot = { count: 0, resetAt: now + windowMs };
    _rlWindows.set(key, slot);
  }

  slot.count++;
  const remaining = Math.max(0, max - slot.count);

  res.setHeader('X-RateLimit-Limit',     String(max));
  res.setHeader('X-RateLimit-Remaining', String(remaining));
  res.setHeader('X-RateLimit-Reset',     String(Math.ceil(slot.resetAt / 1000)));

  if (slot.count > max) {
    const retryAfterSec = Math.ceil((slot.resetAt - now) / 1000);
    log.warn('Rate limit exceeded', { key, count: slot.count, max });
    res.setHeader('Retry-After', String(retryAfterSec));
    return res.status(429).json({
      success      : false,
      error        : 'Too Many Requests',
      message      : `Rate limit exceeded. Try again in ${retryAfterSec}s.`,
      retryAfterMs : slot.resetAt - now,
    });
  }

  next();
};

// Purge stale windows every 10 min to avoid memory leak
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of _rlWindows) {
    if (now > v.resetAt) _rlWindows.delete(k);
  }
}, 10 * 60 * 1_000).unref();

app.use(rateLimiter());

const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1_000,
  max     : 20,
  keyFn   : (req) =>
    `auth:${req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress}`,
});

// ══════════════════════════════════════════════════════════════════════════════
// 7. JSON PARSE ERROR GUARD
// ══════════════════════════════════════════════════════════════════════════════
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success : false,
      error   : 'Bad Request',
      message : 'Request body is not valid JSON.',
      hint    : 'Ensure Content-Type is application/json and body is well-formed.',
      reqId   : req.id,
    });
  }
  next(err);
});

// ══════════════════════════════════════════════════════════════════════════════
// 8. SYSTEM ROUTES  (health, metrics, ping — no auth required)
// ══════════════════════════════════════════════════════════════════════════════
app.get('/', (_req, res) => {
  res.status(200).json({
    name        : app.locals.name,
    version     : app.locals.version,
    status      : 'operational',
    environment : env.NODE_ENV,
    uptimeMs    : Date.now() - app.locals.startedAt,
    endpoints   : {
      health   : '/api/health',
      metrics  : '/api/metrics',
      ping     : '/api/ping',
      auth     : '/api/auth',
      expenses : '/api/expenses',
      income   : '/api/income',
      budgets  : '/api/budgets',
      reports  : '/api/reports',
      dashboard: '/api/dashboard',
    },
  });
});

// ── Health — used by keep-alive pinger and uptime monitors ────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status  : 'ok',
    uptime  : process.uptime(),
    memory  : process.memoryUsage(),
    ts      : new Date().toISOString(),
  });
});

// ── Ping — lightest possible response for keep-alive ─────────────────────────
app.get('/api/ping', (_req, res) => res.status(200).json({ pong: true }));

// ── Metrics ───────────────────────────────────────────────────────────────────
app.get('/api/metrics', (_req, res) => {
  const mem = process.memoryUsage();
  res.status(200).json({
    uptimeMs     : Date.now() - app.locals.startedAt,
    uptimeSec    : process.uptime(),
    memHeapUsed  : mem.heapUsed,
    memHeapTotal : mem.heapTotal,
    memRss       : mem.rss,
    rateLimitKeys: _rlWindows.size,
    nodeVersion  : process.version,
    env          : env.NODE_ENV,
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 9. API ROUTES
// ══════════════════════════════════════════════════════════════════════════════
const API = '/api';

app.use(`${API}/auth`,      authLimiter,  authRoutes);
app.use(`${API}/expenses`,                expenseRoutes);
app.use(`${API}/income`,                  incomeRoutes);
app.use(`${API}/budgets`,                 budgetRoutes);
app.use(`${API}/reports`,                 reportRoutes);
app.use(`${API}/dashboard`,               dashboardRoutes);

log.info('Mounted API routes', {
  routes: ['auth', 'expenses', 'income', 'budgets', 'reports', 'dashboard'],
});

// ══════════════════════════════════════════════════════════════════════════════
// 10. 404 + GLOBAL ERROR HANDLER  (must be last)
// ══════════════════════════════════════════════════════════════════════════════
app.use(notFound);
app.use(errorHandler);

module.exports = app;