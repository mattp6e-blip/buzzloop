'use client'

import dynamic from 'next/dynamic'
import type { ReelTheme } from '@/types'
import type { ReelCompositionProps } from '@/remotion/types'
import { REEL_FPS, REEL_WIDTH, REEL_HEIGHT } from '@/remotion/ReelComposition'

const Player = dynamic(() => import('@remotion/player').then((m) => ({ default: m.Player })), { ssr: false })

// Dynamically import all showcase compositions
const CompositionOriginal   = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionOriginal })),   { ssr: false })
const CompositionDuotone    = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionDuotone })),    { ssr: false })
const CompositionWarm       = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionWarm })),       { ssr: false })
const CompositionCool       = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionCool })),       { ssr: false })
const CompositionRose       = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionRose })),       { ssr: false })
const CompositionTealOrange = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionTealOrange })), { ssr: false })
const CompositionNoir       = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionNoir })),       { ssr: false })
const CompositionEditorial  = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionEditorial })),  { ssr: false })
const CompositionPurple     = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionPurple })),     { ssr: false })
const CompositionCoral      = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionCoral })),      { ssr: false })
const CompositionEmerald    = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionEmerald })),    { ssr: false })
const CompositionRoseBrand  = dynamic(() => import('./ShowcaseCompositions').then(m => ({ default: m.CompositionRoseBrand })),  { ssr: false })

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
  return {
    script: theme.cachedScript!,
    variation: theme.cachedVariations![0],
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

const TREATMENTS: TreatmentConfig[] = [
  { key: 'original',    label: 'Original',      desc: 'Current production',     component: CompositionOriginal   },
  { key: 'duotone',     label: 'Brand Duotone',  desc: 'Brand colour tint',      component: CompositionDuotone    },
  { key: 'warm',        label: 'Warm Grade',     desc: 'Golden cinema',          component: CompositionWarm       },
  { key: 'cool',        label: 'Cool Grade',     desc: 'Blue cinematic',         component: CompositionCool       },
  { key: 'rose',        label: 'Rose Grade',     desc: 'Soft romantic',          component: CompositionRose       },
  { key: 'teal_orange', label: 'Teal & Orange',  desc: 'Complementary split',    component: CompositionTealOrange },
  { key: 'noir',        label: 'Noir',           desc: 'High contrast dark',     component: CompositionNoir       },
  { key: 'editorial',   label: 'Editorial',      desc: 'Text-dominant',          component: CompositionEditorial  },
  { key: 'purple',      label: 'Purple Brand',   desc: 'Alternative identity',   component: CompositionPurple     },
  { key: 'coral',       label: 'Coral Brand',    desc: 'Warm orange identity',   component: CompositionCoral      },
  { key: 'emerald',     label: 'Emerald Brand',  desc: 'Fresh green identity',   component: CompositionEmerald    },
  { key: 'rosebrand',   label: 'Rose Brand',     desc: 'Bold pink identity',     component: CompositionRoseBrand  },
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

            {/* Treatment grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fill, ${PLAYER_W}px)`,
              gap: '32px 28px',
            }}>
              {TREATMENTS.map(treatment => (
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
