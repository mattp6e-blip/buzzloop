'use client'

import { useState } from 'react'
import { DEFAULT_QUESTIONS } from '@/lib/review-questions'
import type { ReviewQuestion } from '@/lib/review-questions'

// ─── Mini phone with scale trick ─────────────────────────────────────────────
// Content is rendered at 2.5× actual size then scaled down so browser minimum
// font size (≈10px) never triggers and content fits the phone frame precisely.

const PHONE_W = 130
const PHONE_H = 215
const SCREEN_W = PHONE_W - 8   // 122
const SCREEN_H = PHONE_H - 22  // 193 (leaves room for notch)
const SCALE    = 0.42
const INNER_W  = Math.round(SCREEN_W / SCALE)  // ~290
const INNER_H  = Math.round(SCREEN_H / SCALE)  // ~460

function MiniPhone({ step, brandColor }: { step: 1 | 2 | 3; brandColor: string }) {
  return (
    <div
      style={{
        width: PHONE_W,
        height: PHONE_H,
        background: '#1c1c1e',
        borderRadius: 22,
        padding: '6px 4px 4px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.22)',
        flexShrink: 0,
      }}
    >
      {/* Notch */}
      <div style={{ width: 44, height: 10, background: '#0a0a0a', borderRadius: 5, margin: '0 auto 2px' }} />
      {/* Screen container, clips overflow */}
      <div
        style={{
          background: '#fafaf9',
          borderRadius: 14,
          width: SCREEN_W,
          height: SCREEN_H,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Inner content at INNER_W × INNER_H, scaled down */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: INNER_W,
            height: INNER_H,
            transform: `scale(${SCALE})`,
            transformOrigin: 'top left',
            padding: '24px 18px 18px',
            boxSizing: 'border-box',
          }}
        >
          {step === 1 && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#9c9488', fontWeight: 600, marginBottom: 24, letterSpacing: 0.5 }}>
                How was your experience?
              </p>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#1a1814', marginBottom: 32, fontFamily: 'Georgia, serif' }}>
                Rate your visit
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
                {[1,2,3,4,5].map(n => (
                  <span key={n} style={{ fontSize: 36, color: n <= 4 ? '#f59e0b' : '#e5e2dc', lineHeight: 1 }}>★</span>
                ))}
              </div>
              <p style={{ fontSize: 11, color: '#c4bfb8' }}>Tap a star to rate</p>
            </div>
          )}

          {step === 2 && (
            <div>
              <p style={{ fontSize: 11, color: '#9c9488', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginBottom: 20 }}>
                Question 2 of 3
              </p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#1a1814', fontFamily: 'Georgia, serif', textAlign: 'center', marginBottom: 24 }}>
                What stood out?
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                {[
                  { label: 'The service', selected: true },
                  { label: 'The atmosphere', selected: false },
                  { label: 'The quality', selected: false },
                  { label: 'The value', selected: false },
                ].map(opt => (
                  <span
                    key={opt.label}
                    style={{
                      fontSize: 13,
                      padding: '8px 16px',
                      borderRadius: 50,
                      border: `1.5px solid ${opt.selected ? brandColor : '#e5e2dc'}`,
                      background: opt.selected ? brandColor : 'white',
                      color: opt.selected ? 'white' : '#3d3a35',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {opt.selected ? '✓ ' : ''}{opt.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <p style={{ fontSize: 24, marginBottom: 8 }}>✨</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#1a1814' }}>Your review is ready</p>
                <p style={{ fontSize: 12, color: '#9c9488', marginTop: 4 }}>Copy it, then paste into Google</p>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#3d3a35',
                  background: 'white',
                  border: '1px solid #e5e2dc',
                  borderRadius: 12,
                  padding: '14px 14px',
                  marginBottom: 16,
                  lineHeight: 1.7,
                }}
              >
                Outstanding experience from the moment I walked in. The team were attentive, professional, and made me feel completely at ease...
              </div>
              <div
                style={{
                  fontSize: 14,
                  background: brandColor,
                  color: 'white',
                  borderRadius: 12,
                  padding: '14px 16px',
                  textAlign: 'center',
                  fontWeight: 700,
                }}
              >
                Copy &amp; post to Google →
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Customer journey (3-step) ────────────────────────────────────────────────

export function CustomerJourney({ brandColor, slug }: { brandColor: string; slug: string }) {
  const steps = [
    { step: 1 as const, title: 'Customer scans', desc: 'They land on a branded page personalised to your business' },
    { step: 2 as const, title: '3 quick questions', desc: 'Tailored to your industry, done in under 10 seconds' },
    { step: 3 as const, title: 'AI writes the review', desc: 'They copy it and post to Google in one tap' },
  ]

  return (
    <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold" style={{ color: 'var(--ink)' }}>What happens after they scan</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--ink3)' }}>The whole experience takes under 10 seconds</p>
        </div>
        <a
          href={`/r/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold hover:opacity-70 transition-opacity flex-shrink-0"
          style={{ color: brandColor }}
        >
          Preview live page →
        </a>
      </div>

      <div className="flex items-stretch">
        {steps.map((s, i) => (
          <div key={s.step} className="flex items-center" style={{ flex: 1 }}>
            <div className="flex flex-col items-center flex-1 gap-3 px-2">
              <MiniPhone step={s.step} brandColor={brandColor} />
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: brandColor }}
              >
                {s.step}
              </div>
              <div className="text-center">
                <p className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{s.title}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--ink3)' }}>{s.desc}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ color: 'var(--border)', fontSize: 20, flexShrink: 0, paddingBottom: 80 }}>›</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Questions editor ─────────────────────────────────────────────────────────

export function QuestionsEditor({
  industry,
  brandColor,
  initialQuestions,
}: {
  industry: string
  brandColor: string
  initialQuestions: ReviewQuestion[] | null
}) {
  const defaults = DEFAULT_QUESTIONS[industry] ?? DEFAULT_QUESTIONS.other
  const [questions, setQuestions] = useState<ReviewQuestion[]>(initialQuestions ?? defaults)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [dirty, setDirty]         = useState(false)

  function updateQuestion(qi: number, text: string) {
    setQuestions(prev => prev.map((q, i) => i === qi ? { ...q, question: text } : q))
    setDirty(true); setSaved(false)
  }

  function updateOption(qi: number, oi: number, text: string) {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qi) return q
      return { ...q, options: q.options.map((o, j) => j === oi ? text : o) }
    }))
    setDirty(true); setSaved(false)
  }

  function addOption(qi: number) {
    setQuestions(prev => prev.map((q, i) => i === qi ? { ...q, options: [...q.options, ''] } : q))
    setDirty(true); setSaved(false)
  }

  function removeOption(qi: number, oi: number) {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qi) return q
      return { ...q, options: q.options.filter((_, j) => j !== oi) }
    }))
    setDirty(true); setSaved(false)
  }

  function resetToDefaults() {
    setQuestions(defaults)
    setDirty(true); setSaved(false)
  }

  async function save() {
    setSaving(true)
    await fetch('/api/save-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions }),
    })
    setSaving(false)
    setSaved(true)
    setDirty(false)
  }

  return (
    <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-base font-bold mb-0.5" style={{ color: 'var(--ink)' }}>Questions customers are asked</h2>
          <p className="text-sm" style={{ color: 'var(--ink3)' }}>
            These are the real questions your customers see. Edit any question or option below.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={resetToDefaults}
            className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-70"
            style={{ borderColor: 'var(--border)', color: 'var(--ink3)', background: 'var(--bg)' }}
          >
            Reset to defaults
          </button>
          <button
            onClick={save}
            disabled={saving || !dirty}
            className="text-xs px-4 py-1.5 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: brandColor, color: 'white' }}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {questions.map((q, qi) => (
          <div key={qi} className="rounded-xl p-4" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            {/* Question number + text */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                style={{ background: brandColor, fontSize: 10 }}
              >
                {qi + 1}
              </div>
              <p className="text-xs font-bold" style={{ color: 'var(--ink4)' }}>Question {qi + 1}</p>
            </div>

            <input
              value={q.question}
              onChange={e => updateQuestion(qi, e.target.value)}
              className="w-full text-sm font-semibold mb-3 bg-transparent outline-none border-b pb-2 transition-colors"
              style={{
                color: 'var(--ink)',
                fontFamily: 'Georgia, serif',
                borderColor: 'var(--border)',
              }}
              onFocus={e => (e.target.style.borderColor = brandColor)}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />

            {/* Options */}
            <div className="flex flex-col gap-1.5">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-1.5 group">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: 'var(--border)' }}
                  />
                  <input
                    value={opt}
                    onChange={e => updateOption(qi, oi, e.target.value)}
                    className="flex-1 text-xs bg-transparent outline-none min-w-0"
                    style={{ color: 'var(--ink3)' }}
                  />
                  {q.options.length > 2 && (
                    <button
                      onClick={() => removeOption(qi, oi)}
                      className="opacity-0 group-hover:opacity-100 text-xs transition-opacity flex-shrink-0"
                      style={{ color: '#dc2626' }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addOption(qi)}
                className="text-xs mt-1 text-left hover:opacity-70 transition-opacity"
                style={{ color: brandColor }}
              >
                + Add option
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs mt-4" style={{ color: 'var(--ink4)' }}>
        After the questions, AI writes a personalised review draft. The customer edits it if they want, then posts to Google in one tap.
      </p>
    </div>
  )
}
