// src/components/layout/MobileNav.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Logo from '../../assets/svgs/Logo';
import DashboardIcon from '../../assets/svgs/DashboardIcon';
import ExpenseIcon from '../../assets/svgs/ExpenseIcon';
import BudgetIcon from '../../assets/svgs/BudgetIcon';
import IncomeIcon from '../../assets/svgs/IncomeIcon';
import ReportIcon from '../../assets/svgs/ReportIcon';
import SettingsIcon from '../../assets/svgs/SettingsIcon';
import LogoutIcon from '../../assets/svgs/LogoutIcon';
import CloseIcon from '../../assets/svgs/CloseIcon';
import { useAuth } from '../../hooks/useAuth';

const MobileNav = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard'), Icon: DashboardIcon },
    { path: '/expenses', label: t('nav.expenses'), Icon: ExpenseIcon },
    { path: '/income', label: t('nav.income'), Icon: IncomeIcon },
    { path: '/budget', label: t('nav.budget'), Icon: BudgetIcon },
    { path: '/reports', label: t('nav.reports'), Icon: ReportIcon },
    { path: '/settings', label: t('nav.settings'), Icon: SettingsIcon },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-forest-950/40 backdrop-blur-sm z-50 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-72 z-50 lg:hidden flex flex-col shadow-xl
                       bg-white dark:bg-surface-card-dark theme-transition"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-sage-100 dark:border-surface-border-dark">
              <div className="flex items-center gap-3">
                <Logo size={32} />
                <span className="font-poppins font-bold text-lg text-gradient-forest">Expenz</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-forest-50 dark:hover:bg-forest-900/40
                           text-sage-400 dark:text-sage-300 transition-colors"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map(({ path, label, Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <NavLink key={path} to={path} onClick={onClose} className="block">
                    <div className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      font-inter text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-forest-50 dark:bg-forest-900/40 text-forest-700 dark:text-forest-200'
                        : 'text-sage-600 dark:text-sage-300 hover:bg-forest-50/60 dark:hover:bg-forest-900/20'
                      }
                    `}>
                      <Icon size={20} active={isActive} />
                      <span>{label}</span>
                    </div>
                  </NavLink>
                );
              })}
            </nav>

            <div className="p-3 border-t border-sage-100 dark:border-surface-border-dark">
              <button
                onClick={() => { logout(); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                           font-inter text-sm font-medium
                           text-sage-500 dark:text-sage-400
                           hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30
                           transition-all"
              >
                <LogoutIcon size={20} />
                <span>{t('nav.logout')}</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNav;