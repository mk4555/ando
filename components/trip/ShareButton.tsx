'use client'

import { useState } from 'react'

interface Props {
  url: string
}

export default function ShareButton({ url }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select the text for manual copy
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="text-sm text-stone-500 underline underline-offset-4 hover:text-stone-700"
    >
      {copied ? 'Link copied!' : 'Copy share link'}
    </button>
  )
}
