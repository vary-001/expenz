// src/components/onboarding/OnboardingModal.jsx
import React, { useState, useRef, useEffect } from 'react';
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

const WORLD_CURRENCIES = [
  { code: 'USD', symbol: '$',    name: 'US Dollar' },
  { code: 'EUR', symbol: '€',    name: 'Euro' },
  { code: 'GBP', symbol: '£',    name: 'British Pound' },
  { code: 'JPY', symbol: '¥',    name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥',    name: 'Chinese Yuan' },
  { code: 'CHF', symbol: 'Fr',   name: 'Swiss Franc' },
  { code: 'CAD', symbol: 'C$',   name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$',   name: 'Australian Dollar' },
  { code: 'NZD', symbol: 'NZ$',  name: 'New Zealand Dollar' },
  { code: 'HKD', symbol: 'HK$',  name: 'Hong Kong Dollar' },
  { code: 'SGD', symbol: 'S$',   name: 'Singapore Dollar' },
  { code: 'SEK', symbol: 'kr',   name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr',   name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr',   name: 'Danish Krone' },
  { code: 'INR', symbol: '₹',    name: 'Indian Rupee' },
  { code: 'KRW', symbol: '₩',    name: 'South Korean Won' },
  { code: 'BRL', symbol: 'R$',   name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'MX$',  name: 'Mexican Peso' },
  { code: 'ARS', symbol: '$',    name: 'Argentine Peso' },
  { code: 'CLP', symbol: '$',    name: 'Chilean Peso' },
  { code: 'COP', symbol: '$',    name: 'Colombian Peso' },
  { code: 'PEN', symbol: 'S/',   name: 'Peruvian Sol' },
  { code: 'ZAR', symbol: 'R',    name: 'South African Rand' },
  { code: 'NGN', symbol: '₦',    name: 'Nigerian Naira' },
  { code: 'KES', symbol: 'KSh',  name: 'Kenyan Shilling' },
  { code: 'GHS', symbol: 'GH₵',  name: 'Ghanaian Cedi' },
  { code: 'EGP', symbol: 'E£',   name: 'Egyptian Pound' },
  { code: 'MAD', symbol: 'MAD',  name: 'Moroccan Dirham' },
  { code: 'TZS', symbol: 'TSh',  name: 'Tanzanian Shilling' },
  { code: 'UGX', symbol: 'USh',  name: 'Ugandan Shilling' },
  { code: 'RWF', symbol: 'FRw',  name: 'Rwandan Franc' },
  { code: 'ETB', symbol: 'Br',   name: 'Ethiopian Birr' },
  { code: 'XOF', symbol: 'CFA',  name: 'West African CFA Franc' },
  { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc' },
  { code: 'AED', symbol: 'د.إ',  name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼',    name: 'Saudi Riyal' },
  { code: 'QAR', symbol: '﷼',    name: 'Qatari Riyal' },
  { code: 'KWD', symbol: 'د.ك',  name: 'Kuwaiti Dinar' },
  { code: 'BHD', symbol: 'BD',   name: 'Bahraini Dinar' },
  { code: 'OMR', symbol: '﷼',    name: 'Omani Rial' },
  { code: 'JOD', symbol: 'JD',   name: 'Jordanian Dinar' },
  { code: 'LBP', symbol: 'L£',   name: 'Lebanese Pound' },
  { code: 'ILS', symbol: '₪',    name: 'Israeli Shekel' },
  { code: 'TRY', symbol: '₺',    name: 'Turkish Lira' },
  { code: 'RUB', symbol: '₽',    name: 'Russian Ruble' },
  { code: 'UAH', symbol: '₴',    name: 'Ukrainian Hryvnia' },
  { code: 'PLN', symbol: 'zł',   name: 'Polish Zloty' },
  { code: 'CZK', symbol: 'Kč',   name: 'Czech Koruna' },
  { code: 'HUF', symbol: 'Ft',   name: 'Hungarian Forint' },
  { code: 'RON', symbol: 'lei',  name: 'Romanian Leu' },
  { code: 'BGN', symbol: 'лв',   name: 'Bulgarian Lev' },
  { code: 'HRK', symbol: 'kn',   name: 'Croatian Kuna' },
  { code: 'RSD', symbol: 'din',  name: 'Serbian Dinar' },
  { code: 'MYR', symbol: 'RM',   name: 'Malaysian Ringgit' },
  { code: 'THB', symbol: '฿',    name: 'Thai Baht' },
  { code: 'IDR', symbol: 'Rp',   name: 'Indonesian Rupiah' },
  { code: 'PHP', symbol: '₱',    name: 'Philippine Peso' },
  { code: 'VND', symbol: '₫',    name: 'Vietnamese Dong' },
  { code: 'BDT', symbol: '৳',    name: 'Bangladeshi Taka' },
  { code: 'PKR', symbol: '₨',    name: 'Pakistani Rupee' },
  { code: 'LKR', symbol: '₨',    name: 'Sri Lankan Rupee' },
  { code: 'NPR', symbol: '₨',    name: 'Nepalese Rupee' },
  { code: 'MMK', symbol: 'K',    name: 'Myanmar Kyat' },
  { code: 'KHR', symbol: '៛',    name: 'Cambodian Riel' },
  { code: 'TWD', symbol: 'NT$',  name: 'Taiwan Dollar' },
  { code: 'MOP', symbol: 'MOP$', name: 'Macanese Pataca' },
  { code: 'ISK', symbol: 'kr',   name: 'Icelandic Króna' },
  { code: 'MKD', symbol: 'ден',  name: 'Macedonian Denar' },
  { code: 'GEL', symbol: '₾',    name: 'Georgian Lari' },
  { code: 'AMD', symbol: '֏',    name: 'Armenian Dram' },
  { code: 'AZN', symbol: '₼',    name: 'Azerbaijani Manat' },
  { code: 'KZT', symbol: '₸',    name: 'Kazakhstani Tenge' },
  { code: 'UZS', symbol: 'сум',  name: 'Uzbekistani Som' },
  { code: 'MNT', symbol: '₮',    name: 'Mongolian Tugrik' },
  { code: 'CUP', symbol: '$',    name: 'Cuban Peso' },
  { code: 'DOP', symbol: 'RD$',  name: 'Dominican Peso' },
  { code: 'GTQ', symbol: 'Q',    name: 'Guatemalan Quetzal' },
  { code: 'HNL', symbol: 'L',    name: 'Honduran Lempira' },
  { code: 'NIO', symbol: 'C$',   name: 'Nicaraguan Córdoba' },
  { code: 'PAB', symbol: 'B/.',  name: 'Panamanian Balboa' },
  { code: 'PYG', symbol: '₲',    name: 'Paraguayan Guaraní' },
  { code: 'UYU', symbol: '$U',   name: 'Uruguayan Peso' },
  { code: 'BOB', symbol: 'Bs.',  name: 'Bolivian Boliviano' },
  { code: 'VES', symbol: 'Bs.S', name: 'Venezuelan Bolívar' },
  { code: 'TTD', symbol: 'TT$',  name: 'Trinidad & Tobago Dollar' },
  { code: 'JMD', symbol: 'J$',   name: 'Jamaican Dollar' },
  { code: 'BBD', symbol: 'Bds$', name: 'Barbadian Dollar' },
  { code: 'BWP', symbol: 'P',    name: 'Botswana Pula' },
  { code: 'MUR', symbol: '₨',    name: 'Mauritian Rupee' },
  { code: 'SCR', symbol: '₨',    name: 'Seychellois Rupee' },
  { code: 'MZN', symbol: 'MT',   name: 'Mozambican Metical' },
  { code: 'ZMW', symbol: 'ZK',   name: 'Zambian Kwacha' },
  { code: 'MWK', symbol: 'MK',   name: 'Malawian Kwacha' },
  { code: 'AOA', symbol: 'Kz',   name: 'Angolan Kwanza' },
  { code: 'DZD', symbol: 'دج',   name: 'Algerian Dinar' },
  { code: 'TND', symbol: 'DT',   name: 'Tunisian Dinar' },
  { code: 'LYD', symbol: 'LD',   name: 'Libyan Dinar' },
  { code: 'SDG', symbol: '£',    name: 'Sudanese Pound' },
  { code: 'SOS', symbol: 'Sh',   name: 'Somali Shilling' },
  { code: 'MGA', symbol: 'Ar',   name: 'Malagasy Ariary' },
  { code: 'IQD', symbol: 'ع.د',  name: 'Iraqi Dinar' },
  { code: 'IRR', symbol: '﷼',    name: 'Iranian Rial' },
  { code: 'SYP', symbol: '£',    name: 'Syrian Pound' },
  { code: 'YER', symbol: '﷼',    name: 'Yemeni Rial' },
  { code: 'AFN', symbol: '؋',    name: 'Afghan Afghani' },
];

const OnboardingModal = () => {
  const { user, completeOnboarding } = useAuth();
  const { setTheme } = useTheme();
  const { changeLanguage } = useLanguage();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const searchRef = useRef(null);

  const [data, setData] = useState({
    currency: 'USD',
    language: 'en',
    theme: 'light',
  });

  const isOpen = user && !user.onboarded;

  // Focus search when entering currency step
  useEffect(() => {
    if (step === 1 && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 300);
    }
  }, [step]);

  const filteredCurrencies = WORLD_CURRENCIES.filter((c) => {
    const q = currencySearch.toLowerCase();
    return (
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.symbol.toLowerCase().includes(q)
    );
  });

  const selectedCurrency = WORLD_CURRENCIES.find((c) => c.code === data.currency);

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

          {/* ── STEP 0: Welcome ─────────────────────────────────── */}
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
              <p className="body-text mb-6">{t('onboarding.letsSetup')}</p>
              <Button onClick={next} fullWidth>
                {t('common.next')}
              </Button>
            </motion.div>
          )}

          {/* ── STEP 1: Currency ────────────────────────────────── */}
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

              {/* Search */}
              <div className="relative mb-3">
                <input
                  ref={searchRef}
                  type="text"
                  value={currencySearch}
                  onChange={(e) => setCurrencySearch(e.target.value)}
                  placeholder="Search currency…"
                  className="
                    w-full px-4 py-2.5 pl-9 rounded-xl text-sm
                    border-2 border-sage-200 dark:border-surface-border-dark
                    bg-white dark:bg-surface-dark
                    text-forest-800 dark:text-forest-100
                    placeholder:text-sage-400 dark:placeholder:text-sage-500
                    focus:outline-none focus:border-forest-400
                    transition-colors
                  "
                />
                <GlobeIcon
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400"
                />
                {currencySearch && (
                  <button
                    onClick={() => setCurrencySearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-forest-500 transition-colors text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Currency list */}
              <div className="h-56 overflow-y-auto rounded-xl border-2 border-sage-100 dark:border-surface-border-dark mb-4 scrollbar-thin scrollbar-thumb-sage-200 dark:scrollbar-thumb-forest-800">
                {filteredCurrencies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-sage-400">
                    <DollarIcon size={28} />
                    <p className="text-xs">No currencies found</p>
                  </div>
                ) : (
                  filteredCurrencies.map((c) => {
                    const selected = data.currency === c.code;
                    return (
                      <button
                        key={c.code}
                        onClick={() => setData({ ...data, currency: c.code })}
                        className={`
                          w-full flex items-center justify-between px-4 py-2.5
                          transition-colors text-left
                          ${selected
                            ? 'bg-forest-50 dark:bg-forest-900/40'
                            : 'hover:bg-sage-50 dark:hover:bg-forest-900/20'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          {/* Symbol badge */}
                          <span className="
                            w-9 h-9 rounded-lg flex items-center justify-center
                            bg-sage-100 dark:bg-forest-900/60
                            font-poppins font-bold text-sm
                            text-forest-700 dark:text-forest-200
                            shrink-0
                          ">
                            {c.symbol}
                          </span>
                          <div>
                            <p className="font-poppins font-semibold text-sm text-forest-800 dark:text-forest-100 leading-none mb-0.5">
                              {c.code}
                            </p>
                            <p className="body-text text-xs leading-none">{c.name}</p>
                          </div>
                        </div>
                        {selected && (
                          <div className="w-5 h-5 rounded-full bg-forest-500 flex items-center justify-center text-white shrink-0">
                            <CheckIcon size={12} />
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Selected pill */}
              {selectedCurrency && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-forest-50 dark:bg-forest-900/40">
                  <span className="text-xs body-text">Selected:</span>
                  <span className="font-poppins font-semibold text-sm text-forest-700 dark:text-forest-200">
                    {selectedCurrency.symbol} {selectedCurrency.code} — {selectedCurrency.name}
                  </span>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="ghost" onClick={prev}>{t('common.back')}</Button>
                <Button onClick={next} fullWidth>{t('common.next')}</Button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Language ────────────────────────────────── */}
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
                  { code: 'en',   label: 'English',     native: 'English',      flag: '🇬🇧' },
                  { code: 'kiny', label: 'Kinyarwanda',  native: 'Ikinyarwanda', flag: '🇷🇼' },
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
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-2xl">{l.flag}</span>
                      <div>
                        <p className="font-poppins font-semibold text-sm text-forest-800 dark:text-forest-100">
                          {l.native}
                        </p>
                        <p className="body-text text-xs">{l.label}</p>
                      </div>
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

          {/* ── STEP 3: Theme ───────────────────────────────────── */}
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

          {/* ── STEP 4: Ready ───────────────────────────────────── */}
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
              <p className="body-text mb-6">{t('onboarding.readyDesc')}</p>

              {/* Summary */}
              <div className="bg-forest-50 dark:bg-forest-900/40 rounded-xl p-4 mb-6 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="body-text">Currency:</span>
                  <span className="font-poppins font-semibold text-forest-700 dark:text-forest-200">
                    {selectedCurrency
                      ? `${selectedCurrency.symbol} ${selectedCurrency.code} — ${selectedCurrency.name}`
                      : data.currency}
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