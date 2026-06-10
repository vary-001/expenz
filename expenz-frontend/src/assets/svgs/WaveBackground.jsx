// src/assets/svgs/WaveBackground.jsx
import React from 'react';

const WaveBackground = ({ className = '' }) => (
  <svg viewBox="0 0 600 800" fill="none" className={className} preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="waveGrad1" x1="0" y1="0" x2="600" y2="800" gradientUnits="userSpaceOnUse">
        <stop stopColor="#d9ece2" />
        <stop offset="1" stopColor="#2d6a50" />
      </linearGradient>
      <linearGradient id="waveGrad2" x1="100" y1="0" x2="500" y2="800" gradientUnits="userSpaceOnUse">
        <stop stopColor="#b5d9c6" />
        <stop offset="1" stopColor="#265541" />
      </linearGradient>
      <linearGradient id="waveGrad3" x1="200" y1="0" x2="600" y2="800" gradientUnits="userSpaceOnUse">
        <stop stopColor="#85bfa3" />
        <stop offset="1" stopColor="#1c392d" />
      </linearGradient>
    </defs>
    {/* Layer 1 - lightest */}
    <path d="M300,0 C320,150 600,200 600,400 C600,600 350,650 300,800 L600,800 L600,0 Z" fill="url(#waveGrad1)" opacity="0.4" />
    {/* Layer 2 */}
    <path d="M350,0 C380,180 600,250 600,420 C600,590 400,680 350,800 L600,800 L600,0 Z" fill="url(#waveGrad2)" opacity="0.6" />
    {/* Layer 3 - darkest */}
    <path d="M400,0 C430,200 600,300 600,450 C600,600 450,720 400,800 L600,800 L600,0 Z" fill="url(#waveGrad3)" opacity="0.85" />
    {/* Leaf decorations */}
    <g opacity="0.3" transform="translate(450, 150) rotate(20)">
      <path d="M0,0 C10,-30 40,-50 60,-40 C80,-30 70,10 50,30 C30,50 -10,30 0,0Z" fill="#85bfa3" />
      <line x1="30" y1="-20" x2="20" y2="25" stroke="#5a9f7e" strokeWidth="1" />
    </g>
    <g opacity="0.25" transform="translate(480, 600) rotate(-15) scale(1.3)">
      <path d="M0,0 C10,-30 40,-50 60,-40 C80,-30 70,10 50,30 C30,50 -10,30 0,0Z" fill="#5a9f7e" />
      <line x1="30" y1="-20" x2="20" y2="25" stroke="#3d8365" strokeWidth="1" />
    </g>
    <g opacity="0.2" transform="translate(520, 380) rotate(40) scale(0.8)">
      <path d="M0,0 C10,-30 40,-50 60,-40 C80,-30 70,10 50,30 C30,50 -10,30 0,0Z" fill="#b5d9c6" />
    </g>
  </svg>
);

export default WaveBackground;