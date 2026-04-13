import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
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
import { LightLeak } from '../components/LightLeak'

interface CTASceneProps {
  ctaHeadline?: string | null   // line 1: story callback
  ctaText: string               // line 2: friction reduction
  websiteUrl?: string | null
  businessName: string
  logoUrl: string | null
  template: VisualTemplate
  brandColor: string
  industry: string
  photo?: string | null
  motif?: ReelMotif
  motifValue?: number
}

export function CTAScene({ ctaHeadline, ctaText, websiteUrl, businessName, logoUrl, template, brandColor, industry, photo, motif, motifValue }: CTASceneProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const config = TEMPLATE_CONFIGS[template]

  const btnSpring = spring({ frame, fps, config: { stiffness: 100, damping: 14 }, delay: 25 })
  const btnScale = interpolate(btnSpring, [0, 1], [0.85, 1])
  const btnOpacity = interpolate(frame, [25, 38], [0, 1], { extrapolateRight: 'clamp' })

  const urlOpacity = interpolate(frame, [35, 48], [0, 1], { extrapolateRight: 'clamp' })
  const cleanUrl = websiteUrl?.replace(/^https?:\/\//, '').replace(/\/$/, '') ?? null

  const buttonLabel = getCtaButtonLabel(industry)

  // ── split ────────────────────────────────────────────────────────────────────
  if (template === 'split') {
    const panelH = interpolate(frame, [4, 22], [0, 1920], { extrapolateRight: 'clamp' })
    const textX  = interpolate(frame, [8, 26], [-80, 0],  { extrapolateRight: 'clamp' })
    const textOp = interpolate(frame, [8, 26], [0, 1],    { extrapolateRight: 'clamp' })
    return (
      <AbsoluteFill>
        <Background brandColor={brandColor} industry={industry} />
        <Grain opacity={0.045} />
        {motif && motif !== 'none' && <MotifLayer motif={motif} brandColor={brandColor} value={motifValue} />}
        <div style={{
          position: 'absolute', left: 0, top: 0,
          width: 320, height: panelH,
          background: brandColor, overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <LogoMark logoUrl={logoUrl} businessName={businessName} placement="center" color="#ffffff" delay={18} />
        </div>
        <AbsoluteFill style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          paddingLeft: 360, paddingRight: 64, paddingTop: 80, paddingBottom: 80,
          transform: `translateX(${textX}px)`, opacity: textOp,
          gap: 0,
        }}>
          {ctaHeadline && (
            <AnimatedText text={ctaHeadline} anim="word-reveal" delay={8}
              style={{ fontSize: 44, fontWeight: 500, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.015em', lineHeight: 1.3, marginBottom: 16, textAlign: 'left' }}
            />
          )}
          <AnimatedText text={ctaText} anim="fade-up" delay={18}
            style={{ fontSize: 58, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 44, textAlign: 'left' }}
          />
          <div style={{
            transform: `scale(${btnScale})`, opacity: btnOpacity,
            background: brandColor, borderRadius: 100, padding: '26px 64px',
            fontSize: 34, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em',
            boxShadow: `0 20px 50px ${brandColor}50`, alignSelf: 'flex-start',
          }}>{buttonLabel}</div>
          {cleanUrl && (
            <div style={{ opacity: urlOpacity, fontSize: 26, fontWeight: 400, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.02em', marginTop: 32 }}>
              {cleanUrl}
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
          textAlign: 'center', padding: '80px 72px', gap: 0,
        }}>
          {ctaHeadline && (
            <AnimatedText text={ctaHeadline} anim="word-reveal" delay={8}
              style={{ fontSize: 44, fontWeight: 300, color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.015em', lineHeight: 1.3, marginBottom: 16 }}
            />
          )}
          <AnimatedText text={ctaText} anim="slam" delay={18}
            style={{ fontSize: 72, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.04em', lineHeight: 0.95, marginBottom: 52 }}
          />
          <div style={{
            transform: `scale(${btnScale})`, opacity: btnOpacity,
            background: brandColor, borderRadius: 100, padding: '28px 72px',
            fontSize: 36, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em',
            boxShadow: `0 20px 50px ${brandColor}50`,
          }}>{buttonLabel}</div>
          {cleanUrl && (
            <div style={{ opacity: urlOpacity, fontSize: 28, fontWeight: 400, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.02em', marginTop: 32 }}>
              {cleanUrl}
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
        <AbsoluteFill style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '80px 72px', gap: 0,
        }}>
          <div style={{
            opacity: interpolate(frame, [5, 20], [0, 1], { extrapolateRight: 'clamp' }),
            marginBottom: 48,
          }}>
            <LogoMark logoUrl={logoUrl} businessName={businessName} placement="center" color="#ffffff" delay={0} />
          </div>
          {ctaHeadline && (
            <AnimatedText text={ctaHeadline} anim="word-reveal" delay={8}
              style={{ fontSize: 46, fontWeight: 500, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.015em', lineHeight: 1.3, marginBottom: 20 }}
            />
          )}
          <AnimatedText text={ctaText} anim="fade-up" delay={18}
            style={{ fontSize: 62, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 52 }}
          />
          <div style={{
            transform: `scale(${btnScale})`, opacity: btnOpacity,
            background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.6)',
            borderRadius: 100, padding: '28px 72px',
            fontSize: 36, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em',
          }}>{buttonLabel}</div>
          {cleanUrl && (
            <div style={{ opacity: urlOpacity, fontSize: 28, fontWeight: 400, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.02em', marginTop: 40 }}>
              {cleanUrl}
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
        {photo ? (
          <PhotoLayer url={photo} direction="pan-right" overlay="full" overlayStrength={0.6} />
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
          padding: '80px 80px 200px 80px', gap: 0,
        }}>
          {ctaHeadline && (
            <AnimatedText text={ctaHeadline} anim="word-reveal" delay={8}
              style={{ fontSize: 40, fontWeight: 400, color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.015em', lineHeight: 1.3, marginBottom: 16, textAlign: 'left' }}
            />
          )}
          <AnimatedText text={ctaText} anim="fade-up" delay={18}
            style={{ fontSize: 58, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 44, textAlign: 'left' }}
          />
          <div style={{
            transform: `scale(${btnScale})`, opacity: btnOpacity,
            background: brandColor, borderRadius: 100, padding: '26px 64px',
            fontSize: 34, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em',
            boxShadow: `0 20px 50px ${brandColor}50`,
          }}>{buttonLabel}</div>
          {cleanUrl && (
            <div style={{ opacity: urlOpacity, fontSize: 26, fontWeight: 400, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.02em', marginTop: 28 }}>
              {cleanUrl}
            </div>
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    )
  }

  // ── neon ─────────────────────────────────────────────────────────────────────
  if (template === 'neon') {
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ background: '#040408' }} />
        <Grain opacity={0.06} />
        {motif && motif !== 'none' && <MotifLayer motif={motif} brandColor={brandColor} value={motifValue} />}
        <AbsoluteFill style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '80px 72px', gap: 0,
        }}>
          {ctaHeadline && (
            <div style={{ textShadow: `0 0 20px ${brandColor}88, 0 0 60px ${brandColor}44` }}>
              <AnimatedText text={ctaHeadline} anim="word-reveal" delay={8}
                style={{ fontSize: 44, fontWeight: 400, color: 'rgba(255,255,255,0.65)', letterSpacing: '-0.015em', lineHeight: 1.3, marginBottom: 20 }}
              />
            </div>
          )}
          <div style={{ textShadow: `0 0 20px ${brandColor}, 0 0 60px ${brandColor}88, 0 0 120px ${brandColor}44` }}>
            <AnimatedText text={ctaText} anim="slam" delay={18}
              style={{ fontSize: 66, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.0, marginBottom: 56 }}
            />
          </div>
          {/* Glowing outline button */}
          <div style={{
            transform: `scale(${btnScale})`, opacity: btnOpacity,
            background: 'transparent',
            border: `2px solid ${brandColor}`,
            borderRadius: 100, padding: '28px 72px',
            fontSize: 36, fontWeight: 700, color: brandColor, letterSpacing: '-0.01em',
            boxShadow: `0 0 20px ${brandColor}88, inset 0 0 20px ${brandColor}22`,
          }}>{buttonLabel}</div>
          {cleanUrl && (
            <div style={{ opacity: urlOpacity, fontSize: 28, fontWeight: 400, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.02em', marginTop: 40 }}>
              {cleanUrl}
            </div>
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    )
  }

  // ── bold ─────────────────────────────────────────────────────────────────────
  if (template === 'bold') {
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ background: '#000000' }} />
        <Grain opacity={0.03} />
        {motif && motif !== 'none' && <MotifLayer motif={motif} brandColor={brandColor} value={motifValue} />}
        <AbsoluteFill style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '80px 60px', gap: 0,
        }}>
          {ctaHeadline && (
            <AnimatedText text={ctaHeadline} anim="word-reveal" delay={8}
              style={{ fontSize: 42, fontWeight: 400, color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.015em', lineHeight: 1.3, marginBottom: 16 }}
            />
          )}
          <AnimatedText text={ctaText} anim="slam" delay={16}
            style={{ fontSize: 96, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.04em', lineHeight: 0.9, marginBottom: 56, textTransform: 'uppercase' as const }}
          />
          <div style={{
            transform: `scale(${btnScale})`, opacity: btnOpacity,
            background: brandColor, borderRadius: 100, padding: '28px 72px',
            fontSize: 36, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em',
            boxShadow: `0 20px 50px ${brandColor}50`,
          }}>{buttonLabel}</div>
          {cleanUrl && (
            <div style={{ opacity: urlOpacity, fontSize: 28, fontWeight: 400, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.02em', marginTop: 32 }}>
              {cleanUrl}
            </div>
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    )
  }

  // ── cards ────────────────────────────────────────────────────────────────────
  if (template === 'cards') {
    const cardSpring = spring({ frame, fps, config: { stiffness: 80, damping: 14 }, delay: 6 })
    const cardY  = interpolate(cardSpring, [0, 1], [60, 0])
    const cardOp = interpolate(cardSpring, [0, 1], [0, 1])
    return (
      <AbsoluteFill>
        <Background brandColor={brandColor} industry={industry} />
        <Grain opacity={0.045} />
        {motif && motif !== 'none' && <MotifLayer motif={motif} brandColor={brandColor} value={motifValue} />}
        <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 64px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)' as string,
            borderRadius: 32, border: '1px solid rgba(255,255,255,0.08)', padding: '60px 56px',
            transform: `translateY(${cardY}px)`, opacity: cardOp, width: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, textAlign: 'center',
          }}>
            <LogoMark logoUrl={logoUrl} businessName={businessName} placement="center" color={brandColor} delay={0} />
            <div style={{ marginTop: 36 }}>
              {ctaHeadline && (
                <AnimatedText text={ctaHeadline} anim="word-reveal" delay={10}
                  style={{ fontSize: 42, fontWeight: 500, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.015em', lineHeight: 1.3, marginBottom: 16 }}
                />
              )}
              <AnimatedText text={ctaText} anim="fade-up" delay={20}
                style={{ fontSize: 58, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 44 }}
              />
            </div>
            <div style={{
              transform: `scale(${btnScale})`, opacity: btnOpacity,
              background: brandColor, borderRadius: 100, padding: '26px 64px',
              fontSize: 34, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em',
              boxShadow: `0 20px 50px ${brandColor}50`,
            }}>{buttonLabel}</div>
            {cleanUrl && (
              <div style={{ opacity: urlOpacity, fontSize: 26, fontWeight: 400, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.02em', marginTop: 28 }}>
                {cleanUrl}
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
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end',
          padding: '80px 80px 180px 80px', gap: 0,
        }}>
          {ctaHeadline && (
            <AnimatedText text={ctaHeadline} anim="word-reveal" delay={8}
              style={{ fontSize: 40, fontWeight: 400, color: '#4b5563', letterSpacing: '-0.015em', lineHeight: 1.3, marginBottom: 16, textAlign: 'left' }}
            />
          )}
          <AnimatedText text={ctaText} anim="fade-up" delay={18}
            style={{ fontSize: 68, fontWeight: 900, color: '#0a0a0f', letterSpacing: '-0.04em', lineHeight: 0.95, marginBottom: 48, textAlign: 'left' }}
          />
          <div style={{
            transform: `scale(${btnScale})`, opacity: btnOpacity,
            background: brandColor, borderRadius: 100, padding: '26px 64px',
            fontSize: 34, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em',
            boxShadow: `0 20px 50px ${brandColor}40`,
          }}>{buttonLabel}</div>
          {cleanUrl && (
            <div style={{ opacity: urlOpacity, fontSize: 26, fontWeight: 400, color: '#9ca3af', letterSpacing: '0.02em', marginTop: 28 }}>
              {cleanUrl}
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
        {photo ? (
          <PhotoLayer url={photo} direction="pan-right" overlay="full" overlayStrength={0.5} />
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
            borderRadius: 28, borderTop: `3px solid ${brandColor}`,
            padding: '40px 48px',
            transform: `translateY(${panelY}px)`, opacity: panelOp, width: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0,
          }}>
            {ctaHeadline && (
              <AnimatedText text={ctaHeadline} anim="word-reveal" delay={12}
                style={{ fontSize: 38, fontWeight: 400, color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.015em', lineHeight: 1.3, marginBottom: 12, textAlign: 'left' }}
              />
            )}
            <AnimatedText text={ctaText} anim="fade-up" delay={22}
              style={{ fontSize: 56, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 36, textAlign: 'left' }}
            />
            <div style={{
              transform: `scale(${btnScale})`, opacity: btnOpacity,
              background: brandColor, borderRadius: 100, padding: '24px 60px',
              fontSize: 32, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em',
              boxShadow: `0 20px 50px ${brandColor}50`,
            }}>{buttonLabel}</div>
            {cleanUrl && (
              <div style={{ opacity: urlOpacity, fontSize: 24, fontWeight: 400, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.02em', marginTop: 24 }}>
                {cleanUrl}
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
        <AbsoluteFill style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '80px 72px', gap: 0,
        }}>
          <div style={{
            opacity: interpolate(frame, [5, 20], [0, 1], { extrapolateRight: 'clamp' }),
            marginBottom: 48,
          }}>
            <LogoMark logoUrl={logoUrl} businessName={businessName} placement="center" color="#ffffff" delay={0} />
          </div>
          {ctaHeadline && (
            <AnimatedText text={ctaHeadline} anim="word-reveal" delay={8}
              style={{ fontSize: 46, fontWeight: 500, color: 'rgba(255,255,255,0.75)', letterSpacing: '-0.015em', lineHeight: 1.3, marginBottom: 20, textAlign: 'center' }}
            />
          )}
          <AnimatedText text={ctaText} anim="fade-up" delay={18}
            style={{ fontSize: 56, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 52, textAlign: 'center' }}
          />
          {/* White outlined button */}
          <div style={{
            transform: `scale(${btnScale})`, opacity: btnOpacity,
            background: 'transparent',
            border: '2px solid rgba(255,255,255,0.9)',
            borderRadius: 100, padding: '28px 72px',
            fontSize: 36, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em',
          }}>{buttonLabel}</div>
          {cleanUrl && (
            <div style={{ opacity: urlOpacity, fontSize: 28, fontWeight: 400, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.02em', marginTop: 40 }}>
              {cleanUrl}
            </div>
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    )
  }

  // ── immersive / editorial (existing behaviour) ────────────────────────────────
  return (
    <AbsoluteFill>
      {photo && template !== 'editorial' ? (
        <PhotoLayer url={photo} direction="pan-right" overlay="full" overlayStrength={0.6} />
      ) : (
        <Background brandColor={brandColor} industry={industry} />
      )}

      <Grain opacity={0.045} />
      <CinematicBars height={68} />
      <LightLeak delay={28} intensity={0.09} />

      <AbsoluteFill style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 72px',
        textAlign: 'center',
        gap: 0,
      }}>
        {/* Logo */}
        {config.logo !== 'none' && (
          <div style={{
            opacity: interpolate(frame, [5, 20], [0, 1], { extrapolateRight: 'clamp' }),
            marginBottom: 48,
          }}>
            <LogoMark logoUrl={logoUrl} businessName={businessName} placement="center" color={brandColor} delay={0} />
          </div>
        )}

        {/* Line 1: Story callback */}
        {ctaHeadline && (
          <AnimatedText
            text={ctaHeadline}
            anim="word-reveal"
            delay={8}
            style={{
              fontSize: 46,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: '-0.015em',
              lineHeight: 1.3,
              marginBottom: 20,
              textAlign: 'center',
            }}
          />
        )}

        {/* Line 2: Friction reduction */}
        <AnimatedText
          text={ctaText}
          anim="fade-up"
          delay={18}
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            marginBottom: 52,
            textAlign: 'center',
          }}
        />

        {/* CTA button */}
        <div style={{
          transform: `scale(${btnScale})`,
          opacity: btnOpacity,
          background: brandColor,
          borderRadius: 100,
          padding: '28px 72px',
          fontSize: 36,
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '-0.01em',
          boxShadow: `0 20px 50px ${brandColor}50`,
          marginBottom: cleanUrl ? 40 : 0,
        }}>
          {buttonLabel}
        </div>

        {/* Website */}
        {cleanUrl && (
          <div style={{
            opacity: urlOpacity,
            fontSize: 28,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.02em',
          }}>
            {cleanUrl}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

function getCtaButtonLabel(industry: string): string {
  const labels: Record<string, string> = {
    dental:        'Book appointment →',
    clinic:        'Book appointment →',
    restaurant:    'Reserve a table →',
    gym:           'Start your trial →',
    salon:         'Book now →',
    spa:           'Book your session →',
    hotel:         'Check availability →',
    bar:           'Reserve a table →',
    physiotherapy: 'Book appointment →',
    veterinary:    'Book appointment →',
  }
  return labels[industry] ?? 'Get started →'
}
