// src/components/reports/MoneyStory.jsx
import React from 'react';
import { motion } from 'framer-motion';
import TrendUpIcon from '../../assets/svgs/TrendUpIcon';
import TrendDownIcon from '../../assets/svgs/TrendDownIcon';
import PieChartIcon from '../../assets/svgs/PieChartIcon';
import BudgetIcon from '../../assets/svgs/BudgetIcon';
import CheckCircleIcon from '../../assets/svgs/CheckCircleIcon';
import AlertIcon from '../../assets/svgs/AlertIcon';
import InfoIcon from '../../assets/svgs/InfoIcon';

const iconMap = {
  income: { Icon: TrendUpIcon, color: 'text-forest-600 dark:text-forest-300', bg: 'bg-forest-100 dark:bg-forest-900/40' },
  expense: { Icon: TrendDownIcon, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/40' },
  breakdown: { Icon: PieChartIcon, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/40' },
  positive: { Icon: CheckCircleIcon, color: 'text-forest-600 dark:text-forest-300', bg: 'bg-forest-100 dark:bg-forest-900/40' },
  negative: { Icon: AlertIcon, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/40' },
  budget: { Icon: BudgetIcon, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/40' },
  info: { Icon: InfoIcon, color: 'text-sage-600 dark:text-sage-300', bg: 'bg-sage-100 dark:bg-sage-900/40' },
};

const MoneyStory = ({ story = [] }) => {
  if (!story.length) return null;

  return (
    <div className="space-y-3">
      {story.map((item, i) => {
        const config = iconMap[item.icon] || iconMap.info;
        const { Icon } = config;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3"
          >
            <div className={`${config.bg} ${config.color} p-2 rounded-lg flex-shrink-0 mt-0.5`}>
              <Icon size={16} />
            </div>
            <p className="font-inter text-sm text-sage-700 dark:text-sage-200 leading-relaxed pt-1">
              {item.text}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MoneyStory;