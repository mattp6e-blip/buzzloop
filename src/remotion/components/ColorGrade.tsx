import { AbsoluteFill } from 'remotion'

export type GradePreset = 'warm' | 'cool' | 'golden' | 'teal_orange' | 'rose' | 'noir'

const GRADES: Record<GradePreset, string> = {
  warm:        'linear-gradient(160deg, rgba(255,140,0,0.14) 0%, rgba(220,60,0,0.09) 100%)',
  cool:        'linear-gradient(160deg, rgba(30,80,255,0.13) 0%, rgba(0,200,255,0.09) 100%)',
  golden:      'radial-gradient(ellipse 130% 55% at 50% 0%, rgba(255,200,0,0.20) 0%, transparent 65%)',
  teal_orange: 'linear-gradient(135deg, rgba(0,210,200,0.14) 0%, transparent 45%, rgba(255,90,30,0.13) 100%)',
  rose:        'linear-gradient(155deg, rgba(244,63,94,0.12) 0%, rgba(168,85,247,0.10) 100%)',
  noir:        'linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.10) 50%, rgba(0,0,0,0.30) 100%)',
}

interface ColorGradeProps {
  preset: GradePreset
  intensity?: number
}

// Applies a cinematic color grade over the entire frame.
// Stack with photos for dramatic mood changes.
export function ColorGrade({ preset, intensity = 1 }: ColorGradeProps) {
  return (
    <AbsoluteFill style={{
      background: GRADES[preset],
      pointerEvents: 'none',
      opacity: intensity,
    }} />
  )
}
