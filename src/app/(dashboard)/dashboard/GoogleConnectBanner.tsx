'use client'

export function GoogleConnectBanner() {
  return (
    <div
      className="rounded-2xl border p-5 mb-6 flex items-center justify-between gap-4"
      style={{ borderColor: 'var(--accent-border)', background: 'var(--accent-bg)' }}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">🔗</div>
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>
            Connect your Google Business Profile
          </p>
          <p className="text-xs" style={{ color: 'var(--ink3)' }}>
            Unlocks your Social Clips and activates your QR code so you can start getting more reviews immediately.
          </p>
        </div>
      </div>
      <a
        href="/api/auth/google?returnTo=/dashboard"
        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:bg-white"
        style={{ borderColor: 'var(--border2)', color: 'var(--ink2)', background: 'white' }}
      >
        <svg width="16" height="16" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
          <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
        </svg>
        Connect Google
      </a>
    </div>
  )
}
