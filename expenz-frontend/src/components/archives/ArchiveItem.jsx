// src/components/archives/ArchiveItem.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate, getCategoryColor } from '../../utils/formatters';
import RestoreIcon from '../../assets/svgs/RestoreIcon';
import TrashIcon from '../../assets/svgs/TrashIcon';
import TrendUpIcon from '../../assets/svgs/TrendUpIcon';
import TrendDownIcon from '../../assets/svgs/TrendDownIcon';

const ArchiveItem = ({ item, onRestore, onDelete, index = 0, loading }) => {
  const isIncome = item.originalModel === 'Income';
  const Icon = isIncome ? TrendUpIcon : TrendDownIcon;
  const accentColor = isIncome ? '#3d8365' : '#f97316';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 0.85, y: 0 }}
      exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
      whileHover={{ opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-sage-100/60 hover:shadow-card hover:border-forest-200 transition-all group relative"
    >
      {/* Archive badge */}
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-sage-100 rounded-full">
        <span className="text-[9px] font-roboto font-bold uppercase tracking-wide text-sage-500">
          Archived
        </span>
      </div>

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: accentColor + '15' }}
      >
        <Icon size={22} style={{ color: accentColor }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-roboto font-semibold text-forest-800 truncate">
          {item.description || item.source}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span
            className="text-[10px] font-roboto font-bold uppercase tracking-wide px-2 py-0.5 rounded-md"
            style={{
              backgroundColor: getCategoryColor(item.category) + '20',
              color: getCategoryColor(item.category),
            }}
          >
            {item.category}
          </span>
          <span className="text-xs font-roboto text-sage-400">•</span>
          <span className="text-xs font-roboto text-sage-500">
            Original: {formatDate(item.date)}
          </span>
          <span className="text-xs font-roboto text-sage-400">•</span>
          <span className="text-xs font-roboto text-sage-400 italic">
            Archived {formatDate(item.archivedAt)}
          </span>
        </div>
      </div>

      {/* Amount */}
      <p
        className="text-base font-roboto font-bold whitespace-nowrap flex-shrink-0"
        style={{ color: accentColor }}
      >
        {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onRestore(item)}
          disabled={loading}
          className="px-3 py-2 rounded-lg bg-forest-50 hover:bg-forest-100 text-forest-600 hover:text-forest-700 transition-colors text-xs font-roboto font-medium flex items-center gap-1.5 disabled:opacity-50"
          title="Restore"
        >
          <RestoreIcon size={14} />
          <span className="hidden sm:inline">Restore</span>
        </button>
        <button
          onClick={() => onDelete(item)}
          disabled={loading}
          className="px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors text-xs font-roboto font-medium flex items-center gap-1.5 disabled:opacity-50"
          title="Delete forever"
        >
          <TrashIcon size={14} />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>
    </motion.div>
  );
};

export default ArchiveItem;