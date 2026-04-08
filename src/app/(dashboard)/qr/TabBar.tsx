'use client'

import Link from 'next/link'

export function TabBar({ active }: { active: 'qr' | 'messages' }) {
  const tabs = [
    { id: 'qr', label: 'QR Code', href: '/qr' },
    { id: 'messages', label: 'Send Messages', href: '/qr?tab=messages' },
  ] as const

  return (
    <div className="flex gap-1 mb-8 p-1 rounded-2xl w-fit" style={{ background: 'var(--bg2)' }}>
      {tabs.map(t => (
        <Link
          key={t.id}
          href={t.href}
          replace
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: active === t.id ? 'white' : 'transparent',
            color: active === t.id ? 'var(--ink)' : 'var(--ink4)',
            boxShadow: active === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          {t.label}
        </Link>
      ))}
    </div>
  )
}
