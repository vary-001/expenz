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

// ─── ANSI helpers (no 3rd party) ──────────────────────────────────────────────
const R      = '\x1b[0m';
const bold   = (s) => `\x1b[1m${s}${R}`;
const red    = (s) => `\x1b[31m${s}${R}`;
const green  = (s) => `\x1b[32m${s}${R}`;
const yellow = (s) => `\x1b[33m${s}${R}`;
const cyan   = (s) => `\x1b[36m${s}${R}`;
const dim    = (s) => `\x1b[2m${s}${R}`;
const magenta= (s) => `\x1b[35m${s}${R}`;

const tag = cyan('[app]');

// ─── Tiny app-scoped logger ───────────────────────────────────────────────────
const log = {
  info : (msg, meta) => console.log (`${tag} ${green ('✔')}  ${msg}`, meta ? dim(JSON.stringify(meta)) : ''),
  warn : (msg, meta) => console.warn(`${tag} ${yellow('⚠')}  ${msg}`, meta ? dim(JSON.stringify(meta)) : ''),
  error: (msg, meta) => console.error(`${tag} ${red   ('✖')}  ${bold(msg)}`, meta ? dim(JSON.stringify(meta)) : ''),
};

// ═══════════════════════════════════════════════════════════════════════════════
// APP FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
const app = express();

// ─── Trust proxy (Render / Railway / Heroku sit behind a proxy) ───────────────
app.set('trust proxy', 1);

// Expose app creation timestamp for uptime calculations in server.js
app.locals.startedAt = Date.now();
app.locals.version   = '1.0.0';
app.locals.name      = 'Expenz API';

// ══════════════════════════════════════════════════════════════════════════════
// 1. SECURITY HEADERS  (helmet)
// ══════════════════════════════════════════════════════════════════════════════
app.use(helmet({
  crossOriginResourcePolicy : { policy: 'cross-origin' },
  crossOriginOpenerPolicy   : { policy: 'same-origin-allow-popups' },
  contentSecurityPolicy     : env.IS_PRODUCTION
    ? undefined   // use helmet defaults in production
    : false,      // relax in development (allows Postman / browser tools)
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
    'http://localhost:5173',   // Vite dev server
    'http://localhost:4173',   // Vite preview
  ].filter(Boolean);

  // Allow extra origins via comma-separated env var EXTRA_ORIGINS
  const extra = (process.env.EXTRA_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  return [...new Set([...base, ...extra])];
})();

const corsOptions = {
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return cb(null, true);

    if (env.IS_DEVELOPMENT) {
      // In development accept everything but still log unfamiliar origins
      if (!ALLOWED_ORIGINS.includes(origin)) {
        log.warn(`CORS — unknown origin allowed in dev mode`, { origin });
      }
      return cb(null, true);
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
      return cb(null, true);
    }

    log.warn(`CORS — blocked request from unlisted origin`, { origin });
    return cb(Object.assign(new Error(`CORS: origin "${origin}" is not allowed`), { status: 403 }));
  },
  methods         : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders  : ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Api-Version'],
  exposedHeaders  : ['X-Request-Id', 'X-Response-Time'],
  credentials     : true,
  maxAge          : 86_400,   // cache preflight 24 h
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));   // handle preflight for every route

// ══════════════════════════════════════════════════════════════════════════════
// 3. BODY PARSERS
// ══════════════════════════════════════════════════════════════════════════════
app.use(express.json({
  limit  : '10mb',
  strict : true,                        // only accept arrays & objects
  verify : (req, _res, buf) => {        // attach raw body for webhook sig checks
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ══════════════════════════════════════════════════════════════════════════════
// 4. REQUEST ENRICHMENT  (request-id, response-time header)
// ══════════════════════════════════════════════════════════════════════════════
app.use((req, res, next) => {
  // Unique request ID — use forwarded ID from proxy or generate our own
  const reqId = req.headers['x-request-id'] || generateId();
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);

  // Start hi-res timer for X-Response-Time header
  const startNs = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = (Number(process.hrtime.bigint() - startNs) / 1e6).toFixed(2);
    res.setHeader('X-Response-Time', `${ms}ms`);
  });

  next();
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. BUILT-IN REQUEST LOGGER  (replaces morgan — no 3rd party)
// ══════════════════════════════════════════════════════════════════════════════
app.use((req, res, next) => {
  // Skip health-check polling noise in production
  if (env.IS_PRODUCTION && req.url === '/api/health') return next();

  const startNs = process.hrtime.bigint();

  res.on('finish', () => {
    const ms  = (Number(process.hrtime.bigint() - startNs) / 1e6).toFixed(2);
    const sc  = res.statusCode;
    const col = sc >= 500 ? red : sc >= 400 ? yellow : sc >= 300 ? cyan : green;

    const parts = [
      dim(new Date().toISOString()),
      magenta(req.method.padEnd(7)),
      bold(req.originalUrl.padEnd(40)),
      col(String(sc)),
      dim(`${ms}ms`),
      dim(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '-'),
      dim(req.id),
    ];

    if (sc >= 500) {
      console.error(parts.join('  '));
    } else if (sc >= 400) {
      console.warn(parts.join('  '));
    } else {
      console.log(parts.join('  '));
    }
  });

  next();
});

// ══════════════════════════════════════════════════════════════════════════════
// 6. BUILT-IN RATE LIMITER  (no 3rd party)
// ══════════════════════════════════════════════════════════════════════════════
const _rlWindows = new Map();   // key → { count, resetAt }

const rateLimiter = ({
  windowMs = env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1_000,
  max      = env.RATE_LIMIT_MAX       ?? 100,
  keyFn    = (req) => req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown',
} = {}) => (req, res, next) => {
  const key  = keyFn(req);
  const now  = Date.now();
  let   slot = _rlWindows.get(key);

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
    log.warn('Rate limit exceeded', { key, count: slot.count, max });
    res.setHeader('Retry-After', String(Math.ceil((slot.resetAt - now) / 1000)));
    return res.status(429).json({
      success : false,
      error   : 'Too Many Requests',
      message : `Rate limit exceeded. Try again after ${Math.ceil((slot.resetAt - now) / 1000)}s.`,
      retryAfterMs: slot.resetAt - now,
    });
  }

  next();
};

// Purge stale windows every 10 min so the Map doesn't grow unbounded
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of _rlWindows) {
    if (now > v.resetAt) _rlWindows.delete(k);
  }
}, 10 * 60 * 1_000).unref();

// Apply rate limiter globally (can also be applied per-router)
app.use(rateLimiter());

// Stricter limiter for auth endpoints (20 req / 15 min)
const authLimiter = rateLimiter({
  max  : 20,
  keyFn: (req) => `auth:${req.headers['x-forwarded-for'] || req.socket?.remoteAddress}`,
});

// ══════════════════════════════════════════════════════════════════════════════
// 7. BUILT-IN JSON PARSE ERROR GUARD
// ══════════════════════════════════════════════════════════════════════════════
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success : false,
      error   : 'Bad Request',
      message : 'Request body is not valid JSON.',
      hint    : 'Check Content-Type header is application/json and body is well-formed.',
      reqId   : req.id,
    });
  }
  next(err);
});

// ══════════════════════════════════════════════════════════════════════════════
// 8. ROOT & META ROUTES
// ══════════════════════════════════════════════════════════════════════════════
app.get('/', (_req, res) => {
  res.status(200).json({
    name       : app.locals.name,
    version    : app.locals.version,
    status     : 'operational',
    environment: env.NODE_ENV,
    docs       : 'https://github.com/vary-001/expenz#api-docs',
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

log.info(`Mounted API routes under ${bold(API)}`, {
  routes: ['auth','expenses','income','budgets','reports','dashboard'],
});

// ══════════════════════════════════════════════════════════════════════════════
// 10. 404 + GLOBAL ERROR HANDLER  (must be last)
// ══════════════════════════════════════════════════════════════════════════════
app.use(notFound);
app.use(errorHandler);

// ─── Utilities ────────────────────────────────────────────────────────────────
function generateId() {
  // ~22-char base-36 unique string — no crypto dep needed
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

module.exports = app;