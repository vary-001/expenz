// src/assets/svgs/LoginIllustration.jsx
import React from 'react';

const LoginIllustration = ({ className = '' }) => (
  <svg viewBox="0 0 500 500" fill="none" className={className}>
    {/* Desk */}
    <rect x="120" y="340" width="260" height="10" rx="4" fill="#2d6a50" opacity="0.3" />
    <rect x="160" y="350" width="8" height="60" rx="2" fill="#2d6a50" opacity="0.2" />
    <rect x="332" y="350" width="8" height="60" rx="2" fill="#2d6a50" opacity="0.2" />

    {/* Chair back */}
    <rect x="210" y="260" width="80" height="8" rx="4" fill="#3d8365" opacity="0.4" />
    <rect x="215" y="268" width="70" height="60" rx="6" fill="#3d8365" opacity="0.2" />

    {/* Person body */}
    <ellipse cx="250" cy="310" rx="35" ry="30" fill="#5a9f7e" opacity="0.6" />

    {/* Person head */}
    <circle cx="250" cy="250" r="28" fill="#d9ece2" />
    <circle cx="250" cy="248" r="25" fill="#f0f7f4" />

    {/* Hair */}
    <path d="M225,240 C225,220 275,220 275,240 C275,230 225,230 225,240Z" fill="#265541" />

    {/* Eyes - happy/closed */}
    <path d="M238,248 C240,244 244,244 246,248" stroke="#2d6a50" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M254,248 C256,244 260,244 262,248" stroke="#2d6a50" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Smile */}
    <path d="M242,258 C246,264 254,264 258,258" stroke="#2d6a50" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Left arm - hand on chin (thinking) */}
    <path d="M215,300 C200,290 195,270 220,255" stroke="#5a9f7e" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.7" />

    {/* Right arm on desk */}
    <path d="M285,300 C300,310 310,330 300,338" stroke="#5a9f7e" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.7" />

    {/* Laptop on desk */}
    <rect x="230" y="320" width="70" height="20" rx="3" fill="#265541" opacity="0.6" />
    <rect x="235" y="300" width="60" height="20" rx="2" fill="#3d8365" opacity="0.5" />
    {/* Screen glow */}
    <rect x="238" y="303" width="54" height="14" rx="1" fill="#d9ece2" opacity="0.5" />
    {/* Chart on screen */}
    <polyline points="242,314 248,310 254,312 260,306 266,308 272,304 278,307 284,302" stroke="#5a9f7e" strokeWidth="1.5" fill="none" opacity="0.8" />

    {/* Floating financial symbols */}
    {/* Dollar sign */}
    <g opacity="0.5" className="animate-float">
      <circle cx="340" cy="180" r="18" fill="#d9ece2" />
      <text x="340" y="186" textAnchor="middle" fill="#2d6a50" fontFamily="Roboto" fontWeight="700" fontSize="18">$</text>
    </g>

    {/* Coin */}
    <g opacity="0.4" style={{ animationDelay: '1s' }} className="animate-float">
      <circle cx="160" cy="200" r="14" fill="#b5d9c6" />
      <circle cx="160" cy="200" r="10" fill="#d9ece2" stroke="#5a9f7e" strokeWidth="1" />
    </g>

    {/* Chart icon floating */}
    <g opacity="0.4" style={{ animationDelay: '2s' }} className="animate-float">
      <rect x="330" y="260" width="30" height="24" rx="4" fill="#d9ece2" />
      <rect x="336" y="272" width="4" height="8" fill="#5a9f7e" />
      <rect x="343" y="268" width="4" height="12" fill="#3d8365" />
      <rect x="350" y="264" width="4" height="16" fill="#2d6a50" />
    </g>

    {/* Light bulb (idea) */}
    <g opacity="0.5" style={{ animationDelay: '0.5s' }} className="animate-float">
      <circle cx="280" cy="200" r="12" fill="#f0f7f4" stroke="#5a9f7e" strokeWidth="1.5" />
      <path d="M276,210 L284,210" stroke="#5a9f7e" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M277,213 L283,213" stroke="#5a9f7e" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M280,190 L280,195" stroke="#85bfa3" strokeWidth="1" strokeLinecap="round" />
      <path d="M288,193 L285,196" stroke="#85bfa3" strokeWidth="1" strokeLinecap="round" />
      <path d="M272,193 L275,196" stroke="#85bfa3" strokeWidth="1" strokeLinecap="round" />
    </g>

    {/* Upward arrow / growth */}
    <g opacity="0.35" style={{ animationDelay: '1.5s' }} className="animate-float">
      <path d="M150,280 L150,260 L144,266 M150,260 L156,266" stroke="#3d8365" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>

    {/* Piggy bank small */}
    <g opacity="0.3" transform="translate(370, 310) scale(0.6)">
      <ellipse cx="20" cy="20" rx="20" ry="16" fill="#85bfa3" />
      <circle cx="12" cy="15" r="2" fill="#2d6a50" />
      <rect x="14" y="0" width="6" height="6" rx="2" fill="#5a9f7e" />
      <ellipse cx="20" cy="36" rx="6" ry="3" fill="#3d8365" opacity="0.4" />
    </g>

    {/* Ground shadow */}
    <ellipse cx="250" cy="410" rx="120" ry="8" fill="#2d6a50" opacity="0.06" />
  </svg>
);

export default LoginIllustration;