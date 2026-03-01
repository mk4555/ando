interface LabelProps {
  children: React.ReactNode
  required?: boolean
  optionalHint?: string
  className?: string
}

export function FieldLabel({ children, required, optionalHint, className = '' }: LabelProps) {
  return (
    <label className={`block text-sm font-medium text-[var(--text)] ${className}`}>
      {children}{' '}
      {required && <span className="text-[var(--error)]">*</span>}
      {optionalHint && (
        <span className="font-normal text-[var(--text-3)]"> - {optionalHint}</span>
      )}
    </label>
  )
}

interface ErrorProps {
  message?: string
  className?: string
}

export function FieldError({ message, className = '' }: ErrorProps) {
  if (!message) return null
  return <p className={`mt-1.5 text-xs text-[var(--error)] ${className}`}>{message}</p>
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export function FormInput({ className = '', ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text-3)] outline-none focus:border-[var(--border-hi)] focus:ring-2 focus:ring-[var(--accent-s)] ${className}`}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string
}

export function FormSelect({ className = '', ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--border-hi)] focus:ring-2 focus:ring-[var(--accent-s)] ${className}`}
    />
  )
}

interface ChoicePillProps {
  selected: boolean
  onChange: () => void
  label: string
}

export function ChoicePill({ selected, onChange, label }: ChoicePillProps) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
        selected
          ? 'border-[var(--cta)] bg-[var(--cta)] text-white'
          : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] hover:border-[var(--border-hi)]'
      }`}
    >
      <input type="checkbox" checked={selected} onChange={onChange} className="sr-only" />
      {label}
    </label>
  )
}
