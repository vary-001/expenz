// src/assets/svgs/ReportIcon.jsx


const ReportIcon = ({ size = 24, className = '', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z" stroke={active ? '#2d6a50' : 'currentColor'} strokeWidth="1.8" fill={active ? '#d9ece2' : 'none'} />
    <path d="M7 15V11M11 15V9M15 15V12M19 15V8" stroke={active ? '#2d6a50' : 'currentColor'} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default ReportIcon;