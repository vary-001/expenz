// src/components/onboarding/OnboardingModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';

import Modal from '../common/Modal';
import Button from '../common/Button';
import Logo from '../../assets/svgs/Logo';
import DollarIcon from '../../assets/svgs/DollarIcon';
import GlobeIcon from '../../assets/svgs/GlobeIcon';
import SunIcon from '../../assets/svgs/SunIcon';
import MoonIcon from '../../assets/svgs/MoonIcon';
import CheckIcon from '../../assets/svgs/CheckIcon';

const STEPS = ['welcome', 'currency', 'language', 'theme', 'ready'];

const OnboardingModal = () => {
  const { user, completeOnboarding } = useAuth();
  const { setTheme } = useTheme();
  const { changeLanguage } = useLanguage();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    currency: 'USD',
    language: 'en',
    theme: 'light',
  });

  const isOpen = user && !user.onboarded;

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await completeOnboarding(data);
      // Apply theme and language immediately
      setTheme(data.theme);
      changeLanguage(data.language);
      addToast('Welcome to Expenz!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Setup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={() => {}} closable={false} size="md">
      <div className="relative">
        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          {STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                idx <= step
                  ? 'bg-gradient-forest'
                  : 'bg-sage-100 dark:bg-surface-border-dark'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 0: Welcome */}
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center py-4"
            >
              <div className="flex justify-center mb-4">
                <Logo size={60} />
              </div>
              <h2 className="font-poppins font-bold text-2xl text-gradient-forest mb-2">
                {t('onboarding.welcome')}
              </h2>
              <p className="body-text mb-6">
                {t('onboarding.letsSetup')}
              </p>
              <Button onClick={next} fullWidth>
                {t('common.next')}
              </Button>
            </motion.div>
          )}

          {/* STEP 1: Currency */}
          {step === 1 && (
            <motion.div
              key="currency"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-forest-50 dark:bg-forest-900/40 text-forest-600 dark:text-forest-300">
                  <DollarIcon size={22} />
                </div>
                <div>
                  <h2 className="heading-2">{t('onboarding.currency')}</h2>
                  <p className="body-text text-xs">{t('onboarding.currencyDesc')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { code: 'USD', symbol: '$', name: 'US Dollar' },
                  { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc' },
                ].map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setData({ ...data, currency: c.code })}
                    className={`p-4 rounded-xl border-2 transition-all text-left
                      ${data.currency === c.code
                        ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/40'
                        : 'border-sage-200 dark:border-surface-border-dark hover:border-forest-300'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-poppins font-bold text-2xl text-forest-700 dark:text-forest-200">
                        {c.symbol}
                      </span>
                      {data.currency === c.code && (
                        <div className="w-5 h-5 rounded-full bg-forest-500 flex items-center justify-center text-white">
                          <CheckIcon size={14} />
                        </div>
                      )}
                    </div>
                    <p className="font-poppins font-semibold text-sm text-forest-800 dark:text-forest-100">
                      {c.code}
                    </p>
                    <p className="body-text text-xs">{c.name}</p>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={prev}>{t('common.back')}</Button>
                <Button onClick={next} fullWidth>{t('common.next')}</Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Language */}
          {step === 2 && (
            <motion.div
              key="language"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-forest-50 dark:bg-forest-900/40 text-forest-600 dark:text-forest-300">
                  <GlobeIcon size={22} />
                </div>
                <div>
                  <h2 className="heading-2">{t('onboarding.language')}</h2>
                  <p className="body-text text-xs">{t('onboarding.languageDesc')}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
                  { code: 'kiny', label: 'Kinyarwanda', native: 'Ikinyarwanda', flag: '🇷🇼' },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setData({ ...data, language: l.code })}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between
                      ${data.language === l.code
                        ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/40'
                        : 'border-sage-200 dark:border-surface-border-dark hover:border-forest-300'
                      }`}
                  >
                    <div className="text-left">
                      <p className="font-poppins font-semibold text-sm text-forest-800 dark:text-forest-100">
                        {l.native}
                      </p>
                      <p className="body-text text-xs">{l.label}</p>
                    </div>
                    {data.language === l.code && (
                      <div className="w-5 h-5 rounded-full bg-forest-500 flex items-center justify-center text-white">
                        <CheckIcon size={14} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={prev}>{t('common.back')}</Button>
                <Button onClick={next} fullWidth>{t('common.next')}</Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Theme */}
          {step === 3 && (
            <motion.div
              key="theme"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-forest-50 dark:bg-forest-900/40 text-forest-600 dark:text-forest-300">
                  <SunIcon size={22} />
                </div>
                <div>
                  <h2 className="heading-2">{t('onboarding.theme')}</h2>
                  <p className="body-text text-xs">{t('onboarding.themeDesc')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => { setData({ ...data, theme: 'light' }); setTheme('light'); }}
                  className={`p-4 rounded-xl border-2 transition-all
                    ${data.theme === 'light'
                      ? 'border-forest-500 bg-forest-50'
                      : 'border-sage-200 dark:border-surface-border-dark hover:border-forest-300'
                    }`}
                >
                  <div className="w-full h-20 rounded-lg bg-gradient-to-br from-white to-forest-50 border border-sage-100 mb-2 flex items-center justify-center">
                    <SunIcon size={28} className="text-forest-500" />
                  </div>
                  <p className="font-poppins font-semibold text-sm text-forest-800 dark:text-forest-100">
                    {t('settings.lightMode')}
                  </p>
                </button>
                <button
                  onClick={() => { setData({ ...data, theme: 'dark' }); setTheme('dark'); }}
                  className={`p-4 rounded-xl border-2 transition-all
                    ${data.theme === 'dark'
                      ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/40'
                      : 'border-sage-200 dark:border-surface-border-dark hover:border-forest-300'
                    }`}
                >
                  <div className="w-full h-20 rounded-lg bg-gradient-to-br from-forest-950 to-forest-800 mb-2 flex items-center justify-center">
                    <MoonIcon size={28} className="text-forest-200" />
                  </div>
                  <p className="font-poppins font-semibold text-sm text-forest-800 dark:text-forest-100">
                    {t('settings.darkMode')}
                  </p>
                </button>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={prev}>{t('common.back')}</Button>
                <Button onClick={next} fullWidth>{t('common.next')}</Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Ready */}
          {step === 4 && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-gradient-forest mx-auto mb-4 flex items-center justify-center text-white"
              >
                <CheckIcon size={40} />
              </motion.div>
              <h2 className="font-poppins font-bold text-2xl text-gradient-forest mb-2">
                {t('onboarding.ready')}
              </h2>
              <p className="body-text mb-6">
                {t('onboarding.readyDesc')}
              </p>

              {/* Summary */}
              <div className="bg-forest-50 dark:bg-forest-900/40 rounded-xl p-4 mb-6 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="body-text">Currency:</span>
                  <span className="font-poppins font-semibold text-forest-700 dark:text-forest-200">
                    {data.currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="body-text">Language:</span>
                  <span className="font-poppins font-semibold text-forest-700 dark:text-forest-200">
                    {data.language === 'en' ? 'English' : 'Ikinyarwanda'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="body-text">Theme:</span>
                  <span className="font-poppins font-semibold text-forest-700 dark:text-forest-200 capitalize">
                    {data.theme}
                  </span>
                </div>
              </div>

              <Button onClick={handleFinish} loading={loading} fullWidth>
                {t('onboarding.getStarted')}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};

export default OnboardingModal;