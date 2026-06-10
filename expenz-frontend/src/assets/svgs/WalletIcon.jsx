// src/assets/svgs/WalletIcon.jsx
import React from 'react';

const WalletIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="6" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
    <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="17" cy="15" r="1.5" fill="currentColor" />
    <path d="M6 6V5a2 2 0 012-2h8a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

export default WalletIcon;