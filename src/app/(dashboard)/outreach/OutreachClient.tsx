'use client'

import { useState } from 'react'

type Channel = 'sms' | 'whatsapp' | 'both'
type Result = { sent: number; failed: number; errors: string[] }

export function OutreachClient({ businessName, reviewUrl }: { businessName: string; reviewUrl: string }) {
  const [raw, setRaw] = useState('')
  const [channel, setChannel] = useState<Channel>('sms')
  const [consented, setConsented] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  const numbers = raw.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
  const previewMessage = `Thanks for visiting ${businessName}! We'd love your honest review — it takes 30 seconds: ${reviewUrl}\n\nReply STOP to opt out.`

  async function handleSend() {
    if (!numbers.length || !consented) return
    setSending(true)
    setResult(null)
    try {
      const res = await fetch('/api/send-review-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numbers, channel }),
      })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({ sent: 0, failed: numbers.length, errors: [String(err)] })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-bold mb-1" style={{ fontSize: '1.6rem', letterSpacing: '-0.03em', color: 'var(--ink)' }}>
          Send review requests
        </h1>
        <p style={{ color: 'var(--ink3)', fontSize: 15 }}>
          Paste your customers' phone numbers and we'll send them a personalised review link.
        </p>
      </div>

      <div className="flex flex-col gap-6">

        {/* Channel selector */}
        <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ink3)' }}>Send via</p>
          <div className="flex gap-2">
            {(['sms', 'whatsapp', 'both'] as Channel[]).map(c => (
              <button
                key={c}
                onClick={() => setChannel(c)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  border: channel === c ? 'none' : '1px solid var(--border)',
                  background: channel === c ? 'var(--accent)' : 'transparent',
                  color: channel === c ? 'white' : 'var(--ink3)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
              >
                {c === 'sms' ? 'SMS' : c === 'whatsapp' ? 'WhatsApp' : 'SMS + WhatsApp'}
              </button>
            ))}
          </div>
          {channel !== 'sms' && (
            <p className="text-xs mt-3 px-1" style={{ color: 'var(--ink4)' }}>
              WhatsApp uses the Twilio sandbox. Recipients must join the sandbox first for testing. Production approval is in progress.
            </p>
          )}
        </div>

        {/* Number input */}
        <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ink3)' }}>
            Phone numbers
            {numbers.length > 0 && (
              <span className="ml-2 font-bold" style={{ color: 'var(--accent)' }}>{numbers.length} {numbers.length === 1 ? 'number' : 'numbers'}</span>
            )}
          </p>
          <textarea
            value={raw}
            onChange={e => setRaw(e.target.value)}
            placeholder={`One per line or comma-separated:\n+12125551234\n+447911123456\n+34612345678`}
            rows={8}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              fontSize: 13,
              fontFamily: 'monospace',
              color: 'var(--ink)',
              background: 'var(--bg)',
              resize: 'vertical',
              outline: 'none',
              lineHeight: 1.7,
            }}
          />
        </div>

        {/* Message preview */}
        <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ink3)' }}>Message preview</p>
          <div style={{
            background: 'var(--bg)',
            borderRadius: 10,
            padding: '14px 16px',
            fontSize: 14,
            lineHeight: 1.75,
            color: 'var(--ink2)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {previewMessage}
          </div>
        </div>

        {/* Consent + send */}
        <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: 'var(--border)' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={consented}
              onChange={e => setConsented(e.target.checked)}
              style={{ marginTop: 3, width: 16, height: 16, accentColor: 'var(--accent)', flexShrink: 0, cursor: 'pointer' }}
            />
            <span style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ink3)' }}>
              I confirm that the people on this list have given consent to receive messages from my business, and I agree to{' '}
              <a href="/terms" target="_blank" style={{ color: 'var(--accent)', fontWeight: 600 }}>Buzzloop's messaging terms</a>.
            </span>
          </label>

          <button
            onClick={handleSend}
            disabled={!numbers.length || !consented || sending}
            style={{
              marginTop: 16,
              width: '100%',
              padding: '14px 20px',
              borderRadius: 12,
              border: 'none',
              background: numbers.length && consented ? 'var(--accent)' : 'var(--border)',
              color: numbers.length && consented ? 'white' : 'var(--ink4)',
              fontSize: 14,
              fontWeight: 700,
              cursor: numbers.length && consented ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            {sending
              ? 'Sending...'
              : numbers.length
              ? `Send to ${numbers.length} ${numbers.length === 1 ? 'person' : 'people'} →`
              : 'Paste numbers above to send'}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="rounded-2xl border p-5" style={{
            background: result.failed === 0 ? '#f0fdf4' : result.sent === 0 ? '#fef2f2' : '#fffbeb',
            borderColor: result.failed === 0 ? '#bbf7d0' : result.sent === 0 ? '#fecaca' : '#fde68a',
          }}>
            <p className="font-bold mb-1" style={{
              color: result.failed === 0 ? '#16a34a' : result.sent === 0 ? '#dc2626' : '#d97706',
              fontSize: 15,
            }}>
              {result.failed === 0
                ? `✓ All ${result.sent} messages sent successfully`
                : result.sent === 0
                ? `✗ All ${result.failed} messages failed`
                : `${result.sent} sent · ${result.failed} failed`}
            </p>
            {result.errors.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {result.errors.slice(0, 3).map((e, i) => (
                  <p key={i} style={{ fontSize: 12, color: '#dc2626', fontFamily: 'monospace' }}>{e}</p>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
