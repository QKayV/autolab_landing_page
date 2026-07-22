# Autolab Product Technical Explainer Redesign

**Date:** 2026-07-21

**Status:** Approved design, awaiting written-spec review

**Branch:** `codex/autolab-landing-refresh`

## Scope boundary

This redesign changes only the standalone Product page and its Product-specific assets and tests.

Allowed implementation scope:

- `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.html`
- `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.css`
- Product-specific illustration or interaction modules
- Product-page tests

The selected Rebirth homepage is frozen. Do not modify its HTML, CSS, JavaScript, animation choreography, copy, or tests. Do not modify shared root production SEO files.

## Objective

Turn the Product page from a sequence of abstract feature diagrams into an illustrated technical explainer. A model researcher or infrastructure lead should be able to describe what Autolab connects, observes, decides, and returns after one scroll.

The page should feel like Autolab published the blueprint for an autonomous research system. It must remain legible to a first-time visitor and credible to a technical buyer.

## Inspiration and retained strengths

The redesign may borrow explanatory patterns from the current [autolab.ai](https://autolab.ai) site:

- inspectable experiment detail
- training traces, logs, checkpoints, and evaluations
- a GPU fleet shown as real compute rather than an abstract box
- CLI, Claude Code, and Codex onboarding tabs
- deployment and technical FAQ content

Do not reproduce unsupported percentages, benchmark outcomes, customer claims, or factual-looking example results from the current site. Do not copy its dense dashboard treatment wholesale. The new page is an illustrated technical explainer, not a simulated product interface.

## Audience and page job

Primary audiences:

- model researchers who need to understand the autonomous experiment loop
- infrastructure leads who need to understand compute ownership, job monitoring, early stopping, and deployment boundaries

The page's single job is to answer:

1. What does Autolab connect to?
2. What does it watch while experiments run?
3. When and why does it stop work?
4. What happens to the freed GPU?
5. How do results determine the next experiments?
6. What does a human receive and approve?

## Visual direction

### Existing identity to preserve

- Paper: `#F7F5F0`
- Ink: `#141414`
- Mint: `#2FCE96`
- Deep mint: `#0C8A5F`
- Graphite chamber: `#0C1210`
- Intervention amber: `#D8A447`
- IBM Plex Serif for major statements
- IBM Plex Sans for explanatory prose
- IBM Plex Mono for system labels, annotations, and instrument keys
- the floating island navigation

Amber is reserved for watchdog intervention. Mint represents active or selected work. Faint graphite lines represent retained history.

### Signature element

The signature is a **living research circuit**. The hero introduces one technical cutaway with three zones:

```text
YOUR SYSTEM             AUTOLAB                         YOUR TEAM
repo + evals      ->     agents propose changes   ->     reviewable code
GPU fleet                scheduler launches work         experiment history
constraints              watchdog stops waste            logs + evidence
                         results guide next runs
```

A single experiment signal travels through the circuit once. Every later section enlarges one part of the same system. The page should feel like one machine being opened progressively, not a stack of unrelated feature cards.

### Diagram grammar

- `▸` means one experiment
- `□` means one GPU
- `○` means one evaluation
- `●` means a selected result
- a solid path means running work
- a faint path means retained experiment history
- a dashed path means a proposed next step

Every diagram must include a compact key when the meaning is not obvious from the adjacent text.

## Information architecture

### 1. Product hero: the complete system

Replace the current four-box loop with the living research circuit.

The hero keeps the current plain-language premise and calls to action. The diagram must visibly include:

- repository
- evaluation
- constraints
- available GPU pool
- experiment agents
- scheduler
- watchdog
- retained results
- proposed next experiments
- reviewable research packet

The diagram is explanatory before it moves. Motion only reinforces the direction of work.

### 2. Connect what you already have

Use an annotated topology plate instead of a decorative GPU grid.

Show:

- repository and evaluation entry points
- local workstation, customer cloud, and cluster GPU groups
- different GPU types joining one queue
- Autolab scheduling experiments onto available compute
- a clear boundary showing that code, data, and weights can remain in the customer's environment

The visual should explain that Autolab coordinates existing infrastructure rather than requiring a replacement stack.

### 3. See what every run is doing

Show one experiment as an exploded technical diagram. Its labeled components are:

- proposed code change
- assigned GPU
- training trace
- live logs
- checkpoint state
- evaluation signal

This may borrow the specificity of the current site's experiment inspector, but it must look like an explanatory illustration rather than a literal application screenshot. Avoid synthetic performance numbers. Use qualitative states such as `running`, `checkpoint saved`, `plateau forming`, and `evaluation pending`.

### 4. Stop waste and keep GPUs moving

Retain the existing watchdog as the page's strongest animated chapter and make the cause and consequence clearer.

The visual sequence is:

1. A training trace improves.
2. The trace plateaus or trends toward failure.
3. The watchdog marks the reason for intervention.
4. The job stops and its path fades into retained history.
5. The GPU becomes available.
6. Several queued experiment paths converge on that GPU.
7. One experiment is assigned and the GPU brightens.

Adjacent copy must explain that stopped work still contributes evidence to the research loop. Do not claim a specific amount of GPU savings.

### 5. Turn every result into the next experiment

Use a lineage illustration rather than a generic results-to-next arrow.

Show completed, stopped, and failed experiments feeding a retained evidence layer. From that evidence, agents propose a new batch of concrete changes. A few branches continue, some terminate, and one promising lineage becomes visually prominent.

Annotations should make two concepts explicit:

- dead ends still teach the system what not to repeat
- useful results shape the next experiments

This chapter is the technical explanation for the homepage swarm and gradient-frontier language.

### 6. Review what worked

Replace the isolated code diff with an exploded **research packet**. The packet contains:

- code diff
- run configuration
- evaluation result state
- logs
- checkpoint reference
- experiment lineage
- approval state

The packet should make clear that Autolab proposes a reviewable change and the human decides what ships. Use qualitative states rather than invented results.

### 7. Deploy and start

Combine deployment and onboarding into a compact final technical chapter.

Deployment illustration:

- customer cloud
- customer cluster or on-prem environment
- optional Autolab-managed compute
- explicit customer-network boundary where relevant

Onboarding:

- restore CLI, Claude Code, and Codex tabs from the current site
- preserve the direct CLI command as the fastest path
- retain early-access and demo calls to action

Follow this chapter with a focused technical FAQ covering what Autolab is, how it differs from fixed-space tuning, where experiments run, what it can optimize, and what humans approve.

## Motion system

Motion is explanatory and restrained.

- The hero experiment signal traverses the complete circuit once, pausing at meaningful decisions.
- A faint lineage path visually connects the chapters on desktop.
- Chapter annotations reveal in a short controlled sequence when the corresponding plate enters the viewport.
- The watchdog is the only continuously animated technical scene.
- GPU reassignment receives the strongest motion moment.
- The lineage chapter performs one organization event where scattered outcomes resolve into a proposed next batch.
- Hover or keyboard focus on a labeled component may reveal one concise explanation.
- Do not add decorative ambient particles, endless motion, parallax, or another scroll-driven canvas.

All new illustrations should use HTML, CSS, and SVG. Keep canvas only for the existing watchdog scene.

## Responsive behavior

Desktop:

- large annotated plates with copy and illustration sharing the viewport
- the living circuit reads left to right
- the faint lineage path may connect chapters vertically

Tablet:

- copy precedes each illustration
- callouts remain adjacent to the component they explain
- diagrams simplify without losing steps

Mobile:

- the living circuit becomes vertical
- annotations sit below their corresponding components
- no interaction depends on hover
- onboarding tabs remain keyboard and touch accessible
- no horizontal scrolling or clipped diagram labels

## Accessibility

- Decorative visual layers are hidden from assistive technology.
- Every technical concept shown graphically is also present in adjacent readable text.
- Interactive callouts are real buttons when they reveal information.
- Focus styles use the existing visible mint treatment.
- Heading order remains sequential.
- Reduced motion displays the final resolved state of every diagram immediately.
- Color is never the only indicator of running, stopped, failed, or selected states.

## Copy rules

- Use plain language and active voice.
- Explain what users connect, control, observe, and receive.
- No em dash character in visible or generated UI copy.
- No invented benchmark results, savings percentages, utilization claims, throughput multipliers, customer claims, or experiment-scale claims.
- Example states must be clearly operational, not presented as real customer outcomes.
- Keep terminology consistent across the hero, diagrams, FAQ, and onboarding.

## Interaction and failure behavior

- The existing early-access form retains its honest configured-endpoint behavior and never simulates success.
- Existing demo and documentation links remain functional.
- The CLI command remains selectable and readable.
- If JavaScript is unavailable, all diagrams remain understandable in their static HTML/SVG state.
- If animation initialization fails, no copy or call to action is hidden.

## Performance constraints

- No new animation framework or runtime dependency.
- No new canvas scene beyond the existing watchdog.
- Prefer CSS transforms, opacity, and SVG stroke effects.
- New viewport-driven effects stop when their chapter is not visible.
- Avoid canvas or SVG backing-store churn during resize.
- Preserve `prefers-reduced-motion` behavior.

## Testing and verification

Add or extend Product-page contracts for:

- required section sequence and headings
- the complete hero circuit concepts
- diagram grammar and adjacent explanatory text
- research-packet contents
- CLI, Claude Code, and Codex onboarding tabs
- technical FAQ topics
- no em dash characters in visible or generated copy
- no unsupported quantitative claims
- no broken local resource references or hash targets
- reduced-motion behavior
- viewport-owned animation work
- no horizontal overflow at 1440x913, 768x900, and 390x844 when a supported browser is available

Verify that the Rebirth homepage files and root production SEO files have no diff from the pre-redesign commit.

## Non-goals

- changing the selected Rebirth homepage
- simulating the literal Autolab application UI
- adding pricing, customer logos, testimonials, or fabricated proof
- rebuilding shared navigation or CTA components
- creating a new design system
- adding backend signup infrastructure
- adding continuous animation to every section

## Acceptance criteria

The redesign is complete when:

1. A technical visitor can explain the full Autolab loop after one scroll.
2. Every major capability has a specific annotated visual, not an abstract placeholder.
3. The living research circuit gives the page one coherent visual idea.
4. GPU intervention and reassignment are clear without relying on prose alone.
5. The lineage visual explains how experiment outcomes influence subsequent work.
6. The research packet makes the human review boundary concrete.
7. The current CLI onboarding path is restored.
8. Motion remains restrained, performant, and reduced-motion safe.
9. No unsupported quantitative claims appear.
10. The Rebirth homepage and root SEO files remain unchanged.
