interface PageShellProps {
  children: React.ReactNode
  maxWidth?: 'lg' | 'xl' | '2xl' | '3xl'
  paddingY?: 'py-12' | 'py-16'
  className?: string
}

const WIDTH_CLASS: Record<NonNullable<PageShellProps['maxWidth']>, string> = {
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
}

export default function PageShell({
  children,
  maxWidth = '2xl',
  paddingY = 'py-12',
  className = '',
}: PageShellProps) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className={`mx-auto ${WIDTH_CLASS[maxWidth]} px-4 ${paddingY} ${className}`}>
        {children}
      </div>
    </div>
  )
}
