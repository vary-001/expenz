// src/assets/svgs/StoryIcon.jsx
import React from 'react';
const StoryIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14l-4-2-4 2-4-2-4 2z"
          stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M8 8h8M8 12h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
export default StoryIcon;