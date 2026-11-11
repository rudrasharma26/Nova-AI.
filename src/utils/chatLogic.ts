export interface MessageAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: MessageAttachment[];
  isError?: boolean;
  modelUsed?: string;
  researchEnabled?: boolean;
  citations?: Array<{ title: string; source: string; url?: string }>;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

/**
 * Filter conversations based on search query matching title or message content.
 */
export function filterConversations(conversations: Conversation[], query: string): Conversation[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return conversations;
  return conversations.filter((c) => {
    const titleMatch = c.title.toLowerCase().includes(clean);
    const messageMatch = c.messages.some((m) => m.content.toLowerCase().includes(clean));
    return titleMatch || messageMatch;
  });
}

/**
 * Format relative timestamps cleanly without middle dots.
 */
export function formatRelativeTime(dateString: string, now: Date = new Date()): string {
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHour / 24);

  if (diffSec < 45) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Create a new empty conversation with standard naming.
 */
export function createNewConversation(): Conversation {
  const now = new Date().toISOString();
  return {
    id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: 'New conversation',
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

/**
 * Derive an updated conversation title from the first user message.
 */
export function deriveTitleFromMessage(message: string): string {
  const clean = message.replace(/\n+/g, ' ').trim();
  if (!clean) return 'New conversation';
  if (clean.length <= 36) return clean;
  return clean.slice(0, 36).trim() + '…';
}

/**
 * Seeded conversations: relatable, diverse everyday mix.
 * 1. Casual/creative: Mallorcan olive oil brand concepts
 * 2. Research with citations: Caffeine metabolism & sleep architecture
 * 3. Document understanding with file attached: Residential solar agreement review
 * 4. Quick coding help: SVG stroke dash animation in CSS
 */
export const GENERAL_SEEDED_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-brand-creative',
    title: 'Mallorcan Olive Oil Brand Concepts',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    messages: [
      {
        id: 'msg-c1',
        role: 'user',
        content: 'Can you help me brainstorm names, brand narrative, and bottle design notes for an artisanal cold-pressed olive oil from a family grove in Mallorca? Looking for something rooted, modern, and quiet.',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: 'msg-c2',
        role: 'assistant',
        content: `Here are three brand directions for your Mallorcan grove, designed to stand out through restraint and sensory heritage:

### 1. Direction: *Olea Niu* (The Grove's Nest)
- **Concept**: Celebrates the centuries-old olive trees as permanent bird sanctuaries and micro-ecosystems nestled in the Serra de Tramuntana.
- **Tone**: Gentle, ancestral, restorative.
- **Narrative Lead**: *"Milled within four hours of harvest under morning sea mist. Olive oil made not by hurry, but by weather and stone."*

### 2. Direction: *Sa Pedrera* (The Quarry of Light)
- **Concept**: Focuses on the mineral-rich limestone terraces where the roots drill deep for mountain moisture.
- **Tone**: Crisp, architectural, culinary-forward.

### Visual & Packaging Guidelines

| Element | Specification | Rationale |
| :--- | :--- | :--- |
| Glass Vessel | Matte ultraviolet or deep flint amber | Protects delicate polyphenols from light oxidation |
| Closure | Turned beechwood cap with cork insert | Warm tactile contrast against cool glass |
| Label Stock | Heavyweight cotton paper, blind debossed | Tells the origin story through texture, not loud graphics |

> **Next step**: If you want, we can develop tasting notes for the front label or draft the back-of-bottle micro-copy for the harvest batch date.`,
        timestamp: new Date(Date.now() - 3600000 * 3 + 7000).toISOString(),
      },
    ],
  },
  {
    id: 'conv-caffeine-research',
    title: 'Caffeine Metabolism & Sleep Architecture',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    messages: [
      {
        id: 'msg-r1',
        role: 'user',
        content: 'What does current scientific consensus say about caffeine half-life, adenosine receptor blocking, and its effect on slow-wave deep sleep?',
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
      },
      {
        id: 'msg-r2',
        role: 'assistant',
        content: `Here is a synthesis of current clinical research regarding caffeine kinetics and sleep neurobiology:

### Mechanism of Action
Caffeine functions as a non-selective antagonist of **adenosine A1 and A2A receptors** in the central nervous system [1]. Under normal wakefulness, extracellular adenosine accumulates in the basal forebrain, generating homeostatic sleep pressure. Caffeine prevents adenosine binding without activating the receptors, artificially masking subjective fatigue while the underlying sleep drive continues to build.

### Metabolic Timeline & Variability

| Stage | Typical Duration | Biological Factor |
| :--- | :--- | :--- |
| Absorption Peak | 30 to 60 minutes | Rapid gastric & small intestine uptake [2] |
| Plasma Half-Life ($t_{1/2}$) | 4.5 to 7.0 hours | Hepatic CYP1A2 enzyme expression |
| Quarter-Life ($t_{1/4}$) | 9.0 to 14.0 hours | Residual receptor occupancy during evening hours |

### Impact on Sleep Architecture
Even when individuals report falling asleep without difficulty after late caffeine consumption, polysomnography reveals distinct neurological disruption [3]:
- **Slow-Wave Sleep (SWS / NREM Stage 3)**: Reduced by 15% to 30%, attenuating deep cellular repair and glymphatic waste clearance.
- **Sleep Spindle Density**: Alterations in EEG spectral power during early sleep cycles.
- **REM Fragmentation**: Increased micro-arousals and delayed first REM cycle onset.

### Research Citations & Sources
1. **National Institutes of Health (PMC)**: *Adenosinergic mechanisms in sleep regulation and cognitive function* (2023).
2. **Sleep Medicine Reviews**: *Systematic meta-analysis on diurnal caffeine administration and objective sleep staging* (2022).
3. **Journal of Clinical Sleep Medicine**: *Caffeine effects on sleep taken 0, 3, or 6 hours before bedtime* (Drake et al.).`,
        timestamp: new Date(Date.now() - 3600000 * 18 + 9000).toISOString(),
        researchEnabled: true,
        citations: [
          { title: 'Adenosinergic mechanisms in sleep regulation', source: 'NIH PubMed Central', url: 'https://ncbi.nlm.nih.gov' },
          { title: 'Diurnal caffeine kinetics and polysomnography', source: 'Sleep Medicine Reviews', url: 'https://sciencedirect.com' },
          { title: 'Caffeine timing and slow-wave sleep decay', source: 'JCSM Clinical Sleep', url: 'https://jcsm.aasm.org' },
        ],
      },
    ],
  },
  {
    id: 'conv-doc-solar',
    title: 'Solar Lease Agreement Analysis',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    messages: [
      {
        id: 'msg-d1',
        role: 'user',
        content: 'I have attached the residential solar lease proposal. Can you break down the annual escalator clause, the net metering assumptions, and what happens if we sell our house before the 20-year term ends?',
        timestamp: new Date(Date.now() - 3600000 * 36).toISOString(),
        attachments: [
          {
            id: 'att-solar-01',
            name: 'SunPath_Residential_PPA_Quote.pdf',
            size: '2.4 MB',
            type: 'application/pdf',
          },
        ],
      },
      {
        id: 'msg-d2',
        role: 'assistant',
        content: `I reviewed **SunPath_Residential_PPA_Quote.pdf**. Here is an objective analysis of the financial terms, transfer obligations, and hidden risks:

### Core Financial Parameters

| Term | Quoted Rate | Assessment & Risk |
| :--- | :--- | :--- |
| Year 1 Kilowatt Rate | $0.165 / kWh | Attractive initial 18% discount vs. local utility base |
| Annual Escalator | **2.9% compounded** | High cumulative risk: Year 15 rate reaches $0.246/kWh |
| Contract Duration | 20 Years (240 months) | Long-term encumbrance on property deed |
| Production Guarantee | 9,400 kWh/year | True-up calculated biennially, not monthly |

### Critical Clause Breakdown

1. **Home Sale & Lease Transfer (Section 14.2)**
   If you sell the house, the buyer must qualify under SunPath's tier-1 credit criteria (FICO $\ge 680$) and sign a full assumption agreement. If the buyer declines:
   - You must either pay the **depreciated system buyout fee** (calculated at $18,400 in Year 5).
   - Or pay $2,800 to have the panels uninstalled and stored.

2. **Net Metering Trade-Off (Section 8.1)**
   The quote assumes your local utility keeps a 1:1 net metering credit. Under newer utility tariff rules (like NEM 3.0), export credits are reduced by ~75% during peak sun hours unless paired with battery storage.

> **Recommendation**: Ask SunPath to remove the 2.9% annual escalator in exchange for a fixed $0.185/kWh rate, or explore direct ownership with a home equity loan to retain full federal tax credits.`,
        timestamp: new Date(Date.now() - 3600000 * 36 + 11000).toISOString(),
      },
    ],
  },
  {
    id: 'conv-css-drawing',
    title: 'CSS SVG Stroke Draw Animation',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    messages: [
      {
        id: 'msg-s1',
        role: 'user',
        content: 'How do I animate an SVG outline drawing itself in pure CSS without any external libraries?',
        timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
      },
      {
        id: 'msg-s2',
        role: 'assistant',
        content: `You can create a smooth path drawing effect using two SVG properties in CSS: \`stroke-dasharray\` and \`stroke-dashoffset\`.

### The Core Technique

\`\`\`css
/* 1. Define the animated path */
.draw-path {
  /* Set dash length equal to or greater than the path's total length */
  stroke-dasharray: 600;
  stroke-dashoffset: 600;
  animation: drawLine 2.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes drawLine {
  to {
    /* Offset transitions to 0, revealing the full stroke */
    stroke-dashoffset: 0;
  }
}
\`\`\`

### Example SVG Markup

\`\`\`html
<svg viewBox="0 0 200 200" width="120" height="120">
  <path
    class="draw-path"
    d="M 20,100 C 60,20 140,20 180,100 S 140,180 20,100"
    fill="none"
    stroke="#5B47E0"
    stroke-width="3"
    stroke-linecap="round"
  />
</svg>
\`\`\`

> **Tip**: To find the exact pixel length of any arbitrary path, call \`pathElement.getTotalLength()\` in your browser console, or round up to a safe estimate.`,
        timestamp: new Date(Date.now() - 3600000 * 72 + 6000).toISOString(),
      },
    ],
  },
];

/**
 * Split text into tokens for smooth realistic streaming simulation.
 */
export function chunkResponseText(text: string): string[] {
  const tokens: string[] = [];
  const words = text.split(/(\s+|```[\s\S]*?```|\n)/g).filter(Boolean);
  for (const word of words) {
    if (word.startsWith('```') && word.endsWith('```')) {
      const lines = word.split('\n');
      for (let i = 0; i < lines.length; i++) {
        tokens.push(lines[i] + (i < lines.length - 1 ? '\n' : ''));
      }
    } else if (word.length > 20) {
      for (let i = 0; i < word.length; i += 12) {
        tokens.push(word.slice(i, i + 12));
      }
    } else {
      tokens.push(word);
    }
  }
  return tokens;
}
