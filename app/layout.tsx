import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import NavbarWrapper from '@/components/layout/NavbarWrapper'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const playfair = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Ando — AI Travel Planner',
  description: 'Plan your next trip with AI.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ando',
  },
  icons: {
    apple: '/icons/icon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#1c1917',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${dmSans.variable}`}
    >
      <body className="antialiased">
        <NavbarWrapper />
        {children}
      </body>
    </html>
  )
}
