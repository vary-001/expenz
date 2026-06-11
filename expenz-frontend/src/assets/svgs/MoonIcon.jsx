// src/assets/svgs/MoonIcon.jsx
import React from 'react';
const MoonIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);
export default MoonIcon;