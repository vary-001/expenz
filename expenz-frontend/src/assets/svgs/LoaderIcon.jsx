// src/assets/svgs/LoaderIcon.jsx


const LoaderIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`animate-spin-slow ${className}`}>
    <circle cx="12" cy="12" r="9" stroke="#d9ece2" strokeWidth="2.5" />
    <path d="M12 3a9 9 0 016.36 2.64" stroke="#2d6a50" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export default LoaderIcon;