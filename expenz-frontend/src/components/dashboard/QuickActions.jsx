// src/components/dashboard/QuickActions.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import PlusIcon from '../../assets/svgs/PlusIcon';
import ReportIcon from '../../assets/svgs/ReportIcon';
import BudgetIcon from '../../assets/svgs/BudgetIcon';
import IncomeIcon from '../../assets/svgs/IncomeIcon';

const QuickActions = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const actions = [
    { label: t('expenses.addExpense'), path: '/expenses', icon: PlusIcon, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400' },
    { label: t('income.addIncome'), path: '/income', icon: IncomeIcon, color: 'text-forest-600 bg-forest-50 dark:bg-forest-900/40 dark:text-forest-300' },
    { label: t('budget.createBudget'), path: '/budget', icon: BudgetIcon, color: 'text-sage-700 bg-sage-50 dark:bg-sage-900/40 dark:text-sage-200' },
    { label: t('nav.reports'), path: '/reports', icon: ReportIcon, color: 'text-forest-700 bg-forest-50 dark:bg-forest-900/40 dark:text-forest-300' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map(({ label, path, icon: Icon, color }, i) => (
        <motion.button
          key={label}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          onClick={() => navigate(path)}
          className={`${color} p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:shadow-md`}
        >
          <Icon size={22} />
          <span className="font-inter font-medium text-xs text-center">{label}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default QuickActions;