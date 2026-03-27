interface Props {
  totalReviews: number
  reelsCreated: number
  drafts: number
  instagramConnected: boolean
  daysSinceLastReview: number | null
  brandColor: string
}

interface Action {
  icon: string
  heading: string
  body: string
  cta: string
  href: string
  urgent?: boolean
}

function pickAction({
  totalReviews,
  reelsCreated,
  drafts,
  instagramConnected,
  daysSinceLastReview,
}: Omit<Props, 'brandColor'>): Action | null {
  // 1. Has enough reviews but hasn't made a single Reel yet — highest value action
  if (totalReviews >= 2 && reelsCreated === 0) {
    return {
      icon: '🎬',
      heading: 'Your reviews are ready to become content',
      body: `You have ${totalReviews} reviews. The AI can turn them into a cinematic Reel right now — it takes about 30 seconds.`,
      cta: 'Create your first Reel →',
      href: '/reels',
    }
  }

  // 2. Reels sitting in drafts unpublished
  if (drafts > 0) {
    return {
      icon: '📤',
      heading: `${drafts} Reel${drafts > 1 ? 's' : ''} waiting to be published`,
      body: 'You created content but never posted it. Every day it sits in drafts is a day it\'s not bringing in customers.',
      cta: 'View drafts →',
      href: '/content',
      urgent: true,
    }
  }

  // 3. Review drought — hasn't had a new review in a while
  if (daysSinceLastReview !== null && daysSinceLastReview >= 14) {
    return {
      icon: '📲',
      heading: `No new reviews in ${daysSinceLastReview} days`,
      body: 'Your QR code might not be visible enough. Try placing it at the checkout, on tables, or in your follow-up messages.',
      cta: 'Get your QR code →',
      href: '/qr',
      urgent: daysSinceLastReview >= 21,
    }
  }

  // 4. Has Reels but no Instagram connected
  if (reelsCreated > 0 && !instagramConnected) {
    return {
      icon: '📸',
      heading: 'Connect Instagram to publish in one click',
      body: `You've created ${reelsCreated} Reel${reelsCreated > 1 ? 's' : ''} but they're not reaching anyone yet. Connect Instagram and post directly from ReviewSpark.`,
      cta: 'Connect Instagram →',
      href: '/api/auth/instagram',
    }
  }

  // 5. Very few reviews — nudge to collect more
  if (totalReviews > 0 && totalReviews < 5) {
    return {
      icon: '⭐',
      heading: 'Collect a few more reviews to unlock the best content',
      body: `You have ${totalReviews} review${totalReviews > 1 ? 's' : ''}. With 5+ the AI finds stronger patterns and creates more compelling Reels.`,
      cta: 'Get your QR code →',
      href: '/qr',
    }
  }

  return null
}

export function NextAction({ totalReviews, reelsCreated, drafts, instagramConnected, daysSinceLastReview, brandColor }: Props) {
  const action = pickAction({ totalReviews, reelsCreated, drafts, instagramConnected, daysSinceLastReview })

  if (!action) return null

  return (
    <div
      className="rounded-2xl border p-5 mb-6 flex items-center gap-5"
      style={{
        borderColor: action.urgent ? '#fca5a5' : `${brandColor}30`,
        background: action.urgent ? '#fef2f2' : `${brandColor}08`,
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: action.urgent ? '#fee2e2' : `${brandColor}15` }}
      >
        {action.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--ink)' }}>
          {action.heading}
        </p>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--ink3)' }}>
          {action.body}
        </p>
      </div>
      <a
        href={action.href}
        className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90 whitespace-nowrap"
        style={{ background: action.urgent ? '#ef4444' : brandColor, color: 'white' }}
      >
        {action.cta}
      </a>
    </div>
  )
}
