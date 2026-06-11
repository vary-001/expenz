// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ThemeToggle from '../components/common/ThemeToggle';
import LanguageToggle from '../components/common/LanguageToggle';
import Logo from '../assets/svgs/Logo';
import WaveBackground from '../assets/svgs/WaveBackground';
import LoginIllustration from '../assets/svgs/LoginIllustration';
import UserIcon from '../assets/svgs/UserIcon';

const Register = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
    if (form.password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (form.password !== form.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      addToast('Account created! Welcome to Expenz!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-surface-dark flex items-center justify-center p-4 theme-transition">
      <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-white dark:bg-surface-card-dark rounded-3xl shadow-xl overflow-hidden flex min-h-[650px] relative border border-sage-100 dark:border-surface-border-dark"
      >
        {/* Illustration side */}
        <div className="hidden lg:block w-1/2 relative overflow-hidden">
          <WaveBackground className="absolute inset-0 w-full h-full transform scale-x-[-1]" />
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              <LoginIllustration className="w-80 h-80 drop-shadow-lg" />
            </motion.div>
          </div>
        </div>

        {/* Form side */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center relative z-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-8"
          >
            <Logo size={40} />
            <div>
              <h1 className="font-poppins font-bold text-2xl text-gradient-forest">Expenz</h1>
              <p className="text-[10px] font-inter text-sage-400 dark:text-sage-500 -mt-0.5 tracking-wide uppercase">
                Smart Finance
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-poppins font-bold text-3xl text-forest-900 dark:text-forest-50 mb-2">
              {t('auth.register')}
            </h2>
            <p className="body-text mb-6">{t('auth.createAccount')}</p>
          </motion.div>

          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <Input label={t('auth.name')} name="name" value={form.name} onChange={handleChange}
                   placeholder="Your full name" icon={UserIcon} />
            <Input label={t('auth.email')} name="email" type="email" value={form.email} onChange={handleChange}
                   placeholder="you@example.com" />
            <Input label={t('auth.password')} name="password" type="password" value={form.password} onChange={handleChange}
                   placeholder="Min. 6 characters" />
            <Input label={t('auth.confirmPassword')} name="confirmPassword" type="password"
                   value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" />
            <Button type="submit" loading={loading} fullWidth className="!rounded-full !py-3.5">
              {t('auth.register')}
            </Button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center body-text"
          >
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="text-forest-600 dark:text-forest-300 font-poppins font-semibold hover:text-forest-700 dark:hover:text-forest-200 transition-colors">
              {t('auth.login')}
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;