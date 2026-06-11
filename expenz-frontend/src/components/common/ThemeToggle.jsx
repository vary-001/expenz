// src/components/common/ThemeToggle.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import SunIcon from '../../assets/svgs/SunIcon';
import MoonIcon from '../../assets/svgs/MoonIcon';

const ThemeToggle = ({ size = 'md' }) => {
  const { isDark, toggleTheme } = useTheme();

  const sizes = {
    sm: 'w-9 h-9',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <button
      onClick={toggleTheme}
      className={`${sizes[size]} rounded-xl flex items-center justify-center
                  bg-forest-50 dark:bg-surface-card-dark
                  text-forest-700 dark:text-forest-200
                  hover:bg-forest-100 dark:hover:bg-forest-900
                  transition-all duration-300 relative overflow-hidden`}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0, scale: isDark ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        className="absolute"
      >
        <SunIcon size={18} />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : -180, scale: isDark ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="absolute"
      >
        <MoonIcon size={18} />
      </motion.div>
    </button>
  );
};

export default ThemeToggle;