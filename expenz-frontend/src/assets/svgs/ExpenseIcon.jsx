// src/assets/svgs/ExpenseIcon.jsx
import React from 'react';

const ExpenseIcon = ({ size = 24, className = '', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke={active ? '#2d6a50' : 'currentColor'} strokeWidth="1.8" fill={active ? '#d9ece2' : 'none'} />
    <path d="M12 8v8M8 12h8" stroke={active ? '#2d6a50' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" transform="rotate(45 12 12)" />
    <path d="M12 7v10" stroke={active ? '#2d6a50' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M9 9.5C9 9.5 9.5 8.5 12 8.5C14.5 8.5 15 9.5 15 10.25C15 12 12 12 12 12C12 12 9 12 9 13.75C9 14.5 9.5 15.5 12 15.5C14.5 15.5 15 14.5 15 14.5" stroke={active ? '#2d6a50' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

export default ExpenseIcon;