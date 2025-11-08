/**
 * FormField 컴포넌트
 * 텍스트/숫자 입력 필드
 */

import React from 'react';
import { COLORS } from '../../constants/colors';

export interface FormFieldProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'email' | 'tel' | 'url';
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  helperText,
  disabled = false,
  required = false,
  min,
  max,
  step,
  className = '',
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label style={styles.label}>
          {label}
          {required && <span style={styles.required}>*</span>}
        </label>
      )}

      <input
        type={type}
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        style={{
          ...styles.input,
          ...(isFocused && styles.inputFocused),
          ...(error && styles.inputError),
          ...(disabled && styles.inputDisabled),
        }}
      />

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

  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: `1px solid ${COLORS.UI.BORDER}`,
    borderRadius: '6px',
    backgroundColor: '#FFFFFF',
    color: COLORS.UI.TEXT_PRIMARY,
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  inputFocused: {
    borderColor: COLORS.SECONDARY,
    boxShadow: `0 0 0 3px ${COLORS.SECONDARY}15`,
  } as React.CSSProperties,

  inputError: {
    borderColor: COLORS.DANGER,
  } as React.CSSProperties,

  inputDisabled: {
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
