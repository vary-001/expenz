// src/assets/svgs/IncomeIcon.jsx


const IncomeIcon = ({ size = 24, className = '', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12Z" stroke={active ? '#2d6a50' : 'currentColor'} strokeWidth="1.8" fill={active ? '#d9ece2' : 'none'} />
    <path d="M12 16V8M9 10l3-3 3 3" stroke={active ? '#2d6a50' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default IncomeIcon;