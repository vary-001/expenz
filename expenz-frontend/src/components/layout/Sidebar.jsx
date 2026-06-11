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
  { path: '/expenses', label: 'Expenses', Icon: ExpenseIcon },
  { path: '/income', label: 'Income', Icon: IncomeIcon },
  { path: '/budget', label: 'Budget', Icon: BudgetIcon },
  { path: '/reports', label: 'Reports', Icon: ReportIcon },
  { path: '/archives', label: 'Archives', Icon: ArchiveIcon },
  { path: '/settings', label: 'Settings', Icon: SettingsIcon },
];

// Decorative SVG money pattern background
const MoneyBgPattern = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]"
    viewBox="0 0 200 600"
    fill="none"
    preserveAspectRatio="xMidYMid slice"
  >
    {/* Dollar signs scattered */}
    <g fill="#2d6a50">
      <text x="20" y="80" fontSize="40" fontWeight="bold" fontFamily="Roboto">$</text>
      <text x="140" y="160" fontSize="32" fontWeight="bold" fontFamily="Roboto">$</text>
      <text x="60" y="240" fontSize="28" fontWeight="bold" fontFamily="Roboto">$</text>
      <text x="150" y="320" fontSize="36" fontWeight="bold" fontFamily="Roboto">$</text>
      <text x="30" y="420" fontSize="30" fontWeight="bold" fontFamily="Roboto">$</text>
      <text x="120" y="500" fontSize="34" fontWeight="bold" fontFamily="Roboto">$</text>
      <text x="50" y="580" fontSize="28" fontWeight="bold" fontFamily="Roboto">$</text>
    </g>

    {/* Coins */}
    <g>
      <circle cx="170" cy="60" r="12" stroke="#3d8365" strokeWidth="2" fill="none" />
      <circle cx="170" cy="60" r="6" fill="#3d8365" />
      <circle cx="40" cy="180" r="10" stroke="#5a9f7e" strokeWidth="2" fill="none" />
      <circle cx="160" cy="380" r="14" stroke="#3d8365" strokeWidth="2" fill="none" />
      <circle cx="160" cy="380" r="7" fill="#3d8365" />
      <circle cx="80" cy="460" r="11" stroke="#5a9f7e" strokeWidth="2" fill="none" />
    </g>

    {/* Up-trending arrows (growth symbol) */}
    <g stroke="#2d6a50" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M100,140 L110,130 L120,135 L130,120 M125,120 L130,120 L130,125" />
      <path d="M80,360 L90,350 L100,355 L110,340 M105,340 L110,340 L110,345" />
    </g>

    {/* Small bills */}
    <g stroke="#3d8365" strokeWidth="1.5" fill="none" opacity="0.6">
      <rect x="100" y="220" width="28" height="16" rx="2" />
      <circle cx="114" cy="228" r="3" />
      <rect x="20" y="340" width="28" height="16" rx="2" />
      <circle cx="34" cy="348" r="3" />
    </g>

    {/* Leaves matching theme */}
    <g opacity="0.5" fill="#5a9f7e">
      <path d="M10,100 Q20,90 30,100 Q20,110 10,100 Z" />
      <path d="M180,250 Q190,240 200,250 Q190,260 180,250 Z" />
      <path d="M15,540 Q25,530 35,540 Q25,550 15,540 Z" />
    </g>
  </svg>
);

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-gradient-to-b from-white via-forest-50/20 to-white border-r border-sage-100 fixed left-0 top-0 z-40 overflow-hidden">
      {/* Decorative money pattern background */}
      <MoneyBgPattern />

      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-forest-50/50 to-transparent pointer-events-none" />

      {/* Content (relative to stay above background) */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo Area */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-sage-100/60">
          <motion.div
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Logo size={40} />
          </motion.div>
          <div>
            <h1 className="text-xl font-roboto font-bold text-gradient-forest leading-tight">Expenz</h1>
            <p className="text-[10px] font-roboto text-sage-500 -mt-0.5 tracking-wide">SMART FINANCE</p>
          </div>
        </div>

        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-4 mt-4 p-3 rounded-2xl bg-gradient-forest shadow-forest relative overflow-hidden"
        >
          {/* Decorative shapes inside user card */}
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10" />
          <div className="absolute -bottom-2 -left-2 w-12 h-12 rounded-full bg-white/5" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <span className="text-white font-roboto font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-roboto font-semibold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] font-roboto text-white/70 truncate">{user?.email || ''}</p>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-roboto font-bold text-sage-400 uppercase tracking-widest px-4 mb-2">
            Main Menu
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
                    flex items-center gap-3 px-4 py-3 rounded-xl font-roboto text-sm font-medium
                    transition-all duration-200 relative overflow-hidden
                    ${isActive
                      ? 'bg-white text-forest-700 shadow-sm border border-forest-100'
                      : 'text-sage-600 hover:text-forest-700 hover:bg-white/60'
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

        {/* Bottom: Wallet info card */}
        <div className="px-4 pb-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="p-3 rounded-xl bg-gradient-to-br from-forest-50 to-forest-100/70 border border-forest-100"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-forest-500 animate-pulse" />
              <p className="text-[10px] font-roboto font-bold text-forest-700 uppercase tracking-wide">
                Live Tracking
              </p>
            </div>
            <p className="text-[10px] font-roboto text-sage-600 leading-relaxed">
              Your finances are synced in real-time across all devices.
            </p>
          </motion.div>
        </div>

        {/* Logout Button */}
        <div className="p-3 border-t border-sage-100/60">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-roboto text-sm font-medium
                       text-sage-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200 w-full"
          >
            <LogoutIcon size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;