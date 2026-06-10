// src/assets/svgs/FilterIcon.jsx
import React from 'react';

const FilterIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 6h18M6 12h12M9 18h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export default FilterIcon;