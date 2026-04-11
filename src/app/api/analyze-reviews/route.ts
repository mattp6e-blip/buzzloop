import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { Review, ReelTheme } from '@/types'

function currentWeekOf(): string {
  const d = new Date()
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const weekNo = Math.ceil((((d.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

const client = new Anthropic()

export function buildReviewList(reviews: Review[]): string {
  return reviews.map(r => {
    const anchor = r.anchor_sentence ? ` [ANCHOR: "${r.anchor_sentence}"]` : ''
    return `[ID: ${r.id}] ${r.star_rating}★ — "${r.what_they_liked}"${r.customer_name ? ` — ${r.customer_name}` : ''}${anchor}`
  }).join('\n')
}

// ── Cluster system ────────────────────────────────────────────────────────────

type ClusterName =
  | 'dental' | 'medical' | 'therapeutic' | 'mental_health' | 'cosmetic'
  | 'hair' | 'nails' | 'wellness' | 'fitness' | 'tattoo'
  | 'restaurant' | 'cafe' | 'bar' | 'hospitality'
  | 'vet' | 'professional' | 'automotive' | 'education' | 'event' | 'default'

interface ClusterConfig {
  name: string
  contentFocus: string
  hookFrameworks: string
  avoidTypes: string
  counts: { socialProof: number; educational: number; mythBust: number; experience: number; behindScenes: number }
}

const INDUSTRY_TO_CLUSTER: Record<string, ClusterName> = {
  // Dental & Oral
  dental: 'dental', orthodontist: 'dental', oral_surgeon: 'dental',
  // Medical & Diagnostic
  optician: 'medical', gp: 'medical', audiologist: 'medical', podiatrist: 'medical',
  paediatrician: 'medical', sleep_clinic: 'medical',
  // Therapeutic & Recovery
  physiotherapy: 'therapeutic', chiropractor: 'therapeutic', osteopath: 'therapeutic', sports_medicine: 'therapeutic',
  // Mental & Emotional Health
  therapist: 'mental_health', psychiatrist: 'mental_health', psychologist: 'mental_health',
  fertility_clinic: 'mental_health', counselling: 'mental_health',
  // Cosmetic & Aesthetics
  cosmetic_clinic: 'cosmetic', dermatologist: 'cosmetic', plastic_surgery: 'cosmetic',
  weight_loss_clinic: 'cosmetic', aesthetics: 'cosmetic',
  // Hair & Barbershop
  salon: 'hair', barbershop: 'hair', hair_extensions: 'hair',
  // Nails, Lash & Brow
  nail_salon: 'nails', lash_brow: 'nails', waxing: 'nails',
  // Body & Wellness
  spa: 'wellness', yoga: 'wellness', pilates: 'wellness', massage: 'wellness',
  meditation: 'wellness', float_tank: 'wellness',
  // Fitness & Performance
  gym: 'fitness', personal_trainer: 'fitness', crossfit: 'fitness', boxing: 'fitness',
  martial_arts: 'fitness', cycling_studio: 'fitness', swimming: 'fitness',
  // Tattoo & Permanent Art
  tattoo: 'tattoo', microblading: 'tattoo', permanent_makeup: 'tattoo', piercing: 'tattoo',
  // Restaurant & Dining
  restaurant: 'restaurant', fine_dining: 'restaurant', casual_dining: 'restaurant',
  // Cafe, Bakery & Dessert
  cafe: 'cafe', bakery: 'cafe', dessert_shop: 'cafe', juice_bar: 'cafe',
  // Bar & Nightlife
  bar: 'bar', cocktail_bar: 'bar', pub: 'bar', wine_bar: 'bar', nightclub: 'bar',
  // Hospitality
  hotel: 'hospitality', boutique_hotel: 'hospitality', bnb: 'hospitality',
  vacation_rental: 'hospitality', event_venue: 'hospitality',
  // Veterinary & Paediatric
  veterinary: 'vet', pet_grooming: 'vet', pet_boarding: 'vet', dog_training: 'vet',
  // Professional & High Stakes
  lawyer: 'professional', accountant: 'professional', financial_advisor: 'professional',
  mortgage_broker: 'professional', real_estate: 'professional',
  // Automotive
  mechanic: 'automotive', car_detailing: 'automotive', tyre_shop: 'automotive',
  body_shop: 'automotive', car_dealership: 'automotive',
  // Education & Skills
  tutoring: 'education', language_school: 'education', music_school: 'education',
  art_school: 'education', driving_school: 'education', dance_studio: 'education',
  // Event & Occasion
  photographer: 'event', florist: 'event', catering: 'event', wedding_planner: 'event',
}

const CLUSTER_CONFIGS: Record<ClusterName, ClusterConfig> = {
  dental: {
    name: 'Dental & Oral',
    contentFocus: 'Address real fears. The viewer is avoiding something they know they should do. Meet the anxiety directly — pain, cost, appearance. Teach things that change the booking decision.',
    hookFrameworks: `1. FEAR OVERCOME: "Most people avoid [treatment] because of [specific fear]. Here's what actually happens." — myth_bust
2. PROCESS REVEAL: "What actually happens in the first [X] minutes. Nobody explains this." — behind_scenes
3. COST OF WAITING: "The [symptom] most people ignore. What it becomes in [time]." — educational
4. EXPECTATION FLIP: "She expected [negative]. Instead: [positive surprise]." — needs review evidence
5. CAPABILITY PROOF: "[Treatment] in [surprisingly short time]. Most don't know this exists." — educational
6. LOYALTY BEHAVIOR: "She drove [distance]. Every [frequency]. Her reason:" — social proof
7. BEHAVIORAL PROOF: "[Specific unexpected behavior that implies quality]" — social proof`,
    avoidTypes: 'sensory/experience — nobody feels sensory joy about dental visits',
    counts: { socialProof: 2, educational: 2, mythBust: 2, experience: 0, behindScenes: 1 },
  },

  medical: {
    name: 'Medical & Diagnostic',
    contentFocus: 'Health anxiety and the cost of ignoring symptoms. The viewer is googling their symptoms at 2am and putting off booking. Teach things that make them act.',
    hookFrameworks: `1. COST OF IGNORING: "The [symptom] most people push through. What it becomes." — educational
2. HIDDEN SIGN: "The [sign] most people miss. What it actually means." — educational
3. FEAR ADDRESSED: "She put it off for [time]. Here's what she found out." — needs review evidence
4. PROCESS REVEAL: "What a [checkup/test] actually involves. Most people are surprised." — behind_scenes
5. LOYALTY BEHAVIOR: "[Patient behavior that implies trust and quality]" — social proof
6. MYTH BUST: "Most people think [health belief]. Specialists disagree." — myth_bust`,
    avoidTypes: 'sensory — not relevant for medical',
    counts: { socialProof: 2, educational: 2, mythBust: 1, experience: 0, behindScenes: 1 },
  },

  therapeutic: {
    name: 'Therapeutic & Recovery',
    contentFocus: 'Pain, recovery, and widespread myths about both. The viewer is pushing through pain they shouldn\'t or avoiding treatment they need. Correct the myths, show real results.',
    hookFrameworks: `1. PAIN MYTH: "You think you should push through [pain]. Physios disagree." — myth_bust
2. RECOVERY MYTH: "Most people think recovery means [wrong belief]. Here's what actually works." — myth_bust
3. TRANSFORMATION: "[Problem] for [time]. Fixed in [X sessions]." — needs review evidence
4. FEAR OF WORSENING: "Ignoring [pain signal] for [time]. What it means." — educational
5. PROCESS REVEAL: "What the first session actually involves. Most people are surprised." — educational
6. LOYALTY PROOF: "She's been coming every [frequency] for [time]. Her reason:" — social proof`,
    avoidTypes: 'sensory — not relevant',
    counts: { socialProof: 2, educational: 2, mythBust: 2, experience: 1, behindScenes: 0 },
  },

  mental_health: {
    name: 'Mental & Emotional Health',
    contentFocus: 'Stigma, vulnerability, and "is this normal." The viewer has been putting this off because of shame or fear of judgement. Meet them where they are — not with clinical language, with human honesty.',
    hookFrameworks: `1. NORMALISATION: "Most people feel [thing] and think they\'re alone. They\'re not." — myth_bust
2. STIGMA BUST: "She was ashamed to book. Here\'s what she found out." — needs review evidence
3. IS THIS NORMAL: "The [thought/feeling] most people never say out loud. It\'s more common than you think." — educational
4. TRANSFORMATION: "She\'d been managing [struggle] for [time]. [X months] later:" — needs review evidence
5. FEAR OF JUDGEMENT: "What actually happens in the first session. No judgement, no pressure." — educational
6. LOYALTY PROOF: "[Patient behavior that shows ongoing trust]" — social proof`,
    avoidTypes: 'sensory, behind_scenes — inappropriate for this industry',
    counts: { socialProof: 2, educational: 2, mythBust: 2, experience: 1, behindScenes: 0 },
  },

  cosmetic: {
    name: 'Cosmetic & Aesthetics',
    contentFocus: 'Self-image, transformation, and fear of looking unnatural. The viewer wants results but is scared of going too far or looking wrong. Show real transformations and address the fear directly.',
    hookFrameworks: `1. FEAR OF OVERDOING: "She was scared of looking [unnatural/overdone]. Here\'s what happened." — myth_bust
2. TRANSFORMATION: "[Concern] she\'d had for [time]. Here\'s what changed." — needs review evidence
3. BEFORE/AFTER PROOF: "What [treatment] actually looks like when it\'s done right." — experience
4. LOYALTY BEHAVIOR: "She comes every [frequency]. Has for [time]. Her reason:" — social proof
5. PROCESS REVEAL: "What [treatment] actually involves. From start to finish." — behind_scenes
6. NATURAL RESULT PROOF: "Nobody guessed she\'d had [treatment]. Her words:" — social proof`,
    avoidTypes: 'nothing specific',
    counts: { socialProof: 3, educational: 1, mythBust: 1, experience: 1, behindScenes: 1 },
  },

  hair: {
    name: 'Hair & Barbershop',
    contentFocus: 'Transformation, trust in the stylist, and the emotional weight of a bad haircut. The viewer has had a bad experience elsewhere and is hesitant. Show the result and the relationship.',
    hookFrameworks: `1. TRANSFORMATION: "She\'d been wearing the same style for [time]. Here\'s what changed." — needs review evidence
2. TRUST PROOF: "She drives [distance] past [number] salons. Her reason:" — social proof
3. FEAR ADDRESSED: "She was nervous about going [short/different]. Here\'s what happened." — needs review evidence
4. LOYALTY: "Same stylist for [time]. Every [frequency]. Her reason:" — social proof
5. RESULT REVEAL: "What [hair transformation] looks like when it\'s done right." — experience
6. MYTH BUST: "[Hair myth most people believe]. Here\'s what actually damages your hair." — myth_bust`,
    avoidTypes: 'educational — nobody wants a hair science lecture',
    counts: { socialProof: 3, educational: 0, mythBust: 1, experience: 1, behindScenes: 1 },
  },

  nails: {
    name: 'Nails, Lash & Brow',
    contentFocus: 'Precision, result, and self-expression. The viewer wants to see the work. Show the transformation and the craft. Loyalty behavior is powerful here — regular clients tell the story.',
    hookFrameworks: `1. RESULT REVEAL: "What [service] looks like when it\'s done right." — experience
2. LOYALTY: "She books every [frequency]. Has for [time]. Same technician." — social proof
3. TRANSFORMATION: "[Before state] to [after state]. Her reaction:" — needs review evidence
4. PRECISION PROOF: "What goes into [service] that most people never see." — behind_scenes
5. MYTH BUST: "Most people think [gel/lash/brow myth]. Here\'s the truth." — myth_bust
6. BEHAVIORAL PROOF: "[Specific behavior that implies quality — drove distance, rebooks immediately]" — social proof`,
    avoidTypes: 'educational',
    counts: { socialProof: 3, educational: 0, mythBust: 1, experience: 1, behindScenes: 1 },
  },

  wellness: {
    name: 'Body & Wellness',
    contentFocus: 'Sensory escape, ritual, and decompression. The viewer is stressed and overwhelmed. Make them feel calm just watching. Education is welcome when it explains why something works.',
    hookFrameworks: `1. SENSORY MOMENT: "What [treatment] actually feels like. From the first minute." — experience
2. TRANSFORMATION: "She came in [state]. Left [feeling]. Her words:" — needs review evidence
3. RITUAL PROOF: "She comes every [frequency]. Has for [time]." — social proof
4. EDUCATION: "What actually happens to your body during [treatment]. Most people don\'t know this." — educational
5. MYTH BUST: "Most people think [wellness myth]. Here\'s what actually helps." — myth_bust
6. FIRST VISIT: "What your first [class/session] actually feels like. Nobody tells you this." — experience`,
    avoidTypes: 'nothing specific',
    counts: { socialProof: 2, educational: 1, mythBust: 1, experience: 2, behindScenes: 1 },
  },

  fitness: {
    name: 'Fitness & Performance',
    contentFocus: 'Transformation, community, and the fear of starting. The viewer wants to change but is intimidated. Show real results. Address the fear of feeling out of place.',
    hookFrameworks: `1. TRANSFORMATION: "She came in [state/fear]. [Time] later: [result]." — needs review evidence
2. FEAR OF STARTING: "The thing stopping most people from starting. It\'s not what you think." — myth_bust
3. COMMUNITY PROOF: "He hasn\'t missed [frequency] in [time]. His reason:" — social proof
4. MYTH BUST: "The [exercise/fitness belief] most people get wrong. Here\'s why it matters." — myth_bust
5. FIRST SESSION: "What the first [class/session] actually feels like. Nobody tells you this." — educational
6. RESULTS PROOF: "[Specific achievement] in [time]. Her words:" — social proof`,
    avoidTypes: 'sensory, behind_scenes',
    counts: { socialProof: 3, educational: 1, mythBust: 1, experience: 1, behindScenes: 0 },
  },

  tattoo: {
    name: 'Tattoo & Permanent Art',
    contentFocus: 'The artist\'s reputation, the permanence, and the design itself. The viewer is deciding who to trust with something on their body forever. Show the craft. Show the process.',
    hookFrameworks: `1. ARTIST REPUTATION: "She researched [number] artists before choosing. Her reason:" — social proof
2. PROCESS REVEAL: "What actually happens during a [type] tattoo. Most people don\'t know this." — behind_scenes
3. CRAFT REVEAL: "What goes into designing [type] that most clients never see." — behind_scenes
4. PERMANENCE PROOF: "She\'d been thinking about this for [time]. Here\'s what she chose." — social proof
5. MYTH BUST: "Most people think [tattoo myth]. Here\'s the truth." — myth_bust
6. RESULT REVEAL: "What [style] looks like when it\'s done right." — experience`,
    avoidTypes: 'educational',
    counts: { socialProof: 2, educational: 0, mythBust: 1, experience: 1, behindScenes: 2 },
  },

  restaurant: {
    name: 'Restaurant & Dining',
    contentFocus: 'Food quality, atmosphere, and loyalty. Make people hungry, envious, or feel like they\'re missing out. Nobody wants to be educated about food — they want to feel something.',
    hookFrameworks: `1. LOYALTY BEHAVIOR: "She\'s been coming every [day/week] for [time]. Same order every time." — social proof
2. DRIVE-FOR-IT: "She drove [distance] for this. Came back [frequency]." — social proof
3. SENSORY REVEAL: "What [signature dish] looks like when it\'s done right." — experience
4. ATMOSPHERE MOMENT: "What a [Friday/Saturday] night here actually looks like." — experience
5. BEHIND THE PASS: "What goes into [signature dish] that most people never see." — behind_scenes
6. RESERVATION PROOF: "The table they book [X weeks] in advance. Every [day]." — social proof`,
    avoidTypes: 'educational, myth_bust',
    counts: { socialProof: 3, educational: 0, mythBust: 0, experience: 2, behindScenes: 1 },
  },

  cafe: {
    name: 'Cafe, Bakery & Dessert',
    contentFocus: 'Ritual, craft, and the sensory moment. The morning coffee, the fresh bread, the treat. Make people feel the ritual and crave the product.',
    hookFrameworks: `1. RITUAL PROOF: "She stops here every morning. Has for [time]." — social proof
2. CRAFT REVEAL: "What goes into [product] that most people never see." — behind_scenes
3. SENSORY MOMENT: "What [signature item] looks like when it comes out of the oven." — experience
4. LOYALTY: "He\'s had the same order for [time]. Here\'s why he never changes it." — social proof
5. MORNING RITUAL: "What [time] looks like here. Every single day." — experience
6. PRODUCT REVEAL: "The [item] most people don\'t order. It\'s the best thing we make." — experience`,
    avoidTypes: 'educational, myth_bust',
    counts: { socialProof: 2, educational: 0, mythBust: 0, experience: 3, behindScenes: 1 },
  },

  bar: {
    name: 'Bar & Nightlife',
    contentFocus: 'Atmosphere, craft, and FOMO. Make people feel like they\'re missing the best night. Show the craft behind the drinks and the energy of the space.',
    hookFrameworks: `1. ATMOSPHERE FOMO: "What a [Friday/Saturday] night here actually looks like." — experience
2. CRAFT REVEAL: "How we make [signature cocktail]. It\'s not what you think." — behind_scenes
3. LOYALTY: "He\'s been here every [day] for [time]. Same order." — social proof
4. SENSORY: "What [signature drink] looks like when it\'s done right." — experience
5. HIDDEN GEM: "The [menu item/cocktail] nobody orders. It\'s the best thing we make." — experience
6. BEHAVIORAL PROOF: "[Customer behavior that implies this is the best in the area]" — social proof`,
    avoidTypes: 'educational, myth_bust',
    counts: { socialProof: 2, educational: 0, mythBust: 0, experience: 3, behindScenes: 1 },
  },

  hospitality: {
    name: 'Hospitality',
    contentFocus: 'Experience, hidden details, and discovery. Make people feel like they\'d be missing something special if they stayed anywhere else.',
    hookFrameworks: `1. HIDDEN DETAIL: "The thing guests find in their room every morning." — experience
2. LOYALTY: "She stays here every time she visits [city]. Her reason:" — social proof
3. LOCAL SECRET: "The spot our guests ask about every single checkout." — experience
4. EXPERIENCE MOMENT: "What checking in here actually feels like." — experience
5. BEHIND THE SCENES: "What happens before you arrive that you never see." — behind_scenes
6. BEHAVIORAL PROOF: "[Guest behavior that implies this is worth the price]" — social proof`,
    avoidTypes: 'educational, myth_bust',
    counts: { socialProof: 2, educational: 0, mythBust: 0, experience: 2, behindScenes: 1 },
  },

  vet: {
    name: 'Veterinary & Pet Care',
    contentFocus: 'Emotional investment and fear. The owner is anxious, often avoidant, and highly protective. Reassure them. Teach them the signs they\'re missing. Show the care.',
    hookFrameworks: `1. HIDDEN SIGN: "The [sign] in your dog/cat most owners miss. What it means." — educational
2. FEAR ADDRESSED: "She was terrified to bring him in. Here\'s what happened." — needs review evidence
3. COST OF IGNORING: "[Symptom] most pet owners push through. What it becomes." — educational
4. MYTH BUST: "Most owners think [belief]. Vets disagree. Here\'s why." — myth_bust
5. LOYALTY: "She\'s been bringing [pet name/breed] here for [time]. Her reason:" — social proof
6. CARE PROOF: "[Specific behavior from staff or outcome that proves genuine care]" — social proof`,
    avoidTypes: 'sensory',
    counts: { socialProof: 2, educational: 3, mythBust: 1, experience: 1, behindScenes: 0 },
  },

  professional: {
    name: 'Professional & High Stakes',
    contentFocus: 'Fear of complexity, being taken advantage of, and making the wrong decision. The viewer is intimidated. Simplify. Demystify. Show outcomes, not process.',
    hookFrameworks: `1. FEAR OF COMPLEXITY: "Most people think [legal/financial process] is complicated. It\'s not." — myth_bust
2. COST OF WAITING: "She put off [legal/financial decision] for [time]. What it cost her." — educational
3. MYTH BUST: "Most people believe [common misconception]. Here\'s what\'s actually true." — myth_bust
4. OUTCOME PROOF: "She came in with [problem]. Left with [resolution]. Her words:" — social proof
5. TRUST PROOF: "[Number] years. [Specific outcome or credential]. What it means for you." — educational
6. BEHAVIORAL PROOF: "[Client behavior that implies trust — returned, referred, stayed for years]" — social proof`,
    avoidTypes: 'sensory, experience',
    counts: { socialProof: 2, educational: 2, mythBust: 2, experience: 0, behindScenes: 0 },
  },

  automotive: {
    name: 'Automotive',
    contentFocus: 'Distrust and transparency. The viewer assumes they\'ll be overcharged or misled. Earn trust by being radically transparent. Myth bust is the single most powerful format here.',
    hookFrameworks: `1. TRANSPARENCY MYTH: "Most mechanics charge for [thing]. You don\'t need it. Here\'s why." — myth_bust
2. RIP-OFF MYTH: "The [warning light/symptom] most garages use to overcharge. What it actually means." — myth_bust
3. COST MYTH: "She was quoted [price] elsewhere. Here\'s what it actually cost." — social proof
4. PROCESS REVEAL: "What actually happens when your car goes in. Most people never see this." — behind_scenes
5. LOYALTY: "He\'s been bringing his car here for [time]. His reason:" — social proof
6. MYTH BUST: "[Common car care belief] that\'s costing you money." — myth_bust`,
    avoidTypes: 'sensory, experience',
    counts: { socialProof: 2, educational: 1, mythBust: 3, experience: 0, behindScenes: 1 },
  },

  education: {
    name: 'Education & Skills',
    contentFocus: 'Progress, transformation, and the fear of not being good enough to start. Show the journey. Make people believe they can do it.',
    hookFrameworks: `1. TRANSFORMATION: "She couldn\'t [skill] at all. [Time] later:" — needs review evidence
2. FEAR OF STARTING: "Most people think they\'re too [old/bad/busy] to start. Here\'s the truth." — myth_bust
3. PROGRESS PROOF: "[Specific milestone achieved]. How long it actually took." — educational
4. LOYALTY: "She\'s been coming every [frequency] for [time]. What changed:" — social proof
5. MYTH BUST: "Most people think learning [skill] takes [long time]. Here\'s what actually works." — myth_bust
6. PROCESS: "What the first [lesson/session] actually looks like. No pressure, no judgement." — educational`,
    avoidTypes: 'sensory',
    counts: { socialProof: 2, educational: 2, mythBust: 2, experience: 1, behindScenes: 0 },
  },

  event: {
    name: 'Event & Occasion',
    contentFocus: 'High-stakes moments. The viewer is trusting this business with something that cannot be redone. Show craft, care, and the emotional weight of getting it right.',
    hookFrameworks: `1. CRAFT REVEAL: "What goes into [service] that most clients never see." — behind_scenes
2. HIGH STAKES PROOF: "She trusted us with [important occasion]. Her words:" — social proof
3. PROCESS REVEAL: "What [service] looks like on the day. From the first hour." — behind_scenes
4. LOYALTY/REFERRAL: "She recommended us to [number] people after her [event]. Her reason:" — social proof
5. EMOTIONAL MOMENT: "The moment [bride/client] saw [result] for the first time." — experience
6. MYTH BUST: "Most people think [planning myth]. Here\'s what actually matters." — myth_bust`,
    avoidTypes: 'educational',
    counts: { socialProof: 2, educational: 0, mythBust: 1, experience: 2, behindScenes: 2 },
  },

  default: {
    name: 'Local Business',
    contentFocus: 'Show what makes this business worth choosing over every alternative nearby.',
    hookFrameworks: `1. LOYALTY BEHAVIOR: "[Specific customer behavior that implies quality]" — social proof
2. UNEXPECTED PROOF: "[Thing a stranger would find surprising about this business]" — social proof
3. PROCESS REVEAL: "What most customers never see that would impress them." — behind_scenes
4. FEAR ADDRESSED: "The thing holding most people back from booking." — myth_bust
5. TRANSFORMATION: "[Before state]. [After state]. Their words." — needs review evidence`,
    avoidTypes: 'nothing specific',
    counts: { socialProof: 2, educational: 1, mythBust: 1, experience: 1, behindScenes: 1 },
  },
}

export function getClusterConfig(industry: string): ClusterConfig {
  const clusterName = INDUSTRY_TO_CLUSTER[industry] ?? 'default'
  return CLUSTER_CONFIGS[clusterName]
}

export function getAnalysisPrompt(reviewList: string, industry: string, businessName: string, reviewCount: number, language: string, socialProofCount: number, excludeTitles: string[] = []): string {
  const excludeBlock = excludeTitles.length > 0
    ? `\nALREADY GENERATED — do NOT produce ideas that overlap with these themes:\n${excludeTitles.map(t => `- "${t}"`).join('\n')}\nEach new theme must be built around a different review, a different behavior, or a different angle entirely.\n`
    : ''
  return `You are the creative director behind the highest-performing local business Instagram Reels. Find the reel ideas that will genuinely stop someone's scroll.

Business: ${businessName} (${industry})
Total qualifying reviews: ${reviewCount}

REVIEWS (sorted by remarkability — strongest raw material first):
${reviewList}

---

LANGUAGE: Write every field of your JSON in ${language}.
${excludeBlock}
---

Find exactly ${socialProofCount} social proof reel ideas from these reviews. Each is one of two types:

## TYPE: story
Built around ONE extraordinary review. The anchor sentence is so specific and surprising it can carry a full reel.

What makes an anchor sentence extraordinary:
- Behavioral proof (flew from abroad, drove 2 hours, chose this over a free/closer option)
- Expectation violation (fell asleep in the dentist chair, fixed in 20 min what 3 others couldn't)
- Specific number + context (37 years, every Friday for 6 years, 4 cancellations before coming)
- Unexpected advocate (child chose it, expert with all options chose this, skeptic converted)

Hook: customer as subject, never the business.
GOOD: "She flies from Norway. Free dentistry there."
BAD: "Our patients travel from around the world."

## TYPE: pattern
Built around a SHARED SIGNAL across 3+ reviews. Multiple customers noticed the same specific thing.

Hook: reveals the shared truth as a surprising fact.
GOOD: "Three different people. Same story. They all came back."
BAD: "Our customers love the experience."

---

BUZZ SCORE (1-100):
90-100: Hook writes itself. Behavioral proof or expectation violation so strong a stranger stops scrolling.
75-89: Strong specific material. Needs light shaping.
60-74: Good material but hook requires more work.
Below 60: Skip it.

---

RULES:
- Only include themes where the hook does NOT name the business or sound like an ad
- Story reels need one extraordinary anchor — skip if anchor is generic
- Pattern reels need 3+ reviews genuinely sharing the signal
- Never generate two themes built around the same underlying story or behaviour
- Return exactly ${socialProofCount} themes, ranked by buzzScore descending
- Set contentType to "social_proof" for all themes

Return ONLY valid JSON:
{
  "themes": [
    {
      "id": "unique-slug",
      "title": "Reel idea as scroll-stopping fact (under 10 words)",
      "hook": "The hook — customer as subject, no business name (max 8 words)",
      "reelType": "story | pattern",
      "contentType": "social_proof",
      "keyPhrase": "the specific remarkable thing",
      "emoji": "ONE emoji",
      "reviewIds": ["id1", "id2"],
      "anchorReviewId": "id1",
      "buzzScore": 85,
      "buzzReason": "One sentence, max 12 words, explaining why this stops the scroll"
    }
  ]
}

For story reels: reviewIds = anchor + 1-2 supporting reviews. anchorReviewId = primary.
For pattern reels: reviewIds = all reviews sharing the pattern (min 3). anchorReviewId omitted.`
}

export function getVarietyPrompt(
  industry: string,
  businessName: string,
  reviewList: string,
  language: string,
  businessContext: string | null | undefined,
  cluster: ClusterConfig,
  excludeTitles: string[] = [],
): string {
  const contextBlock = businessContext
    ? `\nBUSINESS CONTEXT (use this to make every idea specific to what they actually offer):\n${businessContext}\n`
    : ''
  const excludeBlock = excludeTitles.length > 0
    ? `\nALREADY GENERATED — do NOT produce ideas that overlap with these themes:\n${excludeTitles.map(t => `- "${t}"`).join('\n')}\nFind genuinely different angles, topics, and hooks.\n`
    : ''

  const { educational, mythBust, experience, behindScenes } = cluster.counts
  const totalVariety = educational + mythBust + experience + behindScenes

  const countInstructions = [
    educational > 0 ? `- ${educational} educational` : '',
    mythBust > 0 ? `- ${mythBust} myth_bust` : '',
    experience > 0 ? `- ${experience} experience (sensory/atmosphere)` : '',
    behindScenes > 0 ? `- ${behindScenes} behind_scenes` : '',
  ].filter(Boolean).join('\n')

  return `You are a creative director building scroll-stopping Reels for a ${cluster.name} business.

Business: ${businessName} (${industry})
LANGUAGE: Write every field in ${language}.
${contextBlock}${excludeBlock}
CONTENT FOCUS FOR THIS INDUSTRY:
${cluster.contentFocus}

AVOID: ${cluster.avoidTypes}

---

${cluster.hookFrameworks}

---

CONTENT TYPE DEFINITIONS:

educational: A specific fact, process, or insight that potential customers are Googling at 2am. Not a customer story — this is industry knowledge. The hook reveals something surprising or little-known that changes how the viewer thinks.

myth_bust: Names a specific fear or misconception that is stopping people from booking — and pivots to the truth. The fear must be real and widely held. The hook should make someone think "wait, is that actually true?"

experience: Puts the viewer inside a specific sensory or atmospheric moment. Makes someone feel they're missing out. Source: emotional language from reviews + atmosphere of this type of business.

behind_scenes: Reveals something that happens that customers never see. Specific process, craft, or preparation detail. Must be genuinely surprising to a non-expert.

---

YOUR PROCESS:

For educational and myth_bust: Think like a patient/customer who is scared, confused, or avoidant. What specific thing are they wrong about? What would genuinely change their decision if they knew it? The hook must reveal something specific — not a generic question, not a template. Source: industry knowledge only, not the reviews.

For experience and behind_scenes: Scan the reviews for specific sensory words, emotional moments, or process details. Build the hook around the most specific, vivid detail you find.

HOOK QUALITY TEST — before writing any hook, ask: would a stranger scrolling at 150 posts per second stop for this? If the hook sounds like a template ("You think X. Here's the truth.") — rewrite it. If it could apply to any dental/gym/salon in the world — it's too generic, make it specific. If it answers a question nobody was asking — scrap it.

CONTENT MIX REQUIRED — generate exactly ${totalVariety} ideas with this exact breakdown:
${countInstructions}

HOOK RULES:
- Max 8 words. Every word earns its place.
- Never names the business. Never sounds like an ad.
- Must be specific enough that a stranger immediately knows what they're about to learn or see
- No templates. No fill-in-the-blank structures. Write the actual hook.

---

REVIEWS — scan for experience/behind_scenes evidence only:
${reviewList}

---

Return ONLY valid JSON with exactly ${totalVariety} themes. Each theme must have the contentType that matches its definition above:
{
  "themes": [
    {
      "id": "unique-slug",
      "title": "Reel idea as a scroll-stopping fact (under 10 words)",
      "hook": "The actual hook — max 8 words, specific, not a template",
      "reelType": "pattern",
      "contentType": "educational | myth_bust | experience | behind_scenes",
      "keyPhrase": "the specific topic in 4-6 words",
      "emoji": "ONE relevant emoji",
      "reviewIds": [],
      "buzzReason": "One sentence: the specific reason a stranger would stop for this — not generic praise"
    }
  ]
}`
}

export async function POST(req: NextRequest) {
  try {
    const { reviews: rawReviews, businessId, industry = 'other', businessName = '', language = 'English', businessContext, excludeThemeTitles = [] }: {
      reviews: Review[]
      businessId: string
      industry?: string
      businessName?: string
      language?: string
      businessContext?: string | null
      excludeThemeTitles?: string[]
    } = await req.json()

    if (!rawReviews?.length) {
      return NextResponse.json({ themes: [] })
    }

    // Use GBP reviews only
    const gbpReviews = rawReviews.filter(r => r.posted_to_google)
    if (!gbpReviews.length) return NextResponse.json({ themes: [] })

    // Sort by remarkability score (scored reviews first, then unscored by length as proxy)
    const sorted = [...gbpReviews].sort((a, b) => {
      const aScore = a.remarkability_score ?? (a.what_they_liked.length > 100 ? 30 : 10)
      const bScore = b.remarkability_score ?? (b.what_they_liked.length > 100 ? 30 : 10)
      return bScore - aScore
    })

    // Tiered input: feed top reviews based on total count
    const inputCap = sorted.length <= 10 ? sorted.length
      : sorted.length <= 30 ? Math.min(sorted.length, 20)
      : sorted.length <= 100 ? 40
      : 60

    const topReviews = sorted.slice(0, inputCap)
    const reviewList = buildReviewList(topReviews)
    const langSystem = `You must respond in ${language} only. Every word of your JSON output must be in ${language}. This is non-negotiable regardless of the business name or location.`

    const cluster = getClusterConfig(industry)

    // Run social proof analysis + content variety generation in parallel
    const [proofMessage, varietyMessage] = await Promise.all([
      client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 2000,
        system: langSystem,
        messages: [{ role: 'user', content: getAnalysisPrompt(reviewList, industry, businessName, gbpReviews.length, language, cluster.counts.socialProof, excludeThemeTitles) }],
      }),
      client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 2500,
        system: langSystem,
        messages: [{ role: 'user', content: getVarietyPrompt(industry, businessName, reviewList, language, businessContext, cluster, excludeThemeTitles) }],
      }),
    ])

    const parseThemes = (text: string): ReelTheme[] => {
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) return []
      try {
        const parsed = JSON.parse(match[0])
        return parsed.themes ?? (Array.isArray(parsed) ? parsed : [])
      } catch { return [] }
    }

    const proofRaw = (proofMessage.content[0] as { text: string }).text
    const varietyRaw = (varietyMessage.content[0] as { text: string }).text

    console.log('[analyze-reviews] proof raw length:', proofRaw.length)
    console.log('[analyze-reviews] variety raw length:', varietyRaw.length)
    console.log('[analyze-reviews] variety raw snippet:', varietyRaw.slice(0, 300))

    const proofThemes = parseThemes(proofRaw)
    const varietyThemes = parseThemes(varietyRaw)

    console.log('[analyze-reviews] proof themes:', proofThemes.length)
    console.log('[analyze-reviews] variety themes:', varietyThemes.length, varietyThemes.map(t => t.contentType))

    // Social proof sorted by buzzScore, variety appended after
    const proofSorted = proofThemes.sort((a, b) => (b.buzzScore ?? 0) - (a.buzzScore ?? 0))
    const weekOf = currentWeekOf()
    const sorted_themes = [...proofSorted, ...varietyThemes].map(t => ({ ...t, weekOf }))

    // Cache in DB
    if (businessId && sorted_themes.length > 0) {
      const supabase = await createClient()
      await supabase.from('businesses').update({
        reel_themes: sorted_themes,
        reel_themes_review_count: gbpReviews.length,
      }).eq('id', businessId)
    }

    return NextResponse.json({ themes: sorted_themes, language })
  } catch (err) {
    console.error('[analyze-reviews]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
