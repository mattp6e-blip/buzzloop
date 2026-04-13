'use client'

import dynamic from 'next/dynamic'
import type { ReelTheme } from '@/types'
import type { ReelCompositionProps } from '@/remotion/types'
import { REEL_FPS, REEL_WIDTH, REEL_HEIGHT } from '@/remotion/ReelComposition'

const Player = dynamic(() => import('@remotion/player').then((m) => ({ default: m.Player })), { ssr: false })

// Dynamically import all showcase compositions
const CompositionOriginal   = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionOriginal })),   { ssr: false })
const CompositionSplit      = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionSplit })),      { ssr: false })
const CompositionMinimal    = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionMinimal })),    { ssr: false })
const CompositionGradient   = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionGradient })),   { ssr: false })
const CompositionCinematic  = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionCinematic })),  { ssr: false })
const CompositionNeon       = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionNeon })),       { ssr: false })
const CompositionBold       = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionBold })),       { ssr: false })
const CompositionCards      = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionCards })),      { ssr: false })
const CompositionHeadline   = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionHeadline })),   { ssr: false })
const CompositionOverlay    = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionOverlay })),    { ssr: false })
const CompositionBrand      = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionBrand })),      { ssr: false })
const CompositionEditorial  = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionEditorial })),  { ssr: false })
const CompositionMotifParticles   = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionMotifParticles })),   { ssr: false })
const CompositionMotifAurora      = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionMotifAurora })),      { ssr: false })
const CompositionMotifLightRays   = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionMotifLightRays })),   { ssr: false })
const CompositionMotifRadialBurst = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionMotifRadialBurst })), { ssr: false })
const CompositionMotifConfetti    = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionMotifConfetti })),    { ssr: false })
const CompositionMotifStarsFill   = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionMotifStarsFill })),   { ssr: false })
const CompositionMotifProgressRing= dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionMotifProgressRing })),{ ssr: false })
const CompositionMotifRocketLaunch= dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionMotifRocketLaunch })),{ ssr: false })
const CompositionMotifBarChart    = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionMotifBarChart })),    { ssr: false })
const CompositionMotifGoogleG     = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionMotifGoogleG })),     { ssr: false })
const CompositionMotifChatBubbles = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionMotifChatBubbles })), { ssr: false })
const CompositionMotifRippleWaves        = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionMotifRippleWaves })),        { ssr: false })
const CompositionPaletteDarkCinematic    = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionPaletteDarkCinematic })),    { ssr: false })
const CompositionPaletteBoldEnergy       = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionPaletteBoldEnergy })),       { ssr: false })
const CompositionPaletteMagazineLight    = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionPaletteMagazineLight })),    { ssr: false })
const CompositionPaletteBrandForward     = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionPaletteBrandForward })),     { ssr: false })
const CompositionPaletteNeonPulse        = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionPaletteNeonPulse })),        { ssr: false })
const CompositionPalettePureType         = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionPalettePureType })),         { ssr: false })
const CompositionPaletteCardsAllDay      = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionPaletteCardsAllDay })),      { ssr: false })
const CompositionPaletteEditorialMix     = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionPaletteEditorialMix })),     { ssr: false })
const CompositionPaletteCinematicCards   = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionPaletteCinematicCards })),   { ssr: false })
const CompositionPaletteImmersiveOverlay = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionPaletteImmersiveOverlay })), { ssr: false })

interface Props {
  themes: ReelTheme[]
  brandColor: string
  brandSecondaryColor: string
  logoUrl: string | null
  gbpPhotos: string[]
}

const PLAYER_W = 260
const PLAYER_H = Math.round(PLAYER_W * REEL_HEIGHT / REEL_WIDTH)

function buildProps(
  theme: ReelTheme,
  brandColor: string,
  brandSecondaryColor: string,
  logoUrl: string | null,
  gbpPhotos: string[]
): ReelCompositionProps {
  const baseVariation = theme.cachedVariations![0]
  // Patch hook/cta photos from the pool if the cached variation doesn't have them
  const variation = {
    ...baseVariation,
    hookPhoto: baseVariation.hookPhoto ?? gbpPhotos[0] ?? null,
    ctaPhoto:  baseVariation.ctaPhoto  ?? gbpPhotos[1] ?? gbpPhotos[0] ?? null,
  }
  return {
    script: theme.cachedScript!,
    variation,
    brandColor,
    brandSecondaryColor: brandSecondaryColor ?? brandColor,
    logoUrl,
    businessName: 'Harmonia Dental',
    industry: 'dental',
    websiteUrl: null,
    gbpPhotos,
  }
}

interface TreatmentConfig {
  key: string
  label: string
  desc: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any
}

const TEMPLATES: TreatmentConfig[] = [
  { key: 'original',  label: 'Original',    desc: 'Immersive dark',      component: CompositionOriginal  },
  { key: 'split',     label: 'Split',       desc: 'Brand panel + dark',  component: CompositionSplit     },
  { key: 'minimal',   label: 'Minimal',     desc: 'Pure typography',     component: CompositionMinimal   },
  { key: 'gradient',  label: 'Gradient',    desc: 'Brand colour wash',   component: CompositionGradient  },
  { key: 'cinematic', label: 'Cinematic',   desc: 'Photo film look',     component: CompositionCinematic },
  { key: 'neon',      label: 'Neon',        desc: 'Glow & dark',         component: CompositionNeon      },
  { key: 'bold',      label: 'Bold',        desc: 'Max impact type',     component: CompositionBold      },
  { key: 'cards',     label: 'Cards',       desc: 'Frosted glass UI',    component: CompositionCards     },
  { key: 'headline',  label: 'Headline',    desc: 'Editorial light',     component: CompositionHeadline  },
  { key: 'overlay',   label: 'Overlay',     desc: 'Glass on photo',      component: CompositionOverlay   },
  { key: 'brand',     label: 'Brand',       desc: 'Full brand colour',   component: CompositionBrand     },
  { key: 'editorial', label: 'Editorial',   desc: 'Text-dominant dark',  component: CompositionEditorial },
]

const PALETTES: TreatmentConfig[] = [
  { key: 'p_dark_cinematic',    label: 'Dark Cinematic',    desc: 'Cinematic · Overlay · Brand',      component: CompositionPaletteDarkCinematic    },
  { key: 'p_bold_energy',       label: 'Bold Energy',       desc: 'Bold · Neon · Brand',              component: CompositionPaletteBoldEnergy       },
  { key: 'p_magazine_light',    label: 'Magazine Light',    desc: 'Headline · Headline · Bold',       component: CompositionPaletteMagazineLight    },
  { key: 'p_brand_forward',     label: 'Brand Forward',     desc: 'Gradient · Cards · Brand',         component: CompositionPaletteBrandForward     },
  { key: 'p_neon_pulse',        label: 'Neon Pulse',        desc: 'Neon · Neon · Gradient',           component: CompositionPaletteNeonPulse        },
  { key: 'p_pure_type',         label: 'Pure Type',         desc: 'Minimal · Minimal · Brand',        component: CompositionPalettePureType         },
  { key: 'p_cards_all_day',     label: 'Cards All Day',     desc: 'Cards · Cards · Brand',            component: CompositionPaletteCardsAllDay      },
  { key: 'p_editorial_mix',     label: 'Editorial Mix',     desc: 'Editorial · Headline · Gradient',  component: CompositionPaletteEditorialMix     },
  { key: 'p_cinematic_cards',   label: 'Cinematic Cards',   desc: 'Cinematic · Cards · Brand',        component: CompositionPaletteCinematicCards   },
  { key: 'p_immersive_overlay', label: 'Immersive Overlay', desc: 'Immersive · Overlay · Brand',      component: CompositionPaletteImmersiveOverlay },
]

const MOTIFS: TreatmentConfig[] = [
  { key: 'motif_particles',    label: 'Particles',     desc: 'Ambient drift',          component: CompositionMotifParticles    },
  { key: 'motif_aurora',       label: 'Aurora',        desc: 'Dreamy atmosphere',      component: CompositionMotifAurora       },
  { key: 'motif_light_rays',   label: 'Light Rays',    desc: 'Cinematic warmth',       component: CompositionMotifLightRays    },
  { key: 'motif_radial_burst', label: 'Radial Burst',  desc: 'High energy',            component: CompositionMotifRadialBurst  },
  { key: 'motif_confetti',     label: 'Confetti',      desc: 'Celebratory reviews',    component: CompositionMotifConfetti     },
  { key: 'motif_stars_fill',   label: 'Stars Fill',    desc: 'Rating proof',           component: CompositionMotifStarsFill    },
  { key: 'motif_progress',     label: 'Progress Ring', desc: 'Data-driven',            component: CompositionMotifProgressRing },
  { key: 'motif_rocket',       label: 'Rocket Launch', desc: 'Growth narrative',       component: CompositionMotifRocketLaunch },
  { key: 'motif_bar_chart',    label: 'Bar Chart',     desc: 'Rising proof',           component: CompositionMotifBarChart     },
  { key: 'motif_google_g',     label: 'Google Badge',  desc: 'Trust anchor',           component: CompositionMotifGoogleG      },
  { key: 'motif_chat_bubbles', label: 'Chat Bubbles',  desc: 'Social proof flow',      component: CompositionMotifChatBubbles  },
  { key: 'motif_ripple',       label: 'Ripple Waves',  desc: 'Calm & premium',         component: CompositionMotifRippleWaves  },
]


function ReelCard({
  treatment,
  inputProps,
  totalFrames,
}: {
  treatment: TreatmentConfig
  inputProps: ReelCompositionProps
  totalFrames: number
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <div style={{
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)',
      }}>
        <Player
          component={treatment.component as never}
          inputProps={inputProps}
          durationInFrames={totalFrames}
          compositionWidth={REEL_WIDTH}
          compositionHeight={REEL_HEIGHT}
          fps={REEL_FPS}
          style={{ width: PLAYER_W, height: PLAYER_H }}
          controls
          loop
          autoPlay
          errorFallback={({ error }: { error: Error }) => (
            <div style={{ padding: 12, color: '#f87171', fontSize: 11, background: '#1a0a0a', height: '100%', overflow: 'auto', wordBreak: 'break-word' }}>
              {error.message}
            </div>
          )}
        />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
          {treatment.label}
        </div>
        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
          {treatment.desc}
        </div>
      </div>
    </div>
  )
}

export function MockupClient({ themes, brandColor, brandSecondaryColor, logoUrl, gbpPhotos }: Props) {
  if (themes.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <p style={{ color: '#6b7280', fontSize: 15, textAlign: 'center' }}>
          No cached reels found. Build a reel first, then revisit this page.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      padding: '48px 40px 80px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      {themes.map((theme, themeIdx) => {
        const inputProps = buildProps(theme, brandColor, brandSecondaryColor, logoUrl, gbpPhotos)
        const totalFrames = Math.round(theme.cachedScript!.totalDuration * REEL_FPS)

        return (
          <div key={theme.id} style={{ marginBottom: 80 }}>
            {/* Theme header */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#6b7280', marginBottom: 6 }}>
                Theme {themeIdx + 1}
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#ffffff', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {theme.title}
              </h2>
            </div>

            {/* Palettes */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fill, ${PLAYER_W}px)`,
              gap: '32px 28px',
            }}>
              {PALETTES.map(treatment => (
                <ReelCard
                  key={treatment.key}
                  treatment={treatment}
                  inputProps={inputProps}
                  totalFrames={totalFrames}
                />
              ))}
            </div>

            {/* Divider */}
            {themeIdx < themes.length - 1 && (
              <div style={{ height: 1, background: '#1f2937', marginTop: 80 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
