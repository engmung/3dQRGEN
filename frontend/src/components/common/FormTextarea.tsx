/**
 * FormTextarea 컴포넌트
 * 여러 줄 텍스트 입력 영역
 */

import React from 'react';
import { COLORS } from '../../constants/colors';

export interface FormTextareaProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
  className?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  disabled = false,
  required = false,
  rows = 4,
  maxLength,
  showCharCount = false,
  className = '',
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const charCount = value.length;
  const showCount = showCharCount || maxLength;

  return (
    <div className={`form-textarea ${className}`}>
      {label && (
        <label style={styles.label}>
          {label}
          {required && <span style={styles.required}>*</span>}
        </label>
      )}

      <textarea
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        style={{
          ...styles.textarea,
          ...(isFocused && styles.textareaFocused),
          ...(error && styles.textareaError),
          ...(disabled && styles.textareaDisabled),
        }}
      />

      <div style={styles.footer}>
        <div style={styles.footerLeft}>
          {error && <div style={styles.errorText}>{error}</div>}
          {!error && helperText && <div style={styles.helperText}>{helperText}</div>}
        </div>

        {showCount && (
          <div style={styles.charCount}>
            {charCount}
            {maxLength && ` / ${maxLength}`}
          </div>
        )}
      </div>
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

  textarea: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: `1px solid ${COLORS.UI.BORDER}`,
    borderRadius: '6px',
    backgroundColor: '#FFFFFF',
    color: COLORS.UI.TEXT_PRIMARY,
    outline: 'none',
    transition: 'all 0.2s ease',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
    lineHeight: '1.5',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  textareaFocused: {
    borderColor: COLORS.SECONDARY,
    boxShadow: `0 0 0 3px ${COLORS.SECONDARY}15`,
  } as React.CSSProperties,

  textareaError: {
    borderColor: COLORS.DANGER,
  } as React.CSSProperties,

  textareaDisabled: {
    backgroundColor: '#F5F5F5',
    color: COLORS.UI.TEXT_DISABLED,
    cursor: 'not-allowed',
    resize: 'none' as const,
  } as React.CSSProperties,

  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: '6px',
    gap: '12px',
  } as React.CSSProperties,

  footerLeft: {
    flex: 1,
  } as React.CSSProperties,

  errorText: {
    fontSize: '12px',
    color: COLORS.DANGER,
  } as React.CSSProperties,

  helperText: {
    fontSize: '12px',
    color: COLORS.UI.TEXT_SECONDARY,
  } as React.CSSProperties,

  charCount: {
    fontSize: '12px',
    color: COLORS.UI.TEXT_SECONDARY,
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
};
