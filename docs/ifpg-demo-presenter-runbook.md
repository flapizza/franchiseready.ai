# IFPG Demo Presenter Runbook

Use this guide for the approved `ifpg-conference-demo-v1` story. Keep the demonstration local and deterministic; do not imply that conference delivery actions contact an external recipient.

## Pre-demo startup and check

1. Use Chromium at 1920x1080 with browser zoom at 100%. A 1280x800 viewport is also supported.
2. Start the approved local demo runtime with its process-scoped local configuration. Do not use conference Wi-Fi, hosted environments, or live OAuth integrations for the core story.
3. Open `/login`, choose **Enter Conference Demo**, and confirm Mission Control opens.
4. Confirm the header says **Demo Workspace - temporary data**, the product is branded **FranGroove**, and the **IFPG Candidate Story** card identifies **John Smith**.
5. Reset before the first audience conversation and rehearse once privately.

## Reset procedure

The normal presenter reset is to stop and restart the local demo server, enter the Conference Demo again, and confirm John Smith on Mission Control. This rebuilds the process-local demo overlay from the `ifpg-conference-demo-v1` baseline.

The guarded `POST /crm/test-reset` endpoint is reserved for authenticated rehearsal automation. It is not a browser address-bar action and should not be presented as a product feature.

After either reset, confirm:

- John Smith is the IFPG candidate story.
- Discovery has no rehearsal note or completed observation left over.
- Brand Strategy has an empty Presentation Set.
- Referral Studio has no newly prepared package or delivery from the previous conversation.

## Canonical presentation sequence

1. **Mission Control** - Start with the consultant's prioritized work. On the **IFPG Candidate Story** card, click **Open John Smith Candidate 360**.
2. **Candidate 360** - Establish that John is an active candidate and that identity, lifecycle, relationship activity, and consultant intelligence are consolidated here.
3. **Assessment Intelligence** - Use **1. Assessment Intelligence**. Explain the ownership profile, evidence, tensions, and suggested Discovery priorities; these are decision support, not an automatic decision.
4. **Discovery** - Use **2. Discovery**, click **Start Discovery**, exercise the next-best-question/observation control, add a short presenter note, and complete Discovery into validation. Explain that Discovery confirms, refines, or challenges assessment evidence.
5. **Return to John** - Use **John Smith Candidate 360**. Confirm the candidate context remains John before continuing.
6. **Brand Strategy** - Use **3. Brand Strategy**. Show the six-brand portfolio and John's approved order: ERA Group, Schooley Mitchell, ActionCOACH, RouteWise Mobile Services, BrightPath Home Services, and Harbor & Hound Market. Compare the explanations and financial qualification flags; do not describe rank as a black-box verdict.
7. **Brand Presentation** - Add the intended brand or brands to the **Presentation Set**, click **Start Brand Presentation**, record a candidate reaction and concise consultant note, then complete the presentation. Explain that consultant selection, candidate reaction, and AI evidence remain distinct.
8. **Referral Studio** - Mark the chosen opportunity **Refer**, click **Open Referral Studio**, select it, and click **Prepare Referral**. Review **Why This Brand** and **Areas to Validate** before approval.
9. **Simulated handoff** - If demonstrating **Approve & Send Referral**, explicitly point out **Demo delivery recorded; no external email was sent.** No external destination should open.

## Optional secondary routes

Show these only if the conversation calls for them:

- **Brand Library** - broader six-brand portfolio and brand profiles.
- **Sarah Williams** - a contrasting recommendation order.
- **Jared Wirsig** - a presentation-ready secondary candidate story.
- **Communications** - deterministic engagement and draft behavior.
- **Tasks** - consultant work and recommendations.
- **Calendar** - local meeting context; conference meetings do not expose an external meeting link.
- **Team Command Center** - manager-level workload and attention views.

Return to **Mission Control**, then reopen John from the **IFPG Candidate Story** card before resuming the canonical narrative.

## What not to click or show

- Do not use production, deployment, Supabase administration, OAuth, billing, or external integration surfaces.
- Do not claim that simulated referral or communication delivery sent a real email.
- Do not improvise with public scheduling; the request-demo scheduling control is intentionally unavailable.
- Do not use candidate deletion or other destructive controls. Candidate deletion is hidden in Conference Demo mode.
- Do not present implementation fixtures, test routes, credentials, or local infrastructure details.
- Avoid changing Tasks, Calendar, Communications, or a secondary candidate unless that branch of the conversation is intentional.

## Recovery

- **Wrong page or candidate:** click **Mission Control**, then reopen John from **IFPG Candidate Story**.
- **Refresh:** a browser refresh is safe; confirm the page still names John before continuing.
- **Undesirable presentation/referral state:** use the full reset procedure rather than trying to unwind individual actions on stage.
- **Unexpected demo mutations or between conversations:** stop and restart the local server, enter Conference Demo, confirm John, then resume from Mission Control.
- **External network failure:** continue locally. The canonical story requires no external destination.

The reliable recovery line is: "I'm restoring the baseline candidate workflow."

## Known non-blocking limitations

- Demo mutations are process-local and intentionally temporary.
- Referral, communication, scheduling, and meeting delivery behavior shown at the conference is simulated or local unless unmistakably stated otherwise.
- Browser-local assessment drafts can survive a refresh during an in-progress assessment; the approved reset clears the conference assessment draft.
- Firefox is not the authoritative conference path; use Chromium.

## End of session

Perform the full reset, return to Mission Control, confirm John Smith is the IFPG Candidate Story, and leave the browser at the clean opening screen for the next conversation.
