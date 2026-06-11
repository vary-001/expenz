// src/components/expenses/ExpenseItem.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate, getCategoryColor } from '../../utils/formatters';
import EditIcon from '../../assets/svgs/EditIcon';
import TrashIcon from '../../assets/svgs/TrashIcon';
import TrendDownIcon from '../../assets/svgs/TrendDownIcon';

const ExpenseItem = ({ expense, onEdit, onDelete, index = 0 }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
    transition={{ delay: index * 0.03 }}
    className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-sage-100/60 hover:shadow-card-hover hover:border-forest-200 transition-all group"
  >
    {/* Icon with category color */}
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative"
      style={{ backgroundColor: getCategoryColor(expense.category) + '15' }}
    >
      <TrendDownIcon size={22} style={{ color: getCategoryColor(expense.category) }} />
      <div
        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
        style={{ backgroundColor: getCategoryColor(expense.category) }}
      />
    </div>

    {/* Description & Meta */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-roboto font-semibold text-forest-800 truncate">
        {expense.description}
      </p>
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <span
          className="text-[10px] font-roboto font-bold uppercase tracking-wide px-2 py-0.5 rounded-md"
          style={{
            backgroundColor: getCategoryColor(expense.category) + '20',
            color: getCategoryColor(expense.category),
          }}
        >
          {expense.category}
        </span>
        <span className="text-xs font-roboto text-sage-400">•</span>
        <span className="text-xs font-roboto text-sage-500">{formatDate(expense.date)}</span>
        {expense.notes && (
          <>
            <span className="text-xs font-roboto text-sage-400">•</span>
            <span className="text-xs font-roboto text-sage-400 italic truncate max-w-[150px]">
              {expense.notes}
            </span>
          </>
        )}
      </div>
    </div>

    {/* Amount */}
    <div className="text-right flex-shrink-0">
      <p className="text-base font-roboto font-bold text-orange-500 whitespace-nowrap">
        -{formatCurrency(expense.amount)}
      </p>
    </div>

    {/* Actions (visible on hover, always visible on mobile) */}
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 sm:opacity-0 max-sm:opacity-100 transition-opacity">
      <button
        onClick={() => onEdit(expense)}
        className="p-2 rounded-lg hover:bg-forest-50 text-sage-400 hover:text-forest-600 transition-colors"
        title="Edit"
      >
        <EditIcon size={16} />
      </button>
      <button
        onClick={() => onDelete(expense)}
        className="p-2 rounded-lg hover:bg-red-50 text-sage-400 hover:text-red-500 transition-colors"
        title="Move to archive"
      >
        <TrashIcon size={16} />
      </button>
    </div>
  </motion.div>
);

export default ExpenseItem;