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
// Guards every res.setHeader call that happens asynchronously (finish / close
// events) so we never hit ERR_HTTP_HEADERS_SENT.
const safeSetHeader = (res, name, value) => {
  try {
    // headersSent  → response is already flushed to the socket
    // writableEnded → stream has been ended (res.end() was called)
    if (!res.headersSent && !res.writableEnded) {
      res.setHeader(name, value);
    }
  } catch (_) {
    // swallow — nothing useful we can do at this point
  }
};

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
// ══════════════════════════════════════════════════════════════════════════════
const ALLOWED_ORIGINS = (() => {
  const base = [
    env.CLIENT_URL,
    'http://localhost:3000',
    'http://localhost:5173',
    'https://expenztracker.vercel.app/',
    'http://localhost:4173',
  ].filter(Boolean);

  const extra = (process.env.EXTRA_ORIGINS || '')
    .split(',').map((o) => o.trim()).filter(Boolean);

  return [...new Set([...base, ...extra])];
})();

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (env.IS_DEVELOPMENT) {
      if (!ALLOWED_ORIGINS.includes(origin)) {
        log.warn('CORS — unknown origin allowed in dev', { origin });
      }
      return cb(null, true);
    }
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    log.warn('CORS — blocked unlisted origin', { origin });
    return cb(Object.assign(new Error(`CORS: origin "${origin}" not allowed`), { status: 403 }));
  },
  methods        : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders : ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Api-Version'],
  exposedHeaders : ['X-Request-Id', 'X-Response-Time'],
  credentials    : true,
  maxAge         : 86_400,
};

app.use(cors(corsOptions));
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
// 4. REQUEST ENRICHMENT  ← ROOT CAUSE FIX IS HERE
//
//    The previous version attached a `res.on('finish')` listener to set
//    X-Response-Time.  By the time 'finish' fires the response is already
//    sent, so res.setHeader() throws ERR_HTTP_HEADERS_SENT and the
//    uncaughtException handler kills the process.
//
//    Fix: record timing with process.hrtime.bigint() at request start and
//    write the header BEFORE the body is flushed by overriding res.end().
//    res.end() is the last thing Express calls — headers are still open at
//    that point — so it is always safe to set a header there.
// ══════════════════════════════════════════════════════════════════════════════
app.use((req, res, next) => {
  // ── Request ID ────────────────────────────────────────────────────────────
  const reqId = req.headers['x-request-id'] || generateId();
  req.id       = reqId;
  // Safe to set here — response hasn't started yet
  res.setHeader('X-Request-Id', reqId);

  // ── Hi-res start time ─────────────────────────────────────────────────────
  const startNs = process.hrtime.bigint();

  // ── Patch res.end to inject timing header BEFORE the response closes ──────
  // We wrap the original res.end so we run synchronously before the socket
  // is flushed.  Headers are still writable at this exact moment.
  const _end = res.end.bind(res);
  res.end = function patchedEnd(...args) {
    const ms = (Number(process.hrtime.bigint() - startNs) / 1e6).toFixed(2);
    safeSetHeader(res, 'X-Response-Time', `${ms}ms`);
    return _end(...args);
  };

  next();
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. REQUEST LOGGER  (built-in, replaces morgan)
// ══════════════════════════════════════════════════════════════════════════════
app.use((req, res, next) => {
  // Skip noisy health-check polling in production logs
  if (env.IS_PRODUCTION && req.url === '/api/health') return next();

  const startNs = process.hrtime.bigint();

  // Use 'finish' only for LOGGING — never for setting headers
  res.on('finish', () => {
    const ms  = (Number(process.hrtime.bigint() - startNs) / 1e6).toFixed(2);
    const sc  = res.statusCode;
    const col = sc >= 500 ? red : sc >= 400 ? yellow : sc >= 300 ? cyan : green;

    const line = [
      dim(new Date().toISOString()),
      magenta(req.method.padEnd(7)),
      bold(req.originalUrl.padEnd(40)),
      col(String(sc)),
      dim(`${ms}ms`),
      dim(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '-'),
      dim(req.id),
    ].join('  ');

    if (sc >= 500) console.error(line);
    else if (sc >= 400) console.warn(line);
    else console.log(line);
  });

  next();
});

// ══════════════════════════════════════════════════════════════════════════════
// 6. RATE LIMITER  (built-in, Map-backed)
// ══════════════════════════════════════════════════════════════════════════════
const _rlWindows = new Map();

const rateLimiter = ({
  windowMs = env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1_000,
  max      = env.RATE_LIMIT_MAX       ?? 100,
  keyFn    = (req) => req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown',
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

  // Headers are safe here — we're in the middleware pipeline, not in 'finish'
  res.setHeader('X-RateLimit-Limit',     String(max));
  res.setHeader('X-RateLimit-Remaining', String(remaining));
  res.setHeader('X-RateLimit-Reset',     String(Math.ceil(slot.resetAt / 1000)));

  if (slot.count > max) {
    log.warn('Rate limit exceeded', { key, count: slot.count, max });
    res.setHeader('Retry-After', String(Math.ceil((slot.resetAt - now) / 1000)));
    return res.status(429).json({
      success      : false,
      error        : 'Too Many Requests',
      message      : `Rate limit exceeded. Try again in ${Math.ceil((slot.resetAt - now) / 1000)}s.`,
      retryAfterMs : slot.resetAt - now,
    });
  }

  next();
};

// Purge stale windows every 10 min
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of _rlWindows) {
    if (now > v.resetAt) _rlWindows.delete(k);
  }
}, 10 * 60 * 1_000).unref();

app.use(rateLimiter());

const authLimiter = rateLimiter({
  max  : 20,
  keyFn: (req) => `auth:${req.headers['x-forwarded-for'] || req.socket?.remoteAddress}`,
});

// ══════════════════════════════════════════════════════════════════════════════
// 7. JSON PARSE ERROR GUARD
// ══════════════════════════════════════════════════════════════════════════════
// express.json() calls next(err) when the body is malformed.
// This 4-argument middleware catches it before the global error handler.
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
// 8. ROOT
// ══════════════════════════════════════════════════════════════════════════════
app.get('/', (_req, res) => {
  res.status(200).json({
    name       : app.locals.name,
    version    : app.locals.version,
    status     : 'operational',
    environment: env.NODE_ENV,
    endpoints  : {
      health   : '/api/health',
      metrics  : '/api/metrics',
      routes   : '/api/routes',
      report   : '/api/report',
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
  routes: ['auth','expenses','income','budgets','reports','dashboard'],
});

// ══════════════════════════════════════════════════════════════════════════════
// 10. 404 + GLOBAL ERROR HANDLER  (must be last)
// ══════════════════════════════════════════════════════════════════════════════
app.use(notFound);
app.use(errorHandler);

// ─── Utility ──────────────────────────────────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

module.exports = app;