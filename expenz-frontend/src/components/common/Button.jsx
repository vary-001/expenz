// src/components/common/Button.jsx
import React from 'react';
import { motion } from 'framer-motion';
import LoaderIcon from '../../assets/svgs/LoaderIcon';

const variants = {
  primary: 'bg-gradient-forest text-white hover:shadow-forest',
  secondary: 'bg-forest-50 text-forest-700 hover:bg-forest-100',
  outline: 'border-2 border-forest-300 text-forest-700 hover:bg-forest-50',
  danger: 'bg-red-50 text-red-600 hover:bg-red-100',
  ghost: 'text-forest-600 hover:bg-forest-50',
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
      font-roboto font-medium rounded-xl inline-flex items-center justify-center gap-2
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