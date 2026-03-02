'use client'

import { toast } from 'sonner'

interface Props {
  url: string
}

export default function ShareButton({ url }: Props) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Fallback: select the text for manual copy
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    toast('Link copied!')
  }

  return (
    <button
      onClick={handleCopy}
      className="cursor-pointer text-sm text-[var(--text-2)] underline underline-offset-4 hover:text-[var(--text)]"
    >
      Copy share link
    </button>
  )
}
