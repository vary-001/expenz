// src/assets/svgs/BarChartIcon.jsx
import React from 'react';

const BarChartIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="12" width="4" height="9" rx="1" stroke="currentColor" strokeWidth="1.8" />
    <rect x="10" y="6" width="4" height="15" rx="1" stroke="currentColor" strokeWidth="1.8" />
    <rect x="17" y="3" width="4" height="18" rx="1" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

export default BarChartIcon;