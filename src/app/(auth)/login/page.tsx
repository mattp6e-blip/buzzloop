'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  async function handleGoogleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10 justify-center">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-70 transition-opacity">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: 'var(--accent)' }}>
              ⚡
            </div>
            <span className="font-bold text-lg" style={{ color: 'var(--ink)' }}>Buzzloop</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border p-8" style={{ borderColor: 'var(--border)', boxShadow: '0 4px 24px rgba(26,24,20,0.06)' }}>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Welcome back</h1>
          <p className="text-sm mb-7" style={{ color: 'var(--ink3)' }}>Sign in to your Buzzloop account</p>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold mb-5 transition-all hover:bg-gray-50"
            style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--ink4)' }}>or sign in with email</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="you@yourbusiness.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
              Sign in →
            </Button>
          </form>
        </div>

        <p className="text-sm text-center mt-5" style={{ color: 'var(--ink3)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
            Start free
          </Link>
        </p>
      </div>
    </div>
  )
}
