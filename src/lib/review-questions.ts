export interface ReviewQuestion {
  id: string
  question: string
  options: string[]
  multi: boolean
  allowOther?: boolean
}

export const DEFAULT_QUESTIONS: Record<string, ReviewQuestion[]> = {
  restaurant: [
    { id: 'what',      question: 'What did you have?',  options: ['Dinner', 'Lunch', 'Brunch', 'Just drinks', 'Coffee & cake', 'Tasting menu'], multi: false },
    { id: 'highlight', question: 'What stood out?',     options: ['The food quality', 'The service', 'The atmosphere', 'The portion sizes', 'The value', 'Everything!'], multi: true },
    { id: 'vibe',      question: 'How did it feel?',    options: ['Cosy & intimate', 'Lively & fun', 'Perfect for a date', 'Great for groups', 'A hidden gem', 'Like a local favourite'], multi: false },
  ],
  dental: [
    { id: 'reason',    question: 'What brought you in?', options: ['Routine check-up & clean', 'Teeth whitening', 'A treatment or procedure', 'Emergency visit', 'First visit', 'Other...'], multi: false, allowOther: true },
    { id: 'feeling',   question: 'How did the team make you feel?', options: ['Completely at ease', 'Very professional', 'Caring & attentive', 'Safe & in good hands', 'Reassured throughout'], multi: true },
    { id: 'highlight', question: 'What impressed you most?', options: ['Pain-free experience', 'Clear explanations', 'Modern equipment', 'Friendly staff', 'How thorough they were', 'How quick it was'], multi: false },
  ],
  gym: [
    { id: 'use',    question: 'What do you mainly use?',     options: ['Free weights & lifting', 'Cardio machines', 'Group fitness classes', 'Personal training', 'Functional training area', 'The pool or recovery facilities'], multi: true },
    { id: 'keeps',  question: 'What keeps you coming back?', options: ['Seeing real results', 'The community feel', 'Quality of the equipment', 'The coaches & trainers', 'The atmosphere', 'Convenient hours'], multi: true },
    { id: 'impact', question: 'How has it changed you?',     options: ['Stronger & fitter', 'More confident', 'Built a proper routine', 'Lost weight', 'Better mental health', 'Completely hooked'], multi: false },
  ],
  salon: [
    { id: 'service',  question: 'What did you come in for?', options: ['Haircut & style', 'Colour or highlights', 'Hair treatment', 'Blow-dry', 'Nails', 'Other...'], multi: false, allowOther: true },
    { id: 'result',   question: 'How did it turn out?',      options: ['Exactly what I wanted', 'Even better than expected', 'They nailed my reference photos', 'Totally transformed'], multi: false },
    { id: 'feeling',  question: 'How did you feel leaving?', options: ["Like a new person", 'Really confident', 'Relaxed & pampered', "Couldn't stop smiling", 'Ready to show it off'], multi: false },
  ],
  spa: [
    { id: 'service',   question: 'What did you have?',      options: ['Massage', 'Facial', 'Body treatment', 'Full day package', 'Couples treatment', 'Other...'], multi: false, allowOther: true },
    { id: 'feeling',   question: 'How did you feel after?', options: ['Completely relaxed', 'Totally recharged', 'Like a new person', 'Deeply pampered', 'All tension gone'], multi: false },
    { id: 'highlight', question: 'What stood out?',         options: ['The atmosphere & ambience', "The therapist's skill", 'The facilities', 'The results on my skin or body', 'How personalised it felt', 'Everything'], multi: true },
  ],
  clinic: [
    { id: 'reason',    question: 'What brought you in?',  options: ['Routine check-up', 'A health concern', 'Follow-up appointment', 'Tests or results', 'First visit', 'Other...'], multi: false, allowOther: true },
    { id: 'care',      question: 'How was the care?',     options: ['Thorough & attentive', 'Quick & efficient', 'Warm & reassuring', 'Very professional', 'They really listened'], multi: true },
    { id: 'highlight', question: 'What stood out?',       options: ['Clear explanations', 'Short waiting time', 'Friendly & welcoming staff', 'Feeling genuinely heard', 'Easy to book', 'Left with a clear plan'], multi: false },
  ],
  retail: [
    { id: 'reason',    question: 'What brought you in?',          options: ['Looking for something specific', 'Browsing & exploring', 'Buying a gift', 'A recommendation from someone', 'Regular shopping trip', 'Saw it online first'], multi: false },
    { id: 'highlight', question: 'How was the experience?',        options: ['Found exactly what I needed', 'Staff really helped me out', 'Great range & selection', 'Really good value', 'Beautiful store layout', 'Quick & easy'], multi: true },
    { id: 'tell',      question: 'What would you tell a friend?',  options: ['You have to check this place out', 'Great range, never disappointed', 'The staff are genuinely helpful', 'Worth every penny', 'My new go-to spot'], multi: false },
  ],
  other: [
    { id: 'reason',    question: 'What brought you here?',  options: ['A recommendation', 'Saw it online', 'Regular visit', 'First time trying it', 'Special occasion'], multi: false },
    { id: 'highlight', question: 'What stood out most?',    options: ['The quality', 'The people', 'The whole experience', 'The value', 'How professional it was'], multi: true },
    { id: 'feeling',   question: 'How did it make you feel?', options: ['Really impressed', 'Happy I came', 'Glad I found this place', 'Like a regular already', "I'll be back for sure"], multi: false },
  ],
}

export function getQuestions(industry: string, customQuestions?: ReviewQuestion[] | null): ReviewQuestion[] {
  if (customQuestions && customQuestions.length > 0) return customQuestions
  return DEFAULT_QUESTIONS[industry] ?? DEFAULT_QUESTIONS.other
}
