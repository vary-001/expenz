// src/components/common/Button.jsx
import React from 'react';
import { motion } from 'framer-motion';
import LoaderIcon from '../../assets/svgs/LoaderIcon';

const variants = {
  primary: 'bg-gradient-forest text-white hover:shadow-forest',
  secondary: 'bg-forest-50 dark:bg-forest-900/40 text-forest-700 dark:text-forest-200 hover:bg-forest-100 dark:hover:bg-forest-900/60',
  outline: 'border-2 border-forest-300 dark:border-forest-700 text-forest-700 dark:text-forest-200 hover:bg-forest-50 dark:hover:bg-forest-900/40',
  danger: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60',
  ghost: 'text-forest-600 dark:text-forest-300 hover:bg-forest-50 dark:hover:bg-forest-900/40',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

const Button = ({
  children, variant = 'primary', size = 'md', loading = false,
  disabled = false, icon: Icon, className = '', fullWidth = false, ...props
}) => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    whileHover={{ scale: 1.01 }}
    className={`
      font-poppins font-semibold rounded-xl inline-flex items-center justify-center gap-2
      transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
      ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}
    `}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? <LoaderIcon size={18} /> : Icon && <Icon size={18} />}
    {children}
  </motion.button>
);

export default Button;