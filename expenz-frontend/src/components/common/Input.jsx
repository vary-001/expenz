// src/components/common/Input.jsx
import React, { useState } from 'react';
import EyeIcon from '../../assets/svgs/EyeIcon';
import EyeOffIcon from '../../assets/svgs/EyeOffIcon';

const Input = ({ label, type = 'text', error, icon: Icon, className = '', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="label-text block mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400 dark:text-sage-500">
            <Icon size={18} />
          </div>
        )}
        <input
          type={isPassword && showPassword ? 'text' : type}
          className={`
            input-base
            ${Icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-10' : ''}
            ${error ? 'border-red-300 dark:border-red-700 focus:border-red-400 focus:ring-red-100 dark:focus:ring-red-900/40' : ''}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-forest-600 dark:hover:text-forest-300 transition-colors"
          >
            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs font-inter text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input;