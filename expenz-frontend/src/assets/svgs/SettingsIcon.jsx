// src/assets/svgs/SettingsIcon.jsx
import React from 'react';

const SettingsIcon = ({ size = 24, className = '', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="3" stroke={active ? '#2d6a50' : 'currentColor'} strokeWidth="1.8" fill={active ? '#d9ece2' : 'none'} />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={active ? '#2d6a50' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export default SettingsIcon;