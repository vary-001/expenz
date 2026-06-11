// src/components/reports/SuggestionCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import LightbulbIcon from '../../assets/svgs/LightbulbIcon';
import AlertIcon from '../../assets/svgs/AlertIcon';
import CheckCircleIcon from '../../assets/svgs/CheckCircleIcon';
import InfoIcon from '../../assets/svgs/InfoIcon';

const typeConfig = {
  success: {
    bg: 'bg-forest-50 dark:bg-forest-900/30',
    border: 'border-forest-200 dark:border-forest-700',
    iconBg: 'bg-forest-100 dark:bg-forest-800',
    iconColor: 'text-forest-600 dark:text-forest-300',
    titleColor: 'text-forest-800 dark:text-forest-100',
    icon: CheckCircleIcon,
  },
  warning: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-800',
    iconBg: 'bg-orange-100 dark:bg-orange-900',
    iconColor: 'text-orange-600 dark:text-orange-400',
    titleColor: 'text-orange-800 dark:text-orange-200',
    icon: AlertIcon,
  },
  danger: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    iconBg: 'bg-red-100 dark:bg-red-900',
    iconColor: 'text-red-600 dark:text-red-400',
    titleColor: 'text-red-800 dark:text-red-200',
    icon: AlertIcon,
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-900',
    iconColor: 'text-blue-600 dark:text-blue-400',
    titleColor: 'text-blue-800 dark:text-blue-200',
    icon: InfoIcon,
  },
};

const SuggestionCard = ({ suggestion, index = 0 }) => {
  const config = typeConfig[suggestion.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`${config.bg} ${config.border} border rounded-xl p-4`}
    >
      <div className="flex items-start gap-3">
        <div className={`${config.iconBg} ${config.iconColor} p-2 rounded-lg flex-shrink-0`}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-poppins font-semibold text-sm ${config.titleColor} mb-1`}>
            {suggestion.title}
          </h4>
          <p className="font-inter text-xs text-sage-700 dark:text-sage-300 mb-2 leading-relaxed">
            {suggestion.message}
          </p>
          {suggestion.tip && (
            <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-current border-opacity-20">
              <LightbulbIcon size={14} className={`${config.iconColor} flex-shrink-0 mt-0.5`} />
              <p className="font-inter text-xs text-sage-600 dark:text-sage-400 italic leading-relaxed">
                {suggestion.tip}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SuggestionCard;