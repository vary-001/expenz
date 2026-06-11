// src/components/common/Card.jsx
import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={hover ? { y: -2 } : {}}
    className={`card-base p-6 ${hover ? 'hover:shadow-card-hover' : ''} ${className}`}
  >
    {children}
  </motion.div>
);

export default Card;