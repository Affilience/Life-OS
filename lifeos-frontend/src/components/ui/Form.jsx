/**
 * Form Components Library
 *
 * A comprehensive set of form components with:
 * - Consistent styling with design system
 * - Validation states and error messages
 * - Accessibility (labels, descriptions, ARIA)
 * - Dark mode optimized
 * - Smooth focus/hover transitions
 */

import React, { forwardRef, useId } from 'react';
import { Check, ChevronDown, AlertCircle } from 'lucide-react';

// Shared styles
const baseInputClasses = `
  w-full px-3 py-2.5 rounded-lg
  bg-[var(--bg-2)] border border-white/10
  text-white placeholder-white/40
  transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50
  disabled:opacity-50 disabled:cursor-not-allowed
`;

const errorClasses = 'border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/50';
const successClasses = 'border-emerald-500/50 focus:ring-emerald-500/50 focus:border-emerald-500/50';

/**
 * FormField - Wrapper for form inputs with label and error handling
 */
export function FormField({
  label,
  description,
  error,
  required,
  children,
  className = '',
  htmlFor,
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-white/90"
        >
          {label}
          {required && <span className="text-rose-400 ml-1">*</span>}
        </label>
      )}
      {description && (
        <p className="text-xs text-white/50">{description}</p>
      )}
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-rose-400">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Input - Text input with variants
 */
export const Input = forwardRef(function Input(
  {
    type = 'text',
    label,
    description,
    error,
    success,
    required,
    className = '',
    inputClassName = '',
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    ...props
  },
  ref
) {
  const id = useId();
  const inputId = props.id || id;

  const stateClasses = error ? errorClasses : success ? successClasses : '';

  const input = (
    <div className="relative">
      {LeftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
          <LeftIcon className="w-4 h-4" />
        </div>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={`
          ${baseInputClasses}
          ${stateClasses}
          ${LeftIcon ? 'pl-10' : ''}
          ${RightIcon ? 'pr-10' : ''}
          ${inputClassName}
        `}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {RightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
          <RightIcon className="w-4 h-4" />
        </div>
      )}
    </div>
  );

  if (label) {
    return (
      <FormField
        label={label}
        description={description}
        error={error}
        required={required}
        htmlFor={inputId}
        className={className}
      >
        {input}
      </FormField>
    );
  }

  return input;
});

/**
 * TextArea - Multi-line text input
 */
export const TextArea = forwardRef(function TextArea(
  {
    label,
    description,
    error,
    success,
    required,
    className = '',
    textareaClassName = '',
    rows = 4,
    resize = 'vertical',
    ...props
  },
  ref
) {
  const id = useId();
  const textareaId = props.id || id;

  const stateClasses = error ? errorClasses : success ? successClasses : '';
  const resizeClass = resize === 'none' ? 'resize-none' : resize === 'both' ? 'resize' : 'resize-y';

  const textarea = (
    <textarea
      ref={ref}
      id={textareaId}
      rows={rows}
      className={`
        ${baseInputClasses}
        ${stateClasses}
        ${resizeClass}
        ${textareaClassName}
      `}
      aria-invalid={error ? 'true' : undefined}
      {...props}
    />
  );

  if (label) {
    return (
      <FormField
        label={label}
        description={description}
        error={error}
        required={required}
        htmlFor={textareaId}
        className={className}
      >
        {textarea}
      </FormField>
    );
  }

  return textarea;
});

/**
 * Select - Dropdown select input
 */
export const Select = forwardRef(function Select(
  {
    label,
    description,
    error,
    success,
    required,
    className = '',
    selectClassName = '',
    options = [],
    placeholder = 'Select an option',
    ...props
  },
  ref
) {
  const id = useId();
  const selectId = props.id || id;

  const stateClasses = error ? errorClasses : success ? successClasses : '';

  const select = (
    <div className="relative">
      <select
        ref={ref}
        id={selectId}
        className={`
          ${baseInputClasses}
          ${stateClasses}
          appearance-none pr-10 cursor-pointer
          ${selectClassName}
        `}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
    </div>
  );

  if (label) {
    return (
      <FormField
        label={label}
        description={description}
        error={error}
        required={required}
        htmlFor={selectId}
        className={className}
      >
        {select}
      </FormField>
    );
  }

  return select;
});

/**
 * Checkbox - Boolean checkbox input
 */
export const Checkbox = forwardRef(function Checkbox(
  {
    label,
    description,
    error,
    className = '',
    size = 'md',
    ...props
  },
  ref
) {
  const id = useId();
  const checkboxId = props.id || id;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const checkSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={`
            ${sizeClasses[size]}
            appearance-none rounded
            bg-[var(--bg-2)] border border-white/20
            checked:bg-violet-500 checked:border-violet-500
            transition-all duration-200 cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
            peer
          `}
          {...props}
        />
        <Check
          className={`
            ${checkSizeClasses[size]}
            absolute text-white pointer-events-none
            opacity-0 peer-checked:opacity-100
            transition-opacity duration-200
          `}
        />
      </div>
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label
              htmlFor={checkboxId}
              className="text-sm font-medium text-white/90 cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-white/50 mt-0.5">{description}</p>
          )}
          {error && (
            <p className="text-xs text-rose-400 mt-1">{error}</p>
          )}
        </div>
      )}
    </div>
  );
});

/**
 * Toggle - Switch-style toggle input
 */
export const Toggle = forwardRef(function Toggle(
  {
    label,
    description,
    error,
    className = '',
    size = 'md',
    ...props
  },
  ref
) {
  const id = useId();
  const toggleId = props.id || id;

  const sizeClasses = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' },
    lg: { track: 'w-12 h-6', thumb: 'w-5 h-5', translate: 'translate-x-6' },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="relative flex items-center">
        <input
          ref={ref}
          type="checkbox"
          id={toggleId}
          role="switch"
          className="sr-only peer"
          {...props}
        />
        <div
          className={`
            ${sizes.track}
            bg-white/10 rounded-full
            peer-checked:bg-violet-500
            peer-focus:ring-2 peer-focus:ring-violet-500/50
            peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
            transition-colors duration-200 cursor-pointer
          `}
          onClick={() => {
            const input = document.getElementById(toggleId);
            if (input && !input.disabled) {
              input.click();
            }
          }}
        />
        <div
          className={`
            ${sizes.thumb}
            absolute left-0.5 top-1/2 -translate-y-1/2
            bg-white rounded-full shadow-sm
            peer-checked:${sizes.translate}
            transition-transform duration-200 pointer-events-none
          `}
        />
      </div>
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label
              htmlFor={toggleId}
              className="text-sm font-medium text-white/90 cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-white/50 mt-0.5">{description}</p>
          )}
          {error && (
            <p className="text-xs text-rose-400 mt-1">{error}</p>
          )}
        </div>
      )}
    </div>
  );
});

/**
 * RadioGroup - Radio button group
 */
export function RadioGroup({
  label,
  description,
  error,
  required,
  name,
  options = [],
  value,
  onChange,
  orientation = 'vertical',
  className = '',
}) {
  const groupId = useId();

  return (
    <fieldset className={className}>
      {label && (
        <legend className="text-sm font-medium text-white/90 mb-2">
          {label}
          {required && <span className="text-rose-400 ml-1">*</span>}
        </legend>
      )}
      {description && (
        <p className="text-xs text-white/50 mb-3">{description}</p>
      )}
      <div
        className={`
          flex gap-3
          ${orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'}
        `}
        role="radiogroup"
        aria-labelledby={label ? `${groupId}-label` : undefined}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={option.disabled}
                className={`
                  w-5 h-5 appearance-none rounded-full
                  bg-[var(--bg-2)] border-2 border-white/20
                  checked:border-violet-500
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-0
                  disabled:opacity-50 disabled:cursor-not-allowed
                  peer
                `}
              />
              <div
                className={`
                  absolute w-2.5 h-2.5 rounded-full bg-violet-500
                  scale-0 peer-checked:scale-100
                  transition-transform duration-200
                `}
              />
            </div>
            <span className="text-sm text-white/80 group-hover:text-white/90 transition-colors">
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-rose-400 mt-2">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </fieldset>
  );
}

/**
 * SearchInput - Input with search icon and clear button
 */
export const SearchInput = forwardRef(function SearchInput(
  { onClear, value, className = '', ...props },
  ref
) {
  const hasValue = value && value.length > 0;

  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        ref={ref}
        type="search"
        value={value}
        className={`
          ${baseInputClasses}
          pl-10 pr-10
        `}
        {...props}
      />
      {hasValue && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-white/40 hover:text-white/70 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
});

// Export all components
export default {
  FormField,
  Input,
  TextArea,
  Select,
  Checkbox,
  Toggle,
  RadioGroup,
  SearchInput,
};
