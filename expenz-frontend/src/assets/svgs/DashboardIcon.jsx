// src/assets/svgs/DashboardIcon.jsx
import React from 'react';

const DashboardIcon = ({ size = 24, className = '', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="3" width="8" height="8" rx="2" stroke={active ? '#2d6a50' : 'currentColor'} strokeWidth="1.8" fill={active ? '#d9ece2' : 'none'} />
    <rect x="13" y="3" width="8" height="4" rx="2" stroke={active ? '#2d6a50' : 'currentColor'} strokeWidth="1.8" fill={active ? '#d9ece2' : 'none'} />
    <rect x="13" y="9" width="8" height="12" rx="2" stroke={active ? '#2d6a50' : 'currentColor'} strokeWidth="1.8" fill={active ? '#d9ece2' : 'none'} />
    <rect x="3" y="13" width="8" height="8" rx="2" stroke={active ? '#2d6a50' : 'currentColor'} strokeWidth="1.8" fill={active ? '#d9ece2' : 'none'} />
  </svg>
);

export default DashboardIcon;