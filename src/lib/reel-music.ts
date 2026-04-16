/**
 * Reel background music selection
 *
 * Tracks are hosted in Supabase Storage: public bucket "audio"
 * Files: cinematic.mp3, upbeat.mp3, motivational.mp3, acoustic.mp3, chill.mp3, corporate.mp3
 *
 * Source: Pixabay Music (pixabay.com/music) — free for commercial use, no attribution required
 */

type Tone = 'story' | 'proof' | 'bold'

const AUDIO_BASE = 'https://rhggudgximifbtyygyyh.supabase.co/storage/v1/object/public/Audio'

// Calming/acoustic industries regardless of tone
const ACOUSTIC_INDUSTRIES = new Set(['salon', 'spa', 'hotel'])
const CHILL_INDUSTRIES = new Set(['physiotherapy', 'veterinary', 'clinic', 'dental'])

export function pickMusicUrl(tone: Tone, industry: string): string {
  if (ACOUSTIC_INDUSTRIES.has(industry)) return `${AUDIO_BASE}/acoustic.mp3`
  if (CHILL_INDUSTRIES.has(industry))   return `${AUDIO_BASE}/chill.mp3`

  if (tone === 'bold')  return `${AUDIO_BASE}/motivational.mp3`
  if (tone === 'proof') return `${AUDIO_BASE}/upbeat.mp3`
  if (tone === 'story') {
    // Restaurants and bars get upbeat energy
    if (industry === 'restaurant' || industry === 'bar') return `${AUDIO_BASE}/upbeat.mp3`
    return `${AUDIO_BASE}/cinematic.mp3`
  }

  return `${AUDIO_BASE}/corporate.mp3`
}
