// src/config/db.js
'use strict';

const mongoose = require('mongoose');
const env      = require('./env');

// ─── ANSI helpers ─────────────────────────────────────────────────────────────
const R      = '\x1b[0m';
const bold   = (s) => `\x1b[1m${s}${R}`;
const red    = (s) => `\x1b[31m${s}${R}`;
const green  = (s) => `\x1b[32m${s}${R}`;
const yellow = (s) => `\x1b[33m${s}${R}`;
const cyan   = (s) => `\x1b[36m${s}${R}`;
const dim    = (s) => `\x1b[2m${s}${R}`;

// ─── Mask credentials in URI for safe logging ─────────────────────────────────
const maskUri = (uri = '') => uri.replace(/:([^@]+)@/, ':****@');

// ─── In-process state ─────────────────────────────────────────────────────────
const state = {
  attempts       : 0,
  connectedAt    : null,
  disconnectedAt : null,
  reconnects     : 0,
  errors         : [],          // last 10 error messages
  MAX_ERR_LOG    : 10,
};

const pushError = (msg) => {
  state.errors.unshift({ ts: new Date().toISOString(), msg });
  if (state.errors.length > state.MAX_ERR_LOG) state.errors.pop();
};

// ─── Connection options ───────────────────────────────────────────────────────
const MONGOOSE_OPTS = {
  serverSelectionTimeoutMS : 10_000,   // give up finding a server after 10 s
  socketTimeoutMS          : 45_000,   // close idle sockets after 45 s
  connectTimeoutMS         : 10_000,   // TCP connect timeout
  maxPoolSize              : 10,       // max simultaneous connections
  minPoolSize              : 2,        // keep at least 2 connections alive
  heartbeatFrequencyMS     : 10_000,   // how often to ping the server
  retryWrites              : true,
  // Mongoose 7+ no longer needs useNewUrlParser / useUnifiedTopology
};

// ─── Event wiring (called once after first connect) ───────────────────────────
let _eventsRegistered = false;

const wireEvents = () => {
  if (_eventsRegistered) return;
  _eventsRegistered = true;

  const conn = mongoose.connection;

  conn.on('connected', () => {
    state.connectedAt = new Date().toISOString();
    console.log(`${cyan('[db]')} ${green('✔')}  MongoDB connected — host: ${bold(conn.host)}  db: ${bold(conn.name)}`);
  });

  conn.on('disconnected', () => {
    state.disconnectedAt = new Date().toISOString();
    console.warn(`${cyan('[db]')} ${yellow('⚠')}  MongoDB disconnected at ${state.disconnectedAt}`);
  });

  conn.on('reconnected', () => {
    state.reconnects++;
    console.log(`${cyan('[db]')} ${green('↺')}  MongoDB reconnected (reconnect #${state.reconnects})`);
  });

  conn.on('error', (err) => {
    pushError(err.message);
    console.error(`${cyan('[db]')} ${red('✖')}  MongoDB runtime error: ${err.message}`);
  });

  conn.on('close', () => {
    console.log(`${cyan('[db]')} ${dim('–')}  MongoDB connection closed`);
  });

  // Mongoose debug mode in development — logs every query
  if (env.IS_DEVELOPMENT) {
    mongoose.set('debug', (coll, method, query, doc) => {
      console.log(
        `${cyan('[mongoose]')} ${dim(coll + '.' + method)}`,
        dim(JSON.stringify(query)),
        doc ? dim(JSON.stringify(doc)) : ''
      );
    });
  }
};

// ─── Pre-flight URI checks (throws on hard problems) ─────────────────────────
const preflightUri = (uri) => {
  if (!uri) {
    throw Object.assign(new Error('MONGO_URI is empty or undefined.'), {
      hint: 'Set MONGO_URI in your .env file or hosting environment variables.',
    });
  }

  if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
    throw Object.assign(
      new Error(`MONGO_URI must start with mongodb:// or mongodb+srv:// — got: "${uri.slice(0, 20)}..."`),
      { hint: 'Double-check the URI scheme.' }
    );
  }

  if (/<[^>]+>/.test(uri)) {
    throw Object.assign(
      new Error('MONGO_URI contains an unreplaced placeholder (e.g. <db_password>).'),
      { hint: 'Replace the placeholder with your actual Atlas password.' }
    );
  }

  // Warn (don't throw) if password might have un-encoded special chars
  try {
    const withoutScheme = uri.replace(/^mongodb(\+srv)?:\/\//, '');
    const credPart      = withoutScheme.split('@')[0];
    const password      = credPart.includes(':') ? credPart.split(':').slice(1).join(':') : '';
    if (password && /[#%&+= ]/.test(decodeURIComponent(password))) {
      console.warn(
        `${cyan('[db]')} ${yellow('⚠')}  Password contains special characters — ` +
        `ensure they are URL-encoded (e.g. @ → %40, # → %23)`
      );
    }
  } catch { /* ignore decoding errors */ }
};

// ─── Error decoder (maps Mongoose/Atlas codes to human hints) ─────────────────
const decodeError = (err) => {
  const msg   = err.message || '';
  const hints = [];

  if (msg.includes('IP') || msg.includes('whitelist') || msg.includes('ECONNREFUSED')) {
    hints.push('Add your IP (or 0.0.0.0/0) to MongoDB Atlas → Network Access.');
  }
  if (msg.includes('Authentication failed') || msg.includes('auth')) {
    hints.push('Wrong username or password in MONGO_URI.');
    hints.push('URL-encode special characters: @ → %40, # → %23, $ → %24.');
  }
  if (msg.includes('ENOTFOUND') || msg.includes('getaddrinfo')) {
    hints.push('Cluster hostname not found — check the host part of your MONGO_URI.');
  }
  if (msg.includes('SSL') || msg.includes('TLS')) {
    hints.push('TLS/SSL error — try appending ?tls=true&tlsAllowInvalidCertificates=true for local dev.');
  }
  if (msg.includes('serverSelectionTimeout')) {
    hints.push('Server selection timed out — cluster may be paused or IP not whitelisted.');
  }
  if (!hints.length) {
    hints.push('Check MONGO_URI is correct and the cluster is running.');
    hints.push('Verify the database user exists and has readWrite permission.');
  }
  return hints;
};

// ─── connectDB ────────────────────────────────────────────────────────────────
const connectDB = async () => {
  state.attempts++;
  const uri = env.MONGO_URI;

  console.log('');
  console.log(cyan('┌─────────────────────────────────────────────┐'));
  console.log(cyan('│') + bold('           Connecting to MongoDB …            ') + cyan('│'));
  console.log(cyan('└─────────────────────────────────────────────┘'));
  console.log(`  ${dim('URI')}      ${bold(maskUri(uri))}`);
  console.log(`  ${dim('Attempt')} ${bold(String(state.attempts))}`);
  console.log('');

  // Hard checks before even trying
  preflightUri(uri);

  // Wire lifecycle events once
  wireEvents();

  try {
    const conn = await mongoose.connect(uri, MONGOOSE_OPTS);

    state.connectedAt = new Date().toISOString();

    console.log('');
    console.log(green('  ✔  Connected successfully'));
    console.log(`  ${dim('Host')}     ${bold(conn.connection.host)}`);
    console.log(`  ${dim('Database')} ${bold(conn.connection.name)}`);
    console.log(`  ${dim('State')}    ${bold(readyStateLabel(conn.connection.readyState))}`);
    console.log('');

    return conn;

  } catch (err) {
    pushError(err.message);

    const hints = err.hint ? [err.hint] : decodeError(err);

    console.error('');
    console.error(red('╔══════════════════════════════════════════════╗'));
    console.error(red('║         MONGODB CONNECTION FAILED            ║'));
    console.error(red('╚══════════════════════════════════════════════╝'));
    console.error(`  ${red('Error')}   : ${bold(err.message)}`);
    console.error(`  ${dim('Attempt')}: ${state.attempts}`);
    console.error('');
    console.error(yellow('  Possible fixes:'));
    hints.forEach((h, i) => console.error(`  ${dim(String(i + 1) + '.')} ${h}`));
    console.error('');
    console.error(dim('  Stack (first 4 frames):'));
    (err.stack || '').split('\n').slice(1, 5).forEach((l) =>
      console.error(dim('    ' + l.trim()))
    );
    console.error('');

    throw err;   // let server.js decide whether to exit
  }
};

// ─── Helpers exposed for health checks ───────────────────────────────────────
const readyStateLabel = (n) =>
  ({ 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' }[n] || 'unknown');

/**
 * Returns a snapshot of the current DB connection health.
 * Used by /api/health in server.js.
 */
connectDB.healthSnapshot = () => {
  const conn = mongoose.connection;
  return {
    readyState  : conn.readyState,
    status      : readyStateLabel(conn.readyState),
    host        : conn.host        || null,
    database    : conn.name        || null,
    connectedAt : state.connectedAt,
    reconnects  : state.reconnects,
    attempts    : state.attempts,
    recentErrors: state.errors,
  };
};

/**
 * Gracefully close the Mongoose connection.
 * Call this during graceful server shutdown.
 */
connectDB.disconnect = async () => {
  try {
    await mongoose.connection.close();
    console.log(`${cyan('[db]')} ${green('✔')}  MongoDB connection closed gracefully`);
  } catch (err) {
    console.error(`${cyan('[db]')} ${red('✖')}  Error closing MongoDB connection: ${err.message}`);
  }
};

module.exports = connectDB;