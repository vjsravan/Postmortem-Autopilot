# Postmortem Autopilot

> **AI-powered blameless post-mortem generator** — paste your incident signals, get a full draft in seconds.
>
> Built with Next.js 14 + Claude (Anthropic). No auth required. Single-user tool.
>
> ![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss) ![Anthropic](https://img.shields.io/badge/Claude-claude--opus--4-orange)
>
> ---
>
> ## Features
>
> - **Incident form** — paste a time range + service name + raw signals (GitHub commits, PagerDuty alerts, Slack messages)
> - - **Auto-generates blameless post-mortems** with Claude, explicitly prompted to never mention individual names
>   - - **Structured output** with: executive summary, timeline of events, root cause chain, contributing factors, what went well / wrong, 5 action items with team owners + due dates
>     - - **Severity classifier** — auto-assigns P1/P2/P3 with written reasoning
>       - - **Timeline gap detector** — highlights windows where data is missing and flags them with warnings
>         - - **Export** — formatted Markdown or Confluence wiki format, copy-to-clipboard or download
>           - - **PagerDuty webhook** — optional endpoint at `/api/webhook` that receives resolved incident payloads
>             - - **Load Example** button — one click to pre-fill with a realistic Black Friday incident
>              
>               - ---
>
> ## Quick Start
>
> ### 1. Clone & install
>
> ```bash
> git clone https://github.com/vjsravan/Postmortem-Autopilot.git
> cd Postmortem-Autopilot
> npm install
> ```
>
> ### 2. Configure environment
>
> ```bash
> cp .env.example .env.local
> ```
>
> Edit `.env.local` and add your Anthropic API key:
>
> ```
> ANTHROPIC_API_KEY=sk-ant-your-key-here
> ```
>
> Get a key at [console.anthropic.com](https://console.anthropic.com).
>
> ### 3. Run
>
> ```bash
> npm run dev
> ```
>
> Open [http://localhost:3000](http://localhost:3000).
>
> ---
>
> ## How to Use
>
> 1. **Fill in the form:**
> 2.    - **Service Name** — e.g. `payments-api`
>       -    - **Time Range** — e.g. `2024-01-15 14:30 to 16:45 UTC`
>            -    - **GitHub Commits/Deploys** — paste commit log, deploy timestamps, PR merges
>                 -    - **PagerDuty Alerts** — paste alert log or webhook payload
>                      -    - **Slack Messages** *(optional)* — paste channel messages from the incident channel
>                           -    - **Additional Context** *(optional)* — traffic spikes, known issues, recent config changes
>                            
>                                - 2. **Click "Generate Blameless Post-Mortem"**
>                                 
>                                  3. 3. **Review the output:**
>                                     4.    - Severity badge (P1/P2/P3) with reasoning
>                                           -    - Timeline gaps are highlighted with ⚠️ warnings
>                                                -    - Structured sections with action items
>                                                 
>                                                     - 4. **Export:**
>                                                       5.    - Switch to **Markdown** or **Confluence** tab
>                                                             -    - Copy to clipboard or download
>                                                              
>                                                                  - ---
>
> ## Worked Example: Before & After
>
> ### Input (raw signals)
>
> **Service:** `payments-api`
> **Time Range:** `2024-01-15 14:30 to 16:45 UTC`
>
> **GitHub commits:**
> ```
> 14:22 UTC - commit a3f9c12: "Update database connection pool settings" (payments-service)
> 14:28 UTC - deploy pipeline triggered for payments-api v2.4.1
> 14:35 UTC - deploy completed to production
> ```
>
> **PagerDuty alerts:**
> ```
> 14:47 UTC - ALERT: payments-api error rate > 5% (threshold: 1%)
> 14:47 UTC - ALERT: p99 latency > 2000ms (threshold: 500ms)
> 14:52 UTC - INCIDENT created: Payment processing failures
> 15:03 UTC - ALERT: Database connection pool exhausted
> 16:30 UTC - RESOLVED: All metrics returned to normal
> ```
>
> **Slack messages:**
> ```
> 14:48 - on-call-eng: Getting paged for payments errors
> 14:51 - on-call-eng: Seeing timeout errors in the payment processor logs
> 15:00 - db-team: Connection pool looks saturated
> 15:15 - on-call-eng: Rolling back deploy a3f9c12
> 15:22 - on-call-eng: Rollback complete, errors decreasing
> 16:30 - on-call-eng: All clear, incident resolved
> ```
>
> **Additional context:**
> ```
> Black Friday sale was running. Traffic was 3x normal. Previous deploy had
> increased min pool size from 10 to 50 but max remained at 20 (config error).
> ```
>
> ---
>
> ### Output (generated post-mortem)
>
> **Severity:** `P1` — *"A major payment processing outage affecting all users during peak Black Friday traffic, lasting approximately 2 hours and 15 minutes with direct revenue impact. The full checkout flow was unavailable during this period, and the incident required a deployment rollback to resolve."*
>
> **Timeline gap detected:** ⚠️ `15:22 → 16:30` (68 min) — *No data available for recovery monitoring period; unclear when error rates fully normalized after rollback*
>
> **Root Cause Chain:**
> > A deployment containing a misconfigured database connection pool was promoted to production during a peak traffic event. The configuration set the minimum pool size to 50 connections while leaving the maximum at 20, creating an invalid state where the connection pool initialization logic could not satisfy the minimum requirement. Under 3x normal load, the pool became fully saturated within 12 minutes of deployment, causing all database operations to queue and eventually time out. This cascaded into complete payment processing failures as the payment service relies on synchronous database writes for transaction integrity.
> >
> > **Action Items (blameless, team-owned):**
> >
> > | # | Action | Owner | Due | Priority |
> > |---|--------|-------|-----|----------|
> > | 1 | Add connection pool config validation to CI pipeline | Platform Team | 1 week | 🔴 high |
> > | 2 | Implement deployment freeze policy during high-traffic events | Engineering Process | 2 weeks | 🔴 high |
> > | 3 | Add database pool saturation alert before connection exhaustion | Observability Team | 1 week | 🔴 high |
> > | 4 | Document rollback procedure and runbook for payment service | Payments Team | 2 weeks | 🟡 medium |
> > | 5 | Review all service configurations for min > max anti-patterns | DevOps | 1 month | 🟢 low |
> >
> > **Notice:** No individual names appear anywhere. All causes reference systems (deployment pipeline, connection pool configuration) and all owners are teams/roles.
> >
> > ---
> >
> > ## PagerDuty Webhook Integration
> >
> > To automatically receive resolved incidents, configure a webhook in PagerDuty:
> >
> > 1. Go to **Integrations > Extensions > Webhooks > Add Webhook**
> > 2. 2. Set URL to: `https://your-app.vercel.app/api/webhook`
> >    3. 3. Select event: `incident.resolve`
> >      
> >       4. The endpoint at `/api/webhook` (GET) shows the latest received payload, which you can format and paste into the PagerDuty Alerts field.
> >      
> >       5. ---
> >      
> >       6. ## Architecture
> >
> > ```
> > src/
> > ├── app/
> > │   ├── page.tsx              # Main UI page
> > │   ├── layout.tsx            # Root layout + metadata
> > │   ├── globals.css           # Tailwind + global styles
> > │   └── api/
> > │       ├── generate/
> > │       │   └── route.ts      # POST /api/generate — calls Claude
> > │       └── webhook/
> > │           └── route.ts      # POST/GET /api/webhook — PagerDuty receiver
> > ├── components/
> > │   ├── IncidentForm.tsx       # Input form with all signal fields
> > │   └── PostmortemOutput.tsx   # Rendered post-mortem + export tabs
> > ├── lib/
> > │   ├── prompt.ts             # Claude prompt builder (blameless instructions)
> > │   └── parser.ts             # JSON response parser + Markdown/Confluence formatter
> > └── types/
> >     └── index.ts              # TypeScript interfaces
> > ```
> >
> > ---
> >
> > ## Deploy to Vercel
> >
> > ```bash
> > npm install -g vercel
> > vercel
> > ```
> >
> > Add `ANTHROPIC_API_KEY` in your Vercel project environment variables.
> >
> > ---
> >
> > ## Design Decisions
> >
> > **Why blameless?** The prompt explicitly instructs Claude: *"You MUST NOT mention any individual names, usernames, or assign blame to specific people anywhere in your output."* Action item owners are always teams or roles, never people. This aligns with the Google SRE blameless post-mortem culture.
> >
> > **Why paste-based (not API-pull)?** Keeping it paste-based means no OAuth flows, no per-org GitHub app setup, no PagerDuty API tokens required. You can get value in 60 seconds. The optional webhook endpoint adds automation without being required.
> >
> > **Why structured JSON from Claude?** The prompt requests a specific JSON schema with strict rules, then the parser converts it to both Markdown and Confluence wiki format. This separates AI reasoning from presentation formatting.
> >
> > ---
> >
> > ## License
> >
> > MIT
