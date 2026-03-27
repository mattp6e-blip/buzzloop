'use client'

import { useRef, useEffect, useCallback, useState } from 'react'

const W = 189
const H = 336

// ── Helpers ──────────────────────────────────────────────────────────

function clamp(v: number, lo = 0, hi = 1) { return Math.max(lo, Math.min(hi, v)) }
function easeOut(t: number) { return 1 - Math.pow(1 - clamp(t), 3) }
function easeOutBack(t: number) {
  const c = clamp(t); const s = 1.70158
  return 1 + (s + 1) * Math.pow(c - 1, 3) + s * Math.pow(c - 1, 2)
}
function fadeIn(t: number, delay: number, dur = 0.45) {
  return clamp(easeOut((t - delay) / dur))
}
function slideUp(t: number, delay: number, dur = 0.45): [number, number] {
  const p = clamp(easeOut((t - delay) / dur))
  return [p, (1 - p) * 22]
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (ctx.measureText(test).width <= maxW) { line = test }
    else { if (line) lines.push(line); line = w }
  }
  if (line) lines.push(line)
  return lines
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  color: string,
  align: CanvasTextAlign = 'center',
  alpha = 1,
  maxW?: number,
  lineH = 1.35
) {
  if (alpha <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = 'top'
  if (maxW) {
    const lines = wrap(ctx, text, maxW)
    const size = parseInt(font)
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * size * lineH))
  } else {
    ctx.fillText(text, x, y)
  }
  ctx.restore()
}

// ── BRAND 1: Bella Vista (warm Italian restaurant) ────────────────────
// Dark burgundy, gold accents, elegant centered layout

function drawBellaVista(ctx: CanvasRenderingContext2D, t: number) {
  const TOTAL = 15
  const loopT = t % TOTAL
  const phase = loopT < 4 ? 0 : loopT < 8 ? 1 : loopT < 11 ? 2 : 3
  const pt = phase === 0 ? loopT : phase === 1 ? loopT - 4 : phase === 2 ? loopT - 8 : loopT - 11

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#1a0a06')
  bg.addColorStop(1, '#2e1209')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Warm center glow
  const pulse = 0.5 + 0.08 * Math.sin(loopT * 0.6)
  const glow = ctx.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.45, W * 0.65)
  glow.addColorStop(0, `rgba(180, 90, 20, ${pulse * 0.18})`)
  glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // Gold border lines
  ctx.save()
  ctx.strokeStyle = '#d4a947'
  ctx.lineWidth = 0.7
  ctx.globalAlpha = 0.6
  ctx.beginPath(); ctx.moveTo(W * 0.1, H * 0.06); ctx.lineTo(W * 0.9, H * 0.06); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(W * 0.1, H * 0.94); ctx.lineTo(W * 0.9, H * 0.94); ctx.stroke()
  ctx.restore()

  // Brand name always visible
  drawText(ctx, 'BELLA VISTA', W / 2, H * 0.09, `600 8px/1 system-ui`, '#d4a947', 'center', 0.9)

  if (phase === 0) {
    // Hook
    const a1 = fadeIn(pt, 0.2)
    const a2 = fadeIn(pt, 0.6)
    const [, oy] = slideUp(pt, 0.2)
    drawText(ctx, '7 CUSTOMERS', W / 2, H * 0.36 + oy * a1, `700 17px/1 system-ui`, '#ffffff', 'center', a1)
    drawText(ctx, "can't stop talking about", W / 2, H * 0.36 + 22 + oy * a2, `400 11px/1 system-ui`, 'rgba(255,255,255,0.6)', 'center', a2)
    drawText(ctx, 'the truffle pasta', W / 2, H * 0.36 + 36 + oy * a2, `700 14px/1 system-ui`, '#d4a947', 'center', a2)

    // Small star row
    const a3 = fadeIn(pt, 1.2)
    drawText(ctx, '★★★★★', W / 2, H * 0.72, `400 12px/1 system-ui`, '#d4a947', 'center', a3)
    drawText(ctx, 'Read their reviews →', W / 2, H * 0.76, `400 9px/1 system-ui`, 'rgba(255,255,255,0.4)', 'center', a3)

  } else if (phase === 1) {
    // Quote
    const aq = fadeIn(pt, 0.1)
    // Large decorative quote
    ctx.save()
    ctx.font = '900 60px/1 Georgia, serif'
    ctx.fillStyle = '#d4a947'
    ctx.globalAlpha = 0.25 * aq
    ctx.textBaseline = 'top'
    ctx.fillText('\u201C', 10, H * 0.28)
    ctx.restore()

    const a2 = fadeIn(pt, 0.3)
    drawText(ctx, 'Best Italian I\'ve had outside of Italy.', W / 2, H * 0.4, `italic 400 12px/1 system-ui`, '#fff', 'center', a2, W * 0.72, 1.5)
    drawText(ctx, 'We come every week now.', W / 2, H * 0.56, `italic 400 12px/1 system-ui`, '#fff', 'center', a2, W * 0.72, 1.5)

    const a3 = fadeIn(pt, 0.9)
    // Gold line
    ctx.save()
    ctx.strokeStyle = '#d4a947'
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.7 * a3
    ctx.beginPath(); ctx.moveTo(W * 0.35, H * 0.67); ctx.lineTo(W * 0.65, H * 0.67); ctx.stroke()
    ctx.restore()
    drawText(ctx, '— Sarah M.', W / 2, H * 0.69, `600 10px/1 system-ui`, '#d4a947', 'center', a3)

  } else if (phase === 2) {
    // Proof
    const a1 = fadeIn(pt, 0.1)
    const a2 = fadeIn(pt, 0.5)
    drawText(ctx, '4.9', W / 2, H * 0.3, `700 52px/1 Georgia, serif`, '#d4a947', 'center', a1)
    drawText(ctx, '★★★★★', W / 2, H * 0.53, `400 18px/1 system-ui`, '#d4a947', 'center', a1)
    drawText(ctx, 'from 312 happy customers', W / 2, H * 0.64, `400 10px/1 system-ui`, 'rgba(255,255,255,0.5)', 'center', a2)
    drawText(ctx, 'on Google', W / 2, H * 0.7, `600 10px/1 system-ui`, '#d4a947', 'center', a2)

  } else {
    // CTA
    const a1 = fadeIn(pt, 0.1)
    const a2 = fadeIn(pt, 0.5)
    const a3 = fadeIn(pt, 0.9)
    drawText(ctx, 'Reserve your', W / 2, H * 0.35, `400 13px/1 system-ui`, 'rgba(255,255,255,0.7)', 'center', a1)
    drawText(ctx, 'table tonight', W / 2, H * 0.43, `700 20px/1 system-ui`, '#d4a947', 'center', a2)

    // Underline
    ctx.save()
    ctx.strokeStyle = '#d4a947'
    ctx.lineWidth = 1.5
    ctx.globalAlpha = 0.8 * a3
    const uw = 90
    ctx.beginPath(); ctx.moveTo((W - uw) / 2, H * 0.565); ctx.lineTo((W + uw) / 2, H * 0.565); ctx.stroke()
    ctx.restore()

    drawText(ctx, 'bellavista.com', W / 2, H * 0.72, `400 9px/1 system-ui`, 'rgba(255,255,255,0.3)', 'center', a3)
  }
}

// ── BRAND 2: IronCore Fitness (bold gym) ─────────────────────────────
// Pure black, electric cyan, massive bold typography, industrial

function drawIronCore(ctx: CanvasRenderingContext2D, t: number) {
  const TOTAL = 15
  const loopT = t % TOTAL
  const phase = loopT < 4 ? 0 : loopT < 8 ? 1 : loopT < 11 ? 2 : 3
  const pt = phase === 0 ? loopT : phase === 1 ? loopT - 4 : phase === 2 ? loopT - 8 : loopT - 11
  const CYAN = '#00d4ff'

  // Background
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, W, H)

  // Brand name
  drawText(ctx, 'IRONCORE', 14, H * 0.06, `800 8px/1 system-ui`, CYAN, 'left', 0.9)
  // Cyan top accent bar
  ctx.fillStyle = CYAN
  ctx.fillRect(0, 0, W, 2.5)

  if (phase === 0) {
    // Hook — huge bold text
    const a1 = fadeIn(pt, 0.0, 0.35)
    const a2 = fadeIn(pt, 0.3, 0.35)
    const a3 = fadeIn(pt, 0.6, 0.35)
    const [, oy1] = slideUp(pt, 0, 0.35)
    const [, oy2] = slideUp(pt, 0.3, 0.35)

    drawText(ctx, 'MEMBERS', W / 2, H * 0.28 + oy1, `900 28px/1 system-ui`, '#ffffff', 'center', a1)
    drawText(ctx, 'ARE HITTING', W / 2, H * 0.43 + oy2, `900 22px/1 system-ui`, CYAN, 'center', a2)
    drawText(ctx, 'PRs THEY NEVER', W / 2, H * 0.555, `700 15px/1 system-ui`, 'rgba(255,255,255,0.6)', 'center', a3)
    drawText(ctx, 'THOUGHT POSSIBLE', W / 2, H * 0.62, `700 15px/1 system-ui`, 'rgba(255,255,255,0.6)', 'center', a3)

    // Bottom cyan bar
    ctx.fillStyle = CYAN
    ctx.globalAlpha = a3
    ctx.fillRect(0, H - 3, W, 3)
    ctx.globalAlpha = 1

  } else if (phase === 1) {
    // Quote — left-aligned, bold
    const aq = fadeIn(pt, 0.1)
    // Left cyan accent bar
    ctx.fillStyle = CYAN
    ctx.globalAlpha = aq
    ctx.fillRect(0, H * 0.25, 3, H * 0.45)
    ctx.globalAlpha = 1

    const a2 = fadeIn(pt, 0.3)
    drawText(ctx, '"Lost 18kg in', 22, H * 0.28, `700 14px/1 system-ui`, '#ffffff', 'left', a2)
    drawText(ctx, '5 months."', 22, H * 0.38, `700 14px/1 system-ui`, '#ffffff', 'left', a2)
    drawText(ctx, 'The coaches', 22, H * 0.5, `400 11px/1 system-ui`, 'rgba(255,255,255,0.55)', 'left', a2)
    drawText(ctx, 'actually care.', 22, H * 0.56, `400 11px/1 system-ui`, 'rgba(255,255,255,0.55)', 'left', a2)

    const a3 = fadeIn(pt, 0.8)
    drawText(ctx, '— JAMES K.', 22, H * 0.67, `800 9px/1 system-ui`, CYAN, 'left', a3)

  } else if (phase === 2) {
    // Proof — massive number
    const a1 = fadeIn(pt, 0.0, 0.4)
    const a2 = fadeIn(pt, 0.4, 0.4)
    const p = clamp(easeOutBack((pt - 0.1) / 0.5))

    drawText(ctx, '4.8', W / 2, H * 0.24, `900 62px/1 system-ui`, '#ffffff', 'center', a1 * p)
    drawText(ctx, '★', W / 2, H * 0.54, `400 28px/1 system-ui`, CYAN, 'center', a1)
    drawText(ctx, '89 MEMBERS', W / 2, H * 0.67, `800 12px/1 system-ui`, CYAN, 'center', a2)
    drawText(ctx, 'GAVE 5 STARS', W / 2, H * 0.73, `400 10px/1 system-ui`, 'rgba(255,255,255,0.4)', 'center', a2)

  } else {
    // CTA
    const a1 = fadeIn(pt, 0.0, 0.35)
    const a2 = fadeIn(pt, 0.3, 0.35)
    const a3 = fadeIn(pt, 0.7, 0.35)
    drawText(ctx, 'YOUR', W / 2, H * 0.28, `900 20px/1 system-ui`, 'rgba(255,255,255,0.4)', 'center', a1)
    drawText(ctx, 'TRANSFORMATION', W / 2, H * 0.38, `900 17px/1 system-ui`, '#ffffff', 'center', a2)
    drawText(ctx, 'STARTS NOW', W / 2, H * 0.51, `900 22px/1 system-ui`, CYAN, 'center', a2)

    // Highlight box behind STARTS NOW
    ctx.save()
    ctx.globalAlpha = 0.12 * a2
    ctx.fillStyle = CYAN
    ctx.fillRect(W * 0.05, H * 0.49, W * 0.9, 28)
    ctx.restore()

    drawText(ctx, 'GET YOUR FREE WEEK →', W / 2, H * 0.68, `700 9px/1 system-ui`, CYAN, 'center', a3)
  }

  // Bottom bar always
  ctx.fillStyle = CYAN
  ctx.fillRect(0, H - 2, W, 2)
}

// ── BRAND 3: Pearl Dental (clean, light background) ──────────────────
// White/light bg, teal, minimal — totally different feel from dark ones

function drawPearlDental(ctx: CanvasRenderingContext2D, t: number) {
  const TOTAL = 15
  const loopT = t % TOTAL
  const phase = loopT < 4 ? 0 : loopT < 8 ? 1 : loopT < 11 ? 2 : 3
  const pt = phase === 0 ? loopT : phase === 1 ? loopT - 4 : phase === 2 ? loopT - 8 : loopT - 11
  const TEAL = '#0ea5e9'
  const INK = '#0f172a'

  // Light background
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#f0f9ff')
  bg.addColorStop(1, '#e0f2fe')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Teal top bar
  ctx.fillStyle = TEAL
  ctx.fillRect(0, 0, W, 4)

  // Brand
  drawText(ctx, 'PEARL DENTAL', W / 2, H * 0.08, `700 8px/1 system-ui`, TEAL, 'center', 0.9)

  // Decorative circle top-right
  ctx.save()
  ctx.strokeStyle = TEAL
  ctx.lineWidth = 1.5
  ctx.globalAlpha = 0.15
  ctx.beginPath(); ctx.arc(W * 0.88, H * 0.12, 28, 0, Math.PI * 2); ctx.stroke()
  ctx.beginPath(); ctx.arc(W * 0.88, H * 0.12, 18, 0, Math.PI * 2); ctx.stroke()
  ctx.restore()

  if (phase === 0) {
    const a1 = fadeIn(pt, 0.1)
    const a2 = fadeIn(pt, 0.5)
    const [, oy] = slideUp(pt, 0.1)

    drawText(ctx, 'Patients leave smiling', W / 2, H * 0.33 + oy, `700 15px/1 system-ui`, INK, 'center', a1, W * 0.78, 1.4)
    drawText(ctx, '— and not just because', W / 2, H * 0.44 + oy, `400 11px/1 system-ui`, INK + 'aa', 'center', a1, W * 0.78, 1.4)
    drawText(ctx, 'of the results', W / 2, H * 0.5 + oy, `400 11px/1 system-ui`, INK + 'aa', 'center', a1, W * 0.78, 1.4)

    // Teal dot accent
    const a3 = fadeIn(pt, 0.8)
    ctx.save(); ctx.fillStyle = TEAL; ctx.globalAlpha = a3
    ctx.beginPath(); ctx.arc(W / 2, H * 0.65, 3, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(W / 2 - 10, H * 0.65, 3, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(W / 2 + 10, H * 0.65, 3, 0, Math.PI * 2); ctx.fill()
    ctx.restore()

  } else if (phase === 1) {
    const a1 = fadeIn(pt, 0.1)
    const a2 = fadeIn(pt, 0.5)

    // Speech bubble shape
    ctx.save()
    ctx.globalAlpha = 0.1 * a1
    ctx.fillStyle = TEAL
    ctx.beginPath()
    ctx.roundRect(W * 0.08, H * 0.25, W * 0.84, H * 0.38, 12)
    ctx.fill()
    ctx.restore()

    drawText(ctx, '"I used to dread the dentist.', W / 2, H * 0.3, `italic 400 11px/1 system-ui`, INK, 'center', a1, W * 0.75, 1.45)
    drawText(ctx, 'Now I actually look', W / 2, H * 0.41, `italic 400 11px/1 system-ui`, INK, 'center', a1, W * 0.75, 1.45)
    drawText(ctx, 'forward to coming in."', W / 2, H * 0.47, `italic 400 11px/1 system-ui`, INK, 'center', a1, W * 0.75, 1.45)

    drawText(ctx, '— Claire B., Patient', W / 2, H * 0.67, `600 9px/1 system-ui`, TEAL, 'center', a2)

  } else if (phase === 2) {
    const a1 = fadeIn(pt, 0.1, 0.4)
    const a2 = fadeIn(pt, 0.4, 0.4)
    const p = clamp(easeOut((pt - 0.1) / 0.5))

    drawText(ctx, '4.9', W / 2, H * 0.26, `700 56px/1 system-ui`, TEAL, 'center', a1 * p)
    drawText(ctx, '★★★★★', W / 2, H * 0.53, `400 16px/1 system-ui`, TEAL, 'center', a1)
    drawText(ctx, '204 verified reviews', W / 2, H * 0.65, `600 10px/1 system-ui`, INK + '88', 'center', a2)

  } else {
    const a1 = fadeIn(pt, 0.1)
    const a2 = fadeIn(pt, 0.5)
    const a3 = fadeIn(pt, 0.8)

    drawText(ctx, 'A smile you\'ll', W / 2, H * 0.33, `700 16px/1 system-ui`, INK, 'center', a1)
    drawText(ctx, 'be proud of', W / 2, H * 0.44, `700 16px/1 system-ui`, INK, 'center', a1)

    // Teal pill button
    ctx.save()
    ctx.globalAlpha = a2
    ctx.fillStyle = TEAL
    ctx.beginPath()
    ctx.roundRect(W * 0.2, H * 0.6, W * 0.6, 28, 14)
    ctx.fill()
    ctx.restore()
    drawText(ctx, 'Book your check-up →', W / 2, H * 0.615, `700 10px/1 system-ui`, '#ffffff', 'center', a3)
  }
}

// ── BRAND 4: Studio Nine (luxury salon) ──────────────────────────────
// Near-black, rose gold, editorial/fashion, asymmetric

function drawStudioNine(ctx: CanvasRenderingContext2D, t: number) {
  const TOTAL = 15
  const loopT = t % TOTAL
  const phase = loopT < 4 ? 0 : loopT < 8 ? 1 : loopT < 11 ? 2 : 3
  const pt = phase === 0 ? loopT : phase === 1 ? loopT - 4 : phase === 2 ? loopT - 8 : loopT - 11
  const ROSE = '#c9956c'
  const ROSEDIM = '#8a5a3a'

  // Background
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, W, H)

  // Horizontal rose gold line at 28% — editorial divider
  ctx.save()
  ctx.strokeStyle = ROSE
  ctx.lineWidth = 0.8
  ctx.globalAlpha = 0.7
  ctx.beginPath(); ctx.moveTo(W * 0.08, H * 0.28); ctx.lineTo(W * 0.92, H * 0.28); ctx.stroke()
  ctx.restore()

  // Brand — above the line
  drawText(ctx, 'STUDIO', 14, H * 0.15, `300 9px/1 system-ui`, ROSE, 'left', 0.8)
  drawText(ctx, 'NINE', 14, H * 0.21, `700 18px/1 system-ui`, '#ffffff', 'left', 0.95)

  // Issue number top-right (fashion mag style)
  drawText(ctx, 'REVIEWS', W - 12, H * 0.17, `400 7px/1 system-ui`, ROSEDIM, 'right', 0.5)
  drawText(ctx, '2024', W - 12, H * 0.22, `700 8px/1 system-ui`, ROSEDIM, 'right', 0.5)

  if (phase === 0) {
    const a1 = fadeIn(pt, 0.1)
    const a2 = fadeIn(pt, 0.45)
    const [, oy] = slideUp(pt, 0.1)

    drawText(ctx, 'Every client walks', 14, H * 0.33 + oy, `300 13px/1 system-ui`, 'rgba(255,255,255,0.5)', 'left', a1)
    drawText(ctx, 'out a completely', 14, H * 0.42 + oy, `700 15px/1 system-ui`, '#ffffff', 'left', a2)
    drawText(ctx, 'different person', 14, H * 0.52 + oy, `700 15px/1 system-ui`, ROSE, 'left', a2)

    // Bottom right decoration
    const a3 = fadeIn(pt, 0.9)
    ctx.save()
    ctx.globalAlpha = 0.3 * a3
    ctx.strokeStyle = ROSE
    ctx.lineWidth = 0.7
    ctx.beginPath(); ctx.arc(W * 0.85, H * 0.75, 20, 0, Math.PI * 2); ctx.stroke()
    ctx.restore()

  } else if (phase === 1) {
    const aq = fadeIn(pt, 0.0, 0.4)
    // Huge decorative quote
    ctx.save()
    ctx.font = '900 80px/1 Georgia, serif'
    ctx.fillStyle = ROSE
    ctx.globalAlpha = 0.15 * aq
    ctx.textBaseline = 'top'
    ctx.fillText('\u201C', -4, H * 0.27)
    ctx.restore()

    const a2 = fadeIn(pt, 0.2)
    drawText(ctx, '"Best hair I\'ve', W * 0.92, H * 0.34, `300 12px/1 system-ui`, '#ffffff', 'right', a2)
    drawText(ctx, 'had in years.', W * 0.92, H * 0.43, `700 14px/1 system-ui`, '#ffffff', 'right', a2)
    drawText(ctx, 'My confidence went', W * 0.92, H * 0.53, `300 10px/1 system-ui`, 'rgba(255,255,255,0.5)', 'right', a2)
    drawText(ctx, 'through the roof."', W * 0.92, H * 0.6, `300 10px/1 system-ui`, 'rgba(255,255,255,0.5)', 'right', a2)

    const a3 = fadeIn(pt, 0.8)
    drawText(ctx, '— Priya S.', W * 0.92, H * 0.71, `600 9px/1 system-ui`, ROSE, 'right', a3)

  } else if (phase === 2) {
    const a1 = fadeIn(pt, 0.0, 0.4)
    const a2 = fadeIn(pt, 0.35, 0.4)
    const p = clamp(easeOutBack((pt - 0.05) / 0.5))

    drawText(ctx, '5.0', W / 2, H * 0.3, `200 64px/1 system-ui`, ROSE, 'center', a1 * p)

    // Stars
    ctx.save()
    ctx.globalAlpha = a1
    ctx.font = '400 14px/1 system-ui'
    ctx.fillStyle = ROSE
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('★ ★ ★ ★ ★', W / 2, H * 0.55)
    ctx.restore()

    drawText(ctx, '156 reviews', W / 2, H * 0.65, `300 10px/1 system-ui`, 'rgba(255,255,255,0.4)', 'center', a2)
    drawText(ctx, 'PERFECT SCORE', W / 2, H * 0.71, `700 8px/1 system-ui`, ROSE, 'center', a2)

  } else {
    const a1 = fadeIn(pt, 0.0)
    const a2 = fadeIn(pt, 0.4)
    const a3 = fadeIn(pt, 0.8)

    drawText(ctx, 'Time for your', W / 2, H * 0.36, `300 13px/1 system-ui`, 'rgba(255,255,255,0.55)', 'center', a1)
    drawText(ctx, 'glow-up', W / 2, H * 0.44, `700 26px/1 system-ui`, ROSE, 'center', a2)

    // Underline
    ctx.save()
    ctx.strokeStyle = ROSE
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.6 * a2
    const uw = 70
    ctx.beginPath(); ctx.moveTo((W - uw) / 2, H * 0.585); ctx.lineTo((W + uw) / 2, H * 0.585); ctx.stroke()
    ctx.restore()

    drawText(ctx, 'Book your appointment →', W / 2, H * 0.69, `400 9px/1 system-ui`, 'rgba(255,255,255,0.35)', 'center', a3)
  }
}

// ── Canvas component ─────────────────────────────────────────────────

type DrawFn = (ctx: CanvasRenderingContext2D, t: number) => void

const BRANDS: { name: string; industry: string; draw: DrawFn }[] = [
  { name: 'Bella Vista',    industry: 'Restaurant', draw: drawBellaVista },
  { name: 'IronCore',       industry: 'Gym',        draw: drawIronCore },
  { name: 'Pearl Dental',   industry: 'Dental',     draw: drawPearlDental },
  { name: 'Studio Nine',    industry: 'Salon',      draw: drawStudioNine },
]

function BrandReel({ brand }: { brand: typeof BRANDS[0] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)
  const startRef  = useRef<number | null>(null)
  const [currentT, setCurrentT] = useState(0)
  const TOTAL = 15

  const animate = useCallback((ts: number) => {
    if (!canvasRef.current) return
    if (!startRef.current) startRef.current = ts
    const loopT = ((ts - startRef.current) / 1000) % TOTAL
    setCurrentT(loopT)
    const ctx = canvasRef.current.getContext('2d')!
    brand.draw(ctx, loopT)
    rafRef.current = requestAnimationFrame(animate)
  }, [brand])

  useEffect(() => {
    document.fonts.ready.then(() => {
      rafRef.current = requestAnimationFrame(animate)
    })
    return () => cancelAnimationFrame(rafRef.current)
  }, [animate])

  const pct = (currentT / TOTAL) * 100

  // Derive accent color per brand
  const accentColors: Record<string, string> = {
    'Bella Vista': '#d4a947',
    'IronCore': '#00d4ff',
    'Pearl Dental': '#0ea5e9',
    'Studio Nine': '#c9956c',
  }
  const accent = accentColors[brand.name] ?? '#fff'

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="rounded-2xl overflow-hidden" style={{ width: W, height: H, background: '#0a0a0a', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)' }}>
        <canvas ref={canvasRef} width={W} height={H} style={{ display: 'block' }} />
      </div>
      {/* Progress bar */}
      <div className="rounded-full overflow-hidden" style={{ width: W, height: 2, background: 'rgba(255,255,255,0.1)' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: accent, borderRadius: 9999, transition: 'none' }} />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold" style={{ color: '#ffffff' }}>{brand.name}</p>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{brand.industry}</p>
      </div>
    </div>
  )
}

export function ReelDemos() {
  return (
    <div className="flex gap-5 justify-center flex-wrap">
      {BRANDS.map(b => <BrandReel key={b.name} brand={b} />)}
    </div>
  )
}
