// src/components/common/Card.jsx
import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={hover ? { y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' } : {}}
    className={`card-forest ${className}`}
  >
    {children}
  </motion.div>
);

export default Card;