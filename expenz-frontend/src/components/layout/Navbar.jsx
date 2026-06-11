// src/components/layout/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { getGreeting } from '../../utils/formatters';

import ThemeToggle from '../common/ThemeToggle';
import LanguageToggle from '../common/LanguageToggle';
import MenuIcon from '../../assets/svgs/MenuIcon';
import BellIcon from '../../assets/svgs/BellIcon';
import LogoutIcon from '../../assets/svgs/LogoutIcon';
import SettingsIcon from '../../assets/svgs/SettingsIcon';
import UserIcon from '../../assets/svgs/UserIcon';

const Navbar = ({ onMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [accountOpen, setAccountOpen] = useState(false);
  const ref = useRef(null);

  const pageTitles = {
    '/dashboard': t('nav.dashboard'),
    '/expenses': t('nav.expenses'),
    '/income': t('nav.income'),
    '/budget': t('nav.budget'),
    '/reports': t('nav.reports'),
    '/settings': t('nav.settings'),
  };

  const title = pageTitles[location.pathname] || 'Expenz';

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 backdrop-blur-lg
                 bg-white/85 dark:bg-surface-card-dark/85
                 border-b border-sage-100 dark:border-surface-border-dark
                 theme-transition"
    >
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl
                       hover:bg-forest-50 dark:hover:bg-forest-900/40
                       text-forest-700 dark:text-forest-200 transition-colors"
          >
            <MenuIcon size={22} />
          </button>
          <div>
            <p className="font-inter text-xs text-sage-500 dark:text-sage-400">
              {getGreeting(t)}, {user?.name?.split(' ')[0] || 'User'}
            </p>
            <h2 className="font-poppins font-bold text-xl text-gradient-forest">
              {title}
            </h2>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Language */}
          <LanguageToggle />

          {/* Theme */}
          <ThemeToggle />

          {/* Notifications (placeholder) */}
          <button className="hidden sm:flex h-10 w-10 rounded-xl items-center justify-center
                             bg-forest-50 dark:bg-surface-card-dark
                             text-forest-700 dark:text-forest-200
                             hover:bg-forest-100 dark:hover:bg-forest-900/40
                             transition-colors relative">
            <BellIcon size={18} />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-forest-500" />
          </button>

          {/* Account Dropdown */}
          <div ref={ref} className="relative">
            <button
              onClick={() => setAccountOpen(!accountOpen)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl
                         hover:bg-forest-50 dark:hover:bg-forest-900/40
                         transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-forest flex items-center justify-center text-white">
                <span className="font-poppins font-bold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-inter font-semibold text-xs text-forest-800 dark:text-forest-100 leading-tight">
                  {user?.name?.split(' ')[0] || 'User'}
                </p>
                <p className="font-inter text-[10px] text-sage-500 dark:text-sage-400 leading-tight truncate max-w-[120px]">
                  {user?.email}
                </p>
              </div>
            </button>

            <AnimatePresence>
              {accountOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 mt-2 w-64 rounded-2xl shadow-card-hover
                             bg-white dark:bg-surface-card-dark
                             border border-sage-100 dark:border-surface-border-dark
                             overflow-hidden z-50"
                >
                  {/* User info */}
                  <div className="p-4 bg-gradient-forest text-white">
                    <p className="font-poppins font-semibold text-sm">{user?.name}</p>
                    <p className="font-inter text-xs text-white/70 truncate">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-white/80">
                      <span className="px-2 py-0.5 rounded-full bg-white/20">
                        {user?.preferences?.currency || 'USD'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/20 uppercase">
                        {user?.preferences?.language || 'EN'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-2">
                    <button
                      onClick={() => { navigate('/settings'); setAccountOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                                 font-inter text-sm
                                 text-sage-700 dark:text-sage-200
                                 hover:bg-forest-50 dark:hover:bg-forest-900/40 transition-colors"
                    >
                      <SettingsIcon size={16} />
                      <span>{t('nav.settings')}</span>
                    </button>
                    <button
                      onClick={() => { logout(); setAccountOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                                 font-inter text-sm
                                 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <LogoutIcon size={16} />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;