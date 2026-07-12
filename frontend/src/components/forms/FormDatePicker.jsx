/**
 * FormDatePicker — date input with label, error, and optional max date constraint.
 */
export function FormDatePicker({
  id,
  label,
  value,
  onChange,
  error,
  required,
  disabled,
  max,
  min,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type="date"
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          max={max}
          min={min}
          className={`form-input pl-10 ${error ? 'border-error focus:ring-error' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
        </div>
      </div>
      {error && (
        <p className="text-xs text-error flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
    </div>
  )
}

export default FormDatePicker
