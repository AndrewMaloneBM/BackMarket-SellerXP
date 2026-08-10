<script setup lang="ts">
import type { PrototypeConcept } from '~/composables/usePrototypeSidebar'

definePageMeta({ layout: false })

const runtimeConfig = useRuntimeConfig()
const baseHref = (runtimeConfig.app.baseURL ?? '/').replace(/\/$/, '')

const NAV_ITEMS = ['Home', 'Insights', 'Customer Care', 'Listings', 'Orders', 'Opportunities', 'Money', 'Options', 'Seller Support'] as const
const SELLER_NAME = 'TechRenew GmbH'
const CHAT_USER_NAME = 'TechRenew GmbH'
const DROPPED_CONCEPTS: number[] = []

const activeNavItem = ref('Home')
const activeSubStateId = ref('')

const drawerOpen = ref(false)
const chatInput = ref('')
const chatLoading = ref(false)
const activeReleaseFeed = ref(false)
const insightTriggered = ref(false)
const chatContainer = ref<HTMLElement | null>(null)

async function scrollToBottom() {
  await nextTick()
  if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight
}

interface ReleaseFeedGroup {
  date: string
  pills: Array<{ label: string; action: string }>
}

interface ChatMessage {
  role: 'ai' | 'user'
  text: string
  bullets?: string[]
  source?: string
  showFeedback?: boolean
  feedbackGiven?: 'up' | 'down' | null
  learnMore?: boolean
  showContactSupport?: boolean
  isError?: boolean
  pills?: string[]
  showWhatsNew?: boolean
  showInsightTrigger?: boolean
  responsePills?: Array<{ label: string; action: string }>
  responsePillsUsed?: boolean
  ctaButton?: { label: string; navItem?: string }
  basedOn?: string
  note?: string
}

const GREETING: ChatMessage = {
  role: 'ai',
  text: `Hi, I'm Support AI 👋\n\nGot a question about Back Market's policies, orders, listings, or more? I can help by searching the Seller Support Center for answers.`,
  learnMore: true,
}

const GREETING_FUTURE: ChatMessage = {
  role: 'ai',
  text: `Hi, I'm Support AI 👋\n\nGot a question about Back Market's policies, orders, listings, or more? I can help by searching the Seller Support Center for answers.`,
  learnMore: true,
  pills: ['Payments & Payouts', 'My Orders', 'Returns & Refunds', 'Quality Standards', 'Shipping'],
}

const GREETING_WHATS_NEW: ChatMessage = {
  role: 'ai',
  text: `Hi, I'm Support AI 👋\n\nGot a question about Back Market's policies, orders, listings, or more? I can help by searching the Seller Support Center for answers.`,
  learnMore: true,
  pills: ['Payments & Payouts', 'My Orders', 'Returns & Refunds', 'Quality Standards', 'Shipping'],
  showWhatsNew: true,
}

const GREETING_INSIGHT: ChatMessage = {
  role: 'ai',
  text: `Hi, I'm Support AI 👋\n\nGot a question about Back Market's policies, orders, listings, or more? I can help by searching the Seller Support Center for answers.`,
  learnMore: true,
  pills: ['Payments & Payouts', 'My Orders', 'Returns & Refunds', 'Quality Standards', 'Shipping'],
  showInsightTrigger: true,
}

const TOPIC_QUESTIONS: Record<string, string[]> = {
  'Payments & Payouts': [
    'When will I receive my payout?',
    'Why is my payout lower than expected?',
    'How do I change my bank details?',
    'What is a deferred payout?',
    'Why was my payout blocked?',
    'How do payout tiers work?',
  ],
  'My Orders': [
    'How do I process a new order?',
    'What happens if I miss the shipping deadline?',
    'How do I cancel an order?',
    "A buyer hasn't received their order — what do I do?",
    'What is the order acceptance delay?',
  ],
  'Returns & Refunds': [
    'How do I handle a return request?',
    "What is Back Market's return window?",
    'Who pays for return shipping?',
    'Can I refuse a return?',
    'What happens after I receive a returned item?',
  ],
  'Quality Standards': [
    'What are the grading definitions?',
    'What happens if my listing is flagged?',
    'How do I grade a device with a cracked screen?',
    "What's the difference between Excellent and Good?",
    'What is the quality score?',
  ],
  'Shipping': [
    'What are the shipping deadlines?',
    'Which carriers are approved?',
    'What do I do if a package is lost?',
    'How do I print a shipping label?',
    'What is the required packaging standard?',
  ],
}

const activePillTopic = ref<string | null>(null)

const TOPIC_PILL_ICONS: Record<string, string> = {
  'Payments & Payouts': `<path fill-rule="evenodd" d="M8.75 10.5a3.25 3.25 0 1 1 6.5 0 3.25 3.25 0 0 1-6.5 0M12 8.75a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5" clip-rule="evenodd" fill="currentColor"/><path fill-rule="evenodd" d="M21.75 5.5a1.25 1.25 0 0 0-1.25-1.25h-17A1.25 1.25 0 0 0 2.25 5.5v10a1.25 1.25 0 0 0 1.25 1.25h17a1.25 1.25 0 0 0 1.25-1.25v-10m-4.17.25H6.42a3.505 3.505 0 0 1-2.67 2.67v4.16a3.505 3.505 0 0 1 2.67 2.67h11.16a3.505 3.505 0 0 1 2.67-2.67V8.42a3.505 3.505 0 0 1-2.67-2.67" clip-rule="evenodd" fill="currentColor"/><path d="M5 18.25a.75.75 0 0 0 0 1.5h14a.75.75 0 0 0 0-1.5H5" fill="currentColor"/>`,
  'My Orders': `<path fill-rule="evenodd" d="M3.5 4.25A1.25 1.25 0 0 0 2.25 5.5v13a1.25 1.25 0 0 0 1.25 1.25h17a1.25 1.25 0 0 0 1.25-1.25v-13a1.25 1.25 0 0 0-1.25-1.25h-17m.25 14V5.75H10v5.765a.3.3 0 0 0 .434.268l1.432-.716a.3.3 0 0 1 .268 0l1.432.716A.3.3 0 0 0 14 11.515V5.75h6.25v12.5H3.75" clip-rule="evenodd" fill="currentColor"/>`,
  'Returns & Refunds': `<path d="M2.25 12A9.75 9.75 0 0 1 12 2.25a9.72 9.72 0 0 1 6.75 2.714V3a.75.75 0 0 1 1.5 0v3.5A1.25 1.25 0 0 1 19 7.75h-3a.75.75 0 0 1 0-1.5h1.916l-.043-.044A8.25 8.25 0 1 0 12 20.25 8.25 8.25 0 0 0 20.25 12a.75.75 0 0 1 1.5 0c0 5.385-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12" fill="currentColor"/><path d="M12 11.5c2.21 0 4-.672 4-1.5s-1.79-1.5-4-1.5S8 9.172 8 10s1.79 1.5 4 1.5" fill="currentColor"/><path d="M15.092 11.763C14.264 12.073 13.17 12.25 12 12.25c-1.17 0-2.264-.177-3.092-.487a4.305 4.305 0 0 1-.644-.3C8.094 11.63 8 11.811 8 12c0 .829 1.79 1.5 4 1.5s4-.671 4-1.5c0-.19-.093-.37-.264-.537a4.307 4.307 0 0 1-.644.3" fill="currentColor"/><path d="M12 14.25c1.17 0 2.264-.177 3.092-.487a4.307 4.307 0 0 0 .644-.3C15.906 13.63 16 13.811 16 14c0 .829-1.79 1.5-4 1.5S8 14.83 8 14c0-.19.093-.37.264-.537a4.305 4.305 0 0 0 .644.3C9.736 14.073 10.83 14.25 12 14.25" fill="currentColor"/>`,
  'Quality Standards': `<path d="M17.53 8.54a.75.75 0 0 0-1.06-1.061L11 12.949l-2.47-2.47a.75.75 0 0 0-1.06 1.06l2.646 2.647a1.25 1.25 0 0 0 1.768 0l5.646-5.647" fill="currentColor"/><path fill-rule="evenodd" d="M4.5 2.759a1.25 1.25 0 0 0-1.25 1.25V8.73c0 9.392 7.29 12.1 8.395 12.455a1.147 1.147 0 0 0 .71 0C13.46 20.83 20.75 18.122 20.75 8.73V4.01a1.25 1.25 0 0 0-1.25-1.25h-15m.25 5.97V4.26h14.5v4.47c0 8.106-6.024 10.573-7.25 10.992-1.226-.419-7.25-2.886-7.25-10.992" clip-rule="evenodd" fill="currentColor"/>`,
  'Shipping': `<path fill-rule="evenodd" d="M2.25 6A1.25 1.25 0 0 1 3.5 4.75h10a1.25 1.25 0 0 1 1.225 1h2.966a1.25 1.25 0 0 1 1.118.691l1.655 3.31H20.5A1.25 1.25 0 0 1 21.75 11v5a1.25 1.25 0 0 1-1.25 1.25h-.854a2.751 2.751 0 0 1-5.292 0h-3.707a2.751 2.751 0 0 1-5.293 0H3.5A1.25 1.25 0 0 1 2.25 16V6m12.5 8.919a2.751 2.751 0 0 1 4.897.832h.603v-4.5l-5.5-.001v3.669m0-5.169v-2.5h2.787l1.25 2.5H14.75m-1.5 6h-2.604a2.751 2.751 0 0 0-5.292 0H3.75v-9.5h9.5v9.5m-6.5.75a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0m9 0a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0" clip-rule="evenodd" fill="currentColor"/>`,
}

const activeGreeting = computed((): ChatMessage =>
  activeConcept.value === 2 ? GREETING_FUTURE : GREETING
)

const SCRIPTED_RESPONSES: Array<{ match: (t: string) => boolean; response: ChatMessage }> = [
  {
    match: (t) => /error/i.test(t),
    response: {
      role: 'ai',
      text: 'Something went wrong while processing your request. Please try again.',
      isError: true,
    },
  },
  {
    match: (t) => /suspend/i.test(t),
    response: {
      role: 'ai',
      text: `I'm sorry to hear that. Account suspension with pending orders is urgent and needs immediate attention from our support team. This isn't something I can resolve directly, but they can help you right away.`,
      showContactSupport: true,
    },
  },
  {
    match: (t) => /grade|cracked|screen|damaged/i.test(t),
    response: {
      role: 'ai',
      text: `A phone with a cracked screen should be listed as Stallone on Back Market.\n\nThe quality charter defines a cracked screen as a visible structural defect that affects the product's appearance beyond normal wear and tear. Even if the screen is still functional, a crack disqualifies the product from Premium, Excellent, Good, or Fair.\n\nKey points to keep in mind:`,
      bullets: [
        'The crack must be clearly disclosed in the listing description',
        'Photos showing the damage are required',
        'The device must still be fully functional to be listed at all',
      ],
      source: 'Back Market Quality Charter — Grading Definitions',
      showFeedback: true,
      feedbackGiven: null,
    },
  },
]

const BACKFUNDS_PROMO: ChatMessage = {
  role: 'ai',
  text: `💡 You're eligible for BackFunds.\n\nYou have €18,740 pending — with BackFunds you could access that today instead of waiting until Nov 14. Most sellers activate in under 2 minutes.`,
  responsePills: [
    { label: 'Yes, tell me more', action: 'backfunds-yes' },
    { label: 'Not right now', action: 'backfunds-no' },
    { label: 'What are the fees?', action: 'backfunds-fees' },
  ],
}

const BACKFUNDS_FOLLOWUP: ChatMessage = {
  role: 'ai',
  text: `Here's how BackFunds works:`,
  bullets: [
    'Get paid daily — instead of waiting D+7, your payouts are processed every day.',
    'No upfront fees — BackFunds charges a small daily rate only on the amount you advance.',
    'Instant eligibility — if your account is in good standing, you can activate it right now.',
  ],
  ctaButton: { label: 'Go to BackFunds →', navItem: 'Money' },
}

const BACKFUNDS_FEES: ChatMessage = {
  role: 'ai',
  text: `BackFunds charges a small daily rate only on the amount you advance — there are no upfront or fixed fees. Full details and current rates are available on the BackFunds page.`,
  ctaButton: { label: 'See fee details →', navItem: 'Money' },
}

const PAYOUT_TIER_Q = 'What payout tier am I on?'

const PAYOUT_TIER_RESPONSE: ChatMessage = {
  role: 'ai',
  text: `You're currently on Tier 2.\n\nYou meet 2 of 3 requirements for Tier 1:\n\n✅ Order acceptance rate: 97% (target: above 95%)\n✅ Shipping on time: 94% (target: above 90%)\n⚠️ Cancellation rate: 4.2% (target: below 3%)\n\nYour fastest path to Tier 1 is reducing cancellations by 1.2 percentage points.\n\nTier 1 can improve your payout conditions. Exact benefits may depend on your market and account setup.`,
  source: 'Back Market Payout Tier Guidelines',
  responsePills: [
    { label: 'How do I reduce cancellations?', action: 'tier-cancellations' },
    { label: 'What does Tier 1 unlock?', action: 'tier-unlock' },
    { label: 'View payout tier details →', action: 'tier-details' },
  ],
}

const PAYOUT_TIER_CANCELLATIONS: ChatMessage = {
  role: 'ai',
  text: `Here's where to start:`,
  bullets: [
    'Keep inventory synced — most cancellations happen when listed items are no longer available.',
    'Pause low-stock listings you can\'t reliably fulfil.',
    'Review orders daily so issues are caught before the shipping deadline.',
    'If a product is unavailable, update the listing before the next sale.',
    'Based on your current metrics, reducing cancellations is the biggest lever to reach Tier 1.',
  ],
  source: 'Back Market Seller Performance Guidelines',
  showFeedback: true,
  feedbackGiven: null,
}

const PAYOUT_TIER_UNLOCK: ChatMessage = {
  role: 'ai',
  text: `Tier 1 can improve your payout conditions and may give you access to faster payout options, depending on your market and account setup.\n\nThe exact benefits can vary, so you should check the payout tier details page for the full conditions that apply to your account.`,
  source: 'Back Market Payout Tier Guidelines',
  ctaButton: { label: 'View payout tier details →', navItem: 'Money' },
}

const PAYOUT_TIER_DETAILS: ChatMessage = {
  role: 'ai',
  text: `Here's where you can review the full payout tier conditions and benefits that apply to your account.`,
  // TODO: Update navItem to the specific payout tier page once it exists in the BO
  ctaButton: { label: 'Go to payout tier details →', navItem: 'Money' },
}

const INSIGHT_PROMO: ChatMessage = {
  role: 'ai',
  text: `📉 Your GMV is down 12% this week.\n\nThe main driver is a drop in active iPhone listings. You currently have 8 active iPhone listings, down from 14 last week.\n\nBased on buyer demand in your region, adding 5 iPhone 13 or iPhone 14 listings could help recover the gap.`,
  basedOn: 'Sale Insights, active listings, regional demand',
  responsePills: [
    { label: 'Why did my listings drop?', action: 'insight-drop' },
    { label: 'Which models should I prioritise?', action: 'insight-models' },
    { label: 'Help me add listings', action: 'insight-add-listing' },
  ],
}

const INSIGHT_MODELS: ChatMessage = {
  role: 'ai',
  text: `Here are the top models to prioritise this week based on demand, competition, and your current catalogue:`,
  bullets: [
    'iPhone 14 128GB — high demand, low competition, avg. sale price €420',
    'iPhone 13 128GB — very high search volume, moderate competition, avg. sale price €320',
    'iPhone 13 Pro 256GB — growing demand, low competition in Good condition, avg. sale price €480',
  ],
  ctaButton: { label: 'Create listings →', navItem: 'Listings' },
}

const INSIGHT_DROP: ChatMessage = {
  role: 'ai',
  text: `Your active iPhone listings dropped from 14 to 8 this week.\n\nThe main causes appear to be:`,
  bullets: [
    '3 listings expired after 90 days without activity',
    '2 listings were paused after missing required product information',
    '1 listing was removed manually by your team',
  ],
  ctaButton: { label: 'Review paused listings →', navItem: 'Listings' },
}

const INSIGHT_ADD_LISTING: ChatMessage = {
  role: 'ai',
  text: `I can't create the listing for you yet, but I can take you to the right place.\n\nStart with the 5 iPhone models I recommended — they have the strongest demand in your region right now.`,
  ctaButton: { label: 'Go to Listings →', navItem: 'Listings' },
}

const QUALITY_PROMO: ChatMessage = {
  role: 'ai',
  text: `⚠️ I found a quality issue that needs your attention.\n\nYour iPhone 13 (64GB) — Good listing has been flagged 3 times this month for missing damage disclosure. If unresolved, the listing may be paused or reviewed by the quality team.\n\nHere's what's missing:`,
  bullets: [
    'Damage description in the listing details',
    'Photos showing the affected area',
    'Confirmation that the device is fully functional',
  ],
  basedOn: 'Quality Charter, listing flags, quality score',
  responsePills: [
    { label: 'Go to listing →', action: 'quality-go-listing' },
    { label: "What happens if I don't fix it?", action: 'quality-consequences' },
  ],
}

const QUALITY_GO_LISTING: ChatMessage = {
  role: 'ai',
  text: `I'll take you directly to the flagged listing so you can update the missing details and photos.`,
  ctaButton: { label: 'Go to listing →', navItem: 'Listings' },
}

const QUALITY_CONSEQUENCES: ChatMessage = {
  role: 'ai',
  text: `If the flagged listing isn't updated:`,
  bullets: [
    'Quality score impact — repeated flags can lower your quality score and affect listing visibility.',
    'Listing pause — the listing may be paused until the missing information is added.',
    'Account review — repeated unresolved flags across multiple listings may trigger a broader quality review.',
  ],
  basedOn: 'Quality Charter, listing flags, quality score',
  note: 'The fastest fix is to update the listing details and add the missing photos.',
  ctaButton: { label: 'Go to listing →', navItem: 'Listings' },
}

const BACKBOX_PROMO: ChatMessage = {
  role: 'ai',
  text: `📦 I found a sales opportunity in your catalogue.\n\nBuyer demand for iPhone 14 Pro 128GB is high in your region. You have 12 matching devices in your catalogue that are not currently active.\n\nYou could activate this stock in a few ways: list the devices, explore BackBox opportunities, or create a Deal to move them faster.`,
  basedOn: 'catalogue data, regional demand, active listings',
  responsePills: [
    { label: 'Show matching devices', action: 'backbox-devices' },
    { label: 'Explore BackBox', action: 'backbox-explore' },
    { label: 'Create a Deal', action: 'backbox-deal' },
  ],
}

const BACKBOX_DEVICES: ChatMessage = {
  role: 'ai',
  text: `Here are the 3 strongest matches from your catalogue:`,
  bullets: [
    'iPhone 14 Pro 128GB — Space Black — Excellent — unlisted',
    'iPhone 14 Pro 128GB — Deep Purple — Excellent — unlisted',
    'iPhone 14 Pro 128GB — Silver — Good — unlisted',
  ],
  note: 'These devices match current buyer demand and could be activated quickly.',
  ctaButton: { label: 'Go to Listings →', navItem: 'Listings' },
}

const BACKBOX_EXPLORE: ChatMessage = {
  role: 'ai',
  text: `BackBox can help you sell eligible devices directly to Back Market at a guaranteed price.\n\nFor these iPhone 14 Pro devices, BackBox may be a good option if you want a faster sale without managing the full listing flow.\n\nYou can review eligible devices and available offers in Opportunities.`,
  ctaButton: { label: 'Go to Opportunities →', navItem: 'Opportunities' },
}

const BACKBOX_DEAL: ChatMessage = {
  role: 'ai',
  text: `You could create a Deal for these iPhone 14 Pro devices to increase visibility and move stock faster.\n\nBased on similar listings in your region, a 5–8% discount could make these devices more competitive while protecting margin.\n\nStart with the 12 matching devices, then choose the discount level you're comfortable with.`,
  ctaButton: { label: 'Create a Deal →', navItem: 'Opportunities' },
}

const WHATS_NEW_FEED: ReleaseFeedGroup[] = [
  {
    date: 'May 2026',
    pills: [
      { label: '🚀 BM Accelerator for E.U. Sellers', action: 'feature-accelerator' },
      { label: '🔄 Express Replacement — now live', action: 'feature-express' },
    ],
  },
  {
    date: 'April 2026',
    pills: [
      { label: 'BackBox opportunity alerts in Support AI', action: 'feature-backbox-alerts' },
      { label: 'Quality score breakdown', action: 'feature-quality-score' },
      { label: 'New shipping carrier: Evri', action: 'feature-evri' },
    ],
  },
]


const ACCELERATOR_ELIGIBLE: ChatMessage = {
  role: 'ai',
  text: `The Accelerator is available to high-performing sellers in France and Spain with strong sales history in eligible categories.\n\nYour SSM can confirm whether your account qualifies and which categories are included in your offer.`,
  basedOn: 'BM Accelerator eligibility criteria',
  ctaButton: { label: 'Contact my SSM →', navItem: 'Seller Support' },
}

const ACCELERATOR_SSM: ChatMessage = {
  role: 'ai',
  text: `Your SSM is your direct point of contact for the Accelerator programme. They can confirm your targets, walk you through the terms, and get you set up.`,
  ctaButton: { label: 'Contact my SSM →', navItem: 'Seller Support' },
}

const EXPRESS_ROUTING: ChatMessage = {
  role: 'ai',
  text: `When a customer chooses Express Replacement, Back Market selects the replacement seller based on quality score — not price.\n\nThis means the better your listings, grading accuracy, and shipping performance, the more likely you are to receive replacement orders.\n\nMaintaining a strong quality score is the best way to benefit from Express Replacement.`,
  basedOn: 'Express Replacement quality routing criteria',
  ctaButton: { label: 'View my quality score →', navItem: 'Listings' },
}

const EXPRESS_LEARN: ChatMessage = {
  role: 'ai',
  text: `Full details about Express Replacement are available in the Seller Support Center, including how orders appear, how returns are handled, and how to make the most of quality routing.`,
  ctaButton: { label: 'Go to Seller Support Center →', navItem: 'Seller Support' },
}

const FEATURE_RESPONSES: Record<string, ChatMessage> = {
  'feature-accelerator': {
    role: 'ai',
    text: `The BM Accelerator is Back Market's premium partnership programme for high-performing sellers in France and Spain.\n\nHere's what it offers:`,
    bullets: [
      'Commission reduction — earn a percentage-point reduction on eligible category sales from May through July',
      `Growth target — we'll work together to achieve +X% growth over Q1 across 3 months`,
      'Extension opportunity — if targets are met, the offer extends through August to October',
    ],
    note: 'To get started, speak to your Seller Success Manager who can confirm your eligibility and set your targets.',
    basedOn: 'BM Accelerator programme, seller eligibility criteria',
    responsePills: [
      { label: 'Am I eligible?', action: 'accelerator-eligible' },
      { label: 'Speak to my SSM →', action: 'accelerator-ssm' },
    ],
  },
  'feature-express': {
    role: 'ai',
    text: `Express Replacement is Back Market's new Ship-First service — and it's already live.\n\nWhen a customer has a quality issue, they receive a replacement device immediately, before returning the original. No waiting. No complicated claims.\n\nHere's what it means for you as a seller:`,
    bullets: [
      'Incremental revenue — replacement orders are new orders that would otherwise be lost to refunds',
      'Quality rewards — replacements are routed to the highest quality seller on a listing, not just the buybox winner',
      'No extra work — a replacement order appears as a standard new order in your Back Office',
    ],
    note: 'Express Replacement is live in France and the UK, and launching in Germany and Spain in mid-May 2026.',
    basedOn: 'Express Replacement programme, seller quality routing',
    responsePills: [
      { label: 'How does quality routing work?', action: 'express-routing' },
      { label: 'Learn more →', action: 'express-learn' },
    ],
  },
  'feature-backbox-alerts': {
    role: 'ai',

    text: `Support AI now automatically flags BackBox demand spikes that match devices already in your inventory but not yet listed.\n\nTechRenew GmbH has 12 unlisted iPhone 14 Pros right now — this feature means you'll know about buyer demand before the opportunity passes.`,
    bullets: [
      'Alerts appear automatically in the Support AI drawer when a strong match is found',
      'Tap "Show me the devices" to review the matched inventory',
      'List them directly from the alert — product data is pre-filled from the Back Market catalogue',
    ],
    ctaButton: { label: 'Go to Opportunities →', navItem: 'Opportunities' },
  },
  'feature-quality-score': {
    role: 'ai',

    text: `The quality section now shows a full breakdown of which listings are affecting your score and the specific reason for each flag — not just a single summary number.\n\nYour iPhone 13 (64GB) Good listing has been flagged 3 times this month. This breakdown makes it easy to find and fix the issue before it affects your placement.`,
    bullets: [
      'Go to Listings and open the Quality tab',
      'Filter by "Flagged" to see all listings with active issues',
      'Click any listing to see the exact violation and the steps to resolve it',
    ],
    ctaButton: { label: 'Go to Listings →', navItem: 'Listings' },
  },
  'feature-evri': {
    role: 'ai',

    text: `Evri is now an approved carrier for UK shipments, giving you a more cost-effective option for lighter parcels.\n\nIf TechRenew GmbH ships regularly to UK buyers, switching parcels under 2 kg to Evri can meaningfully reduce your cost per order.`,
    bullets: [
      'Open any UK order and click "Generate label"',
      'Select Evri from the carrier dropdown — it appears alongside your existing carriers',
      'Print and attach the label as normal; tracking updates are included automatically',
    ],
    ctaButton: { label: 'Go to Orders →', navItem: 'Orders' },
  },
}

const chatMessages = ref<ChatMessage[]>([GREETING])

watch([() => chatMessages.value.length, chatLoading], scrollToBottom)

async function handleResponsePill(msg: ChatMessage, action: string) {
  msg.responsePillsUsed = true
  if (action === 'backfunds-no') {
    chatMessages.value.push({ role: 'user', text: 'Not right now' })
    chatMessages.value.push({ role: 'ai', text: `No problem. You can activate BackFunds any time from your Money tab if you change your mind.` })
  } else if (action === 'backfunds-yes') {
    chatMessages.value.push({ role: 'user', text: 'Yes, tell me more' })
    chatLoading.value = true
    await new Promise(r => setTimeout(r, 1500))
    chatMessages.value.push({ ...BACKFUNDS_FOLLOWUP })
    chatLoading.value = false
  } else if (action === 'backfunds-fees') {
    chatMessages.value.push({ role: 'user', text: 'What are the fees?' })
    chatLoading.value = true
    await new Promise(r => setTimeout(r, 1500))
    chatMessages.value.push({ ...BACKFUNDS_FEES })
    chatLoading.value = false
  } else if (action === 'tier-details') {
    chatMessages.value.push({ role: 'user', text: 'View payout tier details →' })
    chatMessages.value.push({ ...PAYOUT_TIER_DETAILS })
  } else if (action === 'tier-cancellations') {
    chatMessages.value.push({ role: 'user', text: 'How do I reduce cancellations?' })
    chatLoading.value = true
    await new Promise(r => setTimeout(r, 1500))
    chatMessages.value.push({ ...PAYOUT_TIER_CANCELLATIONS })
    chatLoading.value = false
  } else if (action === 'tier-unlock') {
    chatMessages.value.push({ role: 'user', text: 'What does Tier 1 unlock?' })
    chatLoading.value = true
    await new Promise(r => setTimeout(r, 1500))
    chatMessages.value.push({ ...PAYOUT_TIER_UNLOCK })
    chatLoading.value = false
  } else if (action === 'insight-models') {
    chatMessages.value.push({ role: 'user', text: 'Which models should I prioritise?' })
    chatLoading.value = true
    await new Promise(r => setTimeout(r, 1500))
    chatMessages.value.push({ ...INSIGHT_MODELS })
    chatLoading.value = false
  } else if (action === 'insight-drop') {
    chatMessages.value.push({ role: 'user', text: 'Why did my listings drop?' })
    chatLoading.value = true
    await new Promise(r => setTimeout(r, 1500))
    chatMessages.value.push({ ...INSIGHT_DROP })
    chatLoading.value = false
  } else if (action === 'insight-add-listing') {
    chatMessages.value.push({ role: 'user', text: 'Help me add listings' })
    chatMessages.value.push({ ...INSIGHT_ADD_LISTING })
  } else if (action === 'quality-go-listing') {
    chatMessages.value.push({ role: 'user', text: 'Go to listing →' })
    chatMessages.value.push({ ...QUALITY_GO_LISTING })
  } else if (action === 'quality-consequences') {
    chatMessages.value.push({ role: 'user', text: "What happens if I don't fix it?" })
    chatLoading.value = true
    await new Promise(r => setTimeout(r, 1500))
    chatMessages.value.push({ ...QUALITY_CONSEQUENCES })
    chatLoading.value = false
  } else if (action === 'backbox-devices') {
    chatMessages.value.push({ role: 'user', text: 'Show matching devices' })
    chatLoading.value = true
    await new Promise(r => setTimeout(r, 1500))
    chatMessages.value.push({ ...BACKBOX_DEVICES })
    chatLoading.value = false
  } else if (action === 'backbox-explore') {
    chatMessages.value.push({ role: 'user', text: 'Explore BackBox' })
    chatLoading.value = true
    await new Promise(r => setTimeout(r, 1500))
    chatMessages.value.push({ ...BACKBOX_EXPLORE })
    chatLoading.value = false
  } else if (action === 'backbox-deal') {
    chatMessages.value.push({ role: 'user', text: 'Create a Deal' })
    chatLoading.value = true
    await new Promise(r => setTimeout(r, 1500))
    chatMessages.value.push({ ...BACKBOX_DEAL })
    chatLoading.value = false
  } else if (action === 'accelerator-eligible') {
    chatMessages.value.push({ role: 'user', text: 'Am I eligible?' })
    chatLoading.value = true
    await new Promise(r => setTimeout(r, 1500))
    chatMessages.value.push({ ...ACCELERATOR_ELIGIBLE })
    chatLoading.value = false
  } else if (action === 'accelerator-ssm') {
    chatMessages.value.push({ role: 'user', text: 'Speak to my SSM →' })
    chatMessages.value.push({ ...ACCELERATOR_SSM })
  } else if (action === 'express-routing') {
    chatMessages.value.push({ role: 'user', text: 'How does quality routing work?' })
    chatLoading.value = true
    await new Promise(r => setTimeout(r, 1500))
    chatMessages.value.push({ ...EXPRESS_ROUTING })
    chatLoading.value = false
  } else if (action === 'express-learn') {
    chatMessages.value.push({ role: 'user', text: 'Learn more →' })
    chatMessages.value.push({ ...EXPRESS_LEARN })
  }
}

function handleWhatsNewPill() {
  activeReleaseFeed.value = true
}

async function handleInsightTrigger() {
  insightTriggered.value = true
  chatMessages.value.push({ role: 'user', text: 'Show me my business insights' })
  chatLoading.value = true
  await new Promise(r => setTimeout(r, 1500))
  chatMessages.value.push({ ...INSIGHT_PROMO })
  chatLoading.value = false
}

async function handleReleasePill(label: string, action: string) {
  activeReleaseFeed.value = false
  chatMessages.value.push({ role: 'user', text: label })
  chatLoading.value = true
  await new Promise(r => setTimeout(r, 1500))
  const response = FEATURE_RESPONSES[action]
  if (response) chatMessages.value.push({ ...response })
  chatLoading.value = false
}

function goBackFromFeed() {
  activeReleaseFeed.value = false
  activePillTopic.value = null
}


async function sendMessage() {
  const text = chatInput.value.trim()
  if (!text || chatLoading.value) return
  chatMessages.value.push({ role: 'user', text })
  chatInput.value = ''
  chatLoading.value = true
  await new Promise(r => setTimeout(r, 1500))
  const scripted = SCRIPTED_RESPONSES.find(s => s.match(text))
  chatMessages.value.push(scripted ? { ...scripted.response } : {
    role: 'ai',
    text: `I wasn't able to find a relevant answer for that in the Seller Support Center. Our support team will be able to help you directly.`,
    showContactSupport: true,
  })
  chatLoading.value = false
}

function retryLastMessage() {
  const errorIdx = chatMessages.value.findLastIndex(m => m.isError)
  if (errorIdx === -1) return
  const prev = chatMessages.value[errorIdx - 1]
  if (prev?.role === 'user') {
    chatInput.value = prev.text
    chatMessages.value.splice(errorIdx - 1, 2)
    sendMessage()
  } else {
    chatMessages.value.splice(errorIdx, 1)
  }
}

function clearChat() {
  chatMessages.value = [{ ...activeGreeting.value }]
  chatInput.value = ''
  chatLoading.value = false
  activePillTopic.value = null
  activeReleaseFeed.value = false
  insightTriggered.value = false
}

async function sendPillQuestion(question: string) {
  activePillTopic.value = null
  chatMessages.value.push({ role: 'user', text: question })
  chatLoading.value = true
  await new Promise(r => setTimeout(r, 1500))
  chatMessages.value.push({
    role: 'ai',
    text: `Here's what I found in the Seller Support Center for your question.`,
    bullets: [
      'This is a placeholder answer that would be retrieved from the relevant support article.',
      'In production, Support AI would surface the most relevant content and link directly to it.',
    ],
    source: 'Seller Support Center',
    showFeedback: true,
    feedbackGiven: null,
  })
  chatLoading.value = false
}

function giveFeedback(msg: ChatMessage, vote: 'up' | 'down') {
  msg.feedbackGiven = vote
}

const conceptMeta: readonly PrototypeConcept[] = [
  {
    name: '🚧 In development',
    prdFeature: 'Support AI',
    prdMetric: 'Sellers find answers without leaving the back office.',
    pros: ['Persistent entry point — always one click away from any page'],
    cons: ['Header real estate is limited'],
    pages: [
      {
        id: 'home',
        label: 'Home',
        navItem: 'Home',
        changes: [
          '✦ Support AI chip added to the back office header',
          'Clicking opens the Support AI chat drawer from the right',
        ],
        subStates: [
          { id: 'drawer-greeting',      label: 'Drawer — greeting' },
          { id: 'drawer-q-and-a',       label: 'Drawer — Q&A response' },
          { id: 'drawer-feedback-up',   label: 'Drawer — positive feedback' },
          { id: 'drawer-feedback-down', label: 'Drawer — negative feedback' },
          { id: 'drawer-no-answer',     label: 'Drawer — no answer' },
          { id: 'drawer-error',         label: 'Drawer — error state' },
        ],
      },
    ],
  },
  {
    name: '🌟 Where we want to be',
    prdFeature: 'Support AI — Future vision',
    prdMetric: 'Sellers resolve issues end-to-end without contacting support.',
    pros: ['Deeper integration with seller workflows', 'Proactive suggestions based on seller context'],
    cons: ['Requires more back-end data access', 'Higher implementation complexity'],
    pages: [
      {
        id: 'future-home',
        label: 'Drawer — Greeting',
        navItem: 'Home',
        changes: ['Support AI opens with pre-populated topic shortcuts'],
        subStates: [
          { id: 'future-drawer-greeting', label: 'Greeting with topics' },
        ],
      },
      {
        id: 'future-backfunds',
        label: 'Drawer — BackFunds',
        navItem: 'Home',
        changes: ['Support AI proactively surfaces BackFunds eligibility in the chat'],
        subStates: [
          { id: 'future-backfunds-promo',  label: 'Proactive message' },
          { id: 'future-backfunds-detail', label: 'Follow-up — tell me more' },
        ],
      },
      {
        id: 'future-payout-tier',
        label: 'Drawer — Payout tier',
        navItem: 'Home',
        changes: ['Support AI surfaces personalised payout tier data from the seller\'s account'],
        subStates: [
          { id: 'future-tier-response',      label: 'Tier response' },
          { id: 'future-tier-cancellations', label: 'Follow-up — reduce cancellations' },
          { id: 'future-tier-unlock',        label: 'Follow-up — Tier 1 benefits' },
          { id: 'future-tier-details',       label: 'Follow-up — view tier details' },
        ],
      },
      {
        id: 'future-insight',
        label: 'Drawer — Business insight',
        navItem: 'Home',
        changes: ['Support AI proactively surfaces a personalised GMV insight with actionable recommendations'],
        subStates: [
          { id: 'future-insight-greeting',    label: 'Greeting — trigger' },
          { id: 'future-insight-promo',       label: 'Proactive message' },
          { id: 'future-insight-models',      label: 'Follow-up — prioritise models' },
          { id: 'future-insight-drop',        label: 'Follow-up — why listings dropped' },
          { id: 'future-insight-add-listing', label: 'Follow-up — add a listing' },
        ],
      },
      {
        id: 'future-quality',
        label: 'Drawer — Quality performance',
        navItem: 'Home',
        changes: ['Support AI proactively flags a quality issue on a specific listing'],
        subStates: [
          { id: 'future-quality-promo',        label: 'Proactive message' },
          { id: 'future-quality-listing',      label: 'Follow-up — go to listing' },
          { id: 'future-quality-consequences', label: 'Follow-up — consequences' },
        ],
      },
      {
        id: 'future-backbox',
        label: 'Drawer — Sales opportunity',
        navItem: 'Home',
        changes: ['Support AI proactively surfaces a sales opportunity based on catalogue data and regional demand'],
        subStates: [
          { id: 'future-backbox-promo',   label: 'Proactive message' },
          { id: 'future-backbox-devices', label: 'Follow-up — show matching devices' },
          { id: 'future-backbox-explore', label: 'Follow-up — explore BackBox' },
          { id: 'future-backbox-deal',    label: 'Follow-up — create a deal' },
        ],
      },
      {
        id: 'future-whats-new',
        label: "Drawer — What's new",
        navItem: 'Home',
        changes: ["Support AI surfaces a release feed of recent Back Office updates"],
        subStates: [
          { id: 'future-whats-new-greeting', label: "Greeting with What's new" },
          { id: 'future-whats-new-feed',     label: "What's new feed" },
        ],
      },
    ],
  },
]

const {
  sidebarOpen,
  previewMode,
  activeConcept,
  activePages,
} = usePrototypeSidebar(conceptMeta)

watch(activeConcept, () => {
  drawerOpen.value = false
  chatMessages.value = [{ ...activeGreeting.value }]
  chatLoading.value = false
  chatInput.value = ''
  activeSubStateId.value = ''
  activePillTopic.value = null
  activeReleaseFeed.value = false
  insightTriggered.value = false
})

const activePageId = computed(() => activePages.value[activeConcept.value - 1] ?? '')

async function setActivePage(id: string) {
  activePages.value[activeConcept.value - 1] = id
  chatLoading.value = false
  activeSubStateId.value = ''
  activePillTopic.value = null
  activeReleaseFeed.value = false
  insightTriggered.value = false
  if (id === 'future-backfunds') {
    drawerOpen.value = true
    chatMessages.value = [{ ...activeGreeting.value }, { ...BACKFUNDS_PROMO }]
  } else if (id === 'future-insight') {
    drawerOpen.value = true
    chatMessages.value = [{ ...GREETING_INSIGHT }]
  } else if (id === 'future-quality') {
    drawerOpen.value = true
    chatMessages.value = [{ ...activeGreeting.value }, { ...QUALITY_PROMO }]
  } else if (id === 'future-backbox') {
    drawerOpen.value = true
    chatMessages.value = [{ ...activeGreeting.value }, { ...BACKBOX_PROMO }]
  } else if (id === 'future-payout-tier') {
    drawerOpen.value = true
    chatMessages.value = [{ ...activeGreeting.value }, { role: 'user', text: PAYOUT_TIER_Q }]
    chatLoading.value = true
    await new Promise(r => setTimeout(r, 1500))
    chatMessages.value.push({ ...PAYOUT_TIER_RESPONSE })
    chatLoading.value = false
  } else if (id === 'future-whats-new') {
    drawerOpen.value = true
    chatMessages.value = [{ ...GREETING_WHATS_NEW }]
  } else {
    drawerOpen.value = false
    chatMessages.value = [{ ...activeGreeting.value }]
  }
}

function handleReset() {
  drawerOpen.value = false
  chatMessages.value = [{ ...activeGreeting.value }]
  chatLoading.value = false
  chatInput.value = ''
  activeSubStateId.value = ''
  activePillTopic.value = null
  activeReleaseFeed.value = false
  insightTriggered.value = false
}

const CRACKED_Q = 'What grade should I use for a phone with a cracked screen?'
const SUSPENDED_Q = 'My account has been suspended and I have 200 orders to process today.'

function applySubState(subId: string) {
  activeSubStateId.value = subId
  chatLoading.value = false
  activePillTopic.value = null
  activeReleaseFeed.value = false
  insightTriggered.value = false

  const crackedResponse = SCRIPTED_RESPONSES.find(s => s.match(CRACKED_Q))!.response
  const suspendedResponse = SCRIPTED_RESPONSES.find(s => s.match(SUSPENDED_Q))!.response

  switch (subId) {
    case 'drawer-greeting':
      drawerOpen.value = true
      chatMessages.value = [{ ...activeGreeting.value }]
      break

    case 'drawer-q-and-a':
      drawerOpen.value = true
      chatMessages.value = [{ ...activeGreeting.value }, { role: 'user', text: CRACKED_Q }, { ...crackedResponse, feedbackGiven: null }]
      break

    case 'drawer-feedback-up':
      drawerOpen.value = true
      chatMessages.value = [{ ...activeGreeting.value }, { role: 'user', text: CRACKED_Q }, { ...crackedResponse, feedbackGiven: 'up' }]
      break

    case 'drawer-feedback-down':
      drawerOpen.value = true
      chatMessages.value = [{ ...activeGreeting.value }, { role: 'user', text: CRACKED_Q }, { ...crackedResponse, feedbackGiven: 'down' }]
      break

    case 'drawer-no-answer':
      drawerOpen.value = true
      chatMessages.value = [{ ...activeGreeting.value }, { role: 'user', text: SUSPENDED_Q }, { ...suspendedResponse }]
      break

    case 'drawer-error':
      drawerOpen.value = true
      chatMessages.value = [
        { ...activeGreeting.value },
        { role: 'user', text: CRACKED_Q },
        { role: 'ai', text: 'Something went wrong while processing your request. Please try again.', isError: true },
      ]
      break

    case 'future-drawer-greeting':
      drawerOpen.value = true
      chatMessages.value = [{ ...GREETING_FUTURE }]
      break

    case 'future-backfunds-promo':
      drawerOpen.value = true
      chatMessages.value = [{ ...activeGreeting.value }, { ...BACKFUNDS_PROMO }]
      break

    case 'future-backfunds-detail':
      drawerOpen.value = true
      chatMessages.value = [
        { ...activeGreeting.value },
        { ...BACKFUNDS_PROMO, responsePillsUsed: true },
        { role: 'user', text: 'Yes, tell me more' },
        { ...BACKFUNDS_FOLLOWUP },
      ]
      break

    case 'future-tier-loading':
      drawerOpen.value = true
      chatMessages.value = [{ ...activeGreeting.value }, { role: 'user', text: PAYOUT_TIER_Q }]
      chatLoading.value = true
      setTimeout(() => {
        chatMessages.value.push({ ...PAYOUT_TIER_RESPONSE })
        chatLoading.value = false
      }, 1500)
      break

    case 'future-tier-response':
      drawerOpen.value = true
      chatMessages.value = [{ ...activeGreeting.value }, { role: 'user', text: PAYOUT_TIER_Q }, { ...PAYOUT_TIER_RESPONSE }]
      break

    case 'future-tier-cancellations':
      drawerOpen.value = true
      chatMessages.value = [
        { ...activeGreeting.value },
        { role: 'user', text: PAYOUT_TIER_Q },
        { ...PAYOUT_TIER_RESPONSE, responsePillsUsed: true },
        { role: 'user', text: 'How do I reduce cancellations?' },
        { ...PAYOUT_TIER_CANCELLATIONS },
      ]
      break

    case 'future-tier-unlock':
      drawerOpen.value = true
      chatMessages.value = [
        { ...activeGreeting.value },
        { role: 'user', text: PAYOUT_TIER_Q },
        { ...PAYOUT_TIER_RESPONSE, responsePillsUsed: true },
        { role: 'user', text: 'What does Tier 1 unlock?' },
        { ...PAYOUT_TIER_UNLOCK },
      ]
      break

    case 'future-tier-details':
      drawerOpen.value = true
      chatMessages.value = [
        { ...activeGreeting.value },
        { role: 'user', text: PAYOUT_TIER_Q },
        { ...PAYOUT_TIER_RESPONSE, responsePillsUsed: true },
        { role: 'user', text: 'View payout tier details →' },
        { ...PAYOUT_TIER_DETAILS },
      ]
      break

    case 'future-insight-greeting':
      drawerOpen.value = true
      chatMessages.value = [{ ...GREETING_INSIGHT }]
      break

    case 'future-insight-promo':
      drawerOpen.value = true
      chatMessages.value = [
        { ...GREETING_INSIGHT },
        { role: 'user', text: 'Show me my business insights' },
        { ...INSIGHT_PROMO },
      ]
      break

    case 'future-insight-models':
      drawerOpen.value = true
      chatMessages.value = [
        { ...GREETING_INSIGHT },
        { role: 'user', text: 'Show me my business insights' },
        { ...INSIGHT_PROMO, responsePillsUsed: true },
        { role: 'user', text: 'Which models should I prioritise?' },
        { ...INSIGHT_MODELS },
      ]
      break

    case 'future-insight-drop':
      drawerOpen.value = true
      chatMessages.value = [
        { ...GREETING_INSIGHT },
        { role: 'user', text: 'Show me my business insights' },
        { ...INSIGHT_PROMO, responsePillsUsed: true },
        { role: 'user', text: 'Why did my listings drop?' },
        { ...INSIGHT_DROP },
      ]
      break

    case 'future-insight-add-listing':
      drawerOpen.value = true
      chatMessages.value = [
        { ...GREETING_INSIGHT },
        { role: 'user', text: 'Show me my business insights' },
        { ...INSIGHT_PROMO, responsePillsUsed: true },
        { role: 'user', text: 'Help me add listings' },
        { ...INSIGHT_ADD_LISTING },
      ]
      break

    case 'future-quality-promo':
      drawerOpen.value = true
      chatMessages.value = [{ ...activeGreeting.value }, { ...QUALITY_PROMO }]
      break

    case 'future-quality-listing':
      drawerOpen.value = true
      chatMessages.value = [
        { ...activeGreeting.value },
        { ...QUALITY_PROMO, responsePillsUsed: true },
        { role: 'user', text: 'Go to listing →' },
        { ...QUALITY_GO_LISTING },
      ]
      break

    case 'future-quality-consequences':
      drawerOpen.value = true
      chatMessages.value = [
        { ...activeGreeting.value },
        { ...QUALITY_PROMO, responsePillsUsed: true },
        { role: 'user', text: "What happens if I don't fix it?" },
        { ...QUALITY_CONSEQUENCES },
      ]
      break

    case 'future-backbox-promo':
      drawerOpen.value = true
      chatMessages.value = [{ ...activeGreeting.value }, { ...BACKBOX_PROMO }]
      break

    case 'future-backbox-devices':
      drawerOpen.value = true
      chatMessages.value = [
        { ...activeGreeting.value },
        { ...BACKBOX_PROMO, responsePillsUsed: true },
        { role: 'user', text: 'Show matching devices' },
        { ...BACKBOX_DEVICES },
      ]
      break

    case 'future-backbox-explore':
      drawerOpen.value = true
      chatMessages.value = [
        { ...activeGreeting.value },
        { ...BACKBOX_PROMO, responsePillsUsed: true },
        { role: 'user', text: 'Explore BackBox' },
        { ...BACKBOX_EXPLORE },
      ]
      break

    case 'future-backbox-deal':
      drawerOpen.value = true
      chatMessages.value = [
        { ...activeGreeting.value },
        { ...BACKBOX_PROMO, responsePillsUsed: true },
        { role: 'user', text: 'Create a Deal' },
        { ...BACKBOX_DEAL },
      ]
      break

    case 'future-whats-new-greeting':
      drawerOpen.value = true
      chatMessages.value = [{ ...GREETING_WHATS_NEW }]
      break

    case 'future-whats-new-feed':
      drawerOpen.value = true
      chatMessages.value = [{ ...GREETING_WHATS_NEW }]
      activeReleaseFeed.value = true
      break
  }
}
</script>

<template>
  <div class="flex h-screen overflow-hidden font-body">

    <!-- Sidebar -->
    <PrototypeSidebar
      title="Support AI"
      :concepts="conceptMeta"
      :active-concept="activeConcept"
      :preview-mode="previewMode"
      :sidebar-open="sidebarOpen"
      :active-page-id="activePageId"
      :active-sub-state-id="activeSubStateId"
      :dropped-concepts="DROPPED_CONCEPTS"
      hide-concept-details
      @update:active-concept="activeConcept = $event"
      @update:preview-mode="previewMode = $event"
      @update:sidebar-open="sidebarOpen = $event"
      @update:active-page-id="setActivePage"
      @set-sub-state="(_, sub) => applySubState(sub)"
      @reset="handleReset"
    />

    <!-- Main -->
    <div class="flex-1 flex flex-col overflow-hidden relative">

      <!-- Header -->
      <div class="sticky top-0 z-30 bg-bm-surface flex-shrink-0">
        <header class="border-b border-bm-border">
          <div class="flex items-center px-8 h-14 gap-4">
            <img :src="`${baseHref}/bm-logo.svg`" alt="Back Market" class="h-8 w-auto select-none" />
            <span class="ml-4 text-sm text-bm-text-mid">Hello <strong class="font-semibold text-bm-text-hi">{{ SELLER_NAME }}</strong></span>
            <div class="ml-auto flex items-center gap-2">
              <button @click="drawerOpen = true" class="inline-flex items-center gap-1.5 bg-bm-text-hi text-white text-sm font-medium px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity">
                <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1l1.5 3.5L13 6l-3.5 1.5L8 11l-1.5-3.5L3 6l3.5-1.5L8 1z"/>
                  <path d="M13 10l.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8L13 10z"/>
                </svg>
                Support AI
              </button>
              <button class="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-bm-text-hi bg-bm-gray-100 hover:bg-bm-gray-200 rounded-bm transition-colors">
                EN
                <svg class="w-4 h-4 text-bm-text-muted" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>
              </button>
              <button class="w-8 h-8 rounded-full bg-bm-gray-100 border border-bm-border flex items-center justify-center hover:bg-bm-gray-200 transition-colors">
                <svg class="w-4 h-4 text-bm-text-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              </button>
            </div>
          </div>
        </header>

        <!-- Nav -->
        <nav class="border-b border-bm-border">
          <div class="px-8 flex items-center">
            <button
              v-for="item in NAV_ITEMS"
              :key="item"
              :class="['relative px-4 py-3 text-sm transition-colors border-b-2 whitespace-nowrap', item === activeNavItem ? 'font-semibold text-bm-text-hi border-bm-text-hi' : 'font-normal text-bm-text-muted border-transparent hover:text-bm-text-mid hover:border-bm-gray-300']"
              @click="activeNavItem = item"
            >{{ item }}</button>
          </div>
        </nav>
      </div>

      <!-- Page content -->
      <div class="relative flex-1 overflow-hidden">
        <div class="absolute inset-0 overflow-y-auto bg-bm-surface">
          <div class="px-8 py-6">

            <!-- Page heading -->
            <div class="flex items-center justify-between mb-6">
              <h1 class="text-2xl font-heading-secondary font-semibold text-bm-text-hi">Hello, {{ SELLER_NAME }}!</h1>
              <button class="flex items-center gap-1 px-3 py-1.5 text-sm text-bm-text-hi bg-white hover:bg-bm-gray-100 rounded-bm border border-bm-border transition-colors">
                Euro
                <svg class="w-4 h-4 text-bm-text-muted" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>
              </button>
            </div>

            <!-- Dashboard grid -->
            <div class="grid grid-cols-3 gap-4">

              <!-- Task list -->
              <div class="bg-white rounded-bm-lg border border-bm-border p-5">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2 text-sm font-semibold text-bm-text-hi">
                    <svg class="w-4 h-4 text-bm-text-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                    Task list
                  </div>
                  <span class="flex items-center gap-1">
                    <svg class="w-3.5 h-3.5 text-bm-gray-200" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" /></svg>
                    <span class="w-20 h-3 bg-bm-gray-200 rounded inline-block"></span>
                  </span>
                </div>
                <ul class="divide-y divide-bm-border">
                  <li v-for="(w, i) in ['w-36', 'w-28', 'w-32', 'w-24', 'w-28', 'w-32']" :key="i" class="flex items-center justify-between py-2.5">
                    <div :class="['h-3.5 bg-bm-gray-200 rounded', w]"></div>
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-3.5 bg-bm-gray-200 rounded"></div>
                      <svg class="w-4 h-4 text-bm-gray-200" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- Sale insights -->
              <div class="col-span-2 bg-white rounded-bm-lg border border-bm-border p-5">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2 text-sm font-semibold text-bm-text-hi">
                    <svg class="w-4 h-4 text-bm-text-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                    Sale Insights
                  </div>
                  <div class="flex items-center gap-2">
                    <button class="flex items-center gap-1 text-xs px-2.5 py-1 bg-bm-gray-100 hover:bg-bm-gray-200 rounded-bm border border-bm-border transition-colors text-bm-text-mid">
                      Last 7 days
                      <svg class="w-3.5 h-3.5 text-bm-text-muted" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>
                    </button>
                    <button class="text-xs px-2.5 py-1 bg-bm-gray-100 hover:bg-bm-gray-200 rounded-bm border border-bm-border transition-colors text-bm-text-mid">View details</button>
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-3">
                  <div v-for="i in 3" :key="i" class="bg-bm-surface rounded-bm p-3">
                    <div class="w-28 h-3 bg-bm-gray-200 rounded mb-3"></div>
                    <div class="flex items-center gap-2 mb-2">
                      <div class="w-20 h-5 bg-bm-gray-200 rounded"></div>
                      <div class="w-10 h-3 bg-bm-gray-200 rounded"></div>
                    </div>
                    <div class="w-20 h-3 bg-bm-gray-200 rounded"></div>
                  </div>
                </div>
              </div>

              <!-- Trade-in -->
              <div class="bg-white rounded-bm-lg border border-bm-border p-5">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2 text-sm font-semibold text-bm-text-hi">
                    <svg class="w-4 h-4 text-bm-text-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                    Trade-in
                  </div>
                  <div class="flex items-center gap-2">
                    <button class="flex items-center gap-1 text-xs px-2.5 py-1 bg-bm-gray-100 hover:bg-bm-gray-200 rounded-bm border border-bm-border transition-colors text-bm-text-mid">
                      Last 7 days
                      <svg class="w-3.5 h-3.5 text-bm-text-muted" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>
                    </button>
                    <button class="text-xs px-2.5 py-1 bg-bm-gray-100 hover:bg-bm-gray-200 rounded-bm border border-bm-border transition-colors text-bm-text-mid">View details</button>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="bg-bm-surface rounded-bm p-3">
                    <div class="w-24 h-3 bg-bm-gray-200 rounded mb-2"></div>
                    <div class="w-14 h-7 bg-bm-gray-200 rounded mb-2"></div>
                    <div class="w-20 h-3 bg-bm-gray-200 rounded"></div>
                  </div>
                  <div class="bg-bm-surface rounded-bm p-3">
                    <div class="w-32 h-3 bg-bm-gray-200 rounded mb-2"></div>
                    <div class="w-12 h-7 bg-bm-gray-200 rounded mb-2"></div>
                    <div class="w-16 h-3 bg-bm-gray-200 rounded"></div>
                  </div>
                </div>
              </div>

              <!-- Wallet -->
              <div class="col-span-2 bg-white rounded-bm-lg border border-bm-border p-5">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2 text-sm font-semibold text-bm-text-hi">
                    <svg class="w-4 h-4 text-bm-text-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18-3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3m18 0V6" /></svg>
                    Wallet
                  </div>
                  <div class="flex items-center gap-2">
                    <button class="flex items-center gap-1 text-xs px-2.5 py-1 bg-bm-gray-100 hover:bg-bm-gray-200 rounded-bm border border-bm-border transition-colors text-bm-text-mid">
                      Euro
                      <svg class="w-3.5 h-3.5 text-bm-text-muted" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>
                    </button>
                    <button class="text-xs px-2.5 py-1 bg-bm-gray-100 hover:bg-bm-gray-200 rounded-bm border border-bm-border transition-colors text-bm-text-mid">View details</button>
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-3">
                  <div v-for="(w, i) in [['w-14', 'w-28', 'w-24'], ['w-24', 'w-24', 'w-20'], ['w-28', 'w-16', 'w-14']]" :key="i" class="bg-bm-surface rounded-bm p-3">
                    <div :class="['h-3 bg-bm-gray-200 rounded mb-2', w[0]]"></div>
                    <div :class="['h-5 bg-bm-gray-200 rounded mb-2', w[1]]"></div>
                    <div :class="['h-3 bg-bm-gray-200 rounded', w[2]]"></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- Drawer backdrop -->
      <Transition name="backdrop">
        <div v-if="drawerOpen" class="absolute inset-0 z-40 bg-black/30" @click="drawerOpen = false" />
      </Transition>

      <!-- Support AI chat drawer -->
      <Transition name="drawer">
        <div v-if="drawerOpen" class="absolute right-0 top-0 bottom-0 z-50 w-[65vw] bg-surface-default-mid flex flex-col border-l border-bm-border shadow-2xl">

          <!-- Drawer header -->
          <div class="flex items-center px-6 py-4 border-b border-bm-border flex-shrink-0">
            <button @click="clearChat" class="text-sm text-bm-text-muted hover:text-bm-text-hi transition-colors">Clear chat</button>
            <span class="flex-1 text-center text-sm font-semibold text-bm-text-hi">Support AI</span>
            <button @click="drawerOpen = false" class="w-8 h-8 flex items-center justify-center rounded-bm hover:bg-bm-gray-100 text-bm-text-muted hover:text-bm-text-hi transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Messages -->
          <div ref="chatContainer" class="flex-1 overflow-y-auto p-6 space-y-5">

            <template v-for="(msg, i) in chatMessages" :key="i">

              <!-- User message -->
              <div v-if="msg.role === 'user'" class="bg-static-default-low rounded-bm-lg p-4">
                <div class="flex items-center gap-2.5 mb-1.5">
                  <div class="w-8 h-8 rounded-full bg-bm-gray-300 flex items-center justify-center flex-shrink-0">
                    <span class="text-sm font-semibold text-bm-text-mid">{{ CHAT_USER_NAME[0] }}</span>
                  </div>
                  <span class="text-sm font-semibold text-bm-text-hi">{{ CHAT_USER_NAME }}</span>
                </div>
                <p class="text-sm text-bm-text-mid leading-relaxed pl-10">{{ msg.text }}</p>
              </div>

              <!-- AI message -->
              <div v-else class="flex gap-3">
                <div class="w-9 h-9 rounded-full bg-[#6B5CE7] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <img :src="`${baseHref}/bm-avatar.svg`" class="w-5 h-5 invert" alt="" />
                </div>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-bm-text-hi mb-2">Support AI</p>
                  <div class="bg-static-default-low rounded-bm-lg p-4">

                  <p class="text-sm text-bm-text-mid leading-relaxed whitespace-pre-line">{{ msg.text }}</p>
                  <p v-if="msg.learnMore" class="text-sm font-semibold text-bm-text-hi mt-3">I can't provide legal, financial, or professional advice. <a href="#" class="underline hover:opacity-75">Learn more</a></p>
                  <!-- Topic / question pills -->
                  <div v-if="msg.pills?.length" class="mt-4">

                    <!-- Level 2: question pills for selected topic -->
                    <template v-if="activePillTopic">
                      <button
                        class="flex items-center gap-1 text-xs text-bm-text-muted hover:text-bm-text-hi transition-colors mb-3"
                        @click="activePillTopic = null"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                        Back
                      </button>
                      <div class="flex flex-wrap gap-2">
                        <button
                          v-for="q in TOPIC_QUESTIONS[activePillTopic]"
                          :key="q"
                          class="h-auto py-1.5 px-3 text-sm rounded-full border border-bm-border-action text-bm-text-hi bg-white hover:bg-bm-gray-100 transition-colors text-left"
                          @click="sendPillQuestion(q)"
                        >{{ q }}</button>
                      </div>
                    </template>

                    <!-- Level 1: topic pills -->
                    <div v-else>
                      <div class="flex flex-wrap gap-2">
                        <button
                          v-for="pill in msg.pills"
                          :key="pill"
                          class="inline-flex items-center gap-1.5 h-8 px-3 text-sm rounded-full border border-bm-border-action text-bm-text-hi bg-white hover:bg-bm-gray-100 transition-colors whitespace-nowrap"
                          @click="activePillTopic = pill"
                        >
                          <svg v-if="TOPIC_PILL_ICONS[pill]" class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" v-html="TOPIC_PILL_ICONS[pill]" />
                          {{ pill }}
                        </button>
                      </div>
                      <!-- Insight trigger section -->
                      <div v-if="msg.showInsightTrigger && !insightTriggered" class="mt-4 pt-4 border-t border-bm-border">
                        <p class="text-xs font-medium text-bm-text-muted mb-2">📊 Business insights</p>
                        <button
                          class="h-8 px-3 text-sm rounded-full border border-bm-border-action text-bm-text-hi bg-white hover:bg-bm-gray-100 transition-colors whitespace-nowrap"
                          @click="handleInsightTrigger()"
                        >Show me my business insights</button>
                      </div>
                      <!-- What's new section -->
                      <div v-if="msg.showWhatsNew" class="mt-4 pt-4 border-t border-bm-border">
                        <!-- Feed expanded inline -->
                        <template v-if="activeReleaseFeed">
                          <button
                            class="flex items-center gap-1 text-xs text-bm-text-muted hover:text-bm-text-hi transition-colors mb-3"
                            @click="goBackFromFeed()"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                            Back
                          </button>
                          <div v-for="group in WHATS_NEW_FEED" :key="group.date" class="mb-4 last:mb-0">
                            <p class="text-xs font-semibold text-bm-text-muted uppercase tracking-wide mb-2">{{ group.date }}</p>
                            <div class="flex flex-wrap gap-2">
                              <button
                                v-for="pill in group.pills"
                                :key="pill.label"
                                class="h-auto py-1.5 px-3 text-sm rounded-full border border-bm-border-action text-bm-text-hi bg-white hover:bg-bm-gray-100 transition-colors text-left"
                                @click="handleReleasePill(pill.label, pill.action)"
                              >{{ pill.label }}</button>
                            </div>
                          </div>
                        </template>
                        <!-- Feed collapsed: show single pill -->
                        <template v-else>
                          <p class="text-xs font-medium text-bm-text-muted mb-2">✨ What's new</p>
                          <button
                            class="h-8 px-3 text-sm rounded-full border border-bm-border-action text-bm-text-hi bg-white hover:bg-bm-gray-100 transition-colors whitespace-nowrap"
                            @click="handleWhatsNewPill()"
                          >What's new in the Back Office</button>
                        </template>
                      </div>
                    </div>

                  </div>
                  <!-- Bullets -->
                  <ul v-if="msg.bullets?.length" class="mt-3 space-y-1.5">
                    <li v-for="bullet in msg.bullets" :key="bullet" class="flex items-start gap-2 text-sm text-bm-text-mid">
                      <span class="text-bm-text-muted mt-0.5 select-none">·</span>
                      <span>{{ bullet }}</span>
                    </li>
                  </ul>
                  <!-- Note (closing sentence after bullets) -->
                  <p v-if="msg.note" class="mt-3 text-sm text-bm-text-mid leading-relaxed">{{ msg.note }}</p>
                  <!-- Source -->
                  <a v-if="msg.source" href="#" class="mt-4 flex items-center gap-1.5 text-sm font-medium text-bm-text-hi underline underline-offset-2 hover:opacity-75 transition-opacity">
                    <span>📄</span>
                    Source: {{ msg.source }}
                  </a>
                  <!-- Based on (personalised insights) -->
                  <p v-if="msg.basedOn" class="mt-4 flex items-center gap-1.5 text-sm font-medium text-bm-text-muted">
                    <span>📄</span>
                    Based on: {{ msg.basedOn }}
                  </p>
                  <!-- CTA button -->
                  <div v-if="msg.ctaButton" class="mt-4">
                    <button
                      class="inline-flex items-center gap-2 px-4 py-2 bg-bm-text-hi text-white text-sm font-medium rounded-bm hover:opacity-90 transition-opacity"
                      @click="activeNavItem = msg.ctaButton!.navItem ?? 'Money'; drawerOpen = false"
                    >{{ msg.ctaButton.label }}</button>
                  </div>
                  <!-- Response pills (Yes / No confirmations) -->
                  <div v-if="msg.responsePills?.length && !msg.responsePillsUsed" class="flex flex-wrap gap-2 mt-4">
                    <button
                      v-for="pill in msg.responsePills"
                      :key="pill.label"
                      class="h-8 px-3 text-sm rounded-full border border-bm-border-action text-bm-text-hi bg-white hover:bg-bm-gray-100 transition-colors whitespace-nowrap"
                      @click="handleResponsePill(msg, pill.action)"
                    >{{ pill.label }}</button>
                  </div>
                  <!-- Try again (error state) -->
                  <div v-if="msg.isError" class="mt-4">
                    <button @click="retryLastMessage" class="px-4 py-2 bg-bm-text-hi text-white text-sm font-medium rounded-bm hover:opacity-90 transition-opacity">
                      Try again
                    </button>
                  </div>
                  <!-- Contact support (no-answer state) -->
                  <div v-if="msg.showContactSupport" class="mt-4">
                    <button class="inline-flex items-center gap-2 px-4 py-2 bg-bm-gray-100 hover:bg-bm-gray-200 rounded-full text-sm font-medium text-bm-text-hi border border-bm-border transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"/></svg>
                      Contact support
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                  <!-- Feedback -->
                  <div v-if="msg.showFeedback" class="mt-4 space-y-3">
                    <div class="flex items-center gap-2">
                      <span class="text-sm text-bm-text-muted">Was this helpful?</span>
                      <button
                        @click="giveFeedback(msg, 'up')"
                        :class="['w-8 h-8 rounded-full border flex items-center justify-center transition-colors', msg.feedbackGiven === 'up' ? 'bg-bm-text-hi border-bm-text-hi text-white' : 'border-bm-border hover:border-bm-gray-400 text-bm-text-muted']"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.669A1.989 1.989 0 013.9 18h-.6a1.5 1.5 0 01-1.5-1.5v-6a1.5 1.5 0 011.5-1.5h.6a2 2 0 011.978 1.698c.088.504.13 1.022.13 1.552a11.92 11.92 0 01-.086 1.423L5.904 18.67z"/></svg>
                      </button>
                      <button
                        @click="giveFeedback(msg, 'down')"
                        :class="['w-8 h-8 rounded-full border flex items-center justify-center transition-colors', msg.feedbackGiven === 'down' ? 'bg-bm-text-hi border-bm-text-hi text-white' : 'border-bm-border hover:border-bm-gray-400 text-bm-text-muted']"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384"/></svg>
                      </button>
                      <span v-if="msg.feedbackGiven" class="text-sm text-bm-text-muted">Thanks! Your feedback helps us improve.</span>
                    </div>
                    <!-- Still need help — thumbs down only -->
                    <div v-if="msg.feedbackGiven === 'down'" class="flex items-center gap-3">
                      <span class="text-sm text-bm-text-muted">Still need help?</span>
                      <button class="inline-flex items-center gap-2 px-4 py-2 bg-bm-gray-100 hover:bg-bm-gray-200 rounded-full text-sm font-medium text-bm-text-hi border border-bm-border transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"/></svg>
                        Contact support
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                      </button>
                    </div>
                  </div>
                  </div>
                </div>
              </div>

            </template>

            <!-- Loading state -->
            <div v-if="chatLoading" class="flex gap-3">
              <div class="w-9 h-9 rounded-full bg-[#6B5CE7] flex items-center justify-center flex-shrink-0 mt-0.5">
                <img :src="`${baseHref}/bm-avatar.svg`" class="w-5 h-5 invert" alt="" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-bm-text-hi mb-2">Support AI</p>
                <div class="flex items-center gap-2 text-sm text-bm-text-muted">
                  <svg class="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"/></svg>
                  Reading up...
                </div>
              </div>
            </div>

          </div>

          <!-- Input area -->
          <div class="border-t border-bm-border p-4 flex-shrink-0">
            <form @submit.prevent="sendMessage" class="flex gap-2">
              <input
                v-model="chatInput"
                type="text"
                placeholder="Describe your issue"
                :disabled="chatLoading"
                class="flex-1 text-sm px-4 py-2.5 border border-bm-border rounded-bm focus:outline-none focus:border-bm-text-hi bg-static-default-low text-bm-text-hi placeholder-bm-text-muted disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                :disabled="!chatInput.trim() || chatLoading"
                class="w-10 h-10 bg-bm-text-hi text-white rounded-bm flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>
              </button>
            </form>
            <p class="text-xs text-bm-text-muted mt-2">Support AI can make mistakes. Do not share personal details (e.g., identification, bank codes, passwords).</p>
          </div>

        </div>
      </Transition>

    </div>
  </div>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}
</style>
