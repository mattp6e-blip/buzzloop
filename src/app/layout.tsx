import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
})

export const metadata: Metadata = {
  title: 'Buzzloop — More Reviews. More Customers. On Autopilot.',
  description: 'Turn your happiest customers into a Google review machine — then transform those reviews into stunning social content.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full`}>
      <body className="min-h-full" style={{ background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
