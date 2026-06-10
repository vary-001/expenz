// src/components/common/Input.jsx
import React, { useState } from 'react';
import EyeIcon from '../../assets/svgs/EyeIcon';
import EyeOffIcon from '../../assets/svgs/EyeOffIcon';

const Input = ({
  label, type = 'text', error, icon: Icon, className = '', ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-roboto font-medium text-forest-800 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400">
            <Icon size={18} />
          </div>
        )}
        <input
          type={isPassword && showPassword ? 'text' : type}
          className={`
            input-forest
            ${Icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-10' : ''}
            ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-forest-600 transition-colors"
          >
            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs font-roboto text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;