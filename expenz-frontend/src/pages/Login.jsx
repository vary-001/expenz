// src/pages/Login.jsx
import React, { useState, useCallback, useId } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ThemeToggle from '../components/common/ThemeToggle';
import LanguageToggle from '../components/common/LanguageToggle';
import Logo from '../assets/svgs/Logo';

// ─── Animation variants (defined outside — stable references) ────────────────
const FADE_UP = {
  hidden : { opacity: 0, y: 24 },
  show   : (delay = 0) => ({ opacity: 1, y: 0, transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
  exit   : { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const FADE_IN = {
  hidden: { opacity: 0 },
  show  : (delay = 0) => ({ opacity: 1, transition: { delay, duration: 0.5 } }),
};

const CARD = {
  hidden : { opacity: 0, scale: 0.96, y: 16 },
  show   : { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Illustration ─────────────────────────────────────────────────────────────
const LoginIllustration = () => (
  <svg viewBox="0 0 420 460" fill="none" xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true" className="w-full h-full max-w-sm">

    {/* ── Ambient glow circles ── */}
    <circle cx="210" cy="230" r="180" fill="url(#glowOuter)" opacity="0.35" />
    <circle cx="210" cy="230" r="120" fill="url(#glowInner)" opacity="0.5"  />

    {/* ── Dashboard card base ── */}
    <rect x="60" y="80" width="300" height="300" rx="28"
      fill="white" fillOpacity="0.10"
      stroke="white" strokeOpacity="0.25" strokeWidth="1.5" />

    {/* ── Card glass shine ── */}
    <rect x="60" y="80" width="300" height="60" rx="28"
      fill="white" fillOpacity="0.08" />
    <rect x="60" y="108" width="300" height="32"
      fill="white" fillOpacity="0.04" />

    {/* ── Top bar dots ── */}
    <circle cx="88"  cy="110" r="5" fill="#f87171" fillOpacity="0.8" />
    <circle cx="104" cy="110" r="5" fill="#fbbf24" fillOpacity="0.8" />
    <circle cx="120" cy="110" r="5" fill="#34d399" fillOpacity="0.8" />

    {/* ── Header label ── */}
    <rect x="148" y="104" width="80" height="12" rx="6"
      fill="white" fillOpacity="0.3" />

    {/* ── Balance section ── */}
    <rect x="84"  y="152" width="120" height="10" rx="5"
      fill="white" fillOpacity="0.35" />
    <rect x="84"  y="168" width="160" height="22" rx="7"
      fill="white" fillOpacity="0.55" />
    <rect x="84"  y="198" width="90"  height="8"  rx="4"
      fill="white" fillOpacity="0.2"  />

    {/* ── Sparkline chart area ── */}
    <rect x="84" y="220" width="252" height="72" rx="12"
      fill="white" fillOpacity="0.07"
      stroke="white" strokeOpacity="0.15" strokeWidth="1" />

    {/* sparkline path */}
    <polyline
      points="96,278 120,258 148,265 176,245 204,252 232,235 260,242 288,228 316,234 336,222"
      stroke="url(#sparkGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      fill="none" />
    {/* sparkline fill */}
    <path
      d="M96,278 120,258 148,265 176,245 204,252 232,235 260,242 288,228 316,234 336,222 L336,292 L96,292 Z"
      fill="url(#sparkFill)" opacity="0.25" />

    {/* sparkline dots */}
    {[[120,258],[176,245],[232,235],[288,228]].map(([x,y], i) => (
      <circle key={i} cx={x} cy={y} r="3.5" fill="white" fillOpacity="0.9" />
    ))}

    {/* ── Stat pills ── */}
    {[
      { x: 84,  y: 308, w: 112, label: 'Income',  val: '+$4,280' },
      { x: 208, y: 308, w: 128, label: 'Expenses', val: '-$1,940' },
    ].map(({ x, y, w, label, val }) => (
      <g key={label}>
        <rect x={x} y={y} width={w} height={44} rx="10"
          fill="white" fillOpacity="0.1"
          stroke="white" strokeOpacity="0.2" strokeWidth="1" />
        <rect x={x+10} y={y+8}  width={50} height={7} rx="3.5" fill="white" fillOpacity="0.3" />
        <rect x={x+10} y={y+22} width={70} height={12} rx="4"  fill="white" fillOpacity="0.55" />
      </g>
    ))}

    {/* ── Floating badge — Savings ── */}
    <g filter="url(#badgeShadow)">
      <rect x="248" y="60" width="128" height="52" rx="16"
        fill="white" fillOpacity="0.18"
        stroke="white" strokeOpacity="0.35" strokeWidth="1" />
      <rect x="262" y="73" width="48" height="8"  rx="4" fill="white" fillOpacity="0.4"  />
      <rect x="262" y="87" width="72" height="12" rx="5" fill="white" fillOpacity="0.65" />
      {/* tiny green dot */}
      <circle cx="358" cy="80" r="5" fill="#34d399" />
    </g>

    {/* ── Floating badge — Budget ── */}
    <g filter="url(#badgeShadow)">
      <rect x="44" y="330" width="112" height="52" rx="16"
        fill="white" fillOpacity="0.15"
        stroke="white" strokeOpacity="0.3" strokeWidth="1" />
      <rect x="58" y="343" width="40" height="7"  rx="3.5" fill="white" fillOpacity="0.35" />
      <rect x="58" y="356" width="64" height="11" rx="4.5" fill="white" fillOpacity="0.6"  />
      {/* progress bar */}
      <rect x="58" y="373" width="84" height="4" rx="2" fill="white" fillOpacity="0.15" />
      <rect x="58" y="373" width="54" height="4" rx="2" fill="#34d399" fillOpacity="0.8" />
    </g>

    {/* ── Defs ── */}
    <defs>
      <radialGradient id="glowOuter" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#86efac" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#166534" stopOpacity="0"   />
      </radialGradient>
      <radialGradient id="glowInner" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#bbf7d0" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#16a34a" stopOpacity="0"   />
      </radialGradient>
      <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stopColor="#86efac" />
        <stop offset="100%" stopColor="#34d399" />
      </linearGradient>
      <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="#86efac" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#86efac" stopOpacity="0"   />
      </linearGradient>
      <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.15" />
      </filter>
    </defs>
  </svg>
);

// ─── Illustration panel ───────────────────────────────────────────────────────
const IllustrationPanel = () => (
  <div className="hidden lg:flex w-1/2 relative overflow-hidden
    bg-gradient-to-br from-forest-700 via-forest-600 to-emerald-500
    dark:from-forest-900 dark:via-forest-800 dark:to-emerald-700
    flex-col items-center justify-center p-12 select-none">

    {/* Soft mesh blobs */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full
        bg-emerald-400/20 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full
        bg-forest-400/25 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        w-64 h-64 rounded-full bg-sage-300/10 blur-2xl" />
    </div>

    {/* Subtle dot-grid overlay */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.06]"
      xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>

    {/* Illustration */}
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      transition={{ delay: 0.45, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 w-full max-w-[340px]"
    >
      <LoginIllustration />
    </motion.div>

    {/* Copy below illustration */}
    <motion.div
      custom={0.65}
      variants={FADE_UP}
      initial="hidden"
      animate="show"
      className="relative z-10 mt-8 text-center space-y-2"
    >
      <p className="text-white/90 font-poppins font-semibold text-xl leading-snug">
        Your finances, at a glance
      </p>
      <p className="text-white/55 font-inter text-sm max-w-[220px] mx-auto leading-relaxed">
        Track spending, plan budgets and grow savings — all in one place.
      </p>
    </motion.div>

    {/* Three feature pills */}
    <motion.div
      custom={0.75}
      variants={FADE_IN}
      initial="hidden"
      animate="show"
      className="relative z-10 mt-6 flex gap-2 flex-wrap justify-center"
    >
      {['Smart Budgets', 'Live Reports', 'Multi-currency'].map((label) => (
        <span key={label}
          className="px-3 py-1 rounded-full text-[11px] font-inter font-medium
            bg-white/10 text-white/80 border border-white/15 backdrop-blur-sm">
          {label}
        </span>
      ))}
    </motion.div>
  </div>
);

// ─── Validation ───────────────────────────────────────────────────────────────
const validate = (email, password) => {
  const errs = {};
  if (!email.trim())                            errs.email    = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email.';
  if (!password)                                errs.password = 'Password is required.';
  else if (password.length < 6)                 errs.password = 'Password must be ≥ 6 characters.';
  return errs;
};

// ═════════════════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
const Login = () => {
  const { t }          = useTranslation();
  const { login }      = useAuth();
  const { addToast }   = useToast();
  const formId         = useId();

  const [fields, setFields]   = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  // ── Field helpers ──────────────────────────────────────────────────────────
  const setField = useCallback((name, value) => {
    setFields((prev) => ({ ...prev, [name]: value }));
    // Clear error as user types once they've blurred the field
    if (touched[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }, [touched]);

  const handleBlur = useCallback((name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validate(fields.email, fields.password);
    setErrors((prev) => ({ ...prev, ...(errs[name] ? { [name]: errs[name] } : { [name]: undefined }) }));
  }, [fields]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    const errs = validate(fields.email, fields.password);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await login(fields.email, fields.password);
      addToast(t('auth.welcomeBack'), 'success');
    } catch (err) {
      const msg = err.response?.data?.message || t('auth.loginFailed');
      addToast(msg, 'error');
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  }, [fields, login, addToast, t]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-forest-50
      dark:from-surface-dark dark:via-surface-dark dark:to-forest-950
      flex items-center justify-center p-4 theme-transition">

      {/* ── Top-right controls ── */}
      <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      {/* ── Card ── */}
      <motion.div
        variants={CARD}
        initial="hidden"
        animate="show"
        className="w-full max-w-5xl flex min-h-[620px] rounded-3xl overflow-hidden
          shadow-2xl shadow-forest-900/10 dark:shadow-forest-900/40
          border border-sage-100 dark:border-surface-border-dark"
      >
        {/* ══ Form side ══ */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center
          bg-white dark:bg-surface-card-dark p-8 sm:p-12 relative">

          {/* Subtle top-right decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-bl-full
            bg-gradient-to-bl from-forest-50 to-transparent
            dark:from-forest-900/20 pointer-events-none" />

          {/* ── Logo ── */}
          <motion.div
            custom={0.15}
            variants={FADE_UP}
            initial="hidden"
            animate="show"
            className="flex items-center gap-3 mb-10"
          >
            <Logo size={40} />
            <div>
              <h1 className="font-poppins font-bold text-2xl text-gradient-forest leading-none">
                Expenz
              </h1>
              <p className="text-[10px] font-inter text-sage-400 dark:text-sage-500
                tracking-widest uppercase mt-0.5">
                Smart Finance
              </p>
            </div>
          </motion.div>

          {/* ── Heading ── */}
          <motion.div
            custom={0.25}
            variants={FADE_UP}
            initial="hidden"
            animate="show"
          >
            <h2 className="font-poppins font-bold text-3xl
              text-forest-900 dark:text-forest-50 mb-1 leading-tight">
              {t('auth.login')}
            </h2>
            <p className="body-text text-sm mb-8">
              {t('auth.welcomeBack')}
            </p>
          </motion.div>

          {/* ── Form-level error banner ── */}
          <AnimatePresence>
            {errors.form && (
              <motion.div
                key="form-err"
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0,  height: 'auto' }}
                exit   ={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.25 }}
                role="alert"
                className="mb-5 px-4 py-3 rounded-xl text-sm font-inter
                  bg-red-50 dark:bg-red-900/20
                  border border-red-200 dark:border-red-800
                  text-red-700 dark:text-red-300 flex items-start gap-2"
              >
                {/* inline error icon */}
                <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd"
                    d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0Zm-8-5a1 1 0 0 1 1 1v4a1
                       1 0 1 1-2 0V6a1 1 0 0 1 1-1Zm0 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
                </svg>
                <span>{errors.form}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Fields ── */}
          <motion.form
            id={formId}
            custom={0.35}
            variants={FADE_UP}
            initial="hidden"
            animate="show"
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5"
          >
            <div className="space-y-1">
              <Input
                id={`${formId}-email`}
                label={t('auth.email')}
                type="email"
                value={fields.email}
                onChange={(e) => setField('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? `${formId}-email-err` : undefined}
              />
              <AnimatePresence>
                {errors.email && (
                  <FieldError id={`${formId}-email-err`} msg={errors.email} />
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-1">
              <Input
                id={`${formId}-password`}
                label={t('auth.password')}
                type="password"
                value={fields.password}
                onChange={(e) => setField('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? `${formId}-password-err` : undefined}
              />
              <AnimatePresence>
                {errors.password && (
                  <FieldError id={`${formId}-password-err`} msg={errors.password} />
                )}
              </AnimatePresence>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end -mt-2">
              <Link
                to="/forgot-password"
                className="text-xs font-inter text-forest-500 dark:text-forest-400
                  hover:text-forest-700 dark:hover:text-forest-200
                  underline-offset-2 hover:underline transition-colors"
              >
                {t('auth.forgotPassword', 'Forgot password?')}
              </Link>
            </div>

            <Button
              type="submit"
              loading={loading}
              fullWidth
              disabled={loading}
              aria-label={t('auth.login')}
              className="!rounded-full !py-3.5 mt-1"
            >
              {loading ? t('auth.signingIn', 'Signing in…') : t('auth.login')}
            </Button>
          </motion.form>

          {/* ── Divider ── */}
          <motion.div
            custom={0.5}
            variants={FADE_IN}
            initial="hidden"
            animate="show"
            className="my-6 flex items-center gap-3"
          >
            <span className="flex-1 h-px bg-sage-200 dark:bg-surface-border-dark" />
            <span className="text-xs font-inter text-sage-400 dark:text-sage-600 uppercase tracking-wider">
              {t('auth.orContinueWith', 'or')}
            </span>
            <span className="flex-1 h-px bg-sage-200 dark:bg-surface-border-dark" />
          </motion.div>

          {/* ── Sign-up link ── */}
          <motion.p
            custom={0.55}
            variants={FADE_IN}
            initial="hidden"
            animate="show"
            className="text-center text-sm body-text"
          >
            {t('auth.noAccount')}{' '}
            <Link
              to="/register"
              className="font-poppins font-semibold
                text-forest-600 dark:text-forest-300
                hover:text-forest-800 dark:hover:text-forest-100
                underline-offset-2 hover:underline transition-colors"
            >
              {t('auth.signUp')}
            </Link>
          </motion.p>
        </div>

        {/* ══ Illustration side ══ */}
        <IllustrationPanel />
      </motion.div>
    </div>
  );
};

// ─── Tiny reusable field-error pill ──────────────────────────────────────────
const FieldError = ({ id, msg }) => (
  <motion.p
    id={id}
    role="alert"
    key={msg}
    initial={{ opacity: 0, y: -4 }}
    animate={{ opacity: 1, y: 0  }}
    exit   ={{ opacity: 0, y: -4 }}
    transition={{ duration: 0.2 }}
    className="text-xs font-inter text-red-500 dark:text-red-400 flex items-center gap-1 pl-1"
  >
    <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="currentColor">
      <path d="M6 0a6 6 0 1 0 0 12A6 6 0 0 0 6 0Zm0 9a.75.75 0 1 1 0
        1.5A.75.75 0 0 1 6 9Zm.75-5.25v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 1.5 0Z" />
    </svg>
    {msg}
  </motion.p>
);

export default Login;