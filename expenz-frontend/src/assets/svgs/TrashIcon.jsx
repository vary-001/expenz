// src/assets/svgs/TrashIcon.jsx
import React from 'react';

const TrashIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6" stroke="currentColor" strokeWidth="1.8" />
    <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export default TrashIcon;