// src/assets/svgs/SparkleIcon.jsx
import React from 'react';
const SparkleIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3l1.5 5L19 9.5l-5.5 1.5L12 16l-1.5-5L5 9.5l5.5-1.5L12 3zM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);
export default SparkleIcon;