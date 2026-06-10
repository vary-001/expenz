// src/components/common/Toast.jsx
import React from 'react';
import { motion } from 'framer-motion';
import CheckCircleIcon from '../../assets/svgs/CheckCircleIcon';
import AlertIcon from '../../assets/svgs/AlertIcon';
import CloseIcon from '../../assets/svgs/CloseIcon';

const icons = {
  success: <CheckCircleIcon size={20} className="text-forest-500" />,
  error: <AlertIcon size={20} className="text-red-500" />,
  info: <CheckCircleIcon size={20} className="text-blue-500" />,
};

const bgColors = {
  success: 'bg-forest-50 border-forest-200',
  error: 'bg-red-50 border-red-200',
  info: 'bg-blue-50 border-blue-200',
};

const Toast = ({ message, type = 'success', onClose }) => (
  <motion.div
    initial={{ opacity: 0, x: 100, scale: 0.9 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, x: 100, scale: 0.9 }}
    className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl border shadow-card ${bgColors[type]}`}
  >
    {icons[type]}
    <p className="flex-1 text-sm font-roboto font-medium text-forest-900">{message}</p>
    <button onClick={onClose} className="text-sage-400 hover:text-forest-700 transition-colors">
      <CloseIcon size={16} />
    </button>
  </motion.div>
);

export default Toast;