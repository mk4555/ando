import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-s)] focus-visible:border-[var(--border-hi)]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--cta)] text-white hover:bg-[var(--cta-h)]",
        destructive:
          "bg-[var(--error)] text-white hover:bg-[var(--error)]/90",
        outline:
          "border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] hover:bg-[var(--bg-subtle)]",
        secondary:
          "bg-[var(--bg-subtle)] text-[var(--text)] hover:bg-[var(--border)]",
        ghost:
          "text-[var(--text)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]",
        link: "text-[var(--accent)] underline-offset-4 hover:underline",
      },
      size: {
        default: "px-5 py-2.5 has-[>svg]:px-4",
        sm: "px-3 py-1.5 text-xs",
        lg: "px-6 py-3",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
