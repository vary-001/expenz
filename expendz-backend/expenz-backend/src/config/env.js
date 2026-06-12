// src/config/env.js
'use strict';

require('dotenv').config();

// ─── ANSI helpers (no 3rd party) ─────────────────────────────────────────────
const R = '\x1b[0m';
const bold  = (s) => `\x1b[1m${s}${R}`;
const red   = (s) => `\x1b[31m${s}${R}`;
const green = (s) => `\x1b[32m${s}${R}`;
const yellow= (s) => `\x1b[33m${s}${R}`;
const cyan  = (s) => `\x1b[36m${s}${R}`;
const dim   = (s) => `\x1b[2m${s}${R}`;

// ─── Tiny env-scoped logger ───────────────────────────────────────────────────
const tag = cyan('[env]');
const log = {
  info : (msg)       => console.log (`${tag} ${green('✔')}  ${msg}`),
  warn : (msg)       => console.warn(`${tag} ${yellow('⚠')}  ${msg}`),
  error: (msg, hint) => {
    console.error(`${tag} ${red('✖')}  ${bold(msg)}`);
    if (hint) console.error(`${tag}    ${dim('↳ ' + hint)}`);
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Strip hosting-environment artefacts from a raw env string:
 *   • surrounding quotes  ("value" → value)
 *   • literal \n sequences that some platforms inject
 *   • leading/trailing whitespace
 */
const sanitiseString = (raw = '') =>
  raw
    .replace(/^["'`]|["'`]$/g, '')   // outer quotes (single / double / backtick)
    .replace(/\\n/g, '')              // literal backslash-n
    .replace(/\r?\n/g, '')            // real newline characters
    .trim();

/**
 * Parse an integer env var with a fallback.
 * Warns if the raw value exists but isn't a valid integer.
 */
const parseIntEnv = (raw, fallback, name) => {
  if (raw === undefined || raw === '') return fallback;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) {
    log.warn(`${name}="${raw}" is not a valid integer — using fallback ${fallback}`);
    return fallback;
  }
  return n;
};

/**
 * Parse a boolean env var ('true'/'1'/'yes' → true, everything else → false).
 */
const parseBoolEnv = (raw, fallback = false) => {
  if (raw === undefined || raw === '') return fallback;
  return ['true', '1', 'yes', 'on'].includes(raw.toLowerCase().trim());
};

// ─── Raw reads ────────────────────────────────────────────────────────────────
const raw = {
  NODE_ENV      : sanitiseString(process.env.NODE_ENV)       || 'development',
  PORT          : process.env.PORT,
  MONGO_URI     : sanitiseString(process.env.MONGO_URI       || ''),
  JWT_SECRET    : sanitiseString(process.env.JWT_SECRET      || ''),
  JWT_EXPIRES_IN: sanitiseString(process.env.JWT_EXPIRES_IN  || ''),
  CLIENT_URL    : sanitiseString(process.env.CLIENT_URL      || ''),
  LOG_LEVEL     : sanitiseString(process.env.LOG_LEVEL       || ''),
  BCRYPT_ROUNDS : process.env.BCRYPT_ROUNDS,
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
  RATE_LIMIT_WIN : process.env.RATE_LIMIT_WINDOW_MS,
};

// ─── Coerce & apply defaults ──────────────────────────────────────────────────
const env = {
  NODE_ENV      : ['development', 'production', 'test', 'staging'].includes(raw.NODE_ENV)
                    ? raw.NODE_ENV
                    : (() => { log.warn(`Unknown NODE_ENV "${raw.NODE_ENV}" — defaulting to "development"`); return 'development'; })(),

  PORT          : parseIntEnv(raw.PORT, 5000, 'PORT'),

  MONGO_URI     : raw.MONGO_URI || 'mongodb://localhost:27017/expenz',

  JWT_SECRET    : raw.JWT_SECRET,

  JWT_EXPIRES_IN: raw.JWT_EXPIRES_IN || '7d',

  CLIENT_URL    : raw.CLIENT_URL || 'http://localhost:3000',

  LOG_LEVEL     : (['DEBUG','INFO','WARN','ERROR','FATAL']
                    .includes(raw.LOG_LEVEL.toUpperCase?.() ?? ''))
                    ? raw.LOG_LEVEL.toUpperCase()
                    : 'INFO',

  BCRYPT_ROUNDS : parseIntEnv(raw.BCRYPT_ROUNDS, 12, 'BCRYPT_ROUNDS'),

  RATE_LIMIT_MAX: parseIntEnv(raw.RATE_LIMIT_MAX, 100, 'RATE_LIMIT_MAX'),

  RATE_LIMIT_WINDOW_MS: parseIntEnv(raw.RATE_LIMIT_WIN, 15 * 60 * 1000, 'RATE_LIMIT_WINDOW_MS'),

  // Convenience booleans derived from NODE_ENV
  get IS_PRODUCTION()  { return this.NODE_ENV === 'production';  },
  get IS_DEVELOPMENT() { return this.NODE_ENV === 'development'; },
  get IS_TEST()        { return this.NODE_ENV === 'test';        },
};

// ─── Validation rules ─────────────────────────────────────────────────────────
const rules = [
  // ── required strings ──────────────────────────────────────────────────────
  {
    key   : 'JWT_SECRET',
    fatal : true,
    check : (v) => !!v,
    hint  : 'Set JWT_SECRET in your environment / .env file',
  },
  {
    key   : 'JWT_SECRET',
    fatal : false,
    check : (v) => !v || v.length >= 32,
    hint  : 'JWT_SECRET should be at least 32 characters for security',
  },
  {
    key   : 'MONGO_URI',
    fatal : true,
    check : (v) => !!v,
    hint  : 'Set MONGO_URI in your environment / .env file',
  },
  // ── MONGO_URI format ──────────────────────────────────────────────────────
  {
    key   : 'MONGO_URI',
    fatal : true,
    check : (v) => !v || /^mongodb(\+srv)?:\/\//.test(v),
    hint  : 'MONGO_URI must start with mongodb:// or mongodb+srv://',
  },
  {
    key   : 'MONGO_URI',
    fatal : true,
    check : (v) => !v || !/<[^>]+>/.test(v),
    hint  : 'MONGO_URI still contains a placeholder like <db_password> — replace it with the real value',
  },
  {
    key   : 'MONGO_URI',
    fatal : false,
    check : (v) => {
      // Warn if password looks un-encoded (contains raw @ inside credential block)
      if (!v) return true;
      try {
        const withoutScheme = v.replace(/^mongodb(\+srv)?:\/\//, '');
        const credPart      = withoutScheme.split('@')[0];
        const password      = credPart.split(':').slice(1).join(':');
        return !password.includes('@'); // '@' in password must be %40
      } catch { return true; }
    },
    hint  : 'Password in MONGO_URI may contain un-encoded "@" — use %40 instead',
  },
  // ── JWT_EXPIRES_IN format ─────────────────────────────────────────────────
  {
    key   : 'JWT_EXPIRES_IN',
    fatal : false,
    check : (v) => /^\d+[smhd]$/.test(v),
    hint  : 'JWT_EXPIRES_IN should look like "15m", "2h", "7d", "3600s"',
  },
  // ── PORT range ────────────────────────────────────────────────────────────
  {
    key   : 'PORT',
    fatal : false,
    check : (v) => v >= 1 && v <= 65535,
    hint  : 'PORT must be between 1 and 65535',
  },
  // ── CLIENT_URL format ─────────────────────────────────────────────────────
  {
    key   : 'CLIENT_URL',
    fatal : false,
    check : (v) => {
      try { new URL(v); return true; } catch { return false; }
    },
    hint  : 'CLIENT_URL must be a valid URL (e.g. https://app.example.com)',
  },
];

// ─── Run validation ───────────────────────────────────────────────────────────
let fatalCount = 0;

rules.forEach(({ key, fatal, check, hint }) => {
  const value = env[key];
  if (!check(value)) {
    if (fatal) {
      log.error(`Missing / invalid required variable: ${bold(key)}`, hint);
      fatalCount++;
    } else {
      log.warn(`${bold(key)} — ${hint}`);
    }
  }
});

if (fatalCount > 0) {
  console.error('');
  console.error(red(`  ${fatalCount} fatal env error(s) found. Server cannot start.`));
  console.error(dim('  Check your .env file or hosting environment variables.'));
  console.error('');
  process.exit(1);
}

// ─── Summary (only in non-test environments) ──────────────────────────────────
if (env.NODE_ENV !== 'test') {
  const maskUri = (u = '') => u.replace(/:([^@]{1,})@/, ':****@');

  console.log('');
  console.log(cyan('┌─────────────────────────────────────────────┐'));
  console.log(cyan('│') + bold('         Environment Configuration           ') + cyan('│'));
  console.log(cyan('└─────────────────────────────────────────────┘'));
  console.log(`  ${dim('NODE_ENV')}       ${bold(env.NODE_ENV)}`);
  console.log(`  ${dim('PORT')}           ${bold(String(env.PORT))}`);
  console.log(`  ${dim('LOG_LEVEL')}      ${bold(env.LOG_LEVEL)}`);
  console.log(`  ${dim('MONGO_URI')}      ${bold(maskUri(env.MONGO_URI))}`);
  console.log(`  ${dim('JWT_EXPIRES_IN')} ${bold(env.JWT_EXPIRES_IN)}`);
  console.log(`  ${dim('JWT_SECRET')}     ${bold('*'.repeat(Math.min(env.JWT_SECRET?.length ?? 0, 8)))}`);
  console.log(`  ${dim('CLIENT_URL')}     ${bold(env.CLIENT_URL)}`);
  console.log(`  ${dim('BCRYPT_ROUNDS')}  ${bold(String(env.BCRYPT_ROUNDS))}`);
  console.log(`  ${dim('RATE_LIMIT_MAX')} ${bold(String(env.RATE_LIMIT_MAX))} req / ${bold(String(env.RATE_LIMIT_WINDOW_MS))} ms`);
  console.log('');
  log.info(green('All environment variables validated ✔'));
  console.log('');
}

module.exports = env;