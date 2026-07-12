/**
 * FormInput — text/number/email/tel input with label and validation error.
 */
export function FormInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required,
  disabled,
  min,
  max,
  step,
  className = '',
  hint,
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`form-input ${error ? 'border-error focus:ring-error' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      {hint && !error && <p className="text-xs text-on-surface-variant">{hint}</p>}
      {error && (
        <p className="text-xs text-error flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
    </div>
  )
}

export default FormInput
