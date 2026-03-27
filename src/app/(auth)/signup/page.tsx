'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10 justify-center">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm" style={{ background: 'var(--accent)' }}>
            ⚡
          </div>
          <span className="font-bold text-lg" style={{ color: 'var(--ink)' }}>ReviewSpark</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border p-8" style={{ borderColor: 'var(--border)', boxShadow: '0 4px 24px rgba(26,24,20,0.06)' }}>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Start for free</h1>
          <p className="text-sm mb-7" style={{ color: 'var(--ink3)' }}>14 days free. No credit card required.</p>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
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
              placeholder="Create a password (min 8 chars)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={8}
              required
            />

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
              Create account →
            </Button>
          </form>

          <p className="text-xs text-center mt-5" style={{ color: 'var(--ink4)' }}>
            By signing up you agree to our Terms & Privacy Policy
          </p>
        </div>

        <p className="text-sm text-center mt-5" style={{ color: 'var(--ink3)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
