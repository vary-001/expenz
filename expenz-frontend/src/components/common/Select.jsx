// src/components/common/Select.jsx
import React from 'react';
import ChevronIcon from '../../assets/svgs/ChevronIcon';

const Select = ({ label, options = [], error, className = '', ...props }) => (
  <div className={`w-full ${className}`}>
    {label && (
      <label className="block text-sm font-roboto font-medium text-forest-800 mb-2">
        {label}
      </label>
    )}
    <div className="relative">
      <select
        className={`input-forest appearance-none pr-10 cursor-pointer ${error ? 'border-red-300' : ''}`}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-sage-400">
        <ChevronIcon size={16} direction="down" />
      </div>
    </div>
    {error && <p className="mt-1 text-xs font-roboto text-red-500">{error}</p>}
  </div>
);

export default Select;