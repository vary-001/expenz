// src/components/income/IncomeList.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate } from '../../utils/formatters';
import IncomeSourceBadge from './IncomeSourceBadge';
import EditIcon from '../../assets/svgs/EditIcon';
import TrashIcon from '../../assets/svgs/TrashIcon';
import TrendUpIcon from '../../assets/svgs/TrendUpIcon';
import EmptyState from '../common/EmptyState';

const IncomeList = ({ incomes = [], onEdit, onDelete, emptyAction }) => {
  if (!incomes.length) {
    return (
      <EmptyState
        title="No income records"
        description="Record your income sources so the system can help you budget and plan better."
        actionLabel="Add Income"
        onAction={emptyAction}
      />
    );
  }

  return (
    <div className="space-y-2">
      {incomes.map((inc, i) => (
        <motion.div
          key={inc._id || i}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="flex items-center gap-4 p-4 rounded-xl bg-white border border-sage-100/50 hover:shadow-card transition-all group"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <TrendUpIcon size={20} className="text-forest-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-roboto font-medium text-forest-800 truncate">{inc.description || inc.source}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <IncomeSourceBadge source={inc.source} category={inc.category} />
              <span className="text-xs font-roboto text-sage-400">{formatDate(inc.date)}</span>
              {inc.recurrence !== 'one-time' && (
                <span className="text-[10px] font-roboto text-forest-500 bg-forest-50 px-2 py-0.5 rounded-full capitalize">
                  {inc.recurrence}
                </span>
              )}
            </div>
          </div>
          <p className="text-sm font-roboto font-bold text-forest-600 whitespace-nowrap">
            +{formatCurrency(inc.amount)}
          </p>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(inc)} className="p-2 rounded-lg hover:bg-forest-50 text-sage-400 hover:text-forest-600">
              <EditIcon size={16} />
            </button>
            <button onClick={() => onDelete(inc)} className="p-2 rounded-lg hover:bg-red-50 text-sage-400 hover:text-red-500">
              <TrashIcon size={16} />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default IncomeList;