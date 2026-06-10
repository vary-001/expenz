// src/components/layout/Navbar.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchIcon from '../../assets/svgs/SearchIcon';
import BellIcon from '../../assets/svgs/BellIcon';
import MenuIcon from '../../assets/svgs/MenuIcon';
import { useAuth } from '../../hooks/useAuth';
import { getGreeting } from '../../utils/formatters';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/income': 'Income Sources',
  '/budget': 'Budget Planner',
  '/reports': 'Reports',
  '/archives': 'Archives',
  '/settings': 'Settings',
};

const Navbar = ({ onMenuToggle }) => {
  const location = useLocation();
  const { user } = useAuth();
  const title = pageTitles[location.pathname] || 'Expenz';

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-sage-100"
    >
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl hover:bg-forest-50 transition-colors text-forest-700"
          >
            <MenuIcon size={24} />
          </button>
          <div>
            <p className="text-xs font-roboto text-sage-400">{getGreeting()}, {user?.name?.split(' ')[0] || 'User'}</p>
            <h2 className="text-xl font-roboto font-bold text-gradient-forest">{title}</h2>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Search - desktop only */}
          <div className="hidden md:flex items-center gap-2 bg-forest-50 rounded-xl px-4 py-2.5">
            <SearchIcon size={16} className="text-sage-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm font-roboto text-forest-800 placeholder:text-sage-400 outline-none w-40 lg:w-56"
            />
          </div>

          {/* Notification bell */}
          <button className="relative p-2.5 rounded-xl hover:bg-forest-50 transition-colors text-sage-500 hover:text-forest-700">
            <BellIcon size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-forest-500" />
          </button>

          {/* User avatar - desktop */}
          <div className="hidden md:flex items-center gap-3 pl-3 border-l border-sage-200 ml-1">
            <div className="w-9 h-9 rounded-full bg-gradient-forest flex items-center justify-center">
              <span className="text-white font-roboto font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;