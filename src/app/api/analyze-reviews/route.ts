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
  highValueTopics: string[] // Real questions/fears people Google before booking
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
    highValueTopics: [
      'Does a root canal actually hurt? (reality: most patients feel nothing — modern anaesthetic means you feel pressure, not pain)',
      'How long do dental implants actually last? (reality: lifetime with proper care — the titanium post fuses to bone permanently)',
      'Is sedation dentistry safe? (reality: very safe, widely used — the sedative is carefully dosed and monitored throughout)',
      'Can everything be fixed in one visit? (reality: many clinics now offer same-day crowns, implants, and full smile makeovers)',
      'Dental implants vs dentures — what nobody tells you (implants preserve jaw bone, dentures accelerate bone loss over time)',
      'What bone loss actually means for your options (it doesn\'t automatically rule out implants — bone grafting often makes them possible)',
      'Why your dentist says come every 6 months (it\'s not a sales tactic — gum disease is silent and reverses faster than people think)',
      'What Invisalign actually feels like vs metal braces (pressure but no sharp edges, removable for meals, most people forget they\'re wearing them)',
      'Why teeth whitening works on natural teeth but not crowns (crowns are porcelain — the chemistry only works on enamel)',
      'What actually happens during a scale and clean (ultrasonic scaler breaks up calculus, not painful — the squeaking is the machine, not your teeth)',
      'The real reason a cracked tooth is urgent (cracks spread invisibly under chewing pressure — what\'s fixable today may need extraction in 3 months)',
    ],
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
    highValueTopics: [
      'How often do you actually need an eye test? (reality: every 2 years minimum — most prescription changes are gradual and unnoticed)',
      'What hearing loss in one ear means (unilateral loss is often ignored — it strains the brain, causes fatigue, and worsens without intervention)',
      'Why foot pain isn\'t just aging (most chronic foot pain has a mechanical cause that responds well to orthotics or physio)',
      'What a full blood panel actually tells you (not just cholesterol — markers for inflammation, thyroid, iron, and vitamin deficiency most people never check)',
      'Signs your prescription has changed (headaches after screen time, squinting, and halos around lights are the most common early signs)',
      'How long it takes to fit a hearing aid and adjust to it (most people are surprised it takes 2-4 weeks for the brain to adapt)',
      'What an audiologist does that an online hearing test can\'t (they test the full frequency range, identify the type of loss, and rule out medical causes)',
      'The difference between needing glasses and needing reading glasses (presbyopia starts around 40 — it\'s normal and fixable)',
    ],
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
    highValueTopics: [
      'Should you rest or keep moving with back pain? (reality: gentle movement usually helps — complete rest makes most back pain worse)',
      'How many physio sessions does it actually take? (depends on the issue — most acute injuries improve in 4-6 sessions with the right exercises)',
      'Is cracking your own back bad for you? (cracking releases gas from joints — not harmful but also doesn\'t fix underlying stiffness)',
      'What a slipped disc actually means (the disc bulges, not slips — most resolve with conservative treatment, surgery is rarely needed)',
      'Why your back pain keeps coming back (treating symptoms without addressing posture, movement patterns, or core strength — the root cause)',
      'What happens in a chiropractic adjustment (controlled, precise force to a joint — the sound is gas releasing, not bones cracking)',
      'How to know if your pain needs imaging (most back pain doesn\'t need an MRI — scans often show changes that aren\'t actually causing your pain)',
      'What dry needling actually does (different from acupuncture — targets muscle trigger points to release tension and improve blood flow)',
    ],
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
    highValueTopics: [
      'What the first therapy session actually looks like (mostly talking about your history and goals — no lying on a couch, no being analysed)',
      'How do you know if you need therapy or just need to talk to a friend? (if the same thoughts loop without resolution, or it\'s affecting sleep/work — therapy)',
      'Does CBT actually work? (one of the most researched therapies — effective for anxiety, depression, OCD — but not the only approach)',
      'How long does therapy take to work? (most people notice a shift in 6-10 sessions — deeper patterns take longer)',
      'Is online therapy as effective as in-person? (research shows similar outcomes for most conditions — the therapeutic relationship matters more than the format)',
      'What antidepressants actually do (they don\'t change your personality — they reduce the chemical noise that makes it hard to think clearly)',
      'The difference between anxiety and an anxiety disorder (everyone feels anxious — it becomes a disorder when it stops you living your life)',
      'Why therapists don\'t give you advice (they help you find your own answers — that\'s what makes change stick)',
    ],
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
    highValueTopics: [
      'How long do fillers actually last? (depends on the area — lips 6-9 months, cheeks 12-18 months — metabolism and lifestyle affect this)',
      'Does botox hurt? (a series of small injections — most describe it as a quick pinch, numbing cream is available)',
      'What happens when filler dissolves naturally (it breaks down gradually — you return to baseline, not a worse version)',
      'How to tell if a clinic is safe (check the practitioner\'s medical qualification, not just the clinic\'s Instagram)',
      'The difference between botox and filler (botox relaxes muscles to reduce lines; filler adds volume — completely different mechanisms)',
      'Will botox make you look frozen? (only if overdone — the goal is natural movement with softer lines)',
      'What a consultation actually involves (assessment of your face structure, skin quality, and realistic outcome — no pressure to proceed)',
      'How soon can you see results from botox? (takes 3-5 days to kick in, full effect at 2 weeks)',
    ],
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
    highValueTopics: [
      'Does bleaching actually damage your hair permanently? (it weakens the structure — but with proper treatment and toning, most people maintain healthy bleached hair)',
      'What causes colour to fade fast? (hot water, sun exposure, and sulphate shampoos — the fix is simpler than most people think)',
      'Is it bad to wash your hair every day? (depends on your hair type — fine oily hair benefits from daily washing; coarse dry hair doesn\'t)',
      'What\'s the real difference between balayage and highlights? (highlights are foiled and start at the root; balayage is painted freehand for a softer grow-out)',
      'How long does a balayage actually last? (the colour itself lasts 3-4 months; the grow-out is intentionally gradual so it never looks harsh)',
      'Why a consultation matters before a big colour change (going from dark to light in one session can destroy the hair — a plan prevents this)',
    ],
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
    highValueTopics: [
      'Does gel damage your nails? (the gel doesn\'t — improper removal does. Soaking and peeling instead of proper dissolution is the cause)',
      'How often should you take breaks from gel nails? (most nail technicians say you don\'t need to if they\'re applied and removed correctly)',
      'What causes nails to peel after gel? (usually moisture trapped during application or filing through the top coat — a technique issue, not the product)',
      'Is infilling better than soak-off? (infilling preserves the nail structure and reduces filing damage — better for long-term nail health)',
      'How to spot a hygienic nail salon (sterilised metal tools, disposable files, UV steriliser visible — not just clean-looking)',
      'What\'s the difference between lash lift and lash extensions? (lift curls your natural lashes — no glue, no maintenance; extensions add length and volume but need fills)',
    ],
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
    highValueTopics: [
      'What actually happens to your nervous system during a massage (cortisol drops, serotonin rises — not just relaxation, a measurable biological response)',
      'How often should you get a massage for it to actually help? (once a month maintains; once a week resolves chronic tension)',
      'What float therapy actually does to your brain (sensory deprivation triggers theta brainwaves — the state between sleep and waking)',
      'Is yoga actually effective for stress? (the breathing activates the parasympathetic nervous system — the science behind why it works)',
      'The difference between Swedish and deep tissue massage (Swedish is circulatory and relaxing; deep tissue targets fascia and chronic muscle knots)',
      'What to expect from your first sound bath (pure vibration at specific frequencies — most people feel it in their chest before they hear it)',
    ],
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
    highValueTopics: [
      'How long before you actually see results from training? (strength improves in 2-3 weeks; visible muscle change takes 6-8 weeks — most people quit before this)',
      'Why you\'re not losing weight despite exercising (cardio creates appetite; muscle takes weeks to show — the scale lies for the first month)',
      'How many rest days do you actually need? (muscles grow during rest, not during training — 2 rest days minimum per week)',
      'Is creatine safe? (one of the most researched supplements in sports science — safe, effective, and not just for bodybuilders)',
      'What overtraining actually does to your body (cortisol spikes, sleep worsens, strength drops — more training can literally make you weaker)',
      'What the first session at a new gym actually looks like (induction, a look around, maybe a light workout — nothing intimidating)',
    ],
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
    highValueTopics: [
      'How much does a tattoo actually hurt? (depends on placement — ribs and spine are intense; outer arm and thigh are mild)',
      'What affects how well a tattoo heals? (sun exposure, picking, and tight clothing over fresh ink are the main culprits)',
      'What makes a tattoo age well vs fade fast? (line weight, ink saturation, and placement — fine lines on hands fade fastest)',
      'When do you actually need a touch-up? (most tattoos need one after 6-8 weeks — normal healing, not a quality issue)',
      'How to care for a fresh tattoo (wrap, moisture, no sun — the first 2 weeks determine how it looks for life)',
      'How to choose the right artist for your style (every artist has a specialty — matching style to artist matters more than price)',
    ],
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
    highValueTopics: [
      'What the kitchen actually looks like during a Friday night service (the choreography, the heat, the speed — most diners never see this)',
      'What goes into making a signature dish that takes hours before service even starts',
      'Why the same dish tastes different depending on where you sit (temperature, acoustics, and lighting all affect taste perception)',
      'What sourcing ingredients locally actually means for a kitchen (shorter supply chains, seasonal menus, relationships with producers)',
    ],
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
    highValueTopics: [
      'What actually happens at 5am before the cafe opens (prep, proofing, first bake — what makes the morning rush possible)',
      'Why espresso tastes different depending on the grind (extraction changes with humidity — good baristas adjust the grind every morning)',
      'What makes specialty coffee different from chain coffee (single origin, roast date, and extraction ratio — not just marketing)',
      'How sourdough starter actually works (a living culture — feeding schedule, fermentation time, and temperature all affect the final loaf)',
    ],
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
    highValueTopics: [
      'What goes into making a properly balanced cocktail (acid, sweetness, and dilution — most bars skip the dilution step)',
      'Why ice matters more than people think (large clear ice melts slower, diluting less — the difference between a good and great cocktail)',
      'What bartenders notice that most customers don\'t (the regulars, the returners, and what that says about a bar)',
      'What prep actually looks like before a bar opens (squeezing juice, batching syrups, polishing glasses — hours before the first guest)',
    ],
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
    highValueTopics: [
      'What the housekeeping team does before you arrive that you never see',
      'What early check-in actually involves vs what most hotels say',
      'The hidden amenities most guests never ask for but always wish they had',
      'What concierge actually knows that TripAdvisor doesn\'t',
    ],
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
    highValueTopics: [
      'Signs of pain in dogs that most owners miss (licking paws, yawning repeatedly, and avoiding stairs are often pain signals, not boredom)',
      'How often do cats actually need vet checkups? (once a year minimum — cats hide illness extremely well)',
      'What pet dental disease actually looks like and why it matters (bacteria from the mouth enters the bloodstream and affects the heart and kidneys)',
      'Is pet insurance worth it? (one emergency surgery averages more than 3 years of insurance premiums)',
      'What vaccinations your pet actually needs each year vs every 3 years (core vaccines are triennial; kennel cough and leptospirosis are annual)',
      'What anaesthesia for pets actually involves (pre-op bloodwork, monitoring throughout, recovery care — not scary when you understand it)',
      'What the signs of anxiety in cats look like (hiding, over-grooming, not using the litter box — often mistaken for bad behavior)',
      'Why older dogs slow down — and when it\'s more than just age (arthritis is common but treatable; many owners assume it\'s just aging)',
    ],
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
    highValueTopics: [
      'What a first consultation with a lawyer actually involves (not a commitment — it\'s an assessment of your situation and options)',
      'How much a will actually costs vs what people assume (most basic wills are completed in one appointment)',
      'When you actually need a lawyer vs when you can handle it yourself (anything involving property, divorce, or employment disputes — get advice)',
      'What an accountant can save you vs doing your own tax return (most self-employed people overpay by more than an accountant costs)',
      'Why waiting to deal with legal issues makes them more expensive (limitation periods, evidence decay, and escalating costs)',
      'What financial planning actually is vs what most people think (it\'s not just for wealthy people — it\'s a roadmap for your current income)',
    ],
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
    highValueTopics: [
      'What that orange engine warning light actually means (it\'s not always serious — but ignoring it for 3 months usually makes it serious)',
      'How often do you actually need an oil change? (modern synthetic oil lasts 10,000-15,000 miles — the 3,000-mile rule is outdated)',
      'When to replace brake pads vs when you have more time (thickness, not squeaking, is the real indicator)',
      'What a full service actually includes vs what many garages charge for (oil, filters, fluid levels, brake check — know what\'s in the quote)',
      'The tyre tread depth most drivers don\'t know they\'re below (legal limit is 1.6mm — handling degrades significantly before that point)',
      'What happens to your car during a diagnostic scan (the computer reads fault codes — it tells you what system failed, not what part to replace)',
      'Why dealer servicing doesn\'t void your warranty at an independent garage (EU block exemption rules — most drivers don\'t know this)',
    ],
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
    highValueTopics: [
      'How long does it actually take to become conversational in a new language? (with consistent practice, most people reach conversational level in 6-9 months)',
      'Is it too late to learn an instrument as an adult? (adults learn faster than children in the early stages — the fear of looking stupid is the real barrier)',
      'What makes tutoring actually effective vs just more time studying (targeted work on specific gaps, not more of the same — quality over quantity)',
      'How many lessons before you see real progress? (most people see a clear breakthrough around lesson 8-10)',
      'What a typical first driving lesson actually involves (introduction to controls, slow-speed manoeuvres — nothing on a main road)',
      'The difference between learning a skill and being coached (a coach identifies what\'s actually holding you back — a teacher delivers the same material to everyone)',
    ],
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
    highValueTopics: [
      'How far in advance do you actually need to book a wedding photographer? (top photographers book 12-18 months out — most people find this out too late)',
      'What makes a good wedding photo vs a great one (light, moment, and composition — and why you can\'t plan the best ones)',
      'What a florist does in the 48 hours before your wedding that clients never see',
      'How a wedding planner saves money vs costs money (vendor relationships and avoiding expensive last-minute decisions)',
      'What happens if your photographer cancels (backup plans, contracts, and what to ask before signing)',
    ],
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
    highValueTopics: [
      'What actually happens behind the scenes that customers never see',
      'The most common misconception people have before their first visit',
      'What the difference is between a good and great result in this field',
      'What to look for when choosing a business like this',
    ],
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

  const topicsBlock = cluster.highValueTopics.length > 0
    ? `\nHIGH-VALUE TOPICS FOR THIS INDUSTRY — real questions and fears people Google before booking:\n${cluster.highValueTopics.map(t => `- ${t}`).join('\n')}\n\nFor educational and myth_bust ideas: choose topics from this list that are most relevant to what this specific business offers. Use the business context and reviews to judge which topics apply. Do not invent topics outside this list.\n`
    : ''

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
${topicsBlock}
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

For educational and myth_bust:
Step 1 — Generate the topic from industry knowledge. Think like a patient/customer who is scared, confused, or avoidant. What specific thing are they wrong about? What would genuinely change their decision if they knew it?
Step 2 — After deciding the topic, scan the reviews for ONE that would work as a closing validation quote. The review must topically match — it should mention the same treatment, fear, or outcome the reel is about. A patient saying "I was so scared, now I wish I'd done it years ago" works for a sedation myth bust. A generic "great service" review does NOT.
Step 3 — If a matching review is found, include its ID in reviewIds. If nothing matches well enough, leave reviewIds as [].

For experience and behind_scenes: Scan the reviews for specific sensory words, emotional moments, or process details. Build the hook around the most specific, vivid detail you find. Include the source review ID in reviewIds.

HOOK QUALITY TEST — before writing any hook, ask: would a stranger scrolling at 150 posts per second stop for this? If the hook sounds like a template ("You think X. Here's the truth.") — rewrite it. If it could apply to any dental/gym/salon in the world — it's too generic, make it specific. If it answers a question nobody was asking — scrap it.

CONTENT MIX REQUIRED — generate exactly ${totalVariety} ideas with this exact breakdown:
${countInstructions}

HOOK RULES:
- Max 8 words. Every word earns its place.
- Never names the business. Never sounds like an ad.
- Must be specific enough that a stranger immediately knows what they're about to learn or see
- No templates. No fill-in-the-blank structures. Write the actual hook.

---

REVIEWS — scan for topic matching (edu/myth_bust closing quotes) and experience/behind_scenes evidence:
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
      "reviewIds": ["matched-review-id-or-empty"],
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

    // Always fetch fresh reviews from DB — client-side props may have stale/null remarkability scores
    const supabase = await createClient()
    const { data: freshReviews } = await supabase
      .from('reviews')
      .select('id, what_they_liked, customer_name, star_rating, posted_to_google, remarkability_score, anchor_sentence, remarkability_signal')
      .eq('business_id', businessId)
      .eq('posted_to_google', true)

    // Use DB data if available, fall back to client-provided reviews
    const gbpReviews = (freshReviews?.length ? freshReviews : rawReviews.filter(r => r.posted_to_google)) as Review[]
    if (!gbpReviews.length) return NextResponse.json({ themes: [] })

    // Sort by remarkability score (scored reviews first, unscored last)
    const sorted = [...gbpReviews].sort((a, b) => {
      const aScore = a.remarkability_score ?? -1
      const bScore = b.remarkability_score ?? -1
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
