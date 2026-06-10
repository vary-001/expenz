// src/assets/svgs/EditIcon.jsx
import React from 'react';

const EditIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M16.5 3.5l4 4L7 21H3v-4L16.5 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M14 6l4 4" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

export default EditIcon;