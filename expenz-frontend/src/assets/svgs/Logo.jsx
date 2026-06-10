// src/assets/svgs/Logo.jsx


const Logo = ({ size = 40, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none" className={className}>
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#5a9f7e" />
        <stop offset="1" stopColor="#1c392d" />
      </linearGradient>
    </defs>
    <rect width="60" height="60" rx="16" fill="url(#logoGrad)" />
    <path d="M18 42V22c0-2.2 1.8-4 4-4h16c2.2 0 4 1.8 4 4v8c0 2.2-1.8 4-4 4H24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M18 34h12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="38" cy="38" r="8" fill="white" fillOpacity="0.2" />
    <path d="M36 38h4M38 36v4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default Logo;