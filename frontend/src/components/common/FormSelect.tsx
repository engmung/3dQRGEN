/**
 * FormSelect 컴포넌트
 * 선택 박스 (드롭다운)
 */

import React from 'react';
import { COLORS } from '../../constants/colors';

export interface FormSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  options: FormSelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`form-select ${className}`}>
      {label && (
        <label style={styles.label}>
          {label}
          {required && <span style={styles.required}>*</span>}
        </label>
      )}

      <select
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        style={{
          ...styles.select,
          ...(isFocused && styles.selectFocused),
          ...(error && styles.selectError),
          ...(disabled && styles.selectDisabled),
        }}
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

      {error && <div style={styles.errorText}>{error}</div>}
      {!error && helperText && <div style={styles.helperText}>{helperText}</div>}
    </div>
  );
};

const styles = {
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: 500,
    color: COLORS.UI.TEXT_PRIMARY,
  } as React.CSSProperties,

  required: {
    color: COLORS.DANGER,
    marginLeft: '4px',
  } as React.CSSProperties,

  select: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: `1px solid ${COLORS.UI.BORDER}`,
    borderRadius: '6px',
    backgroundColor: '#FFFFFF',
    color: COLORS.UI.TEXT_PRIMARY,
    outline: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    boxSizing: 'border-box' as const,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '32px',
  } as React.CSSProperties,

  selectFocused: {
    borderColor: COLORS.SECONDARY,
    boxShadow: `0 0 0 3px ${COLORS.SECONDARY}15`,
  } as React.CSSProperties,

  selectError: {
    borderColor: COLORS.DANGER,
  } as React.CSSProperties,

  selectDisabled: {
    backgroundColor: '#F5F5F5',
    color: COLORS.UI.TEXT_DISABLED,
    cursor: 'not-allowed',
  } as React.CSSProperties,

  errorText: {
    marginTop: '6px',
    fontSize: '12px',
    color: COLORS.DANGER,
  } as React.CSSProperties,

  helperText: {
    marginTop: '6px',
    fontSize: '12px',
    color: COLORS.UI.TEXT_SECONDARY,
  } as React.CSSProperties,
};
