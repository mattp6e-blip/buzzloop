'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Step = 'rating' | 'complaint' | 'questions' | 'extra' | 'generating' | 'draft' | 'done'

interface Question {
  id: string
  question: string
  options: string[]
  multi: boolean
  allowOther?: boolean
}

const QUESTIONS: Record<string, Question[]> = {
  restaurant: [
    { id: 'what',      question: 'What did you have?',  options: ['Dinner', 'Lunch', 'Brunch', 'Just drinks', 'Coffee & cake', 'Tasting menu'], multi: false },
    { id: 'highlight', question: 'What stood out?',     options: ['The food quality', 'The service', 'The atmosphere', 'The portion sizes', 'The value', 'Everything!'], multi: true },
    { id: 'vibe',      question: 'How did it feel?',    options: ['Cosy & intimate', 'Lively & fun', 'Perfect for a date', 'Great for groups', 'A hidden gem', 'Like a local favourite'], multi: false },
  ],
  dental: [
    { id: 'reason',    question: 'What brought you in?', options: ['Routine check-up & clean', 'Teeth whitening', 'A treatment or procedure', 'Emergency visit', 'First visit', 'Other...'], multi: false, allowOther: true },
    { id: 'feeling',   question: 'How did the team make you feel?', options: ['Completely at ease', 'Very professional', 'Caring & attentive', 'Safe & in good hands', 'Reassured throughout'], multi: true },
    { id: 'highlight', question: 'What impressed you most?',     options: ['Pain-free experience', 'Clear explanations', 'Modern equipment', 'Friendly staff', 'How thorough they were', 'How quick it was'], multi: false },
  ],
  gym: [
    { id: 'use',       question: 'What do you mainly use?',      options: ['Free weights & lifting', 'Cardio machines', 'Group fitness classes', 'Personal training', 'Functional training area', 'The pool or recovery facilities'], multi: true },
    { id: 'keeps',     question: 'What keeps you coming back?',  options: ['Seeing real results', 'The community feel', 'Quality of the equipment', 'The coaches & trainers', 'The atmosphere', 'Convenient hours'], multi: true },
    { id: 'impact',    question: 'How has it changed you?',      options: ['Stronger & fitter', 'More confident', 'Built a proper routine', 'Lost weight', 'Better mental health', 'Completely hooked'], multi: false },
  ],
  salon: [
    { id: 'service',   question: 'What did you come in for?',    options: ['Haircut & style', 'Colour or highlights', 'Hair treatment', 'Blow-dry', 'Nails', 'Other...'], multi: false, allowOther: true },
    { id: 'result',    question: 'How did it turn out?',         options: ['Exactly what I wanted', 'Even better than expected', 'They nailed my reference photos', 'Totally transformed'], multi: false },
    { id: 'feeling',   question: 'How did you feel leaving?',    options: ['Like a new person', 'Really confident', 'Relaxed & pampered', 'Couldn\'t stop smiling', 'Ready to show it off'], multi: false },
  ],
  spa: [
    { id: 'service',   question: 'What did you have?',           options: ['Massage', 'Facial', 'Body treatment', 'Full day package', 'Couples treatment', 'Other...'], multi: false, allowOther: true },
    { id: 'feeling',   question: 'How did you feel after?',      options: ['Completely relaxed', 'Totally recharged', 'Like a new person', 'Deeply pampered', 'All tension gone'], multi: false },
    { id: 'highlight', question: 'What stood out?',              options: ['The atmosphere & ambience', 'The therapist\'s skill', 'The facilities', 'The results on my skin or body', 'How personalised it felt', 'Everything'], multi: true },
  ],
  clinic: [
    { id: 'reason',    question: 'What brought you in?',         options: ['Routine check-up', 'A health concern', 'Follow-up appointment', 'Tests or results', 'First visit', 'Other...'], multi: false, allowOther: true },
    { id: 'care',      question: 'How was the care?',            options: ['Thorough & attentive', 'Quick & efficient', 'Warm & reassuring', 'Very professional', 'They really listened'], multi: true },
    { id: 'highlight', question: 'What stood out?',              options: ['Clear explanations', 'Short waiting time', 'Friendly & welcoming staff', 'Feeling genuinely heard', 'Easy to book', 'Left with a clear plan'], multi: false },
  ],
  retail: [
    { id: 'reason',    question: 'What brought you in?',         options: ['Looking for something specific', 'Browsing & exploring', 'Buying a gift', 'A recommendation from someone', 'Regular shopping trip', 'Saw it online first'], multi: false },
    { id: 'highlight', question: 'How was the experience?',      options: ['Found exactly what I needed', 'Staff really helped me out', 'Great range & selection', 'Really good value', 'Beautiful store layout', 'Quick & easy'], multi: true },
    { id: 'tell',      question: 'What would you tell a friend?', options: ['You have to check this place out', 'Great range, never disappointed', 'The staff are genuinely helpful', 'Worth every penny', 'My new go-to spot'], multi: false },
  ],
  other: [
    { id: 'reason',    question: 'What brought you here?',       options: ['A recommendation', 'Saw it online', 'Regular visit', 'First time trying it', 'Special occasion'], multi: false },
    { id: 'highlight', question: 'What stood out most?',         options: ['The quality', 'The people', 'The whole experience', 'The value', 'How professional it was'], multi: true },
    { id: 'feeling',   question: 'How did it make you feel?',    options: ['Really impressed', 'Happy I came', 'Glad I found this place', 'Like a regular already', 'I\'ll be back for sure'], multi: false },
  ],
}

const PLACEHOLDERS: Record<string, string> = {
  restaurant: 'e.g. The pasta was cooked perfectly — we couldn\'t stop talking about it on the way home...',
  dental:     'e.g. Dr. Smith talked me through every step before starting — I barely felt a thing...',
  gym:        'e.g. The 6am classes have completely changed my routine — I\'m actually enjoying mornings now...',
  salon:      'e.g. She matched my reference photos exactly and gave me the best advice for maintaining the colour...',
  spa:        'e.g. I came in stressed and left feeling like I\'d had a full night\'s sleep — genuinely incredible...',
  clinic:     'e.g. The doctor took time to really listen and didn\'t rush me out — I left feeling reassured...',
  retail:     'e.g. They didn\'t just sell me something — they took time to find what actually suited my needs...',
  other:      'e.g. What really stood out was how attentive everyone was from the moment I walked in...',
}

function getQuestions(industry: string): Question[] {
  return QUESTIONS[industry] ?? QUESTIONS.other
}

function StaffPicker({
  staffMembers, value, onChange, brandColor,
}: { staffMembers: string[]; value: string; onChange: (v: string) => void; brandColor: string }) {
  const isKnown    = staffMembers.includes(value)
  const showOther  = !isKnown && value !== ''
  const otherActive = !isKnown  // "Someone else" chip is active when value isn't a known name

  return (
    <div className="mb-5">
      <div className="flex flex-wrap gap-2">
        {staffMembers.map(name => {
          const selected = value === name
          return (
            <button
              key={name}
              onClick={() => onChange(selected ? '' : name)}
              className="px-4 py-2 rounded-full text-sm font-semibold border transition-all active:scale-95"
              style={{
                background:  selected ? brandColor : 'white',
                color:       selected ? 'white' : '#3d3a35',
                borderColor: selected ? brandColor : '#e5e2dc',
              }}
            >
              {selected && '✓ '}{name}
            </button>
          )
        })}
        <button
          onClick={() => onChange(otherActive ? '' : ' ')}
          className="px-4 py-2 rounded-full text-sm font-semibold border transition-all active:scale-95"
          style={{
            background:  otherActive ? brandColor : 'white',
            color:       otherActive ? 'white' : '#3d3a35',
            borderColor: otherActive ? brandColor : '#e5e2dc',
          }}
        >
          {otherActive && '✓ '}Someone else
        </button>
      </div>
      {otherActive && (
        <input
          type="text"
          value={showOther ? value.trim() : ''}
          autoFocus
          placeholder="Enter their name..."
          className="w-full mt-3 px-4 py-3 rounded-2xl border text-sm outline-none"
          style={{ borderColor: brandColor, color: '#1a1814', background: 'white' }}
          onChange={e => onChange(e.target.value || ' ')}
        />
      )}
    </div>
  )
}

interface Props {
  businessId: string
  businessName: string
  industry: string
  brandColor: string
  googleBusinessUrl: string | null
  staffMembers: string[]
}

export function ReviewFlow({ businessId, businessName, industry, brandColor, googleBusinessUrl, staffMembers }: Props) {
  const [step, setStep]               = useState<Step>('rating')
  const [starRating, setStarRating]   = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers]         = useState<Record<string, string[]>>({})
  const [otherInputs, setOtherInputs] = useState<Record<string, string>>({})
  const [freeText, setFreeText]       = useState('')
  const [staffName, setStaffName]     = useState('')
  const [complaint, setComplaint]     = useState('')
  const [draft, setDraft]             = useState('')
  const [copied, setCopied]           = useState(false)

  const questions = getQuestions(industry)
  const currentQ  = questions[questionIndex]
  const currentSelected = answers[currentQ?.id] ?? []

  function toggleOption(option: string) {
    const q = currentQ
    if (q.multi) {
      setAnswers(prev => {
        const cur = prev[q.id] ?? []
        return { ...prev, [q.id]: cur.includes(option) ? cur.filter(o => o !== option) : [...cur, option] }
      })
    } else {
      setAnswers(prev => ({ ...prev, [q.id]: [option] }))
      // Auto-advance on single select, unless "Other..." was chosen (needs text input)
      if (!(q.allowOther && option === 'Other...')) {
        setTimeout(() => advanceQuestion(), 280)
      }
    }
  }

  function advanceQuestion() {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(i => i + 1)
    } else {
      setStep('extra')
    }
  }

  function buildAnswerSummary() {
    const parts: string[] = []
    for (const q of questions) {
      const selected = answers[q.id]
      if (selected?.length) {
        const resolved = selected.map(o => (o === 'Other...' && otherInputs[q.id]) ? otherInputs[q.id] : o)
        parts.push(resolved.join(', '))
      }
    }
    if (freeText.trim()) parts.push(freeText.trim())
    return parts.join('. ')
  }

  async function handleSubmit() {
    setStep('generating')
    const summary = buildAnswerSummary()

    const res = await fetch('/api/generate-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessName, industry, starRating, whatTheyLiked: summary, staffName: staffName.trim() || null }),
    })
    const { draft: generatedDraft } = await res.json()
    setDraft(generatedDraft)

    const supabase = createClient()
    await supabase.from('reviews').insert({
      business_id: businessId,
      star_rating: starRating,
      what_they_liked: summary || 'Great experience',
      staff_name: staffName.trim() || null,
      ai_draft: generatedDraft,
    })

    setStep('draft')
  }

  async function handleComplaintSubmit() {
    const supabase = createClient()
    await supabase.from('reviews').insert({
      business_id: businessId,
      star_rating: starRating,
      what_they_liked: complaint || 'Customer reported a negative experience',
      staff_name: null,
      ai_draft: 'PRIVATE',
    })
    setStep('done')
  }

  async function handleCopyAndRedirect() {
    // Open Google first — must happen synchronously with the user gesture or browsers block it
    if (googleBusinessUrl) window.open(googleBusinessUrl, '_blank')
    await navigator.clipboard.writeText(draft)
    setCopied(true)
  }

  // Progress for the questions step
  const totalSteps  = questions.length + 2 // questions + extra + done
  const currentStep = step === 'questions' ? questionIndex + 1 : step === 'extra' ? questions.length + 1 : 0
  const progress    = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#fafaf9', touchAction: 'manipulation' }}>

      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 bg-white" style={{ borderBottom: '1px solid #f0ede8' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: brandColor }}>
          ⚡
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: '#1a1814' }}>{businessName}</p>
          <p className="text-xs" style={{ color: '#9c9488' }}>Leave a review</p>
        </div>
      </div>

      {/* Progress bar — only during questions */}
      {(step === 'questions' || step === 'extra') && (
        <div style={{ height: 3, background: '#f0ede8' }}>
          <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, background: brandColor }} />
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-xs">

          {/* ── STEP: Rating ── */}
          {step === 'rating' && (
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: '#9c9488' }}>
                How was your experience?
              </p>
              <h1 className="text-2xl font-bold mb-10" style={{ color: '#1a1814', fontFamily: 'Georgia, serif' }}>
                Rate {businessName}
              </h1>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setStarRating(star)
                      setTimeout(() => setStep(star >= 4 ? 'questions' : 'complaint'), 300)
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault()
                      setStarRating(star)
                      setTimeout(() => setStep(star >= 4 ? 'questions' : 'complaint'), 300)
                    }}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="active:scale-90"
                    style={{ fontSize: 52, lineHeight: 1, touchAction: 'manipulation', cursor: 'pointer', transition: 'transform 100ms' }}
                  >
                    <span style={{ color: star <= (hoveredStar || starRating) ? '#f59e0b' : '#e5e2dc' }}>★</span>
                  </button>
                ))}
              </div>
              <p className="text-xs" style={{ color: '#c4bfb8' }}>Tap to rate</p>
            </div>
          )}

          {/* ── STEP: Complaint (1–3 stars) ── */}
          {step === 'complaint' && (
            <div className="text-center">
              <div className="text-4xl mb-4">😔</div>
              <h1 className="text-xl font-bold mb-2" style={{ color: '#1a1814' }}>
                We&apos;re sorry to hear that
              </h1>
              <p className="text-sm mb-6" style={{ color: '#9c9488' }}>
                Help {businessName} improve — what went wrong?
              </p>
              <textarea
                value={complaint}
                onChange={e => setComplaint(e.target.value)}
                placeholder="Tell us what happened..."
                className="w-full px-4 py-3 rounded-2xl border text-sm outline-none resize-none"
                style={{ borderColor: '#e5e2dc', color: '#1a1814', background: 'white', minHeight: 110 }}
                onFocus={e => e.target.style.borderColor = brandColor}
                onBlur={e => e.target.style.borderColor = '#e5e2dc'}
              />
              <button
                onClick={handleComplaintSubmit}
                className="w-full mt-4 py-4 rounded-2xl text-white font-bold text-base transition-all active:scale-95"
                style={{ background: brandColor }}
              >
                Send feedback
              </button>
              <p className="text-xs mt-3" style={{ color: '#c4bfb8' }}>
                Your feedback goes directly to the owner — not published publicly
              </p>
            </div>
          )}

          {/* ── STEP: Questions ── */}
          {step === 'questions' && currentQ && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-6 text-center" style={{ color: '#9c9488' }}>
                Question {questionIndex + 1} of {questions.length}
              </p>
              <h2 className="text-xl font-bold mb-6 text-center" style={{ color: '#1a1814', fontFamily: 'Georgia, serif' }}>
                {currentQ.question}
              </h2>
              <div className="flex flex-wrap gap-2.5 justify-center mb-4">
                {currentQ.options.map(option => {
                  const selected = currentSelected.includes(option)
                  return (
                    <button
                      key={option}
                      onClick={() => toggleOption(option)}
                      className="px-4 py-2.5 rounded-full text-sm font-semibold border transition-all active:scale-95"
                      style={{
                        background:   selected ? brandColor : 'white',
                        color:        selected ? 'white' : '#3d3a35',
                        borderColor:  selected ? brandColor : '#e5e2dc',
                        boxShadow:    selected ? `0 0 0 3px ${brandColor}25` : 'none',
                      }}
                    >
                      {selected && '✓ '}{option}
                    </button>
                  )
                })}
              </div>
              {/* "Other..." text input */}
              {currentQ.allowOther && currentSelected.includes('Other...') && (
                <input
                  type="text"
                  autoFocus
                  value={otherInputs[currentQ.id] ?? ''}
                  onChange={e => setOtherInputs(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                  placeholder="Tell us what you came in for..."
                  className="w-full px-4 py-3 rounded-2xl border text-sm outline-none mb-4"
                  style={{ borderColor: brandColor, color: '#1a1814', background: 'white' }}
                />
              )}
              <div className="mb-4" />
              {/* Next / Skip buttons */}
              {(currentQ.multi || (currentQ.allowOther && currentSelected.includes('Other...'))) && currentSelected.length > 0 && (
                <button
                  onClick={advanceQuestion}
                  className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all active:scale-95"
                  style={{ background: brandColor }}
                >
                  Next →
                </button>
              )}
              {currentQ.multi && currentSelected.length === 0 && (
                <button
                  onClick={advanceQuestion}
                  className="w-full py-3 rounded-2xl text-sm font-semibold transition-all"
                  style={{ color: '#9c9488' }}
                >
                  Skip
                </button>
              )}
            </div>
          )}

          {/* ── STEP: Extra (free text + staff) ── */}
          {step === 'extra' && (
            <div>
              <h2 className="text-xl font-bold mb-2 text-center" style={{ color: '#1a1814', fontFamily: 'Georgia, serif' }}>
                Anything else to add?
              </h2>
              <p className="text-sm mb-6 text-center" style={{ color: '#9c9488' }}>Optional — your own words make it even better</p>

              <textarea
                value={freeText}
                onChange={e => setFreeText(e.target.value)}
                placeholder={PLACEHOLDERS[industry] ?? PLACEHOLDERS.other}
                className="w-full px-4 py-3 rounded-2xl border text-sm outline-none resize-none mb-4"
                style={{ borderColor: '#e5e2dc', color: '#1a1814', background: 'white', minHeight: 90 }}
                onFocus={e => e.target.style.borderColor = brandColor}
                onBlur={e => e.target.style.borderColor = '#e5e2dc'}
              />

              <p className="text-xs font-semibold mb-2" style={{ color: '#9c9488' }}>
                Who looked after you? <span style={{ color: '#c4bfb8', fontWeight: 400 }}>(optional)</span>
              </p>
              {staffMembers.length > 0 ? (
                <StaffPicker
                  staffMembers={staffMembers}
                  value={staffName}
                  onChange={setStaffName}
                  brandColor={brandColor}
                />
              ) : (
                <input
                  type="text"
                  value={staffName}
                  onChange={e => setStaffName(e.target.value)}
                  placeholder="e.g. Maria"
                  className="w-full px-4 py-3 rounded-2xl border text-sm outline-none mb-5"
                  style={{ borderColor: '#e5e2dc', color: '#1a1814', background: 'white' }}
                  onFocus={e => e.target.style.borderColor = brandColor}
                  onBlur={e => e.target.style.borderColor = '#e5e2dc'}
                />
              )}

              <button
                onClick={handleSubmit}
                className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all active:scale-95"
                style={{ background: brandColor }}
              >
                Write my review ✦
              </button>
            </div>
          )}

          {/* ── STEP: Generating ── */}
          {step === 'generating' && (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-5"
                style={{ borderColor: brandColor, borderTopColor: 'transparent' }} />
              <h2 className="text-lg font-bold mb-2" style={{ color: '#1a1814' }}>Writing your review...</h2>
              <p className="text-sm" style={{ color: '#9c9488' }}>Just a second</p>
            </div>
          )}

          {/* ── STEP: Draft ── */}
          {step === 'draft' && (
            <div>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">✨</div>
                <h1 className="text-xl font-bold mb-1" style={{ color: '#1a1814' }}>Your review is ready</h1>
                <p className="text-sm" style={{ color: '#9c9488' }}>Copy it, then paste it into Google</p>
              </div>
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                className="w-full rounded-2xl p-5 mb-1 text-sm leading-relaxed outline-none resize-none"
                style={{ background: 'white', border: '1px solid #e5e2dc', color: '#3d3a35', minHeight: 140 }}
                onFocus={e => e.target.style.borderColor = brandColor}
                onBlur={e => e.target.style.borderColor = '#e5e2dc'}
              />
              <p className="text-xs mb-4 text-right" style={{ color: '#c4bfb8' }}>Tap to edit</p>
              <button
                onClick={handleCopyAndRedirect}
                className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all active:scale-95"
                style={{ background: copied ? '#16a34a' : brandColor }}
              >
                {copied ? '✓ Copied! Opening Google...' : 'Copy & post to Google →'}
              </button>
              {!googleBusinessUrl && (
                <p className="text-xs text-center mt-3" style={{ color: '#c4bfb8' }}>
                  Copy the text above and paste it into your Google review
                </p>
              )}
              <p className="text-xs text-center mt-5" style={{ color: '#c4bfb8' }}>Thank you for your kind words 🙏</p>
            </div>
          )}

          {/* ── STEP: Done (after complaint) ── */}
          {step === 'done' && (
            <div className="text-center">
              <div className="text-4xl mb-4">🙏</div>
              <h1 className="text-xl font-bold mb-2" style={{ color: '#1a1814' }}>Thank you for letting us know</h1>
              <p className="text-sm" style={{ color: '#9c9488' }}>
                {businessName} will use your feedback to improve. We appreciate your honesty.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
