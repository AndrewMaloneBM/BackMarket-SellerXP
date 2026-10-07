<script setup lang="ts">
definePageMeta({ layout: false })

const { hub } = useAppConfig()
const runtimeConfig = useRuntimeConfig()
const baseHref = (runtimeConfig.app.baseURL ?? '/').replace(/\/$/, '')
const withBase = (path: string) => `${baseHref}${path}`

useHead({
  title: `${hub.teamName} Prototype Hub`
})

interface Concept {
  n: number
  name: string
  pages: string[]
}

interface Prototype {
  title: string
  description: string
  problemStatement?: string
  author: string
  date: string
  updated: string
  status: 'In progress' | 'Complete' | 'Backlog'
  concepts: Concept[]
  scope: string
  goal?: string
  impact?: string
  link: string
}

const prototypes: Prototype[] = [
  {
    title: 'Deals Adoption',
    description: 'Deal adoption in FR/ES sits at 35-40% vs a 50-60% target. 100-200 daily instances where a seller could adopt a deal at no margin cost and doesn\'t. This prototype explores how to help sellers discover, assess, act on, and track Back Market Deals within the workflows they already use.',
    problemStatement: 'A deal that could earn a seller more is invisible to 60% of the people it\'s built for, and unclear to the rest.',
    author: 'Andrew Malone',
    date: 'August 2026',
    updated: '2026-08-15',
    status: 'In progress',
    concepts: [
      { n: 1, name: 'Hackathon V1', pages: ['Listings'] },
    ],
    scope: 'Home, Listings',
    goal: 'Lift adoption from 35-40% to 50-60%',
    impact: '100-200 daily missed deal instances, +9% GMV uplift when sellers participate',
    link: '/prototypes/deals-adoption',
  },
  {
    title: 'Deals Step One Testing',
    description: 'A scoped first step of the Deals Adoption experience. Unlike the North Star prototype, this starts as a bare Back Office shell (Home, Listings, Opportunities placeholder) and builds up feature by feature based on live tester feedback.',
    problemStatement: 'The North Star deals prototype is a million miles down the road. This is step one.',
    author: 'Andrew Malone',
    date: 'September 2026',
    updated: '2026-09-22',
    status: 'In progress',
    concepts: [
      { n: 1, name: 'Step One shell', pages: ['Home', 'Listings', 'Opportunities'] },
    ],
    scope: 'Home, Listings, Opportunities',
    goal: 'Test a scoped step-one deals experience with external sellers',
    impact: 'Tester round starting 23 September 2026',
    link: '/prototypes/deals-step-one',
  },
  {
    title: 'Seller Cash Flow Optimization via a 6-Tier Risk Model Migration',
    description: 'The current 4-tier deferred payout system holds 100% of Future Refunds as deposit for 76% of sellers, with no realistic path to better cash flow terms. This prototype explores how to surface the new 6-tier risk model in the seller Back Office: where the tier dashboard lives on the Money page, how deposit adjustments are communicated, and how proactive progression guidance helps sellers reach the next tier.',
    problemStatement: 'Mid-performing sellers are stuck in Tier 1 with no visible path to unlock the cash they are owed.',
    author: 'Andrew Malone',
    date: 'August 2026',
    updated: '2026-08-20',
    status: 'In progress',
    concepts: [
      { n: 1, name: 'Full dashboard below wallet', pages: ['Money'] },
      { n: 2, name: 'Split payouts', pages: ['Money'] },
      { n: 3, name: 'Wallet summary + Payouts (inactive)', pages: ['Money'] },
    ],
    scope: 'Home, Money',
    goal: 'Make tier progression and deposit releases transparent for all 1,408 sellers',
    impact: '€4.84M cash released to 512 sellers',
    link: '/prototypes/tier-dashboard',
  },
  {
    title: 'Bring AI into the seller Back Office to reduce support friction and help sellers perform better',
    description: 'Support AI is Back Market\'s first seller-facing AI capability, embedded directly in the BO. Today it answers policy and operational questions instantly. Tomorrow it proactively surfaces personalised insights on payouts, quality, BackFunds eligibility, BackBox opportunities, and new feature releases — without sellers ever leaving the Back Office.',
    problemStatement: 'From answering questions to driving performance — Support AI is the foundation for a smarter Back Office.',
    author: 'Andrew Malone',
    date: 'May 2026',
    updated: '2026-05-10',
    status: 'In progress',
    concepts: [
      { n: 1, name: 'In development',      pages: ['Home'] },
      { n: 2, name: 'Where we want to be', pages: ['Home'] },
    ],
    scope: 'Back Office, all pages',
    goal: 'Reduce support volume + unlock proactive seller performance',
    impact: 'Lower support costs, higher seller engagement, faster feature adoption',
    link: '/prototypes/support-ai',
  },
  {
    title: 'Proactive Seller Insights in Support AI',
    description: 'Support AI evolves from a reactive knowledge-base chatbot into a proactive insight system. It surfaces a small number of high-confidence items that deserve seller attention, lets sellers explore evidence conversationally, and can complete one safe operation (Deal submission) without sending the seller to another workflow. The MVP demonstrates three insight types: Deal (executable), Stock (informational), and Performance (explanatory).',
    problemStatement: 'Sellers need to discover operational opportunities and risks across multiple Back Office areas, but the chatbot only helps when they already know what to ask.',
    author: 'Andrew Malone',
    date: 'September 2026',
    updated: '2026-09-18',
    status: 'In progress',
    concepts: [
      { n: 1, name: 'Proactive Insights MVP', pages: ['Home'] },
    ],
    scope: 'Back Office, Support AI',
    goal: 'Test whether sellers notice, understand, and explore proactive insights',
    impact: 'Badge counts attention items; Deal flow is the first executable action in Support AI',
    link: '/prototypes/proactive-seller-insights',
  },
  {
    title: 'Increase Sellers BackFunds adoption through a dedicated micro service and self-onboarding experience',
    description: 'BackFunds lets Back Market sellers get paid daily instead of waiting a week, but only 11% of eligible sellers use it — mostly because they don\'t know it exists. This prototype explores four ways to surface the service inside the seller Back Office so discovery and self-onboarding become effortless.',
    problemStatement: 'A service that could pay sellers six days faster is invisible to 89% of the people it\'s built for.',
    author: 'Andrew Malone',
    date: 'April 2026',
    updated: '2026-04-18',
    status: 'In progress',
    concepts: [
      { n: 1, name: 'Banner',        pages: ['Home', 'Money'] },
      { n: 2, name: 'Dedicated Tab', pages: ['Money'] },
      { n: 3, name: 'Grid Card',     pages: ['Money'] },
      { n: 4, name: 'Nudge Strip',   pages: ['Money'] },
    ],
    scope: 'Home, Money',
    goal: 'Lift adoption from 11% to 40%',
    impact: '€915K/year today, €1.4–1.9M potential',
    link: '/prototypes/money-tab',
  },
]

const shipped: Prototype[] = []

const search = ref('')
const scopeFilter = ref('All')

const allScopes = computed(() => {
  const scopes = new Set<string>()
  for (const p of prototypes) {
    for (const part of p.scope.split(',').map(s => s.trim())) scopes.add(part)
  }
  return ['All', ...Array.from(scopes).sort()]
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return prototypes.filter((p) => {
    if (scopeFilter.value !== 'All' && !p.scope.split(',').map(s => s.trim()).includes(scopeFilter.value)) return false
    if (!q) return true
    const haystack = `${p.title} ${p.description} ${p.scope} ${p.author} ${p.concepts.map(c => c.name).join(' ')}`.toLowerCase()
    return haystack.includes(q)
  })
})

const statusTone: Record<Prototype['status'], string> = {
  'In progress': 'bg-bm-green-50 text-bm-green-700 border-bm-green-200',
  'Complete': 'bg-bm-gray-100 text-bm-text-mid border-bm-border',
  'Backlog': 'bg-bm-gray-100 text-bm-text-low border-bm-border',
}

</script>

<template>
  <div class="min-h-screen bg-bm-surface">
    <!-- Back Office chrome -->
    <div class="sticky top-0 z-30 bg-bm-white">
      <header class="border-b border-bm-border">
        <div class="flex items-center gap-4 px-8 h-14">
          <img :src="withBase('/bm-logo.svg')" alt="Back Market" class="h-8 w-auto select-none" />
          <div class="flex items-center gap-3 ml-6">
            <span class="text-sm text-bm-text-mid">Prototype Hub</span>
          </div>
          <div class="ml-auto flex items-center gap-2">
            <button class="ml-1 w-8 h-8 rounded-full bg-bm-gray-100 border border-bm-border flex items-center justify-center hover:bg-bm-gray-200 transition-colors">
              <svg class="w-4 h-4 text-bm-text-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
            </button>
          </div>
        </div>
      </header>
    </div>

    <main class="max-w-6xl mx-auto px-8 py-10">
      <!-- Page heading -->
      <div class="flex items-end justify-between gap-6 flex-wrap mb-8">
        <div>
          <h1 class="font-display text-4xl text-bm-text-hi">Prototype Hub</h1>
          <p class="text-sm text-bm-text-low mt-2">
            {{ hub.teamName }} · {{ prototypes.length }} prototypes · fully mocked, safe to explore
          </p>
        </div>
        <div class="flex items-center gap-3">
          <label class="relative">
            <svg class="w-4 h-4 text-bm-text-muted absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.2-5.2M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" /></svg>
            <input
              v-model="search"
              type="search"
              placeholder="Search prototypes"
              class="w-64 pl-9 pr-3 py-2 text-sm bg-bm-white border border-bm-border rounded-bm-sm focus:outline-none focus:border-bm-green-500 transition-colors"
            />
          </label>
          <select
            v-model="scopeFilter"
            class="py-2 px-3 text-sm bg-bm-white border border-bm-border rounded-bm-sm text-bm-text-mid focus:outline-none focus:border-bm-green-500"
          >
            <option v-for="s in allScopes" :key="s" :value="s">{{ s === 'All' ? 'All scopes' : s }}</option>
          </select>
        </div>
      </div>

      <!-- Cards -->
      <section class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <article
          v-for="p in filtered"
          :key="p.link"
          class="group bg-bm-white border border-bm-border rounded-bm-lg p-6 flex flex-col hover:border-bm-border-action hover:shadow-[0_2px_8px_rgba(20,22,30,0.06)] transition-all"
        >
          <div class="flex items-start justify-between gap-4">
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-bm-xl border text-xs font-medium"
              :class="statusTone[p.status]"
            >
              <span v-if="p.status === 'In progress'" class="w-1.5 h-1.5 rounded-full bg-bm-green-500 animate-pulse"></span>
              {{ p.status }}
            </span>
            <span class="text-xs text-bm-text-muted mt-1">{{ p.date }}</span>
          </div>

          <h2 class="font-display text-xl text-bm-text-hi mt-3 leading-snug">{{ p.title }}</h2>
          <p v-if="p.problemStatement" class="text-sm text-bm-text-mid mt-2 italic leading-relaxed">{{ p.problemStatement }}</p>

          <div class="flex flex-wrap gap-1.5 mt-4">
            <span
              v-for="scope in p.scope.split(',').map(s => s.trim())"
              :key="scope"
              class="px-2 py-0.5 rounded-bm-sm bg-bm-gray-100 border border-bm-border text-xs text-bm-text-low"
            >{{ scope }}</span>
          </div>

          <div class="flex items-center justify-between mt-5 pt-4 border-t border-bm-border">
            <span class="text-xs text-bm-text-low">
              {{ p.concepts.length }} concept{{ p.concepts.length > 1 ? 's' : '' }}
            </span>
            <a
              :href="withBase(p.link)"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-bm bg-bm-green-600 text-white text-sm font-medium hover:bg-bm-green-700 transition-colors"
            >
              Open prototype
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" /></svg>
            </a>
          </div>
        </article>

        <!-- Empty state -->
        <div v-if="filtered.length === 0" class="md:col-span-2 bg-bm-white border border-bm-border rounded-bm-lg p-12 text-center">
          <p class="text-sm text-bm-text-low">No prototypes match your search.</p>
          <button
            class="mt-4 text-sm text-bm-green-700 hover:underline"
            @click="search = ''; scopeFilter = 'All'"
          >Clear filters</button>
        </div>
      </section>

      <!-- Shipped -->
      <section v-if="shipped.length" class="mt-12">
        <h2 class="font-display text-2xl text-bm-text-hi mb-4">Complete projects</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <article
            v-for="p in shipped"
            :key="p.link"
            class="bg-bm-white border border-bm-border rounded-bm-lg p-6"
          >
            <span class="inline-flex px-2.5 py-0.5 rounded-bm-xl border text-xs font-medium" :class="statusTone[p.status]">{{ p.status }}</span>
            <h3 class="font-display text-lg text-bm-text-hi mt-3">{{ p.title }}</h3>
            <a :href="withBase(p.link)" class="text-sm text-bm-green-700 hover:underline mt-3 inline-block">Open prototype</a>
          </article>
        </div>
      </section>

      <footer class="mt-14 pt-6 border-t border-bm-border flex items-center justify-between text-xs text-bm-text-muted">
        <span>{{ hub.teamName }} Prototype Hub · internal only · Okta gated</span>
        <span>Seller Experience squad</span>
      </footer>
    </main>
  </div>
</template>
