// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Logo from '../../assets/svgs/Logo';
import DashboardIcon from '../../assets/svgs/DashboardIcon';
import ExpenseIcon from '../../assets/svgs/ExpenseIcon';
import BudgetIcon from '../../assets/svgs/BudgetIcon';
import IncomeIcon from '../../assets/svgs/IncomeIcon';
import ReportIcon from '../../assets/svgs/ReportIcon';
import SettingsIcon from '../../assets/svgs/SettingsIcon';
import LogoutIcon from '../../assets/svgs/LogoutIcon';
import { useAuth } from '../../hooks/useAuth';

const MoneyBgPattern = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.035] dark:opacity-[0.08]"
    viewBox="0 0 200 600"
    fill="none"
    preserveAspectRatio="xMidYMid slice"
  >
    <g className="fill-forest-700 dark:fill-forest-300">
      <text x="20" y="80" fontSize="40" fontFamily="Poppins" fontWeight="700">$</text>
      <text x="140" y="160" fontSize="32" fontFamily="Poppins" fontWeight="700">$</text>
      <text x="60" y="240" fontSize="28" fontFamily="Poppins" fontWeight="700">$</text>
      <text x="150" y="320" fontSize="36" fontFamily="Poppins" fontWeight="700">$</text>
      <text x="30" y="420" fontSize="30" fontFamily="Poppins" fontWeight="700">$</text>
      <text x="120" y="500" fontSize="34" fontFamily="Poppins" fontWeight="700">$</text>
    </g>
    <g className="stroke-forest-600 dark:stroke-forest-300" fill="none" strokeWidth="1.5">
      <circle cx="170" cy="60" r="12" />
      <circle cx="40" cy="180" r="10" />
      <circle cx="160" cy="380" r="14" />
      <circle cx="80" cy="460" r="11" />
    </g>
    <g className="stroke-forest-600 dark:stroke-forest-300" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M100,140 L110,130 L120,135 L130,120 M125,120 L130,120 L130,125" />
      <path d="M80,360 L90,350 L100,355 L110,340 M105,340 L110,340 L110,345" />
    </g>
  </svg>
);

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
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
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 z-40 overflow-hidden
                      bg-white dark:bg-surface-card-dark
                      border-r border-sage-100 dark:border-surface-border-dark
                      theme-transition">
      <MoneyBgPattern />

      <div className="relative z-10 flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-sage-100/60 dark:border-surface-border-dark">
          <motion.div
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Logo size={38} />
          </motion.div>
          <div>
            <h1 className="font-poppins font-bold text-xl text-gradient-forest leading-tight">
              Expenz
            </h1>
            <p className="font-inter text-[10px] text-sage-500 dark:text-sage-400 -mt-0.5 tracking-widest uppercase">
              Smart Finance
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto no-scrollbar">
          <p className="font-inter text-[10px] font-semibold text-sage-400 dark:text-sage-500 uppercase tracking-widest px-4 mb-3">
            Menu
          </p>
          {navItems.map(({ path, label, Icon }, idx) => {
            const isActive = location.pathname === path;
            return (
              <NavLink key={path} to={path} className="block">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    font-inter text-sm font-medium
                    transition-all duration-200 relative overflow-hidden
                    ${isActive
                      ? 'bg-forest-50 dark:bg-forest-900/40 text-forest-700 dark:text-forest-200 shadow-sm'
                      : 'text-sage-600 dark:text-sage-300 hover:text-forest-700 dark:hover:text-forest-200 hover:bg-forest-50/60 dark:hover:bg-forest-900/20'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full bg-gradient-forest"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon size={20} active={isActive} />
                  <span className="flex-1">{label}</span>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-1.5 h-1.5 rounded-full bg-forest-500"
                    />
                  )}
                </motion.div>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-sage-100/60 dark:border-surface-border-dark">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full
                       font-inter text-sm font-medium
                       text-sage-500 dark:text-sage-400
                       hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30
                       transition-all duration-200"
          >
            <LogoutIcon size={20} />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;