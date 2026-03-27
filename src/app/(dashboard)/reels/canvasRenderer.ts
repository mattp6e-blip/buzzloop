import type { ReelSlide } from '@/types'

export interface RenderOptions {
  logoImage?: HTMLImageElement | null
  industry?: string
  websiteUrl?: string
}

// ── Easing ─────────────────────────────────────────────────────

function clamp01(t: number) { return Math.max(0, Math.min(1, t)) }
function easeOut(t: number) { return 1 - Math.pow(1 - t, 3) }
function easeOutBack(t: number) {
  const c1 = 1.70158, c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
function progress(t: number, start: number, end: number) {
  return clamp01((t - start) / (end - start))
}

// ── Text helpers ───────────────────────────────────────────────

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width <= maxWidth) {
      current = test
    } else {
      if (current) lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines
}

function drawFade(
  ctx: CanvasRenderingContext2D,
  draw: () => void,
  t: number,
  delay: number,
  dur = 0.4
) {
  const alpha = easeOut(progress(t, delay, delay + dur))
  if (alpha <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha
  draw()
  ctx.restore()
}

function drawSlideUp(
  ctx: CanvasRenderingContext2D,
  draw: (offsetY: number) => void,
  t: number,
  delay: number,
  dur = 0.45,
  dist = 28
) {
  const p = easeOut(progress(t, delay, delay + dur))
  if (p <= 0) return
  ctx.save()
  ctx.globalAlpha = p
  draw((1 - p) * dist)
  ctx.restore()
}

// Word-by-word reveal with automatic line wrapping
function drawWordReveal(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  t: number,
  baseDelay: number,
  fontSize: number,
  color: string,
  fontSpec: string,
  lineHeight: number,
  italic = false
) {
  ctx.save()
  ctx.font = `${italic ? 'italic ' : ''}${fontSize}px ${fontSpec}`
  ctx.textBaseline = 'top'
  const lines = wrapText(ctx, text, maxWidth)

  let wordIndex = 0
  for (let li = 0; li < lines.length; li++) {
    const words = lines[li].split(' ')
    let cx = x
    for (const word of words) {
      const wordDelay = baseDelay + wordIndex * 0.07
      const p = easeOut(progress(t, wordDelay, wordDelay + 0.45))
      if (p > 0) {
        ctx.globalAlpha = p
        ctx.fillStyle = color
        ctx.fillText(word, cx, y + li * lineHeight + (1 - p) * 16)
      }
      cx += ctx.measureText(word + ' ').width
      wordIndex++
    }
  }
  ctx.restore()
  return lines.length
}

// Draw quote with optional word highlighting
function drawQuoteReveal(
  ctx: CanvasRenderingContext2D,
  text: string,
  highlightWords: string[],
  x: number,
  y: number,
  maxWidth: number,
  t: number,
  baseDelay: number,
  fontSize: number,
  color: string,
  highlightColor: string,
  fontSpec: string,
  lineHeight: number
) {
  ctx.save()
  ctx.font = `italic ${fontSize}px ${fontSpec}`
  ctx.textBaseline = 'top'
  const lowerHighlights = highlightWords.map(w => w.toLowerCase())
  const lines = wrapText(ctx, text, maxWidth)

  let wordIndex = 0
  for (let li = 0; li < lines.length; li++) {
    const words = lines[li].split(' ')
    let cx = x
    for (const word of words) {
      const wordDelay = baseDelay + wordIndex * 0.065
      const p = easeOut(progress(t, wordDelay, wordDelay + 0.45))
      if (p > 0) {
        const isHighlighted = lowerHighlights.some(h => word.toLowerCase().includes(h))
        ctx.globalAlpha = p
        ctx.fillStyle = isHighlighted ? highlightColor : color
        if (isHighlighted) {
          ctx.font = `italic bold ${fontSize}px ${fontSpec}`
        } else {
          ctx.font = `italic ${fontSize}px ${fontSpec}`
        }
        ctx.fillText(word, cx, y + li * lineHeight + (1 - p) * 14)
      }
      ctx.font = `italic ${fontSize}px ${fontSpec}`
      cx += ctx.measureText(word + ' ').width
      wordIndex++
    }
  }
  ctx.restore()
  return lines.length
}

function drawStars(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  count: number,
  t: number,
  baseDelay: number,
  color: string,
  size: number
) {
  ctx.save()
  ctx.font = `${size}px serif`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'

  const spacing = size * 1.35
  const totalW = (count - 1) * spacing
  const startX = cx - totalW / 2

  for (let i = 0; i < count; i++) {
    const p = easeOutBack(progress(t, baseDelay + i * 0.09, baseDelay + i * 0.09 + 0.4))
    if (p <= 0) continue
    ctx.save()
    ctx.globalAlpha = clamp01(progress(t, baseDelay + i * 0.09, baseDelay + i * 0.09 + 0.25))
    ctx.translate(startX + i * spacing, y)
    ctx.scale(p, p)
    ctx.fillStyle = color
    ctx.fillText('★', 0, 0)
    ctx.restore()
  }
  ctx.restore()
}

function drawLineDraw(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  t: number, delay: number,
  color: string, thickness = 2
) {
  const p = easeOut(progress(t, delay, delay + 0.7))
  if (p <= 0) return
  const endX = x1 + (x2 - x1) * p
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = thickness
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(endX, y2)
  ctx.stroke()
  ctx.restore()
}

// ── Particle system ────────────────────────────────────────────

const PARTICLE_DEFS = [
  { rx: 0.12, ry: 0.82, dur: 4.0, delay: 0.2, size: 3 },
  { rx: 0.25, ry: 0.88, dur: 3.5, delay: 0.7, size: 4 },
  { rx: 0.40, ry: 0.78, dur: 5.0, delay: 1.2, size: 3 },
  { rx: 0.55, ry: 0.91, dur: 4.5, delay: 0.4, size: 3 },
  { rx: 0.68, ry: 0.84, dur: 3.8, delay: 0.9, size: 4 },
  { rx: 0.80, ry: 0.87, dur: 4.2, delay: 0.0, size: 3 },
  { rx: 0.88, ry: 0.75, dur: 3.6, delay: 1.5, size: 3 },
  { rx: 0.20, ry: 0.71, dur: 4.8, delay: 0.6, size: 3 },
]

function drawParticles(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  t: number,
  color: string
) {
  ctx.save()
  for (const p of PARTICLE_DEFS) {
    const localT = (t - p.delay) % p.dur
    if (localT < 0) continue
    const progress = localT / p.dur
    const alpha = progress < 0.2 ? progress / 0.2 : progress > 0.7 ? (1 - progress) / 0.3 : 1
    const driftY = progress * H * 0.12

    ctx.globalAlpha = alpha * 0.65
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(p.rx * W, p.ry * H - driftY, p.size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

// ── Background renderers ───────────────────────────────────────

// Industry-specific base gradients
const INDUSTRY_BG: Record<string, [string, string]> = {
  dental:     ['#08111e', '#0c1a2e'],
  clinic:     ['#08111e', '#0c1a2e'],
  restaurant: ['#160c06', '#241008'],
  gym:        ['#000000', '#060606'],
  salon:      ['#0a0608', '#100810'],
  spa:        ['#080c10', '#0c1018'],
  retail:     ['#080810', '#100818'],
}

function drawCinematicBg(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, brandColor: string, industry?: string) {
  const [dark, light] = INDUSTRY_BG[industry ?? ''] ?? ['#0a0a0a', '#0a0a0a']

  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, dark)
  bg.addColorStop(1, light)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Subtle radial glow
  const pulse = 0.5 + 0.15 * Math.sin(t * 0.8)
  const grd = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, W * 0.7)
  grd.addColorStop(0, `${brandColor}${Math.floor(pulse * 25).toString(16).padStart(2, '0')}`)
  grd.addColorStop(1, 'transparent')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, W, H)

  // Industry decorative motifs
  drawIndustryMotif(ctx, W, H, t, brandColor, industry)

  // Letterbox bars
  const barH = H * 0.072
  const barP = easeOut(clamp01(t * 3))
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, W, barH * barP)
  ctx.fillRect(0, H - barH * barP, W, barH)
}

function drawIndustryMotif(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, brandColor: string, industry?: string) {
  ctx.save()
  ctx.strokeStyle = brandColor
  ctx.lineWidth = W * 0.003

  if (industry === 'dental' || industry === 'clinic') {
    // Subtle dental arch arcs — very low opacity
    ctx.globalAlpha = 0.055
    ctx.beginPath(); ctx.arc(W * 0.5, -H * 0.1, H * 0.55, 0.1, Math.PI - 0.1); ctx.stroke()
    ctx.globalAlpha = 0.03
    ctx.beginPath(); ctx.arc(W * 0.5, -H * 0.1, H * 0.65, 0.1, Math.PI - 0.1); ctx.stroke()
    // Small cross motif top-right
    ctx.globalAlpha = 0.04
    ctx.lineWidth = W * 0.005
    const cx = W * 0.82, cy = H * 0.12, cs = W * 0.04
    ctx.beginPath(); ctx.moveTo(cx, cy - cs); ctx.lineTo(cx, cy + cs)
    ctx.moveTo(cx - cs, cy); ctx.lineTo(cx + cs, cy)
    ctx.stroke()
  } else if (industry === 'restaurant') {
    // Warm organic S-curves
    ctx.globalAlpha = 0.055
    ctx.beginPath()
    ctx.moveTo(0, H * 0.3)
    ctx.bezierCurveTo(W * 0.4, H * 0.15, W * 0.6, H * 0.45, W, H * 0.3)
    ctx.stroke()
    ctx.globalAlpha = 0.03
    ctx.beginPath()
    ctx.moveTo(0, H * 0.7)
    ctx.bezierCurveTo(W * 0.4, H * 0.55, W * 0.6, H * 0.85, W, H * 0.7)
    ctx.stroke()
  } else if (industry === 'gym') {
    // Bold diagonal slash
    ctx.globalAlpha = 0.07
    ctx.lineWidth = W * 0.006
    ctx.beginPath(); ctx.moveTo(W * 0.65, 0); ctx.lineTo(W, H * 0.2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, H * 0.8); ctx.lineTo(W * 0.35, H); ctx.stroke()
  } else if (industry === 'salon' || industry === 'spa') {
    // Elegant flowing curves
    ctx.globalAlpha = 0.06
    ctx.lineWidth = W * 0.0015
    ctx.beginPath()
    ctx.moveTo(0, H * 0.15)
    ctx.bezierCurveTo(W * 0.6, H * 0.05, W * 0.4, H * 0.35, W, H * 0.25)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, H * 0.75)
    ctx.bezierCurveTo(W * 0.6, H * 0.65, W * 0.4, H * 0.95, W, H * 0.85)
    ctx.stroke()
  }

  ctx.restore()
}

function drawLogo(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  t: number,
  logoImage: HTMLImageElement,
  mode: 'watermark' | 'prominent',
  delay = 1.2
) {
  if (!logoImage.complete || !logoImage.naturalWidth) return
  const alpha = easeOut(progress(t, delay, delay + 0.5))
  if (alpha <= 0) return

  const ratio = logoImage.naturalWidth / logoImage.naturalHeight

  if (mode === 'watermark') {
    // Small, top-right corner, low opacity
    const maxW = W * 0.18
    const maxH = H * 0.04
    let dw = maxW, dh = dw / ratio
    if (dh > maxH) { dh = maxH; dw = dh * ratio }
    const pad = W * 0.055
    ctx.save()
    ctx.globalAlpha = alpha * 0.55
    ctx.drawImage(logoImage, W - pad - dw, pad * 1.8, dw, dh)
    ctx.restore()
  } else {
    // Prominent — centered, larger, on CTA slide
    const maxW = W * 0.38
    const maxH = H * 0.08
    let dw = maxW, dh = dw / ratio
    if (dh > maxH) { dh = maxH; dw = dh * ratio }
    ctx.save()
    ctx.globalAlpha = alpha * 0.88
    ctx.drawImage(logoImage, (W - dw) / 2, H * 0.72, dw, dh)
    ctx.restore()
  }
}

// ── Slide renderers ────────────────────────────────────────────

function renderHookSlide(
  ctx: CanvasRenderingContext2D,
  slide: ReelSlide,
  t: number,
  W: number, H: number,
  brandColor: string,
  businessName: string,
  brandFont: string,
  opts?: RenderOptions
) {
  drawCinematicBg(ctx, W, H, t, brandColor, opts?.industry)
  drawParticles(ctx, W, H, t, brandColor)

  const pad = W * 0.09
  const midY = H * 0.42

  // Stars
  drawStars(ctx, W / 2, midY - H * 0.14, 5, t, 0.2, '#f59e0b', W * 0.045)

  // Hook headline
  const headline = slide.content.headline ?? ''
  const subline = slide.content.subline ?? ''

  ctx.save()
  ctx.font = `bold ${W * 0.072}px "${brandFont}", system-ui, sans-serif`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'center'
  const headlineLines = wrapText(ctx, headline, W - pad * 2)
  ctx.restore()

  const lineH = W * 0.088
  const totalTextH = headlineLines.length * lineH
  const textStartY = midY - totalTextH / 2

  drawWordReveal(
    ctx, headline,
    pad, textStartY,
    W - pad * 2,
    t, 0.5,
    W * 0.072, '#ffffff',
    `"${brandFont}", system-ui, sans-serif`,
    lineH
  )

  if (subline) {
    drawSlideUp(ctx, (dy) => {
      ctx.font = `${W * 0.038}px "${brandFont}", system-ui, sans-serif`
      ctx.textBaseline = 'top'
      ctx.fillStyle = `${brandColor}`
      ctx.textAlign = 'left'
      ctx.fillText(subline, pad, textStartY + totalTextH + W * 0.04 + dy)
    }, t, 1.4)
  }

  // Brand name at bottom
  drawFade(ctx, () => {
    ctx.font = `bold ${W * 0.028}px "${brandFont}", system-ui, sans-serif`
    ctx.textBaseline = 'bottom'
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.fillText(businessName.toUpperCase(), pad, H * 0.92)
  }, t, 1.8)

  // Bottom accent line
  drawLineDraw(ctx, pad, H * 0.93, W - pad, H * 0.93, t, 2.0, brandColor, W * 0.003)
}

function renderQuoteSlide(
  ctx: CanvasRenderingContext2D,
  slide: ReelSlide,
  t: number,
  W: number, H: number,
  brandColor: string,
  businessName: string,
  brandFont: string,
  opts?: RenderOptions
) {
  drawCinematicBg(ctx, W, H, t, brandColor, opts?.industry)
  drawParticles(ctx, W, H, t, brandColor)

  const pad = W * 0.09
  const quote = slide.content.quote ?? ''
  const author = slide.content.author
  const highlights = slide.content.highlightWords ?? []

  // Stars
  drawStars(ctx, pad + W * 0.12, H * 0.15, 5, t, 0.15, '#f59e0b', W * 0.038)

  // Large opening quote mark
  drawFade(ctx, () => {
    ctx.font = `bold ${W * 0.22}px Georgia, serif`
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'
    ctx.fillStyle = brandColor
    ctx.globalAlpha = 0.25
    ctx.fillText('\u201C', pad - W * 0.02, H * 0.18)
  }, t, 0.3, 0.6)

  // Quote text
  const quoteLines = drawQuoteReveal(
    ctx, quote, highlights,
    pad, H * 0.28,
    W - pad * 2,
    t, 0.5,
    W * 0.048, 'rgba(255,255,255,0.92)', brandColor,
    `"${brandFont}", Georgia, serif`,
    W * 0.065
  )

  // Author
  if (author) {
    const authorY = H * 0.28 + quoteLines * W * 0.065 + W * 0.06
    drawSlideUp(ctx, (dy) => {
      ctx.font = `bold ${W * 0.032}px "${brandFont}", system-ui, sans-serif`
      ctx.textBaseline = 'top'
      ctx.textAlign = 'left'
      ctx.fillStyle = brandColor
      ctx.fillText(`— ${author}`, pad, authorY + dy)
    }, t, 0.5 + quote.split(' ').length * 0.065 + 0.2)
  }

  // Brand line + name
  drawLineDraw(ctx, pad, H * 0.88, W * 0.55, H * 0.88, t, 2.2, brandColor, W * 0.0025)
  drawFade(ctx, () => {
    ctx.font = `bold ${W * 0.026}px "${brandFont}", system-ui, sans-serif`
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255,255,255,0.28)'
    ctx.fillText(businessName.toUpperCase(), pad, H * 0.905)
  }, t, 2.6)
}

function renderProofSlide(
  ctx: CanvasRenderingContext2D,
  slide: ReelSlide,
  t: number,
  W: number, H: number,
  brandColor: string,
  businessName: string,
  brandFont: string,
  opts?: RenderOptions
) {
  drawCinematicBg(ctx, W, H, t, brandColor, opts?.industry)

  const pad = W * 0.1
  const stat = slide.content.stat ?? ''
  const subline = slide.content.subline ?? ''

  // Auto-size the stat text to always fit — measure first, scale down if needed
  let statFontSize = W * 0.11
  ctx.font = `bold ${statFontSize}px "${brandFont}", system-ui, sans-serif`
  while (ctx.measureText(stat).width > W - pad * 2 && statFontSize > W * 0.055) {
    statFontSize -= W * 0.005
    ctx.font = `bold ${statFontSize}px "${brandFont}", system-ui, sans-serif`
  }

  const statP = easeOut(progress(t, 0.2, 0.65))
  if (statP > 0) {
    ctx.save()
    ctx.globalAlpha = statP
    ctx.font = `bold ${statFontSize}px "${brandFont}", system-ui, sans-serif`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(stat, W / 2, H * 0.38 + (1 - statP) * 40)
    ctx.restore()
  }

  if (subline) {
    // Also auto-size subline
    let subFontSize = W * 0.048
    ctx.font = `${subFontSize}px "${brandFont}", system-ui, sans-serif`
    while (ctx.measureText(subline).width > W - pad * 2 && subFontSize > W * 0.03) {
      subFontSize -= W * 0.004
      ctx.font = `${subFontSize}px "${brandFont}", system-ui, sans-serif`
    }
    drawFade(ctx, () => {
      ctx.font = `${subFontSize}px "${brandFont}", system-ui, sans-serif`
      ctx.textBaseline = 'top'
      ctx.textAlign = 'center'
      ctx.fillStyle = brandColor
      ctx.fillText(subline, W / 2, H * 0.47)
    }, t, 0.75)
  }

  // Stars row
  drawStars(ctx, W / 2, H * 0.57, 5, t, 0.65, '#f59e0b', W * 0.052)

  drawLineDraw(ctx, pad, H * 0.88, W - pad, H * 0.88, t, 1.0, brandColor, W * 0.003)

  drawFade(ctx, () => {
    ctx.font = `bold ${W * 0.026}px "${brandFont}", system-ui, sans-serif`
    ctx.textBaseline = 'top'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.28)'
    ctx.fillText(businessName.toUpperCase(), W / 2, H * 0.905)
  }, t, 1.2)
}

function renderCTASlide(
  ctx: CanvasRenderingContext2D,
  slide: ReelSlide,
  t: number,
  W: number, H: number,
  brandColor: string,
  businessName: string,
  brandFont: string,
  opts?: RenderOptions
) {
  // Deep dark background — more cinematic than flat brand color
  ctx.fillStyle = '#0d0d0d'
  ctx.fillRect(0, 0, W, H)

  // Large brand color glow behind center text
  const pulse = 0.5 + 0.2 * Math.sin(t * 1.2)
  const grd = ctx.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.45, W * 0.85)
  grd.addColorStop(0, `${brandColor}55`)
  grd.addColorStop(0.5, `${brandColor}18`)
  grd.addColorStop(1, 'transparent')
  ctx.fillStyle = grd
  ctx.globalAlpha = pulse
  ctx.fillRect(0, 0, W, H)
  ctx.globalAlpha = 1

  // Spinning geometric rings
  const circleP = easeOutBack(progress(t, 0.0, 0.6))
  if (circleP > 0) {
    ctx.save()
    ctx.globalAlpha = 0.12 * clamp01(progress(t, 0.0, 0.4))
    ctx.strokeStyle = brandColor
    ctx.lineWidth = W * 0.003
    ctx.beginPath()
    ctx.arc(W / 2, H * 0.45, W * 0.42 * circleP, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 0.07 * clamp01(progress(t, 0.0, 0.4))
    ctx.beginPath()
    ctx.arc(W / 2, H * 0.45, W * 0.52 * circleP, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  drawIndustryMotif(ctx, W, H, t, brandColor, opts?.industry)

  const pad = W * 0.1
  const headline = slide.content.headline ?? ''
  const cta = slide.content.cta ?? ''

  // Emotional headline — large, centered, word-by-word
  const headlineLines = drawWordReveal(
    ctx, headline,
    pad, H * 0.3,
    W - pad * 2,
    t, 0.3,
    W * 0.082, '#ffffff',
    `bold "${brandFont}", system-ui, sans-serif`,
    W * 0.1
  )

  // Divider line
  drawLineDraw(ctx, W * 0.3, H * 0.3 + headlineLines * W * 0.1 + W * 0.06,
    W * 0.7, H * 0.3 + headlineLines * W * 0.1 + W * 0.06,
    t, 0.3 + headlineLines * 0.07 * (headline.split(' ').length / headlineLines) + 0.5,
    `${brandColor}`, W * 0.004)

  // CTA text — smaller, warmer color, specific action
  const ctaStartY = H * 0.3 + headlineLines * W * 0.1 + W * 0.12
  drawWordReveal(
    ctx, cta,
    pad, ctaStartY,
    W - pad * 2,
    t, 0.3 + headline.split(' ').length * 0.07 + 0.5,
    W * 0.052, brandColor,
    `"${brandFont}", system-ui, sans-serif`,
    W * 0.068
  )

  // Brand name at bottom
  drawLineDraw(ctx, pad, H * 0.9, W - pad, H * 0.9, t, 2.2, 'rgba(255,255,255,0.15)', W * 0.002)
  drawFade(ctx, () => {
    ctx.font = `bold ${W * 0.028}px "${brandFont}", system-ui, sans-serif`
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.fillText(businessName.toUpperCase(), pad, H * 0.918)
  }, t, 2.4)

  // Website URL on CTA slide
  if (opts?.websiteUrl) {
    const siteDisplay = opts.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    drawFade(ctx, () => {
      ctx.font = `500 ${W * 0.028}px "${brandFont}", system-ui, sans-serif`
      ctx.textBaseline = 'top'
      ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(255,255,255,0.45)'
      ctx.fillText(siteDisplay, W / 2, H * 0.935)
    }, t, 2.8)
  }
}

// ── Main: draw a single frame ──────────────────────────────────

export function drawReelFrame(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  absoluteT: number,
  slides: ReelSlide[],
  brandColor: string,
  businessName: string,
  brandFont: string,
  opts?: RenderOptions
) {
  ctx.clearRect(0, 0, W, H)

  let elapsed = 0
  for (const slide of slides) {
    if (absoluteT < elapsed + slide.duration) {
      const slideT = absoluteT - elapsed

      switch (slide.type) {
        case 'hook':  renderHookSlide(ctx, slide, slideT, W, H, brandColor, businessName, brandFont, opts); break
        case 'quote': renderQuoteSlide(ctx, slide, slideT, W, H, brandColor, businessName, brandFont, opts); break
        case 'proof': renderProofSlide(ctx, slide, slideT, W, H, brandColor, businessName, brandFont, opts); break
        case 'cta':   renderCTASlide(ctx, slide, slideT, W, H, brandColor, businessName, brandFont, opts); break
      }

      // Logo overlay (drawn after slide content)
      if (opts?.logoImage?.complete && opts.logoImage.naturalWidth) {
        const isCTA = slide.type === 'cta'
        drawLogo(ctx, W, H, slideT, opts.logoImage, isCTA ? 'prominent' : 'watermark')
      }

      return
    }
    elapsed += slide.duration
  }

  // Past the end — show last slide frozen
  const last = slides[slides.length - 1]
  if (last) {
    switch (last.type) {
      case 'hook':  renderHookSlide(ctx, last, last.duration, W, H, brandColor, businessName, brandFont, opts); break
      case 'quote': renderQuoteSlide(ctx, last, last.duration, W, H, brandColor, businessName, brandFont, opts); break
      case 'proof': renderProofSlide(ctx, last, last.duration, W, H, brandColor, businessName, brandFont, opts); break
      case 'cta':   renderCTASlide(ctx, last, last.duration, W, H, brandColor, businessName, brandFont, opts); break
    }

    // Logo overlay for frozen last slide
    if (opts?.logoImage?.complete && opts.logoImage.naturalWidth) {
      const isCTA = last.type === 'cta'
      drawLogo(ctx, W, H, last.duration, opts.logoImage, isCTA ? 'prominent' : 'watermark')
    }
  }
}

// ── Video export ───────────────────────────────────────────────

export async function exportReelVideo(
  slides: ReelSlide[],
  totalDuration: number,
  brandColor: string,
  businessName: string,
  brandFont: string,
  onProgress?: (pct: number) => void,
  opts?: RenderOptions
): Promise<Blob> {
  const W = 1080, H = 1920
  const FPS = 30
  const totalFrames = Math.ceil(totalDuration * FPS)

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
    ? 'video/webm;codecs=vp8'
    : 'video/webm'

  const stream = canvas.captureStream(FPS)
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 })
  const chunks: BlobPart[] = []

  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: mimeType }))
    }
    recorder.onerror = reject

    recorder.start(100) // collect data every 100ms

    let frameIndex = 0
    let startTime: number | null = null

    function renderLoop(timestamp: number) {
      if (!startTime) startTime = timestamp

      const elapsed = (timestamp - startTime) / 1000
      const targetFrame = Math.floor(elapsed * FPS)

      // Draw all frames up to target (catch up if slow)
      while (frameIndex <= targetFrame && frameIndex < totalFrames) {
        const t = frameIndex / FPS
        drawReelFrame(ctx, W, H, t, slides, brandColor, businessName, brandFont, opts)
        onProgress?.(frameIndex / totalFrames)
        frameIndex++
      }

      if (frameIndex >= totalFrames) {
        recorder.stop()
        return
      }

      requestAnimationFrame(renderLoop)
    }

    requestAnimationFrame(renderLoop)
  })
}
