// src/components/layout/MobileNav.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../../assets/svgs/Logo';
import DashboardIcon from '../../assets/svgs/DashboardIcon';
import ExpenseIcon from '../../assets/svgs/ExpenseIcon';
import BudgetIcon from '../../assets/svgs/BudgetIcon';
import IncomeIcon from '../../assets/svgs/IncomeIcon';
import ReportIcon from '../../assets/svgs/ReportIcon';
import ArchiveIcon from '../../assets/svgs/ArchiveIcon';
import SettingsIcon from '../../assets/svgs/SettingsIcon';
import LogoutIcon from '../../assets/svgs/LogoutIcon';
import CloseIcon from '../../assets/svgs/CloseIcon';
import { useAuth } from '../../hooks/useAuth';

// src/components/layout/MobileNav.jsx (UPDATE navItems)
const navItems = [
  { path: '/dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { path: '/expenses', label: 'Expenses', Icon: ExpenseIcon },  // ← renamed
  { path: '/income', label: 'Income', Icon: IncomeIcon },
  { path: '/budget', label: 'Budget', Icon: BudgetIcon },
  { path: '/reports', label: 'Reports', Icon: ReportIcon },
  { path: '/archives', label: 'Archives', Icon: ArchiveIcon },
  { path: '/settings', label: 'Settings', Icon: SettingsIcon },
];

const MobileNav = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-forest-950/30 backdrop-blur-sm z-50 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 lg:hidden shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-sage-100">
              <div className="flex items-center gap-3">
                <Logo size={32} />
                <span className="text-lg font-roboto font-bold text-gradient-forest">Expenz</span>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-forest-50 text-sage-400">
                <CloseIcon size={20} />
              </button>
            </div>

            {/* User card */}
            <div className="mx-4 mt-4 p-3 rounded-xl bg-gradient-forest">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white font-roboto font-bold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-roboto font-medium text-white truncate">{user?.name}</p>
                  <p className="text-[10px] font-roboto text-white/60 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map(({ path, label, Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <NavLink key={path} to={path} onClick={onClose} className="block">
                    <div className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl font-roboto text-sm font-medium transition-all
                      ${isActive ? 'bg-forest-50 text-forest-700' : 'text-sage-500 hover:text-forest-700 hover:bg-forest-50/50'}
                    `}>
                      <Icon size={20} active={isActive} />
                      <span>{label}</span>
                    </div>
                  </NavLink>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-sage-100">
              <button
                onClick={() => { logout(); onClose(); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-roboto text-sm font-medium text-sage-400 hover:text-red-500 hover:bg-red-50 transition-all w-full"
              >
                <LogoutIcon size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNav;