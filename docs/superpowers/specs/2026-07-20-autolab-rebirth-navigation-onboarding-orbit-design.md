# Autolab Rebirth Navigation, Onboarding, and Orbit Refinement

## Status

Approved direction. Refine the selected Rebirth prototype without changing its ending, the saved backup, or the production SEO work merged from `origin/main`.

## Objective

Make the Rebirth direction feel like a credible Autolab product page as well as a high-end motion piece. The refinement has three connected jobs:

1. Replace the visually unbalanced header with a precisely centered navigation system that still morphs from a full-width bar into a floating island.
2. Restore the original orbital readability before vectors settle onto the evaluated topology.
3. Give self-serve users a direct path from the hero to real CLI, Claude Code, and Codex onboarding while keeping the enterprise demo path visible.

The selected Rebirth page is the canonical preview. Shared shell and motion changes apply to the A3 comparison pages so their common sequence remains comparable; their distinct endings remain unchanged.

## Selected Approach

Use one restrained product shell around one spectacular research sequence. The header and onboarding section should feel engineered, calm, and recognizably Autolab. The singularity-to-gradient-to-rebirth animation remains the page's visual signature.

This combines the strongest parts of the approaches already reviewed:

- Keep the current bar-to-island transformation, but rebuild its internals as a true three-zone grid rather than a four-item flex row.
- Let the island's center change meaning over time: navigation links at rest, live experiment telemetry during the active research run, and navigation links again after resolution.
- Keep experiment positions on the approved orbit-to-frontier trajectory, but delay arrowhead alignment so velocity and tangential motion remain legible until the vectors are mostly landed.
- Borrow the production site's actual onboarding commands and three entry modes, then present them with the visual discipline of the Rebirth prototype.

Rejected alternatives:

- A permanently visible experiment counter repeats the earlier bug and makes the initial page feel like a dashboard with unexplained state.
- A separate telemetry item in the header creates uneven spacing because hidden content still participates in layout.
- Increasing orbit radius or speed would alter the approved choreography and solve the wrong problem; the perceived regression came from arrow orientation.
- A second highly animated onboarding spectacle would compete with the singularity. The onboarding should convert attention into action, not introduce another visual thesis.

## Navigation Design

### Layout

The navigation shell uses three columns: left identity, centered stage, and right action. The center is geometrically centered in the viewport and island regardless of the widths of the wordmark and demo button.

```text
┌─────────────────────────────────────────────────────────────────────┐
│ autolab▮          How it works   Research   Docs       Book a demo ↗ │
└─────────────────────────────────────────────────────────────────────┘

                       scroll ↓

       ╭──────────────────────────────────────────────────────╮
       │ autolab     ● 742 experiments active    Book a demo ↗ │
       ╰──────────────────────────────────────────────────────╯
```

At the top of the page, the shell spans the viewport with the existing paper translucency and a single bottom rule. After 80 pixels of scroll, it contracts into the floating island with a restrained border, blur, and shadow. The transition retains the existing smooth cubic timing.

The center stage contains the navigation links and telemetry in the same grid cell. Only one is visible at a time:

- Before the orbit begins: show `How it works`, `Research`, and `Docs`.
- From orbit through compression: crossfade to the changing live experiment count.
- During the Rebirth resolution and after the run: restore the navigation links.

The status dot pulses quietly only while telemetry is live. Hidden content must use both visual hiding and `aria-hidden` so it neither occupies an extra navigation column nor creates duplicate accessible content.

### Links

- Wordmark: `#top`
- How it works: `#research-run`
- Research: `#outro`
- Docs: `#get-started`, which contains the executable onboarding instructions
- Book a demo: the existing production calendar URL, opened in a new tab with `rel="noopener"`

On mobile, keep the wordmark and demo button. Hide the center stage rather than compressing three links or telemetry into an unreadable row. The island remains inset from the viewport edges.

## Orbit-to-Topology Motion

The particle coordinates, orbit radius, spin, easing, pointer gravity, frontier positions, and phase boundaries remain unchanged from the approved Rebirth sequence.

Only orientation timing changes:

- Through the complete orbit phase and the first half of the orbit-to-gradient morph, arrows continue to follow their actual velocity. This preserves the tangential, swirling read.
- Topology alignment remains zero until approximately `0.46` normalized progress, when the position interpolation is already about 84 percent landed on the frontier.
- From approximately `0.46` to the existing gradient boundary at `0.60`, headings ease into the projected uphill surface direction.
- Alignment still releases during compression exactly as it does now so the implosion and Rebirth ending remain authored.

The implementation continues using `surfaceAlignmentFor(progress)` as the pure motion contract. Tests must prove that alignment is absent in orbit and early landing, present by the settled topology, and gone again at compression.

## Onboarding Design

Insert a new `#get-started` section immediately after the sticky Rebirth sequence and before the closing research statement. The hero's `Start researching` button and inline install command both link to this section. The hero and header `Book a demo` actions use the production calendar URL, preserving the enterprise path.

The section keeps the paper background returned by the Rebirth pulse. Its left column carries the concise production message:

- Eyebrow: `FROM GOAL TO FIRST RUN`
- Heading: `Start this afternoon.`
- Body: `Install, point it at your eval, go. Or meet Autolab inside the coding agent you already use.`
- Trust line: `Your infra or ours. Code, data, and weights stay in your network.`

The right column is one dark, instrument-like command surface. It has a semantic tablist with three buttons and one visible panel:

### CLI

```sh
$ curl -fsSL app.autolab.ai/install.sh | sh
$ autolab init   # point it at the eval script that prints your metric
$ autolab start  # the agents begin. watch or walk away.
```

### Claude Code

```sh
$ autolab install claude-code
then, inside Claude Code:
> use /autolab to run experiments on this repo
```

### Codex

```sh
$ autolab install codex
then, inside Codex:
> queue autolab experiments against eval.py
```

The tab strip uses real buttons with `role="tab"`, `aria-selected`, `aria-controls`, roving `tabindex`, and Left/Right/Home/End keyboard navigation. Panels use `role="tabpanel"` and `hidden`. No copy-to-clipboard control is added in this pass; selectable commands keep the interaction focused and avoid inventing behavior the user did not request.

On narrow screens, the two columns stack, tab labels remain on one row, code scrolls horizontally inside the command surface, and the section never creates page-level horizontal overflow.

## Components and Responsibilities

- `autolab-mog-a3-*-v1.html`: shared navigation structure, CTA destinations, and onboarding markup. Ending-specific content stays untouched.
- `autolab-mog-core-v1.css`: navigation grid/island geometry, center-stage crossfade, shared onboarding visuals, focus states, mobile rules, and reduced-motion styling.
- `autolab-mog-a3-motion-v1.js`: pure delayed surface-alignment timing. No DOM or canvas knowledge.
- `autolab-mog-a3-scene-v1.js`: applies navigation telemetry state and consumes the pure alignment amount when drawing vectors.
- `autolab-mog-a3-onboarding-v1.js`: small isolated tab controller shared by the three pages.
- Existing Node tests: motion boundaries, static markup contracts, CTA destinations, tab semantics, and shared resource loading.

No new framework, build step, dependency, image asset, or configuration layer is introduced.

## State and Data Flow

Scroll remains the only scene timeline. `navigationTelemetryFor(progress)` determines whether telemetry is visible and its text. The scene controller applies that result to the center stage and toggles a single state class on the topbar; CSS owns the crossfade.

Particle position still comes from `poseForExperiment()`. Particle orientation uses velocity until `surfaceAlignmentFor(progress)` becomes nonzero, then blends toward `projectedSurfaceAngle()` through the returned amount.

The onboarding controller owns only the selected tab. Clicking or keyboard-selecting a tab updates `aria-selected`, roving `tabindex`, and the corresponding panel's `hidden` state. It has no relationship to scroll state or the canvas scene.

## Accessibility and Failure Behavior

- All links and tab buttons receive visible `:focus-visible` treatment.
- The topbar status is decorative live context, not an assertive live region; it must not announce hundreds of count changes to screen readers.
- With JavaScript unavailable, the first onboarding panel remains visible and the other two remain present as hidden semantic panels.
- Reduced motion removes pulsing and near-instantly resolves navigation/tab transitions while retaining every state and instruction.
- Existing dark/light contrast, semantic section headings, and the canvas's `aria-hidden` treatment remain intact.

## Verification Criteria

At 1440×913 and 390×844, verify:

- The initial header shows no experiment count and its center navigation is geometrically centered.
- Scrolling more than 80 pixels produces the floating island without overlap or layout jump.
- Telemetry replaces, rather than shifts, the center navigation only during the active experiment phases.
- Arrowheads remain velocity-aligned through orbit and early topology formation, then visibly align uphill once mostly landed.
- Orbit coordinates, timing boundaries, pointer behavior, compression, and Rebirth ending match the pre-refinement behavior.
- `Start researching` and the hero install command land on `#get-started`.
- CLI, Claude Code, and Codex tabs work by pointer and keyboard and expose the production commands exactly.
- The demo links use the production calendar target.
- No horizontal overflow, missing resource, console error, or console warning exists.
- Reduced motion preserves the full semantic story.
- Node tests and JavaScript syntax checks pass.
- `git diff origin/main -- index.html manifesto.html careers.html autoresearch.html robots.txt sitemap.xml llms.txt favicon.ico apple-touch-icon.png logo.png og.png` remains empty, preserving Ardham's production SEO changes and assets.

## Preservation and Scope

- `backup/rebirth-v1-before-orbit-telemetry` remains the rollback point and is not moved or rewritten.
- A1, A2, Slingshot, Loop, the original singularity, and comparison chooser remain available.
- Production landing-page integration is not part of this refinement. The root production files keep the merged SEO content unchanged; a later graduation pass can replace page-body presentation while retaining that metadata.
- Final marketing copy, backend installation behavior, analytics, authentication, and real experiment telemetry are out of scope.
