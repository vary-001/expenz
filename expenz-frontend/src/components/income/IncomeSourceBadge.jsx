// src/components/income/IncomeSourceBadge.jsx
import React from 'react';
import { getCategoryColor } from '../../utils/formatters';

const IncomeSourceBadge = ({ source, category }) => (
  <span
    className="inline-flex items-center gap-1.5 text-[11px] font-roboto font-medium px-2.5 py-1 rounded-full"
    style={{
      backgroundColor: getCategoryColor(category) + '15',
      color: getCategoryColor(category),
    }}
  >
    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getCategoryColor(category) }} />
    {source}
  </span>
);

export default IncomeSourceBadge;