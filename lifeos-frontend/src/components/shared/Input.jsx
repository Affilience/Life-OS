import React from 'react';
import './Input.css';

const Input = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error, 
  required = false,
  className = '',
  ...props 
}) => {
  const inputClasses = `input-field ${error ? 'error' : ''} ${className}`;

  if (type === 'textarea') {
    return (
      <div className="input-container">
        {label && (
          <label className="input-label">
            {label}
            {required && <span className="input-required">*</span>}
          </label>
        )}
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${inputClasses} input-textarea`}
          rows={4}
          {...props}
        />
        {error && (
          <p className="input-error">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="input-container">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="input-error">{error}</p>
      )}
    </div>
  );
};

export default Input;