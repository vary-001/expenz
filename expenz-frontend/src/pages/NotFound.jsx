// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Logo from '../assets/svgs/Logo';
import Button from '../components/common/Button';

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-white dark:bg-surface-dark flex items-center justify-center p-4 theme-transition">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <Logo size={60} className="mx-auto mb-6" />
        <h1 className="font-poppins font-bold text-6xl text-gradient-forest mb-4">404</h1>
        <p className="body-text mb-8">This page doesn't exist. Let's get you back on track.</p>
        <Link to="/dashboard">
          <Button>{t('nav.dashboard')}</Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;