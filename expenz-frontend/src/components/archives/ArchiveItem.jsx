// src/components/archives/ArchiveItem.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate } from '../../utils/formatters';
import RestoreIcon from '../../assets/svgs/RestoreIcon';
import TrashIcon from '../../assets/svgs/TrashIcon';

const ArchiveItem = ({ item, onRestore, onDelete, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04 }}
    className="flex items-center gap-4 p-4 rounded-xl bg-white border border-sage-100/50 hover:shadow-card transition-all group opacity-70 hover:opacity-100"
  >
    <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center flex-shrink-0">
      <span className="text-sm font-roboto font-bold text-sage-400">
        {item.type === 'income' ? 'IN' : 'EX'}
      </span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-roboto font-medium text-forest-800 truncate">{item.description}</p>
      <p className="text-xs font-roboto text-sage-400">
        {item.category} • {formatDate(item.date)} • Archived {formatDate(item.archivedAt)}
      </p>
    </div>
    <p className="text-sm font-roboto font-bold text-sage-500">{formatCurrency(item.amount)}</p>
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={() => onRestore(item)} className="p-2 rounded-lg hover:bg-forest-50 text-sage-400 hover:text-forest-600" title="Restore">
        <RestoreIcon size={16} />
      </button>
      <button onClick={() => onDelete(item)} className="p-2 rounded-lg hover:bg-red-50 text-sage-400 hover:text-red-500" title="Delete permanently">
        <TrashIcon size={16} />
      </button>
    </div>
  </motion.div>
);

export default ArchiveItem;