import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MetaCrafting System',
  description: 'A comprehensive crafting and equipment system for RPG games',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
