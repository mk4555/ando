import { cn } from '@/lib/utils'

interface Props {
  className?: string
}

export default function Spinner({ className }: Props) {
  return (
    <div
      className={cn(
        'h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--text)]',
        className
      )}
    />
  )
}
