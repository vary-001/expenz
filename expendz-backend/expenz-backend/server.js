// server.js
'use strict';

const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const env = require('./src/config/env');

// ─── ANSI Color Helpers ───────────────────────────────────────────────────────
const c = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  red:     '\x1b[31m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  cyan:    '\x1b[36m',
  white:   '\x1b[37m',
  bgRed:   '\x1b[41m',
  bgGreen: '\x1b[42m',
};

const paint = (color, text) => `${color}${text}${c.reset}`;

// ─── Internal Logger (no 3rd party) ──────────────────────────────────────────
const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, FATAL: 4 };
const CURRENT_LEVEL = LOG_LEVELS[String(env.LOG_LEVEL || 'INFO').toUpperCase()] ?? LOG_LEVELS.INFO;

const logger = {
  _format(level, msg, meta) {
    const ts        = new Date().toISOString();
    const metaStr   = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${ts}] [${level}] ${msg}${metaStr}`;
  },
  _write(level, color, msg, meta) {
    if (LOG_LEVELS[level] < CURRENT_LEVEL) return;
    const line = this._format(level, msg, meta);
    level === 'ERROR' || level === 'FATAL'
      ? console.error(paint(color, line))
      : console.log(paint(color, line));
  },
  debug (msg, meta) { this._write('DEBUG',  c.dim,     msg, meta); },
  info  (msg, meta) { this._write('INFO',   c.cyan,    msg, meta); },
  warn  (msg, meta) { this._write('WARN',   c.yellow,  msg, meta); },
  error (msg, meta) { this._write('ERROR',  c.red,     msg, meta); },
  fatal (msg, meta) { this._write('FATAL',  c.bgRed,   msg, meta); },
};

// ─── Server Metrics (in-memory, no 3rd party) ────────────────────────────────
const metrics = (() => {
  const _data = {
    startTime:        Date.now(),
    totalRequests:    0,
    activeRequests:   0,
    totalErrors:      0,
    statusCodes:      {},
    routeHits:        {},
    responseTimes:    [],         // last 1 000 samples
    bytesOut:         0,
    bytesIn:          0,
    lastRequests:     [],         // ring buffer – last 20
    uncaughtErrors:   [],         // last 10
    dbConnects:       0,
    dbErrors:         0,
  };

  const MAX_RT_SAMPLES  = 1_000;
  const MAX_LAST_REQ    = 20;
  const MAX_ERR_SAMPLES = 10;

  return {
    // ── request lifecycle ─────────────────────────────────────────────────
    requestStart(req) {
      _data.totalRequests++;
      _data.activeRequests++;
      req._startAt = process.hrtime.bigint();
      const cl = parseInt(req.headers['content-length'] || '0', 10);
      if (!isNaN(cl)) _data.bytesIn += cl;
    },

    requestEnd(req, res) {
      _data.activeRequests = Math.max(0, _data.activeRequests - 1);

      const durationNs = process.hrtime.bigint() - (req._startAt || process.hrtime.bigint());
      const durationMs = Number(durationNs) / 1e6;

      // response-time ring-buffer
      _data.responseTimes.push(durationMs);
      if (_data.responseTimes.length > MAX_RT_SAMPLES) _data.responseTimes.shift();

      // bytes out
      const cl = parseInt(res.getHeader('content-length') || '0', 10);
      if (!isNaN(cl)) _data.bytesOut += cl;

      // status codes
      const sc = String(res.statusCode);
      _data.statusCodes[sc] = (_data.statusCodes[sc] || 0) + 1;
      if (res.statusCode >= 400) _data.totalErrors++;

      // route hits  (strip query-string, collapse IDs → :id)
      const route = this._normaliseRoute(req.method, req.url);
      _data.routeHits[route] = (_data.routeHits[route] || 0) + 1;

      // last-requests ring-buffer
      const entry = {
        ts:         new Date().toISOString(),
        method:     req.method,
        url:        req.url,
        status:     res.statusCode,
        ms:         durationMs.toFixed(2),
        ip:         req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown',
        ua:         (req.headers['user-agent'] || '').slice(0, 80),
      };
      _data.lastRequests.unshift(entry);
      if (_data.lastRequests.length > MAX_LAST_REQ) _data.lastRequests.pop();
    },

    recordUncaughtError(type, err) {
      _data.uncaughtErrors.unshift({
        ts:   new Date().toISOString(),
        type,
        msg:  err?.message || String(err),
        stack: err?.stack?.split('\n').slice(0, 5) || [],
      });
      if (_data.uncaughtErrors.length > MAX_ERR_SAMPLES) _data.uncaughtErrors.pop();
    },

    dbConnect() { _data.dbConnects++; },
    dbError()   { _data.dbErrors++;   },

    // ── aggregation helpers ───────────────────────────────────────────────
    _normaliseRoute(method, url) {
      const path = (url || '/').split('?')[0]
        .replace(/\/[0-9a-f]{24}/gi, '/:id')   // MongoDB ObjectId
        .replace(/\/\d+/g, '/:id');             // numeric IDs
      return `${method} ${path}`;
    },

    _percentile(sorted, p) {
      if (!sorted.length) return 0;
      const idx = Math.ceil((p / 100) * sorted.length) - 1;
      return sorted[Math.max(0, idx)];
    },

    _avg(arr) {
      return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    },

    snapshot() {
      const sorted = [..._data.responseTimes].sort((a, b) => a - b);
      const uptimeSec = Math.floor((Date.now() - _data.startTime) / 1000);

      return {
        uptime:         `${Math.floor(uptimeSec / 3600)}h ${Math.floor((uptimeSec % 3600) / 60)}m ${uptimeSec % 60}s`,
        uptimeSec,
        startTime:      new Date(_data.startTime).toISOString(),
        pid:            process.pid,
        nodeVersion:    process.version,
        env:            env.NODE_ENV,
        port:           env.PORT,
        memory: {
          heapUsedMB:   (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
          heapTotalMB:  (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2),
          rssMB:        (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
          externalMB:   (process.memoryUsage().external / 1024 / 1024).toFixed(2),
        },
        cpu:            process.cpuUsage(),
        requests: {
          total:        _data.totalRequests,
          active:       _data.activeRequests,
          errors:       _data.totalErrors,
          errorRate:    _data.totalRequests
            ? ((_data.totalErrors / _data.totalRequests) * 100).toFixed(2) + '%'
            : '0%',
        },
        responseTimes: {
          avgMs:        this._avg(sorted).toFixed(2),
          minMs:        (sorted[0] ?? 0).toFixed(2),
          maxMs:        (sorted[sorted.length - 1] ?? 0).toFixed(2),
          p50Ms:        this._percentile(sorted, 50).toFixed(2),
          p90Ms:        this._percentile(sorted, 90).toFixed(2),
          p95Ms:        this._percentile(sorted, 95).toFixed(2),
          p99Ms:        this._percentile(sorted, 99).toFixed(2),
          samples:      sorted.length,
        },
        throughput: {
          bytesIn:      _data.bytesIn,
          bytesOut:     _data.bytesOut,
          kbIn:         (_data.bytesIn  / 1024).toFixed(2),
          kbOut:        (_data.bytesOut / 1024).toFixed(2),
        },
        statusCodes:    _data.statusCodes,
        topRoutes:      Object.entries(_data.routeHits)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 10)
                          .map(([route, hits]) => ({ route, hits })),
        db: {
          connects:     _data.dbConnects,
          errors:       _data.dbErrors,
        },
        lastRequests:   _data.lastRequests,
        recentErrors:   _data.uncaughtErrors,
      };
    },
  };
})();

// ─── Request Logging & Metrics Middleware (injected before app routes) ────────
function attachObserver(appInstance) {
  appInstance.use((req, res, next) => {
    metrics.requestStart(req);

    // Intercept response finish
    const onFinish = () => {
      res.removeListener('finish', onFinish);
      res.removeListener('close',  onClose);
      metrics.requestEnd(req, res);

      const ms     = (Number(process.hrtime.bigint() - req._startAt) / 1e6).toFixed(2);
      const sc     = res.statusCode;
      const color  = sc >= 500 ? c.red : sc >= 400 ? c.yellow : sc >= 300 ? c.cyan : c.green;
      logger.debug(
        `${paint(c.bold, req.method)} ${req.url} ${paint(color, String(sc))} ${ms}ms`,
        { ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress }
      );
    };

    const onClose = () => {
      res.removeListener('finish', onFinish);
      res.removeListener('close',  onClose);
      metrics.requestEnd(req, res);
      logger.warn(`Request aborted by client`, { method: req.method, url: req.url });
    };

    res.on('finish', onFinish);
    res.on('close',  onClose);
    next();
  });
}

// ─── Built-in Diagnostic Routes (mounted BEFORE app) ─────────────────────────
function mountDiagnosticRoutes(appInstance) {
  // ── Health  GET /api/health ───────────────────────────────────────────────
  appInstance.get('/api/health', (req, res) => {
    const snap = metrics.snapshot();
    const healthy = snap.db.errors === 0;
    res.status(healthy ? 200 : 503).json({
      status:    healthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime:    snap.uptime,
      env:       snap.env,
      memory:    snap.memory,
      db: {
        connects: snap.db.connects,
        errors:   snap.db.errors,
      },
    });
  });

  // ── Metrics  GET /api/metrics ─────────────────────────────────────────────
  appInstance.get('/api/metrics', (req, res) => {
    res.status(200).json(metrics.snapshot());
  });

  // ── Routes report  GET /api/routes ───────────────────────────────────────
  appInstance.get('/api/routes', (req, res) => {
    const routes = [];
    const extractRoutes = (stack, prefix = '') => {
      (stack || []).forEach((layer) => {
        if (layer.route) {
          const methods = Object.keys(layer.route.methods)
            .map((m) => m.toUpperCase());
          routes.push({
            methods,
            path: prefix + (layer.route.path || ''),
          });
        } else if (layer.name === 'router' && layer.handle?.stack) {
          const match = (layer.regexp?.source || '')
            .replace('\\/?(?=\\/|$)', '')
            .replace(/\\\//g, '/')
            .replace(/\^\\/, '')
            .replace(/\?(?:\(\?:\(\[\^\\\/\]\+\?\)\))\?/g, ':param')
            .replace(/[^a-zA-Z0-9/:_-]/g, '');
          extractRoutes(layer.handle.stack, prefix + '/' + match);
        }
      });
    };
    extractRoutes(appInstance._router?.stack);
    res.status(200).json({
      count:  routes.length,
      routes: routes.sort((a, b) => a.path.localeCompare(b.path)),
    });
  });

  // ── Live Report  GET /api/report ─────────────────────────────────────────
  appInstance.get('/api/report', (req, res) => {
    const s   = metrics.snapshot();
    const sep = '─'.repeat(52);

    const lines = [
      '',
      '╔════════════════════════════════════════════════════╗',
      '║            EXPENZ SERVER LIVE REPORT              ║',
      '╚════════════════════════════════════════════════════╝',
      '',
      `  Uptime        : ${s.uptime}`,
      `  Started       : ${s.startTime}`,
      `  PID           : ${s.pid}`,
      `  Node          : ${s.nodeVersion}`,
      `  Environment   : ${s.env}`,
      `  Port          : ${s.port}`,
      '',
      sep,
      '  MEMORY',
      sep,
      `  Heap Used     : ${s.memory.heapUsedMB} MB`,
      `  Heap Total    : ${s.memory.heapTotalMB} MB`,
      `  RSS           : ${s.memory.rssMB} MB`,
      `  External      : ${s.memory.externalMB} MB`,
      '',
      sep,
      '  REQUESTS',
      sep,
      `  Total         : ${s.requests.total}`,
      `  Active        : ${s.requests.active}`,
      `  Errors        : ${s.requests.errors}`,
      `  Error Rate    : ${s.requests.errorRate}`,
      '',
      sep,
      '  RESPONSE TIMES',
      sep,
      `  Avg           : ${s.responseTimes.avgMs} ms`,
      `  Min           : ${s.responseTimes.minMs} ms`,
      `  Max           : ${s.responseTimes.maxMs} ms`,
      `  p50           : ${s.responseTimes.p50Ms} ms`,
      `  p90           : ${s.responseTimes.p90Ms} ms`,
      `  p95           : ${s.responseTimes.p95Ms} ms`,
      `  p99           : ${s.responseTimes.p99Ms} ms`,
      `  Samples       : ${s.responseTimes.samples}`,
      '',
      sep,
      '  THROUGHPUT',
      sep,
      `  Bytes In      : ${s.throughput.kbIn} KB`,
      `  Bytes Out     : ${s.throughput.kbOut} KB`,
      '',
      sep,
      '  STATUS CODES',
      sep,
      ...Object.entries(s.statusCodes).map(
        ([code, count]) => `  ${code}  : ${count} request(s)`
      ),
      '',
      sep,
      '  TOP 10 ROUTES',
      sep,
      ...s.topRoutes.map(
        (r, i) => `  ${String(i + 1).padStart(2)}. [${String(r.hits).padStart(5)} hits]  ${r.route}`
      ),
      '',
      sep,
      '  DATABASE',
      sep,
      `  Connects      : ${s.db.connects}`,
      `  Errors        : ${s.db.errors}`,
      '',
      sep,
      '  LAST 20 REQUESTS',
      sep,
      ...s.lastRequests.map(
        (r) => `  ${r.ts}  ${r.method.padEnd(6)} ${String(r.status)} ${String(r.ms).padStart(8)}ms  ${r.url}`
      ),
      '',
      sep,
      '  RECENT UNCAUGHT ERRORS',
      sep,
      ...(s.recentErrors.length
        ? s.recentErrors.map(
            (e) => `  [${e.ts}] ${e.type}: ${e.msg}\n${e.stack.map((l) => '    ' + l).join('\n')}`
          )
        : ['  None 🎉']),
      '',
    ];

    const accept = req.headers.accept || '';
    if (accept.includes('application/json')) {
      res.status(200).json(s);
    } else {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.status(200).send(lines.join('\n'));
    }
  });

  // ── Ping  GET /api/ping ───────────────────────────────────────────────────
  appInstance.get('/api/ping', (_req, res) => {
    res.status(200).json({ pong: true, ts: Date.now() });
  });

  logger.info('📡 Diagnostic routes mounted', {
    routes: ['/api/health', '/api/metrics', '/api/routes', '/api/report', '/api/ping'],
  });
}

// ─── Pretty Startup Banner ────────────────────────────────────────────────────
function printBanner(port) {
  const snap = metrics.snapshot();
  console.log('');
  console.log(paint(c.cyan + c.bold,
    '╔══════════════════════════════════════════════════════╗'));
  console.log(paint(c.cyan + c.bold,
    '║           EXPENZ  Backend  Server  Ready            ║'));
  console.log(paint(c.cyan + c.bold,
    '╚══════════════════════════════════════════════════════╝'));
  console.log(`  ${paint(c.green,  '🚀 Mode')}       : ${paint(c.bold, env.NODE_ENV)}`);
  console.log(`  ${paint(c.green,  '🌐 Port')}       : ${paint(c.bold, String(port))}`);
  console.log(`  ${paint(c.green,  '🆔 PID')}        : ${process.pid}`);
  console.log(`  ${paint(c.green,  '📦 Node')}       : ${process.version}`);
  console.log(`  ${paint(c.green,  '💾 Heap')}       : ${snap.memory.heapTotalMB} MB`);
  console.log('');
  console.log(`  ${paint(c.yellow, '🔗 Base URL')}   : http://localhost:${port}`);
  console.log(`  ${paint(c.yellow, '❤️  Health')}     : http://localhost:${port}/api/health`);
  console.log(`  ${paint(c.yellow, '📊 Metrics')}    : http://localhost:${port}/api/metrics`);
  console.log(`  ${paint(c.yellow, '📋 Routes')}     : http://localhost:${port}/api/routes`);
  console.log(`  ${paint(c.yellow, '📑 Report')}     : http://localhost:${port}/api/report`);
  console.log(`  ${paint(c.yellow, '🏓 Ping')}       : http://localhost:${port}/api/ping`);
  console.log('');
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
function registerShutdown(server) {
  const shutdown = async (signal) => {
    logger.warn(`${signal} received — starting graceful shutdown…`);
    const snap = metrics.snapshot();
    logger.info('Final metrics snapshot', {
      uptime:       snap.uptime,
      totalReqs:    snap.requests.total,
      errorRate:    snap.requests.errorRate,
      p99:          snap.responseTimes.p99Ms + 'ms',
    });

    server.close((err) => {
      if (err) {
        logger.error('Error while closing server', { err: err.message });
        process.exit(1);
      }
      logger.info('✅ HTTP server closed cleanly');
      process.exit(0);
    });

    // Force-kill if graceful close takes too long
    setTimeout(() => {
      logger.fatal('Graceful shutdown timed out — forcing exit');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}

// ─── Global Error Handlers ────────────────────────────────────────────────────
function registerGlobalErrorHandlers(server) {
  process.on('unhandledRejection', (reason) => {
    const err = reason instanceof Error ? reason : new Error(String(reason));
    logger.error('Unhandled Promise Rejection', {
      message: err.message,
      stack:   err.stack?.split('\n').slice(0, 6),
    });
    metrics.recordUncaughtError('UnhandledRejection', err);
    // Do NOT exit — log and continue; swap to exit(1) if you prefer strict mode
  });

  process.on('uncaughtException', (err) => {
    logger.fatal('Uncaught Exception — server will shut down', {
      message: err.message,
      stack:   err.stack?.split('\n').slice(0, 8),
    });
    metrics.recordUncaughtError('UncaughtException', err);
    server.close(() => process.exit(1));
    setTimeout(() => process.exit(1), 5_000).unref();
  });

  process.on('warning', (warning) => {
    logger.warn('Node.js Warning', {
      name:    warning.name,
      message: warning.message,
      code:    warning.code,
    });
  });
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
const startServer = async () => {
  logger.info('⚙️  Booting EXPENZ backend…');

  // 1. Connect DB
  try {
    await connectDB();
    metrics.dbConnect();
    logger.info('✅ MongoDB connected');
  } catch (err) {
    metrics.dbError();
    logger.fatal('MongoDB connection failed — aborting boot', {
      message: err.message,
      hints: [
        'Is MONGO_URI set in environment variables?',
        'Did you replace <db_password> with the real password?',
        'Is 0.0.0.0/0 allowed in Atlas Network Access?',
      ],
    });
    process.exit(1);
  }

  // 2. Attach observer middleware FIRST (before app routes)
  attachObserver(app);

  // 3. Mount diagnostic routes
  mountDiagnosticRoutes(app);

  // 4. Create HTTP server
  const server = http.createServer(app);

  // 5. Register global error handlers
  registerGlobalErrorHandlers(server);

  // 6. Register graceful shutdown
  registerShutdown(server);

  // 7. Listen
  await new Promise((resolve, reject) => {
    server.listen(env.PORT, resolve);
    server.once('error', reject);
  });

  // 8. Banner
  printBanner(env.PORT);

  // 9. Periodic memory/health log (every 5 min in production)
  if (env.NODE_ENV === 'production') {
    setInterval(() => {
      const s = metrics.snapshot();
      logger.info('⏱  Periodic health tick', {
        uptime:       s.uptime,
        heapMB:       s.memory.heapUsedMB,
        activeReqs:   s.requests.active,
        totalReqs:    s.requests.total,
        errorRate:    s.requests.errorRate,
        p95Ms:        s.responseTimes.p95Ms,
      });
    }, 5 * 60 * 1_000).unref();
  }
};

startServer().catch((err) => {
  logger.fatal('Fatal error during server startup', {
    message: err.message,
    stack:   err.stack?.split('\n').slice(0, 8),
  });
  process.exit(1);
});