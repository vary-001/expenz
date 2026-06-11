// src/components/common/LanguageToggle.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import GlobeIcon from '../../assets/svgs/GlobeIcon';

const languages = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'kiny', label: 'Kinyarwanda', native: 'Ikinyarwanda' },
];

const LanguageToggle = () => {
  const { language, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = languages.find((l) => l.code === language) || languages[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="h-10 px-3 rounded-xl flex items-center gap-2
                   bg-forest-50 dark:bg-surface-card-dark
                   text-forest-700 dark:text-forest-200
                   hover:bg-forest-100 dark:hover:bg-forest-900
                   transition-all duration-300"
      >
        <GlobeIcon size={18} />
        <span className="text-xs font-inter font-medium uppercase">{current.code}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute right-0 mt-2 w-48 rounded-xl shadow-card-hover
                       bg-white dark:bg-surface-card-dark
                       border border-sage-100 dark:border-surface-border-dark
                       overflow-hidden z-50"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-3 flex items-center justify-between font-inter text-sm
                            transition-colors hover:bg-forest-50 dark:hover:bg-forest-900/40
                            ${language === lang.code
                              ? 'text-forest-700 dark:text-forest-200 font-semibold'
                              : 'text-sage-600 dark:text-sage-300'}`}
              >
                <span>{lang.native}</span>
                {language === lang.code && (
                  <span className="w-2 h-2 rounded-full bg-forest-500" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageToggle;