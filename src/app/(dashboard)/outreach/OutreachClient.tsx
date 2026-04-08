'use client'

import { useRef, useState } from 'react'

type Channel = 'sms' | 'whatsapp' | 'both'
type InputMode = 'manual' | 'csv'
type Contact = { number: string; name?: string }
type Result = { sent: number; failed: number; errors: string[] }
type Stats = { sent: number; clicked: number; converted: number }

function parseCSV(text: string): Contact[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  if (!lines.length) return []

  const sep = lines[0].includes(';') ? ';' : ','
  const firstLower = lines[0].toLowerCase()
  const hasHeader = /name|phone|mobile|number|tel|first/.test(firstLower)

  let nameCol = -1
  let phoneCol = -1

  if (hasHeader) {
    const headers = firstLower.split(sep).map(h => h.trim().replace(/^"|"$/g, ''))
    nameCol = headers.findIndex(h => /name|first/.test(h))
    phoneCol = headers.findIndex(h => /phone|mobile|number|tel/.test(h))
  }

  const dataLines = hasHeader ? lines.slice(1) : lines

  return dataLines.map(line => {
    const parts = line.split(sep).map(p => p.trim().replace(/^"|"$/g, ''))
    if (nameCol !== -1 && phoneCol !== -1) {
      return { number: parts[phoneCol] ?? '', name: parts[nameCol] || undefined }
    }
    if (parts.length === 1) return { number: parts[0] }
    // Auto-detect: which column looks like a phone number?
    const pi = parts.findIndex(p => /^\+?[\d\s\-().]+$/.test(p) && p.replace(/\D/g, '').length >= 7)
    if (pi !== -1) {
      const ni = parts.findIndex((_, i) => i !== pi)
      return { number: parts[pi], name: ni !== -1 ? parts[ni] || undefined : undefined }
    }
    return { number: parts[0] }
  }).filter(c => c.number.trim())
}

function buildPreview(businessName: string, trackUrl: string, sampleName?: string): string {
  const name = sampleName?.trim().split(/\s+/)[0]
  return name
    ? `Hi ${name}! ${businessName} - quick Google review? ${trackUrl}\n\nSTOP to opt out.`
    : `${businessName} - quick Google review? ${trackUrl}\n\nSTOP to opt out.`
}

export function OutreachClient({
  businessName,
  reviewUrl,
  stats: initialStats,
}: {
  businessName: string
  reviewUrl: string
  stats: Stats
}) {
  const [inputMode, setInputMode] = useState<InputMode>('manual')
  const [rawText, setRawText] = useState('')
  const [csvContacts, setCsvContacts] = useState<Contact[]>([])
  const [channel, setChannel] = useState<Channel>('sms')
  const [consented, setConsented] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [stats, setStats] = useState<Stats>(initialStats)
  const fileRef = useRef<HTMLInputElement>(null)

  const manualContacts: Contact[] = rawText
    .split(/[\n,]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(n => ({ number: n }))

  const contacts = inputMode === 'manual' ? manualContacts : csvContacts
  const hasNames = contacts.some(c => c.name)
  const sampleName = contacts.find(c => c.name)?.name
  const previewMessage = buildPreview(businessName, reviewUrl, sampleName)

  function handleCSVFile(file: File) {
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      setCsvContacts(parsed)
      setInputMode('csv')
    }
    reader.readAsText(file)
  }

  async function handleSend() {
    if (!contacts.length || !consented) return
    setSending(true)
    setResult(null)
    try {
      const res = await fetch('/api/send-review-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts, channel }),
      })
      const data = await res.json()
      setResult(data)
      if (data.sent > 0) {
        setStats(s => ({ ...s, sent: s.sent + data.sent }))
      }
    } catch (err) {
      setResult({ sent: 0, failed: contacts.length, errors: [String(err)] })
    } finally {
      setSending(false)
    }
  }

  const clickRate = stats.sent > 0 ? Math.round((stats.clicked / stats.sent) * 100) : 0
  const convRate = stats.clicked > 0 ? Math.round((stats.converted / stats.clicked) * 100) : 0

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-bold mb-1" style={{ fontSize: '1.6rem', letterSpacing: '-0.03em', color: 'var(--ink)' }}>
          Send review requests
        </h1>
        <p style={{ color: 'var(--ink3)', fontSize: 15 }}>
          Send a personalised message to customers asking for a Google review.
        </p>
      </div>

      {/* Stats */}
      {stats.sent > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Sent', value: stats.sent, sub: 'total messages' },
            { label: 'Clicked', value: stats.clicked, sub: `${clickRate}% click rate` },
            { label: 'Reviews', value: stats.converted, sub: `${convRate}% conversion` },
            { label: 'Drop-offs', value: stats.clicked - stats.converted, sub: 'clicked but didn\'t review' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border p-4" style={{ background: 'white', borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--ink3)' }}>{s.label}</p>
              <p className="text-2xl font-bold mb-0.5" style={{ color: 'var(--ink)', fontFamily: 'Georgia, serif' }}>{s.value}</p>
              <p className="text-xs" style={{ color: 'var(--ink4)' }}>{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-5">

        {/* Channel */}
        <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ink3)' }}>Send via</p>
          <div className="flex gap-2 flex-wrap">
            {(['sms', 'whatsapp', 'both'] as Channel[]).map(c => (
              <button
                key={c}
                onClick={() => setChannel(c)}
                style={{
                  padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  border: channel === c ? 'none' : '1px solid var(--border)',
                  background: channel === c ? 'var(--accent)' : 'transparent',
                  color: channel === c ? 'white' : 'var(--ink3)',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                }}
              >
                {c === 'sms' ? 'SMS' : c === 'whatsapp' ? 'WhatsApp' : 'SMS + WhatsApp'}
              </button>
            ))}
          </div>
          {channel !== 'sms' && (
            <p className="text-xs mt-3 px-1" style={{ color: 'var(--ink4)' }}>
              WhatsApp uses the Twilio sandbox for testing. Recipients must join by texting the sandbox join word to +14155238886.
            </p>
          )}
        </div>

        {/* Contacts input */}
        <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--ink3)' }}>
              Contacts
              {contacts.length > 0 && (
                <span className="ml-2 font-bold" style={{ color: 'var(--accent)' }}>
                  {contacts.length} {contacts.length === 1 ? 'person' : 'people'}
                  {hasNames && ' · with names ✓'}
                </span>
              )}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setInputMode('manual')}
                style={{
                  padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  border: inputMode === 'manual' ? 'none' : '1px solid var(--border)',
                  background: inputMode === 'manual' ? 'var(--ink)' : 'transparent',
                  color: inputMode === 'manual' ? 'white' : 'var(--ink4)',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Paste
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  border: inputMode === 'csv' ? 'none' : '1px solid var(--border)',
                  background: inputMode === 'csv' ? 'var(--ink)' : 'transparent',
                  color: inputMode === 'csv' ? 'white' : 'var(--ink4)',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Upload CSV
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                style={{ display: 'none' }}
                onChange={e => { if (e.target.files?.[0]) handleCSVFile(e.target.files[0]) }}
              />
            </div>
          </div>

          {inputMode === 'manual' ? (
            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder={`One per line or comma-separated:\n+12125551234\n+447911123456\n+34612345678`}
              rows={7}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1px solid var(--border)', fontSize: 13,
                fontFamily: 'monospace', color: 'var(--ink)',
                background: 'var(--bg)', resize: 'vertical', outline: 'none', lineHeight: 1.7,
              }}
            />
          ) : csvContacts.length > 0 ? (
            <div style={{ maxHeight: 220, overflowY: 'auto', borderRadius: 10, border: '1px solid var(--border)' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg2)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--ink3)', fontWeight: 600, fontSize: 11 }}>NAME</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--ink3)', fontWeight: 600, fontSize: 11 }}>NUMBER</th>
                  </tr>
                </thead>
                <tbody>
                  {csvContacts.slice(0, 50).map((c, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 12px', color: c.name ? 'var(--ink)' : 'var(--ink4)' }}>{c.name ?? '—'}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--ink2)', fontFamily: 'monospace' }}>{c.number}</td>
                    </tr>
                  ))}
                  {csvContacts.length > 50 && (
                    <tr style={{ borderTop: '1px solid var(--border)' }}>
                      <td colSpan={2} style={{ padding: '8px 12px', color: 'var(--ink4)', fontSize: 12 }}>
                        + {csvContacts.length - 50} more
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--ink4)', padding: '12px 0' }}>
              No contacts parsed yet — upload a .csv file with name and phone columns.
            </p>
          )}

          {inputMode === 'csv' && csvContacts.length > 0 && (
            <p className="text-xs mt-3" style={{ color: 'var(--ink4)' }}>
              CSV format: name + phone columns detected.
              {hasNames ? ' Messages will be personalised with first names.' : ''}
              {' '}<button onClick={() => { setCsvContacts([]); setInputMode('manual') }} style={{ color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit' }}>Clear</button>
            </p>
          )}
        </div>

        {/* Message preview */}
        <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--ink3)' }}>Message preview</p>
            {hasNames && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                ✓ Personalised
              </span>
            )}
          </div>
          <div style={{
            background: 'var(--bg)', borderRadius: 10, padding: '14px 16px',
            fontSize: 14, lineHeight: 1.75, color: 'var(--ink2)',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere',
          }}>
            {previewMessage}
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--ink4)' }}>
            The link will be wrapped in a unique tracking URL per recipient so you can see who clicked and who left a review.
          </p>
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
              <a href="/terms" target="_blank" style={{ color: 'var(--accent)', fontWeight: 600 }}>Buzzloop&apos;s messaging terms</a>.
            </span>
          </label>

          <button
            onClick={handleSend}
            disabled={!contacts.length || !consented || sending}
            style={{
              marginTop: 16, width: '100%', padding: '14px 20px', borderRadius: 12,
              border: 'none',
              background: contacts.length && consented ? 'var(--accent)' : 'var(--border)',
              color: contacts.length && consented ? 'white' : 'var(--ink4)',
              fontSize: 14, fontWeight: 700, cursor: contacts.length && consented ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}
          >
            {sending
              ? 'Sending...'
              : contacts.length
              ? `Send to ${contacts.length} ${contacts.length === 1 ? 'person' : 'people'} →`
              : 'Add contacts above to send'}
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
                ? `✓ All ${result.sent} messages sent`
                : result.sent === 0
                ? `Failed to send`
                : `${result.sent} sent · ${result.failed} failed`}
            </p>
            <p style={{ fontSize: 13, color: 'var(--ink3)' }}>
              Clicks and conversions will appear in the stats above as customers interact.
            </p>
            {result.errors.slice(0, 3).map((e, i) => (
              <p key={i} style={{ fontSize: 12, color: '#dc2626', fontFamily: 'monospace', marginTop: 4 }}>{e}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
