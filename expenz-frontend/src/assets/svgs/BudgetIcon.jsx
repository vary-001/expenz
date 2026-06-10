

const BudgetIcon = ({ size = 24, className = '', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="4" width="18" height="16" rx="3" stroke={active ? '#2d6a50' : 'currentColor'} strokeWidth="1.8" fill={active ? '#d9ece2' : 'none'} />
    <path d="M3 9h18" stroke={active ? '#2d6a50' : 'currentColor'} strokeWidth="1.8" />
    <circle cx="7.5" cy="14" r="1.5" fill={active ? '#2d6a50' : 'currentColor'} />
    <path d="M11 14h6" stroke={active ? '#2d6a50' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export default BudgetIcon;