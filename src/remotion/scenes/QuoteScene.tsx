import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { Background } from '../components/Background'
import { PhotoLayer } from '../components/PhotoLayer'
import { AnimatedText } from '../components/AnimatedText'
import { LogoMark } from '../components/LogoMark'
import { Grain } from '../components/Grain'
import { CinematicBars } from '../components/CinematicBars'
import { MotifLayer } from '../motifs'
import type { ReelMotif } from '../motifs'
import type { VisualTemplate } from '../types'
import { TEMPLATE_CONFIGS } from '../styleConfigs'

interface QuoteSceneProps {
  quote: string
  author?: string
  highlightWords?: string[]
  template: VisualTemplate
  brandColor: string
  logoUrl: string | null
  businessName: string
  industry: string
  photo?: string | null
  motif?: ReelMotif
  motifValue?: number
}

export function QuoteScene({ quote, author, highlightWords = [], template, brandColor, logoUrl, businessName, industry, photo, motif, motifValue }: QuoteSceneProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const config = TEMPLATE_CONFIGS[template]
  const hasPhoto = !!photo

  // Stars
  const starOpacity = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: 'clamp' })
  const starScale = spring({ frame, fps, config: { stiffness: 120, damping: 15 }, delay: 5 })

  // Quote entrance
  const cardProgress = spring({ frame, fps, config: { stiffness: 80, damping: 14 }, delay: 8 })
  const cardY = interpolate(cardProgress, [0, 1], [36, 0])
  const cardOpacity = interpolate(cardProgress, [0, 1], [0, 1])

  // Author
  const authorOpacity = interpolate(frame, [26, 40], [0, 1], { extrapolateRight: 'clamp' })
  const authorX = interpolate(frame, [26, 40], [-16, 0], { extrapolateRight: 'clamp' })

  // ── split ────────────────────────────────────────────────────────────────────
  if (template === 'split') {
    const panelH = interpolate(frame, [4, 22], [0, 1920], { extrapolateRight: 'clamp' })
    return (
      <AbsoluteFill>
        <Background brandColor={brandColor} industry={industry} />
        <Grain opacity={0.045} />
        {motif && motif !== 'none' && <MotifLayer motif={motif} brandColor={brandColor} value={motifValue} />}
        {/* Brand panel */}
        <div style={{
          position: 'absolute', left: 0, top: 0,
          width: 320, height: panelH,
          background: brandColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            opacity: interpolate(frame, [16, 28], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            {[1,2,3,4,5].map(i => (
              <span key={i} style={{ fontSize: 28, color: '#ffffff' }}>★</span>
            ))}
          </div>
        </div>
        {/* Right-side content */}
        <AbsoluteFill style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          paddingLeft: 360, paddingRight: 64, paddingTop: 120, paddingBottom: 140,
        }}>
          <div style={{ transform: `translateY(${cardY}px)`, opacity: cardOpacity }}>
            <QuoteText quote={quote} highlightWords={highlightWords} brandColor={brandColor} template={template} delay={12} />
          </div>
          {author && (
            <div style={{
              marginTop: 36, opacity: authorOpacity, transform: `translateX(${authorX}px)`,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ width: 4, height: 28, borderRadius: 2, background: brandColor }} />
              <span style={{ fontSize: 28, fontWeight: 500, color: 'rgba(255,255,255,0.62)', letterSpacing: '0.015em' }}>{author}</span>
            </div>
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    )
  }

  // ── minimal ──────────────────────────────────────────────────────────────────
  if (template === 'minimal') {
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ background: '#000000' }} />
        <Grain opacity={0.03} />
        {motif && motif !== 'none' && <MotifLayer motif={motif} brandColor={brandColor} value={motifValue} />}
        <AbsoluteFill style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '80px 72px',
        }}>
          <div style={{ transform: `translateY(${cardY}px)`, opacity: cardOpacity }}>
            <QuoteText quote={quote} highlightWords={highlightWords} brandColor={brandColor} template={template} delay={10} />
          </div>
          {author && (
            <div style={{ marginTop: 28, opacity: authorOpacity }}>
              <span style={{ fontSize: 28, fontWeight: 400, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.015em' }}>{author}</span>
            </div>
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    )
  }

  // ── gradient ─────────────────────────────────────────────────────────────────
  if (template === 'gradient') {
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ background: `linear-gradient(160deg, ${brandColor} 0%, #08080f 100%)` }} />
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.55) 100%)' }} />
        <Grain opacity={0.045} />
        {motif && motif !== 'none' && <MotifLayer motif={motif} brandColor="#ffffff" value={motifValue} />}
        <LogoMark logoUrl={logoUrl} businessName={businessName} placement="center" color="#ffffff" delay={5} />
        <AbsoluteFill style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '148px 72px 160px 72px',
        }}>
          <div style={{
            display: 'flex', gap: 8, marginBottom: 32,
            opacity: starOpacity, transform: `scale(${starScale})`, transformOrigin: 'left center',
          }}>
            {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: 34, color: '#ffffff' }}>★</span>)}
          </div>
          <div style={{ transform: `translateY(${cardY}px)`, opacity: cardOpacity }}>
            <QuoteText quote={quote} highlightWords={highlightWords} brandColor={brandColor} template={template} delay={12} />
          </div>
          {author && (
            <div style={{ marginTop: 40, opacity: authorOpacity, transform: `translateX(${authorX}px)`, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 4, height: 32, borderRadius: 2, background: 'rgba(255,255,255,0.8)' }} />
              <span style={{ fontSize: 30, fontWeight: 500, color: 'rgba(255,255,255,0.72)', letterSpacing: '0.015em' }}>{author}</span>
            </div>
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    )
  }

  // ── cinematic ────────────────────────────────────────────────────────────────
  if (template === 'cinematic') {
    return (
      <AbsoluteFill>
        {hasPhoto ? (
          <PhotoLayer url={photo!} direction="zoom-out" overlay="full" overlayStrength={0.74} />
        ) : (
          <Background brandColor={brandColor} industry={industry} />
        )}
        <AbsoluteFill style={{
          background: 'linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(0,0,0,0.85) 80%, rgba(0,0,0,0.97) 100%)',
        }} />
        <Grain opacity={0.05} />
        <CinematicBars height={90} />
        {motif && motif !== 'none' && <MotifLayer motif={motif} brandColor={brandColor} value={motifValue} />}
        <AbsoluteFill style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end',
          padding: '80px 80px 200px 80px',
        }}>
          <div style={{
            display: 'flex', gap: 8, marginBottom: 24,
            opacity: starOpacity, transform: `scale(${starScale})`, transformOrigin: 'left center',
          }}>
            {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: 28, color: brandColor }}>★</span>)}
          </div>
          <div style={{ transform: `translateY(${cardY}px)`, opacity: cardOpacity }}>
            <QuoteText quote={quote} highlightWords={highlightWords} brandColor={brandColor} template={template} delay={12} />
          </div>
          {author && (
            <div style={{ marginTop: 28, opacity: authorOpacity }}>
              <span style={{ fontSize: 26, fontWeight: 400, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.015em' }}>{author}</span>
            </div>
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    )
  }

  // ── neon ─────────────────────────────────────────────────────────────────────
  if (template === 'neon') {
    const ruleOp = interpolate(frame, [5, 18], [0, 1], { extrapolateRight: 'clamp' })
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ background: '#040408' }} />
        <Grain opacity={0.06} />
        {motif && motif !== 'none' && <MotifLayer motif={motif} brandColor={brandColor} value={motifValue} />}
        <AbsoluteFill style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '148px 72px 160px 72px',
        }}>
          <div style={{
            display: 'flex', gap: 8, marginBottom: 32, opacity: ruleOp,
          }}>
            {[1,2,3,4,5].map(i => (
              <span key={i} style={{
                fontSize: 34, color: brandColor,
                textShadow: `0 0 12px ${brandColor}, 0 0 30px ${brandColor}88`,
              }}>★</span>
            ))}
          </div>
          <div style={{
            transform: `translateY(${cardY}px)`, opacity: cardOpacity,
            textShadow: `0 0 20px ${brandColor}, 0 0 60px ${brandColor}88, 0 0 120px ${brandColor}44`,
          }}>
            <QuoteText quote={quote} highlightWords={highlightWords} brandColor={brandColor} template={template} delay={12} />
          </div>
          {author && (
            <div style={{ marginTop: 36, opacity: authorOpacity, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 4, height: 28, borderRadius: 2, background: brandColor, boxShadow: `0 0 10px ${brandColor}` }} />
              <span style={{ fontSize: 28, fontWeight: 500, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.015em' }}>{author}</span>
            </div>
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    )
  }

  // ── bold ─────────────────────────────────────────────────────────────────────
  if (template === 'bold') {
    const words = quote.split(' ')
    const highlighted = new Set(highlightWords.map(w => w.toLowerCase()))
    const f = Math.max(0, frame - 10)
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ background: '#000000' }} />
        <Grain opacity={0.03} />
        {motif && motif !== 'none' && <MotifLayer motif={motif} brandColor={brandColor} value={motifValue} />}
        <AbsoluteFill style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '80px 60px',
        }}>
          <div style={{
            fontSize: 80, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.18,
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', gap: '0.2em',
          }}>
            {words.map((word, i) => {
              const wf = Math.max(0, f - i * 3)
              const op = interpolate(wf, [0, 8], [0, 1], { extrapolateRight: 'clamp' })
              const clean = word.toLowerCase().replace(/[^a-z]/g, '')
              const isHL = highlighted.has(clean)
              return (
                <span key={i} style={{
                  opacity: op,
                  color: isHL ? brandColor : '#ffffff',
                  fontSize: isHL ? 80 * 1.1 : 80,
                  fontWeight: isHL ? 900 : 800,
                  display: 'inline-block',
                }}>{word}</span>
              )
            })}
          </div>
          {author && (
            <div style={{ marginTop: 36, opacity: authorOpacity }}>
              <span style={{ fontSize: 28, fontWeight: 400, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.015em' }}>{author}</span>
            </div>
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    )
  }

  // ── cards ────────────────────────────────────────────────────────────────────
  if (template === 'cards') {
    const cardSpring2 = spring({ frame, fps, config: { stiffness: 80, damping: 14 }, delay: 6 })
    const cY = interpolate(cardSpring2, [0, 1], [60, 0])
    const cOp = interpolate(cardSpring2, [0, 1], [0, 1])
    return (
      <AbsoluteFill>
        <Background brandColor={brandColor} industry={industry} />
        <Grain opacity={0.045} />
        {motif && motif !== 'none' && <MotifLayer motif={motif} brandColor={brandColor} value={motifValue} />}
        <LogoMark logoUrl={logoUrl} businessName={businessName} placement="corner" color={brandColor} delay={5} />
        <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 64px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.96)', borderRadius: 32, padding: '52px 56px',
            boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
            transform: `translateY(${cY}px)`, opacity: cOp, width: '100%',
          }}>
            <div style={{
              display: 'flex', gap: 6, marginBottom: 24,
              opacity: starOpacity, transform: `scale(${starScale})`, transformOrigin: 'left center',
            }}>
              {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: 28, color: '#FBBC04' }}>★</span>)}
            </div>
            <div>
              <QuoteText quote={quote} highlightWords={highlightWords} brandColor={brandColor} template={template} delay={14} />
            </div>
            {author && (
              <div style={{ marginTop: 28, opacity: authorOpacity, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 3, height: 24, borderRadius: 2, background: brandColor }} />
                <span style={{ fontSize: 26, fontWeight: 500, color: '#6B7280', letterSpacing: '0.015em' }}>{author}</span>
              </div>
            )}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    )
  }

  // ── headline ─────────────────────────────────────────────────────────────────
  if (template === 'headline') {
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ background: '#f4f3ee' }} />
        {motif && motif !== 'none' && <MotifLayer motif={motif} brandColor={brandColor} value={motifValue} />}
        <AbsoluteFill style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '148px 80px 160px 80px',
        }}>
          <div style={{
            display: 'flex', gap: 6, marginBottom: 28,
            opacity: starOpacity, transform: `scale(${starScale})`, transformOrigin: 'left center',
          }}>
            {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: 30, color: brandColor }}>★</span>)}
          </div>
          <div style={{ transform: `translateY(${cardY}px)`, opacity: cardOpacity }}>
            <QuoteText quote={quote} highlightWords={highlightWords} brandColor={brandColor} template={template} delay={12} />
          </div>
          {author && (
            <div style={{ marginTop: 32, opacity: authorOpacity, transform: `translateX(${authorX}px)`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 4, height: 28, borderRadius: 2, background: brandColor }} />
              <span style={{ fontSize: 28, fontWeight: 500, color: '#4b5563', letterSpacing: '0.015em' }}>{author}</span>
            </div>
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    )
  }

  // ── overlay ──────────────────────────────────────────────────────────────────
  if (template === 'overlay') {
    const panelSpring = spring({ frame, fps, config: { stiffness: 80, damping: 16 }, delay: 8 })
    const panelY  = interpolate(panelSpring, [0, 1], [40, 0])
    const panelOp = interpolate(panelSpring, [0, 1], [0, 1])
    return (
      <AbsoluteFill>
        {hasPhoto ? (
          <PhotoLayer url={photo!} direction="zoom-out" overlay="full" overlayStrength={0.5} />
        ) : (
          <Background brandColor={brandColor} industry={industry} />
        )}
        <Grain opacity={0.04} />
        {motif && motif !== 'none' && <MotifLayer motif={motif} brandColor={brandColor} value={motifValue} />}
        <LogoMark logoUrl={logoUrl} businessName={businessName} placement="corner" color={brandColor} delay={5} />
        <AbsoluteFill style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end',
          padding: '80px 64px 140px 64px',
        }}>
          <div style={{
            background: 'rgba(8,8,14,0.72)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)' as string,
            borderRadius: 28,
            borderTop: `3px solid ${brandColor}`,
            padding: '40px 48px',
            transform: `translateY(${panelY}px)`, opacity: panelOp, width: '100%',
          }}>
            <div style={{
              display: 'flex', gap: 6, marginBottom: 20,
              opacity: starOpacity, transform: `scale(${starScale})`, transformOrigin: 'left center',
            }}>
              {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: 28, color: brandColor }}>★</span>)}
            </div>
            <div style={{ transform: `translateY(${cardY}px)`, opacity: cardOpacity }}>
              <QuoteText quote={quote} highlightWords={highlightWords} brandColor={brandColor} template={template} delay={14} />
            </div>
            {author && (
              <div style={{ marginTop: 28, opacity: authorOpacity, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 3, height: 24, borderRadius: 2, background: brandColor }} />
                <span style={{ fontSize: 26, fontWeight: 400, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.015em' }}>{author}</span>
              </div>
            )}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    )
  }

  // ── brand ────────────────────────────────────────────────────────────────────
  if (template === 'brand') {
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ background: brandColor }} />
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
        <Grain opacity={0.04} />
        {motif && motif !== 'none' && <MotifLayer motif={motif} brandColor="#ffffff" value={motifValue} />}
        <LogoMark logoUrl={logoUrl} businessName={businessName} placement="center" color="#ffffff" delay={5} />
        <AbsoluteFill style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '148px 72px 160px 72px',
        }}>
          <div style={{
            display: 'flex', gap: 8, marginBottom: 32,
            opacity: starOpacity, transform: `scale(${starScale})`, transformOrigin: 'left center',
          }}>
            {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: 34, color: '#ffffff' }}>★</span>)}
          </div>
          <div style={{ transform: `translateY(${cardY}px)`, opacity: cardOpacity }}>
            <QuoteText quote={quote} highlightWords={highlightWords} brandColor={brandColor} template={template} delay={12} />
          </div>
          {author && (
            <div style={{ marginTop: 40, opacity: authorOpacity, transform: `translateX(${authorX}px)`, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 4, height: 32, borderRadius: 2, background: 'rgba(255,255,255,0.6)' }} />
              <span style={{ fontSize: 30, fontWeight: 500, color: 'rgba(255,255,255,0.78)', letterSpacing: '0.015em' }}>{author}</span>
            </div>
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    )
  }

  // ── immersive / editorial (existing behaviour) ────────────────────────────────
  return (
    <AbsoluteFill>
      {hasPhoto ? (
        <PhotoLayer url={photo!} direction="zoom-out" overlay="full" overlayStrength={0.74} />
      ) : (
        <Background brandColor={brandColor} industry={industry} />
      )}

      <Grain opacity={0.045} />
      <CinematicBars height={68} />
      {motif && motif !== 'none' && <MotifLayer motif={motif} brandColor={brandColor} value={motifValue} />}

      <LogoMark logoUrl={logoUrl} businessName={businessName} placement={config.logo} color={brandColor} delay={5} />

      <AbsoluteFill style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '148px 72px 160px 72px',
      }}>
        {/* Stars */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 32,
          opacity: starOpacity,
          transform: `scale(${starScale})`,
          transformOrigin: 'left center',
        }}>
          {[1,2,3,4,5].map(i => (
            <span key={i} style={{ fontSize: 34, color: brandColor }}>★</span>
          ))}
        </div>

        {/* Quote */}
        <div style={{ transform: `translateY(${cardY}px)`, opacity: cardOpacity }}>
          <QuoteText
            quote={quote}
            highlightWords={highlightWords}
            brandColor={brandColor}
            template={template}
            delay={12}
          />
        </div>

        {/* Author — brand bar + name, no em dash */}
        {author && (
          <div style={{
            marginTop: 40,
            opacity: authorOpacity,
            transform: `translateX(${authorX}px)`,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}>
            <div style={{
              width: 4,
              height: 32,
              borderRadius: 2,
              background: brandColor,
            }} />
            <span style={{
              fontSize: 30,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.62)',
              letterSpacing: '0.015em',
            }}>
              {author}
            </span>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

function QuoteText({ quote, highlightWords, brandColor, template, delay = 0 }: {
  quote: string
  highlightWords: string[]
  brandColor: string
  template: VisualTemplate
  delay?: number
}) {
  const frame = useCurrentFrame()
  const highlighted = new Set(highlightWords.map(w => w.toLowerCase()))
  const words = quote.split(' ')
  const f = Math.max(0, frame - delay)
  const stagger = 4

  // Per-template font sizes and colours
  const isLight = template === 'headline' || template === 'cards'
  const isBold  = template === 'bold'
  const isMinimal = template === 'minimal'

  const fontSize =
    template === 'editorial' ? 74 :
    isBold                   ? 80 :
    isMinimal                ? 68 :
    template === 'headline'  ? 66 :
    template === 'cards'     ? 58 :
    62

  const fontWeight =
    template === 'editorial' ? 900 :
    isBold                   ? 800 :
    isMinimal                ? 800 :
    700

  const baseColor = isLight ? '#111827' : '#ffffff'

  return (
    <div style={{
      fontSize,
      fontWeight,
      color: baseColor,
      letterSpacing: '-0.025em',
      lineHeight: 1.22,
      flexWrap: 'wrap',
      display: 'flex',
      alignItems: 'flex-start',
    }}>
      <span style={{
        color: isLight ? brandColor : brandColor,
        marginRight: 4,
        fontWeight: 900,
        fontSize: fontSize * 1.4,
        lineHeight: 0.8,
        verticalAlign: 'top',
        opacity: f > 0 ? 1 : 0,
      }}>&ldquo;</span>
      {words.map((word, i) => {
        const wf = Math.max(0, f - i * stagger)
        const opacity = interpolate(wf, [0, 8], [0, 1], { extrapolateRight: 'clamp' })
        const translateY = interpolate(wf, [0, 8], [14, 0], { extrapolateRight: 'clamp' })
        const clean = word.toLowerCase().replace(/[^a-z]/g, '')
        const isHighlighted = highlighted.has(clean)
        return (
          <span
            key={i}
            style={{
              opacity,
              transform: `translateY(${translateY}px)`,
              display: 'inline-block',
              color: isHighlighted ? brandColor : baseColor,
              fontWeight: isHighlighted ? 900 : fontWeight,
              marginRight: '0.25em',
            }}
          >
            {word}
          </span>
        )
      })}
    </div>
  )
}
