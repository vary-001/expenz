// src/assets/svgs/RestoreIcon.jsx

const RestoreIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 12a9 9 0 1018 0 9 9 0 00-18 0Z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M3 12h4l2-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default RestoreIcon;