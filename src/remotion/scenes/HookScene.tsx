import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { Background } from '../components/Background'
import { PhotoLayer, CollageLayer } from '../components/PhotoLayer'
import { AnimatedText } from '../components/AnimatedText'
import { LogoMark } from '../components/LogoMark'
import { Grain } from '../components/Grain'
import { CinematicBars } from '../components/CinematicBars'
import { MotifLayer } from '../motifs'
import type { VisualTemplate } from '../types'
import type { ReelMotif } from '../motifs'
import { TEMPLATE_CONFIGS } from '../styleConfigs'
import { LightLeak } from '../components/LightLeak'

interface HookSceneProps {
  headline: string
  subline?: string
  template: VisualTemplate
  brandColor: string
  logoUrl: string | null
  businessName: string
  industry: string
  photo?: string | null
  motif?: ReelMotif
  motifValue?: number
}

export function HookScene({ headline, subline, template, brandColor, logoUrl, businessName, industry, photo, motif, motifValue }: HookSceneProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const config = TEMPLATE_CONFIGS[template]

  const hasPhoto = !!photo

  // Accent bar — only for non-editorial
  const barWidth = interpolate(frame, [10, 35], [0, 100], { extrapolateRight: 'clamp' })

  const isEditorial = template === 'editorial'

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
        {/* Brand panel */}
        <div style={{
          position: 'absolute', left: 0, top: 0,
          width: 320, height: panelH,
          background: brandColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <LogoMark logoUrl={logoUrl} businessName={businessName} placement="center" color="#ffffff" delay={18} />
        </div>
        {/* Right-side text */}
        <AbsoluteFill style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          paddingLeft: 360, paddingRight: 64, paddingTop: 80, paddingBottom: 140,
          transform: `translateX(${textX}px)`, opacity: textOp,
        }}>
          <AnimatedText
            text={headline}
            anim="slide-left"
            delay={15}
            style={{ fontSize: 82, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.0, textAlign: 'left' }}
          />
          {subline && (
            <AnimatedText
              text={subline}
              anim="fade-up"
              delay={30}
              style={{ fontSize: 42, fontWeight: 400, color: 'rgba(255,255,255,0.65)', marginTop: 24, letterSpacing: '-0.01em', textAlign: 'left' }}
            />
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    )
  }

  // ── minimal ──────────────────────────────────────────────────────────────────
  if (template === 'minimal') {
    const ruleW = interpolate(frame, [5, 25], [0, 80], { extrapolateRight: 'clamp' })
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ background: '#000000' }} />
        <Grain opacity={0.03} />
        {motif && motif !== 'none' && <MotifLayer motif={motif} brandColor={brandColor} value={motifValue} />}
        <AbsoluteFill style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '80px 72px',
        }}>
          <div style={{ width: ruleW, height: 4, background: brandColor, borderRadius: 2, marginBottom: 44 }} />
          <AnimatedText
            text={headline}
            anim="slam"
            delay={15}
            style={{ fontSize: 100, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.04em', lineHeight: 0.95 }}
          />
          {subline && (
            <AnimatedText
              text={subline}
              anim="fade-up"
              delay={32}
              style={{ fontSize: 42, fontWeight: 300, color: 'rgba(255,255,255,0.5)', marginTop: 28, letterSpacing: '-0.01em' }}
            />
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
        {/* Radial vignette */}
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.55) 100%)' }} />
        <Grain opacity={0.045} />
        {motif && motif !== 'none' && <MotifLayer motif={motif} brandColor="#ffffff" value={motifValue} />}
        <LogoMark logoUrl={logoUrl} businessName={businessName} placement="center" color="#ffffff" delay={10} />
        <AbsoluteFill style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '80px 72px 140px',
        }}>
          <AnimatedText
            text={headline}
            anim="char-spring"
            delay={15}
            style={{ fontSize: 88, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.035em', lineHeight: 1.0, textAlign: 'center' }}
          />
          {subline && (
            <AnimatedText
              text={subline}
              anim="fade-up"
              delay={30}
              style={{ fontSize: 44, fontWeight: 400, color: 'rgba(255,255,255,0.72)', marginTop: 24, letterSpacing: '-0.01em', textAlign: 'center' }}
            />
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    )
  }

  // ── cinematic ────────────────────────────────────────────────────────────────
  if (template === 'cinematic') {
    const ruleW = interpolate(frame, [10, 30], [0, 60], { extrapolateRight: 'clamp' })
    return (
      <AbsoluteFill>
        {hasPhoto ? (
          <PhotoLayer url={photo!} direction="pan-left" overlay="bottom" overlayStrength={0.5} />
        ) : (
          <Background brandColor={brandColor} industry={industry} />
        )}
        {/* Heavy bottom vignette */}
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
          <div style={{ width: ruleW, height: 3, background: brandColor, borderRadius: 2, marginBottom: 28 }} />
          <AnimatedText
            text={headline}
            anim="fade-up"
            delay={15}
            style={{ fontSize: 72, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.05, textAlign: 'left' }}
          />
          {subline && (
            <AnimatedText
              text={subline}
              anim="fade-up"
              delay={28}
              style={{ fontSize: 38, fontWeight: 400, color: 'rgba(255,255,255,0.6)', marginTop: 20, letterSpacing: '-0.01em', textAlign: 'left' }}
            />
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    )
  }

  // ── neon ─────────────────────────────────────────────────────────────────────
  if (template === 'neon') {
    const ruleOp = interpolate(frame, [8, 22], [0, 1], { extrapolateRight: 'clamp' })
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ background: '#040408' }} />
        <Grain opacity={0.06} />
        {motif && motif !== 'none' && <MotifLayer motif={motif} brandColor={brandColor} value={motifValue} />}
        <AbsoluteFill style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '80px 72px 140px',
        }}>
          {/* Top rule */}
          <div style={{
            width: 120, height: 2, background: brandColor,
            boxShadow: `0 0 12px ${brandColor}, 0 0 30px ${brandColor}88`,
            borderRadius: 2, marginBottom: 48, opacity: ruleOp,
          }} />
          <div style={{ textShadow: `0 0 20px ${brandColor}, 0 0 60px ${brandColor}88, 0 0 120px ${brandColor}44` }}>
            <AnimatedText
              text={headline}
              anim="slam"
              delay={15}
              style={{ fontSize: 84, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.0 }}
            />
          </div>
          {subline && (
            <div style={{ textShadow: `0 0 16px ${brandColor}99, 0 0 40px ${brandColor}55` }}>
              <AnimatedText
                text={subline}
                anim="fade-up"
                delay={30}
                style={{ fontSize: 44, fontWeight: 400, color: 'rgba(255,255,255,0.75)', marginTop: 24, letterSpacing: '-0.01em' }}
              />
            </div>
          )}
          {/* Bottom rule */}
          <div style={{
            width: 120, height: 2, background: brandColor,
            boxShadow: `0 0 12px ${brandColor}, 0 0 30px ${brandColor}88`,
            borderRadius: 2, marginTop: 48, opacity: ruleOp,
          }} />
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
          textAlign: 'center', padding: '80px 60px',
        }}>
          <AnimatedText
            text={headline}
            anim="slam"
            delay={10}
            style={{ fontSize: 148, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.05em', lineHeight: 0.9, textTransform: 'uppercase' as const }}
          />
          {subline && (
            <div style={{
              background: brandColor, borderRadius: 100, padding: '14px 36px',
              fontSize: 32, fontWeight: 700, color: '#ffffff', marginTop: 40,
              opacity: interpolate(frame, [25, 38], [0, 1], { extrapolateRight: 'clamp' }),
            }}>
              {subline}
            </div>
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    )
  }

  // ── cards ────────────────────────────────────────────────────────────────────
  if (template === 'cards') {
    const cardSpring = spring({ frame, fps, config: { stiffness: 80, damping: 14 } })
    const cardY   = interpolate(cardSpring, [0, 1], [60, 0])
    const cardOp  = interpolate(cardSpring, [0, 1], [0, 1])
    return (
      <AbsoluteFill>
        <Background brandColor={brandColor} industry={industry} />
        <Grain opacity={0.045} />
        {motif && motif !== 'none' && <MotifLayer motif={motif} brandColor={brandColor} value={motifValue} />}
        <LogoMark logoUrl={logoUrl} businessName={businessName} placement="corner" color={brandColor} delay={5} />
        <AbsoluteFill style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '80px 64px',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)' as string,
            borderRadius: 32,
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '60px 56px',
            transform: `translateY(${cardY}px)`,
            opacity: cardOp,
            width: '100%',
            maxWidth: 800,
          }}>
            <AnimatedText
              text={headline}
              anim="word-reveal"
              delay={12}
              style={{ fontSize: 78, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.0 }}
            />
            {subline && (
              <AnimatedText
                text={subline}
                anim="fade-up"
                delay={28}
                style={{ fontSize: 40, fontWeight: 400, color: 'rgba(255,255,255,0.6)', marginTop: 24, letterSpacing: '-0.01em' }}
              />
            )}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    )
  }

  // ── headline ─────────────────────────────────────────────────────────────────
  if (template === 'headline') {
    const ruleW = interpolate(frame, [5, 30], [0, 700], { extrapolateRight: 'clamp' })
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ background: '#f4f3ee' }} />
        {motif && motif !== 'none' && <MotifLayer motif={motif} brandColor={brandColor} value={motifValue} />}
        <AbsoluteFill style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end',
          padding: '80px 80px 180px 80px',
        }}>
          <div style={{
            fontSize: 22, fontWeight: 700, color: brandColor,
            textTransform: 'uppercase' as const, letterSpacing: '0.14em',
            marginBottom: 20,
            opacity: interpolate(frame, [5, 20], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            {businessName}
          </div>
          <div style={{ width: ruleW, height: 2, background: '#111111', borderRadius: 1, marginBottom: 36 }} />
          <AnimatedText
            text={headline}
            anim="word-reveal"
            delay={15}
            style={{ fontSize: 96, fontWeight: 900, color: '#0a0a0f', letterSpacing: '-0.04em', lineHeight: 0.95, textAlign: 'left' }}
          />
          {subline && (
            <AnimatedText
              text={subline}
              anim="fade-up"
              delay={32}
              style={{ fontSize: 42, fontWeight: 400, color: '#4b5563', marginTop: 24, letterSpacing: '-0.01em', textAlign: 'left' }}
            />
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
          <PhotoLayer url={photo!} direction="pan-right" overlay="bottom" overlayStrength={0.3} />
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
            padding: '48px 52px',
            transform: `translateY(${panelY}px)`,
            opacity: panelOp,
            width: '100%',
          }}>
            <AnimatedText
              text={headline}
              anim="fade-up"
              delay={18}
              style={{ fontSize: 78, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.0, textAlign: 'left' }}
            />
            {subline && (
              <AnimatedText
                text={subline}
                anim="fade-up"
                delay={32}
                style={{ fontSize: 40, fontWeight: 400, color: 'rgba(255,255,255,0.65)', marginTop: 20, letterSpacing: '-0.01em', textAlign: 'left' }}
              />
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
        {/* Radial shadow */}
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
        <Grain opacity={0.04} />
        {motif && motif !== 'none' && <MotifLayer motif={motif} brandColor="#ffffff" value={motifValue} />}
        <LogoMark logoUrl={logoUrl} businessName={businessName} placement="center" color="#ffffff" delay={10} />
        <AbsoluteFill style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '80px 72px 140px',
        }}>
          <AnimatedText
            text={headline}
            anim="char-spring"
            delay={15}
            style={{ fontSize: 88, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.035em', lineHeight: 1.0, textAlign: 'center' }}
          />
          {subline && (
            <AnimatedText
              text={subline}
              anim="fade-up"
              delay={30}
              style={{ fontSize: 44, fontWeight: 400, color: 'rgba(255,255,255,0.75)', marginTop: 24, letterSpacing: '-0.01em', textAlign: 'center' }}
            />
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    )
  }

  // ── immersive / editorial (existing behaviour) ───────────────────────────────
  return (
    <AbsoluteFill>
      {/* Background layer */}
      {template === 'immersive' && hasPhoto ? (
        <PhotoLayer url={photo!} direction="zoom-in" overlay="bottom" overlayStrength={0.45} />
      ) : isEditorial ? (
        <EditorialBackground brandColor={brandColor} frame={frame} />
      ) : (
        <Background brandColor={brandColor} industry={industry} />
      )}

      <Grain opacity={0.045} />
      <CinematicBars height={68} />
      {template === 'immersive' && hasPhoto && <LightLeak delay={22} intensity={0.11} />}
      {motif && motif !== 'none' && <MotifLayer motif={motif} brandColor={brandColor} value={motifValue} />}

      <LogoMark logoUrl={logoUrl} businessName={businessName} placement={config.logo} color={brandColor} delay={10} />

      <AbsoluteFill style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isEditorial ? 'flex-start' : 'center',
        justifyContent: isEditorial ? 'flex-end' : 'center',
        padding: isEditorial ? '80px 72px 140px 80px' : '80px 72px 140px 72px',
        textAlign: isEditorial ? 'left' : 'center',
      }}>
        {!isEditorial && (
          <div style={{
            width: barWidth,
            height: 5,
            background: brandColor,
            borderRadius: 3,
            marginBottom: 32,
            alignSelf: 'center',
          }} />
        )}

        <AnimatedText
          text={headline}
          anim={config.textAnim}
          delay={15}
          style={{
            fontSize: isEditorial ? 96 : 84,
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: isEditorial ? '-0.04em' : '-0.03em',
            lineHeight: 1.0,
            textAlign: isEditorial ? 'left' : 'center',
          }}
        />

        {subline && (
          <AnimatedText
            text={subline}
            anim="fade-up"
            delay={30}
            style={{
              fontSize: 44,
              fontWeight: 400,
              color: '#ffffff',
              opacity: 0.65,
              marginTop: 24,
              letterSpacing: '-0.01em',
              textAlign: isEditorial ? 'left' : 'center',
            }}
          />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

function EditorialBackground({ brandColor, frame }: { brandColor: string; frame: number }) {
  const stripeH = interpolate(frame, [4, 28], [0, 1920], { extrapolateRight: 'clamp' })
  const ruleW   = interpolate(frame, [18, 42], [0, 920], { extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ background: '#08080d' }}>
      {/* Vertical brand stripe down left edge */}
      <div style={{
        position: 'absolute', left: 0, top: 0,
        width: 7, height: stripeH,
        background: brandColor,
      }} />
      {/* Horizontal rule above text area */}
      <div style={{
        position: 'absolute', left: 80, bottom: 300,
        width: ruleW, height: 1.5,
        background: `${brandColor}55`,
      }} />
    </AbsoluteFill>
  )
}
