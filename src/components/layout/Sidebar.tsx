'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '◼' },
  { href: '/qr', label: 'QR Code', icon: '▦' },
  { href: '/reels', label: 'Content', icon: '✦' },
  { href: '/content', label: 'Posts', icon: '❐' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
]

export function Sidebar({ businessName }: { businessName: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-[220px] flex flex-col border-r z-40"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs" style={{ background: 'var(--accent)' }}>
            ⚡
          </div>
          <span className="font-bold text-sm" style={{ color: 'var(--ink)' }}>Buzzloop</span>
        </div>
      </div>

      {/* Business name */}
      <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'var(--ink4)' }}>Business</p>
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink2)' }}>{businessName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'text-[var(--accent)]'
                  : 'hover:bg-[var(--bg2)]'
              )}
              style={{
                background: active ? 'var(--accent-bg)' : undefined,
                color: active ? 'var(--accent)' : 'var(--ink3)',
              }}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all duration-150 hover:bg-[var(--bg2)]"
          style={{ color: 'var(--ink3)' }}
        >
          <span>↩</span>
          Sign out
        </button>
      </div>
    </aside>
  )
}
