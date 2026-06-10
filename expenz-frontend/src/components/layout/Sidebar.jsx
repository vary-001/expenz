// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../../assets/svgs/Logo';
import DashboardIcon from '../../assets/svgs/DashboardIcon';
import ExpenseIcon from '../../assets/svgs/ExpenseIcon';
import BudgetIcon from '../../assets/svgs/BudgetIcon';
import IncomeIcon from '../../assets/svgs/IncomeIcon';
import ReportIcon from '../../assets/svgs/ReportIcon';
import ArchiveIcon from '../../assets/svgs/ArchiveIcon';
import SettingsIcon from '../../assets/svgs/SettingsIcon';
import LogoutIcon from '../../assets/svgs/LogoutIcon';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { path: '/transactions', label: 'Transactions', Icon: ExpenseIcon },
  { path: '/income', label: 'Income', Icon: IncomeIcon },
  { path: '/budget', label: 'Budget', Icon: BudgetIcon },
  { path: '/reports', label: 'Reports', Icon: ReportIcon },
  { path: '/archives', label: 'Archives', Icon: ArchiveIcon },
  { path: '/settings', label: 'Settings', Icon: SettingsIcon },
];

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-white border-r border-sage-100 fixed left-0 top-0 z-40">
      {/* Logo area */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sage-100">
        <Logo size={36} />
        <div>
          <h1 className="text-xl font-roboto font-bold text-gradient-forest">Expenz</h1>
          <p className="text-[10px] font-roboto text-sage-400 -mt-0.5">Smart Finance</p>
        </div>
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
            <p className="text-sm font-roboto font-medium text-white truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] font-roboto text-white/60 truncate">{user?.email || ''}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ path, label, Icon }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink key={path} to={path} className="block">
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl font-roboto text-sm font-medium
                  transition-all duration-200 relative overflow-hidden
                  ${isActive
                    ? 'bg-forest-50 text-forest-700'
                    : 'text-sage-500 hover:text-forest-700 hover:bg-forest-50/50'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-forest"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={20} active={isActive} />
                <span>{label}</span>
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-sage-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-roboto text-sm font-medium
                     text-sage-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 w-full"
        >
          <LogoutIcon size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;