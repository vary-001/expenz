// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../assets/svgs/Logo';
import Button from '../components/common/Button';

const NotFound = () => (
  <div className="min-h-screen bg-white flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md"
    >
      <Logo size={60} className="mx-auto mb-6" />
      <h1 className="text-6xl font-roboto font-bold text-gradient-forest mb-4">404</h1>
      <p className="text-lg font-roboto text-sage-500 mb-8">
        Oops! This page doesn't exist. Let's get you back on track.
      </p>
      <Link to="/dashboard">
        <Button>Back to Dashboard</Button>
      </Link>
    </motion.div>
  </div>
);

export default NotFound;