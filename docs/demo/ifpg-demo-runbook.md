# IFPG Demo Runbook

Authoritative presenter guide for the deterministic FranGroove IFPG demonstration.

## Quick Start

1. Use branch `feature/fp002-interactive-runtime` at the reviewed demo checkpoint.
2. Start the approved production demo build on `http://127.0.0.1:3100` with conference demo access enabled.
3. Restart the demo server before the session. The mutable demo overlay is process-local, so a restart restores its initial state.
4. Open `http://127.0.0.1:3100/login` and choose **Enter Conference Demo as Jim Wood**.
5. Confirm Mission Control opens at `/crm` and Jared Wirsig appears under **AI Recommended Actions** with **Prepare the Brand Presentation**.
6. Present at 100% browser zoom. Do not depend on conference Wi-Fi.

The primary story is:

> FranGroove helps a franchise consultant understand a candidate, run better discovery, explain better-fit opportunities, know what to do next, and make a dramatically better introduction to the franchisor—without taking control away from the consultant.

## Pre-Demo Checklist

Use this about ten minutes before presenting.

- [ ] Laptop connected to power; charger accessible.
- [ ] Display/projector connected and mirrored at 1366×768 or better.
- [ ] Browser zoom is 100%; notifications and password-manager popups are disabled.
- [ ] Unrelated tabs, email, chat, and developer tools are closed.
- [ ] Correct branch/checkpoint and production demo build are running locally.
- [ ] Port 3100 responds at `http://127.0.0.1:3100/login`.
- [ ] Demo server was restarted and the conference demo login works.
- [ ] Mission Control is the starting screen and Jared is visible in AI Recommended Actions.
- [ ] The full Jared path has been smoke-tested once on the presentation machine.
- [ ] No Gmail account or external OAuth flow will be used.
- [ ] Backup screenshots, recording, and handoff PDF are locally available when prepared.

## Reset Procedures

### Normal pre-demo reset — target under 60 seconds

1. Stop only the FranGroove demo server on port 3100.
2. Start the approved conference-demo production build again. This clears the process-local mutable overlay.
3. Open `/login`; choose **Enter Conference Demo as Jim Wood**.
4. Verify `/crm` loads and Jared's recommended action says **Prepare the Brand Presentation**.
5. Optionally open `/crm/candidates/jared-wirsig/strategy` in a second tab and confirm the Presentation Set says **Select one or more recommendations**. Close that tab and return to `/crm`.

The guarded test reset is `POST /crm/test-reset`. It requires an authenticated conference-demo session and is intended for automated rehearsal/E2E isolation, not a live browser address-bar action.

### Emergency reset

If state becomes confusing, say: “Let me put Jared back at the beginning of this workflow.” Restart the local demo server, return to `/login`, enter the conference demo, and open `/crm`. Do not try to manually unwind several mutations on stage.

### Post-demo reset

Close the browser tab, stop the demo server, restart it if another demonstration follows, sign in again, and leave the browser on `/crm` with Jared visible.

## Exact Primary Click Path

Starting URL: `http://127.0.0.1:3100/login`

1. **Enter Conference Demo as Jim Wood** → `/crm`
2. Jared card in **AI Recommended Actions** → **Open Candidate Journey** → `/crm/candidates/jared-wirsig`
3. **Open Full Playbook** → `/crm/candidates/jared-wirsig/playbook`
4. **Back to Jared Wirsig** → `/crm/candidates/jared-wirsig`
5. **Review Brand Strategy** → `/crm/candidates/jared-wirsig/strategy`
6. ERA Group → **Add to Presentation Set**
7. ActionCOACH → **Add to Presentation Set**
8. **Start Brand Presentation** → `/crm/candidates/jared-wirsig/strategy/presentation?brandId=era-group`
9. ERA Group → choose **Strong Interest** → **Save Reaction & Next Brand**
10. ActionCOACH → choose **Interested** → **Save Reaction & Complete**
11. ERA Group summary → **Refer**
12. **Open Referral Studio** → `/crm/candidates/jared-wirsig/referral`
13. Select ERA Group → **Prepare Referral**
14. **Draft Introduction Email** → `/crm/communications?...` with the composer open
15. **Return to package** → exact Jared/ERA referral package
16. Stop on **Consultant Approval**. Point to **Approve & Send Referral**; do not click it.

State mutations are limited to two selected brands, two candidate reactions, ERA referral intent, and one prepared handoff. Nothing is externally sent.

## Full 10–12 Minute Script

### 0:00–1:15 — Mission Control

- **Screen:** Mission Control, `/crm`.
- **Click:** None until the transition.
- **Audience sees:** Daily brief, candidates needing attention, accepted work, meetings, and evidence-based recommended actions. Jared appears naturally with **Prepare the Brand Presentation**.
- **Say:** “This is where I start my day. FranGroove is not just counting records—it is telling me which candidates deserve attention and why. Jared has completed Discovery, and the next high-value decision is preparing the brand conversation.”
- **Point out:** Three candidates need attention; tasks and meetings are distinct from recommendations; Jared's action is tied to his current journey.
- **Why it matters:** The product acts as an operating system for a franchise consultant, not a generic dashboard.
- **Do not explain:** Every metric, every other candidate, pipeline configuration, or the AI Active badge.
- **Click:** Jared's **Open Candidate Journey**.
- **Transition:** “Before I act, I want the full context on Jared—not another disconnected CRM record.”
- **Risk/recovery:** If the wrong candidate opens, use `/crm/candidates/jared-wirsig`.

### 1:15–2:25 — Candidate 360 and Discovery intelligence

- **Screen:** Jared Candidate 360.
- **Audience sees:** Brand Strategy stage, 93% buying confidence, 91% candidate readiness, completed assessment/discovery, profile intelligence, and current recommendation.
- **Say:** “In one place I can see who Jared is, where he is in the process, what we learned, and what I should do next. He completed Discovery with strong leadership, financial, and systems-alignment evidence. His timeline is 30–60 days, and the next decision is to present a brand strategy.”
- **What FranGroove learned:** Strong leadership, adequate financial capacity, coachability/system alignment, and readiness for executive business-model comparisons.
- **Why it matters:** These are decision inputs, not raw assessment answers.
- **How behavior changes:** The consultant can lead with validated executive strengths and spend conversation time on ownership-model tradeoffs instead of repeating intake questions.
- **Do not explain:** Every score or every activity item.
- **Click:** **Open Full Playbook**.
- **Transition:** “Understanding the candidate is useful. The next question is: what should I actually do?”

### 2:25–3:15 — Engagement Playbook

- **Screen:** `/crm/candidates/jared-wirsig/playbook`.
- **Audience sees:** **Prepare the Brand Presentation**, why it matters, timing before the next candidate meeting, progress, and consultant controls.
- **Say:** “The Playbook converts evidence into a recommended next step. Discovery is complete, so FranGroove recommends preparing the ordered presentation set before the next meeting. Notice that it does not execute anything by itself.”
- **Safest behavior:** Explain only. Do not choose **Accept Recommendation**, **Create Task**, **Mark Complete**, **Skip Step**, or **Dismiss Recommendation** during the primary demo.
- **Why:** Those mutations add no payoff and can complicate later rehearsals.
- **Click:** **Back to Jared Wirsig**, then **Review Brand Strategy**.
- **Transition:** “Now let’s see why FranGroove chose these opportunities—not just the rankings.”

### 3:15–5:10 — Brand Strategy: ERA Group vs ActionCOACH

- **Screen:** `/crm/candidates/jared-wirsig/strategy`.
- **Audience sees:** Jared context, 91% readiness, ERA Group as recommended presentation lead, ERA 95% fit and ActionCOACH 92% fit, evidence, tradeoffs, and presentation controls.
- **Say:** “Matching is easy to claim. The useful part is explaining why a brand fits and what still needs to be validated.”
- **ERA Group:** Strong alignment around leadership, relationship building, and coachability; financial requirements are satisfied. It leads because the current evidence shows stronger lifestyle flexibility and operational-fit alignment. Validate operational fit and Jared's expectations for an executive/strategic ownership role.
- **ActionCOACH:** Also aligns around leadership, relationship building, and coachability, but through a business-coaching model serving owners and leadership teams. Validate comfort coaching owners, holding senior leaders accountable, and local-market visibility.
- **Memorable comparison line:** “These are both credible options for Jared—but ERA fits the executive consulting path, while ActionCOACH asks whether he wants to coach other owners every day.”
- **Why it matters:** Similar scores do not mean interchangeable recommendations.
- **Click:** Add ERA Group, add ActionCOACH, then **Start Brand Presentation**.
- **Do not click:** Third-brand alternatives, reorder controls, brand-profile detours, or shortlist dispositions yet.
- **Risk/recovery:** If only one brand is selected, return to the strategy URL and add the missing brand. If the wrong brand is selected, remove it before starting.

### 5:10–6:25 — Consultant-led Brand Presentation and reaction

- **Screen:** ERA Group, then ActionCOACH presentation.
- **Audience sees:** 30-second overview, ownership facts, why the brand matched, what to emphasize, concerns, questions, and Candidate Reaction.
- **Say:** “This is not a questionnaire for Jared. It is a conversation guide for me: what to emphasize, what concern to address directly, and what question to ask.”
- **Safe mutation:** Select **Strong Interest** for ERA Group. A consultant note is optional; omit it in a fast or high-risk setting. Choose **Save Reaction & Next Brand**. Select **Interested** for ActionCOACH and choose **Save Reaction & Complete**.
- **Causal moment:** “Jared's response is now a consultant-owned fact. The match score does not magically change, but his reaction determines the shortlist and which handoff we prepare next.”
- **Why it matters:** AI evidence and human judgment remain visibly separate.
- **Risk:** A reaction is required. If a click appears not to advance, wait for the button state/navigation; do not double-click rapidly.
- **Recovery:** Return to `/crm/candidates/jared-wirsig/strategy/presentation`; the saved response is retained.

### 6:25–7:05 — Shortlist and Referral Studio

- **Screen:** Brand Presentation Complete.
- **Click:** ERA Group **Refer**, then **Open Referral Studio**.
- **Say:** “Jared showed the stronger reaction to ERA, so I—not the AI—choose which opportunity moves toward a franchisor introduction.”
- **Audience sees:** Reactions remain separate from immutable match rankings; the referral action is explicit.
- **Risk:** Do not select Refer on both brands in the primary story.

### 7:05–8:45 — Candidate Handoff Package

- **Screen:** `/crm/candidates/jared-wirsig/referral`.
- **Click:** Select ERA Group, then **Prepare Referral**.
- **Audience sees:** A franchisor-facing document with Jared/ERA identity, executive overview, candidate-reported financial profile, objectives, Discovery highlights, Why This Brand, strengths, areas to validate, questions, and first-conversation focus.
- **Say:** “Now Jared is ready to meet the franchisor. This is where most systems stop. FranGroove turns the work we already did into a useful introduction package.”
- **Focus on only four sections:** Executive Overview; Financial Profile; Why This Brand; Areas to Validate / Suggested Focus.
- **Financial language:** “These are candidate-reported figures—$235,000 liquid capital, $376,000 investable capital, and a stated $250,000–$600,000 investment range. FranGroove organizes the information; it does not independently verify financial statements.”
- **Payoff line:** “The franchisor starts the first call understanding Jared—not spending twenty minutes starting from zero.”
- **Do not do:** Edit the introduction, mark ready, refresh the package, print live, or approve/send.
- **Risk/recovery:** Direct URL is `/crm/candidates/jared-wirsig/referral`. If the package is absent, select ERA and choose **Prepare Referral**.

### 8:45–9:30 — Communications Draft

- **Click:** **Draft Introduction Email**.
- **Audience sees:** **Review Introduction Draft**, Jared, ERA Group, Candidate Handoff provenance, **Unsent draft**, recipient context, meaningful subject, and populated introduction.
- **Say:** “The handoff moves directly into a useful franchisor introduction. FranGroove prepares it; I review it and decide whether anything leaves my account.”
- **Point out:** Subject, candidate/brand context, and the explicit Unsent status.
- **Do not click:** **Send Email**.
- **Risk/recovery:** If closed, return to the referral URL and choose **Draft Introduction Email** again.

### 9:30–10:30 — Consultant-controlled close

- **Click:** **Return to package**.
- **Audience sees:** Consultant Approval and **Approve & Send Referral**.
- **Say:** “This is the control boundary across the product: AI assists, but the consultant owns the relationship, the shortlist, the introduction, and the final send.”
- **End here.** Do not click approval and do not navigate to an administrative screen.

Expected full timing: about **10 minutes 30 seconds**, with a comfortable range of 10–12 minutes.

## 3–5 Minute Booth Script

Target: **4 minutes**.

1. **Mission Control — 35 seconds.** “I start with the candidates and decisions that need attention.” Click Jared.
2. **Candidate 360 — 45 seconds.** Show stage, executive summary, readiness, and completed Discovery. “FranGroove understands Jared; it is not just storing notes.”
3. **Brand Strategy — 90 seconds.** Use direct link `/crm/candidates/jared-wirsig/strategy` if speed matters. Show ERA and ActionCOACH. Use the memorable comparison line. Do not start the live presentation unless asked.
4. **Handoff — 70 seconds.** If the package is already prepared, open `/crm/candidates/jared-wirsig/referral`. Otherwise select ERA and prepare it. Show executive overview, financial disclaimer, Why This Brand, and Areas to Validate.
5. **Close — 20 seconds.** “FranGroove prepares the franchisor to have a better first call, while the consultant controls what gets sent.”
6. **Optional Communications — 20 seconds.** Open the draft only if time remains. Never send.

## 90-Second Script

Use three screens: Candidate 360, Brand Strategy, and Handoff.

- **0:00–0:25 — Candidate 360:** “FranGroove combines Jared's assessment, completed Discovery, financial profile, and current stage into one usable candidate picture.”
- **0:25–0:55 — Brand Strategy:** “It explains fit rather than just returning a score. ERA and ActionCOACH are both viable, but for different ownership behaviors and with different validation questions.”
- **0:55–1:20 — Handoff:** “When Jared is ready, the same evidence becomes a franchisor-facing introduction with financial context, strengths, concerns, and a suggested first conversation.”
- **1:20–1:30 — Close:** “The system tells me what to do and prepares the work. I still make every relationship decision.”

If navigation time is constrained, preload those three screens in adjacent tabs after a clean reset; do not mutate state during the 90-second version.

## Jared Story Reference

- Stage: Brand Strategy / brand matching.
- Discovery: completed.
- Buying confidence: 93%.
- Candidate readiness: 91%.
- Investment range: $250,000–$600,000.
- Decision window: 30–60 days.
- Evidence: leadership, financial capacity, systems alignment, relationship building, and coachability.
- Next action: Present Brand Strategy.
- Brands: ERA Group and ActionCOACH.

Do not add facts not visible in the application.

## Sarah Williams Branch — 60–90 Seconds

Use only when asked, “Does the system respond differently depending on the candidate?”

1. Open `/crm/candidates/sarah-williams`.
2. Point out Referral / Introduction stage, 97% buying confidence, 94% readiness, completed validation, and a 30-day decision window.
3. Explain that Sarah's recent email opens/link activity drives follow-up intelligence, while her validated state supports an ERA Group introduction.
4. Open her Playbook or referral package only if the question requires proof.
5. Say: “Jared's story is brand presentation; Sarah's is engagement and referral follow-through. The workflow changes with the evidence.”

Do not repeat Jared's full presentation or mutate Sarah's ready-for-review package.

## Manager / Team Extension — 45–60 Seconds

Question trigger: “What if I manage several consultants?”

Open `/crm/team` and show:

- Team health and situations needing attention.
- Authorized team/consultant scope controls.
- Active candidates, decision opportunities, meetings, tasks, referrals, and risk.
- Consultant ownership and drill-down.

Say: “The same candidate intelligence rolls up into an authorized operating view, so a leader sees where coaching or intervention matters without replacing consultant ownership.”

Stop after one drill-down. Do not re-run the candidate story.

## Common Audience Questions

### “Does it send email?”

“The deterministic IFPG demo records communication behavior locally and we do not send anything during the presentation. The product has consultant-initiated Gmail sending architecture and implementation with send-only authorization, but a real account must be configured and acceptance-tested before claiming live connectivity. We do not run Google OAuth on the show floor.”

Implemented boundary: outbound, consultant-initiated sending and canonical communication handling. Demo boundary: seeded delivery/engagement and local state. Production-gated: customer Google Cloud configuration, OAuth verification, credentials, and live acceptance. Gmail read access is not part of this live story.

### “What exactly is AI doing?”

“It organizes candidate evidence, interprets assessment and Discovery signals, recommends the next consultant step, explains brand-fit dimensions, and turns the selected evidence into presentation and handoff guidance. In this conference build the scenario is deterministic so the demo is repeatable. Production intelligence must operate behind the same evidence, provenance, and consultant-control boundaries.”

Do not claim autonomous decisions, autonomous sending, or live model calls in the deterministic demo.

### “How does matching work?”

“FranGroove compares candidate evidence—such as leadership, operational fit, relationship building, coachability, and financial qualification—with each brand's ownership profile. It shows the fit dimensions, evidence, tradeoffs, and questions to validate. The ranking is advisory; the consultant controls what gets presented and referred.”

Brand ranking is not pay-to-play. Do not discuss internal source code or imply franchisors can buy ranking position.

### “Where is the data stored?”

“This IFPG scenario uses deterministic fixtures plus a process-local mutable demo overlay, so a restart resets changes. Supabase-backed authentication and production persistence boundaries exist, but business-domain persistence is being migrated in explicit packs and should not be overstated from the demo.”

### “Can managers read consultant email?”

“Not by virtue of being a manager. The Gmail architecture treats a connected mailbox as owner-only; candidate reporting visibility does not grant mailbox-body access. Any future manager email-visibility feature would require explicit policy, consent, auditability, and redaction rules.”

### “Does the AI send things automatically?”

“No. Recommendations remain advisory. Tasks require acceptance, presentation reactions are entered by the consultant, referrals require explicit selection, and email requires an explicit send action.”

### “Are the financials verified?”

“No. They are candidate-reported or stated figures organized for the consultant and franchisor. FranGroove does not independently verify financial statements.”

### “What happens with Gmail?”

“A configured consultant explicitly connects their own account through a secured OAuth flow. Current outbound authorization is send-only; credential handling is server-side and mailbox ownership remains scoped to that consultant. We do not attempt OAuth or claim a live connection in this demo.”

### “What does it cost?”

“Pricing discussion handled separately.”

## Safe URL Cheat Sheet

All paths are relative to `http://127.0.0.1:3100`.

| Screen | Safe URL |
|---|---|
| Login | `/login` |
| Mission Control | `/crm` |
| Jared Candidate 360 | `/crm/candidates/jared-wirsig` |
| Jared Playbook | `/crm/candidates/jared-wirsig/playbook` |
| Jared Brand Strategy | `/crm/candidates/jared-wirsig/strategy` |
| Jared Presentation | `/crm/candidates/jared-wirsig/strategy/presentation` |
| Jared Referral Studio / Handoff | `/crm/candidates/jared-wirsig/referral` |
| Communications | `/crm/communications` |
| Sarah Candidate 360 | `/crm/candidates/sarah-williams` |
| Team Command Center | `/crm/team` |

The Communications handoff draft carries generated query parameters. Recover it from Jared's handoff with **Draft Introduction Email** instead of typing the query string.

## Failure Recovery Matrix

| Symptom | Likely cause | Fastest recovery | Safe screen | Reset? | Presenter cover line |
|---|---|---|---|---|---|
| Wrong candidate opened | Mis-click | Open Jared direct URL | Jared 360 | No | “Let me use the candidate whose Discovery is complete.” |
| Wrong brand selected | Extra selection | Return to strategy and remove it before starting | Jared Strategy | Usually no | “The consultant controls the presentation set.” |
| Navigated away | Sidebar or stray link | Use safe URL cheat sheet | Last intended screen | No | “Each workspace keeps the candidate journey connected.” |
| Modal closed | Escape/close clicked | Return to handoff and click **Draft Introduction Email** | Jared Referral | No | “The draft remains attached to the handoff.” |
| Browser Back used | Accidental navigation | Use the direct URL, not repeated Forward/Back | Last intended screen | No | “I’ll jump back to the active candidate decision.” |
| Reaction changed unexpectedly | Wrong radio selected | Select intended reaction before saving; after saving, reopen presentation | Jared Presentation | No | “Reactions are consultant-entered and remain editable evidence.” |
| Referral state mutated | Prepared/marked ready accidentally | Continue if explainable; otherwise restart server | Jared Referral | Maybe | “The package state is explicit and consultant controlled.” |
| Task accidentally created | Playbook action clicked | Ignore it for this story; reset after session | Jared Playbook | Not immediately | “Recommendations can become accountable work only when accepted.” |
| Draft closed | Modal dismissed | Reopen from handoff | Jared Referral | No | “Nothing was lost or sent.” |
| Reset needed | Multiple confusing mutations | Restart local demo server and sign in | Mission Control | Yes | “I’m restoring the baseline candidate workflow.” |
| App server unavailable | Process stopped/port conflict | Start approved local build; verify port 3100 | Login | Process restart | “The demo runs locally; I’m restarting the workspace.” |
| External network unavailable | Conference Wi-Fi | Continue locally | Mission Control | No | “The core demonstration is intentionally local and deterministic.” |
| Browser zoom incorrect | Browser setting | Set zoom to 100% | Current screen | No | “I’m restoring the conference display scale.” |
| Conference Wi-Fi unavailable | Venue network | Use localhost; avoid OAuth | Mission Control | No | “No external service is required for this workflow.” |
| Google Fonts unavailable during build | Build-time network dependency | Use the already reviewed production build; do not rebuild onsite | Login | No | “The presentation build is already packaged locally.” |
| Live Gmail unavailable | Account/config/network absent | Show unsent deterministic draft; do not connect OAuth | Communications draft | No | “This shows the approval boundary without relying on a live mailbox.” |

## Recovery Rehearsal

Practice these harmless mistakes:

1. Close the Communications modal, recover through Jared Referral → **Draft Introduction Email**.
2. Use Back once from Brand Strategy, recover with `/crm/candidates/jared-wirsig/strategy`.
3. Open Sarah or Team Command Center, then recover with Jared's direct Candidate 360 URL.
4. Confirm none requires reset.
5. Restart the server once and verify the baseline returns.

## Timing Cuts

Sections most likely to run long: Brand Strategy, Candidate 360 evidence, and Handoff.

- **Two minutes behind:** Skip the detailed Playbook explanation and ActionCOACH presentation screen. Show the strategy comparison, then move directly to the prepared ERA handoff.
- **Five minutes behind:** Use the booth path: Candidate 360 → Brand Strategy → Handoff. Do not mutate reactions or open Communications unless specifically asked.
- **Long question midway:** Answer briefly, then say, “Let me show you the payoff.” Move to the Jared handoff URL. Preserve at least Brand Strategy explanation, Handoff, and consultant-control close.
- **Hard stop in 90 seconds:** Use the three preloaded screens and the 90-second script.

Never cut both the brand explanation and the handoff. Those are the core differentiation and payoff.

## Things Not To Do Live

- Do not run Google OAuth or connect an account.
- Do not send real email or click **Send Email** / **Approve & Send Referral**.
- Do not open developer tools, terminals, source code, or test routes on the projected display.
- Do not rebuild onsite if the reviewed production build is already available.
- Do not depend on conference Wi-Fi, Supabase local runtime, external AI, Gmail, or external brand APIs.
- Do not narrate every score, badge, card, or sidebar destination.
- Do not change pipeline stages, candidate facts, or Sarah's package.
- Do not accept/dismiss Playbook recommendations or create tasks in the primary story.
- Do not demonstrate Settings, failed-delivery injection, or administrative setup unless specifically asked.
- Do not call deterministic engagement “live Gmail data.”
- Do not imply financial verification, autonomous AI approval, or pay-to-play matching.
- Do not end on an administrative screen; end at consultant approval.

## No-Network Assessment

The primary demo does not require Gmail API calls, Google OAuth, a local Supabase stack, an external AI provider, or an external brand API. Candidate, brand, communication, task, meeting, strategy, reaction, and referral state come from deterministic fixtures plus one process-local overlay. The protected E2E journey builds and runs without Supabase/Docker and asserts that no email has been accepted by Gmail.

The known external dependency is build-time retrieval of the configured Google font. Avoid it onsite by using the already-built, reviewed production output. Runtime presentation should use localhost and remain independent of venue networking.

## Features Deliberately Not Demonstrated Live

- Google OAuth setup or live Gmail acceptance.
- Inbound mailbox synchronization/read scopes.
- Supabase migrations, Docker, or persistence administration.
- Settings and pipeline customization.
- Failure injection and retry controls.
- Candidate intake/assessment completion from scratch.
- Manager coaching beyond the optional 60-second team view.
- Reports, pricing, planned automation, SMS, or calling.

## Backup Strategy

Before IFPG, prepare—but do not substitute for the live rehearsal:

1. Seven local 1366×768 screenshots: Mission Control, Jared 360, Playbook, Strategy comparison, Presentation, Handoff, and Communications draft.
2. A silent 2–3 minute local screen recording following the booth path.
3. A saved PDF of the Jared → ERA Group handoff package with the financial disclaimer and consultant note intact.
4. A one-page copy of the Safe URL and Failure Recovery sections.

Store all backups locally on the presentation laptop and a second offline device. Do not rely on cloud storage or conference Wi-Fi.
