// src/assets/svgs/EmptyStateIcon.jsx


const EmptyStateIcon = ({ className = '' }) => (
  <svg viewBox="0 0 200 160" fill="none" className={className}>
    <rect x="40" y="30" width="120" height="90" rx="12" fill="#f0f7f4" stroke="#d9ece2" strokeWidth="2" />
    <path d="M60 70h80M60 85h50" stroke="#b5d9c6" strokeWidth="2" strokeLinecap="round" />
    <circle cx="100" cy="55" r="10" fill="#d9ece2" />
    <path d="M97 55l3 3 5-6" stroke="#5a9f7e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="160" cy="40" r="15" fill="#d9ece2" opacity="0.5" />
    <circle cx="35" cy="100" r="10" fill="#d9ece2" opacity="0.3" />
    <text x="100" y="145" textAnchor="middle" fill="#85bfa3" fontFamily="Roboto" fontSize="12" fontWeight="500">No data yet</text>
  </svg>
);

export default EmptyStateIcon;