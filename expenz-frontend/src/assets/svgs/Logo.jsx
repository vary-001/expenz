// src/assets/svgs/Logo.jsx
import React from 'react';
import logoImg from '../logo.png';

const Logo = ({ size, className = '', alt = 'Expenz', ...props }) => (
  <img
    src={logoImg}
    alt={alt}
    className={`object-contain ${className}`}
    style={size ? { width: size, height: size } : {}}
    {...props}
  />
);

export default Logo;