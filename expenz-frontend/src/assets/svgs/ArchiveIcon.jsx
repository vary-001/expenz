// src/assets/svgs/ArchiveIcon.jsx
import React from 'react';

const ArchiveIcon = ({ size = 24, className = '', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="3" width="20" height="5" rx="2" stroke={active ? '#2d6a50' : 'currentColor'} strokeWidth="1.8" fill={active ? '#d9ece2' : 'none'} />
    <path d="M4 8v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8" stroke={active ? '#2d6a50' : 'currentColor'} strokeWidth="1.8" fill="none" />
    <path d="M10 12h4" stroke={active ? '#2d6a50' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export default ArchiveIcon;