// src/assets/svgs/ChevronIcon.jsx
import React from 'react';

const ChevronIcon = ({ size = 24, direction = 'right', className = '' }) => {
  const rotations = { right: '0', down: '90', left: '180', up: '270' };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}
         style={{ transform: `rotate(${rotations[direction]}deg)` }}>
      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default ChevronIcon;