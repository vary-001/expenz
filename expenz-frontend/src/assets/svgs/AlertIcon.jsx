// src/assets/svgs/AlertIcon.jsx


const AlertIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L2 20h20L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 9v4M12 16v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default AlertIcon;