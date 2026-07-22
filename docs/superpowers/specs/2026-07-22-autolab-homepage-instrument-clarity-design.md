# Autolab Homepage Instrument Clarity Design

## Status

Approved creative direction, pending written-spec review before implementation planning.

## Objective

Make a surgical clarity pass on the selected Rebirth homepage. Keep the singularity, experiment swarm, frontier, collapse, result reveal, and GPU scheduling motion. Remove prototype controls and replace small or cryptic instrument language with larger, plain-language cues.

This pass changes only the selected homepage and its directly associated styles, animation code, and tests. It does not redesign the product page, interest page, navigation, onboarding, analytics, SEO, or deployment behavior.

## Approved Changes

### Remove prototype controls

Remove the fixed `A2 / S / R / L` comparison chooser from the selected homepage. Remove the fixed `A3-R / IMPLODE → REBIRTH` concept label from the selected homepage as well.

The comparison pages and shared styles remain available as backups. This work does not delete or rewrite those variants.

### Simplify the model-improvement instrument

Keep the header title, progress line, and step counter:

- `AUTOLAB / MODEL IMPROVEMENT LOOP`
- progress line
- `01 / 06` through `06 / 06`

Remove the top-right phrase:

- `▸ experiment · lineage · ● winner`

When the vector field needs a legend, show only these two plain-language labels:

- `▸ EACH ARROW IS AN EXPERIMENT`
- `● GREEN MARKS THE BEST RESULT`

Remove the additional `lineage`, `altitude`, and `frontier candidate` explanations. The motion and the six-step story should carry those ideas without a second vocabulary system.

Change the Stop step's supporting key from:

- `dead ends stop · evidence remains`

to:

- `weak runs stop · every result improves the next`

No other six-step headline or body copy changes in this pass.

### Replace the bottom-right metrics panel

Replace the three-cell `QUEUE / QUEUED`, `REPO / MAPPED`, and `STATUS / SEARCHING` panel with one compact live-status strip. It contains a small `NOW` label, one larger status phrase, and the existing restrained mint status indicator.

The phrase changes with the six scroll steps:

1. `SETTING THE GOAL`
2. `PROPOSING EXPERIMENTS`
3. `RUNNING ACROSS YOUR GPUS`
4. `STOPPING WEAK RUNS EARLY`
5. `USING RESULTS TO CHOOSE WHAT'S NEXT`
6. `BEST CHANGE READY FOR REVIEW`

The strip remains anchored at the bottom-right of the research instrument and follows the existing reveal timing. It fades away as the final result card resolves. Because the status changes are driven by scrolling, it must not use an assertive or chatty live region that repeatedly interrupts assistive technology.

### Increase small type

Increase only the undersized labels within the model-improvement instrument:

- Research header and step labels: target 10px minimum.
- Six-step body copy: target 15px on desktop and 14px on mobile.
- Supporting research keys: target 10px with a readable line height.
- Vector legend: target 10px.
- Frontier axis labels such as `EXPERIMENT SPACE`, `EVAL MIX`, and `PERFORMANCE`: target 10px with adjusted positions so they do not collide.
- Result-card labels and footer copy: target 9px to 10px.
- Result-card metric labels such as `EVAL`, `CHECKS`, and `STATUS`: target 10px. Keep their larger values visually dominant.
- New live-status phrase: target 11px to 12px.

Do not globally increase every mono label across the site. This is a scoped legibility fix for the research instrument and result card.

## GPU Intake Choreography

Keep the twelve-GPU fabric and the existing four experiments per GPU. Increase the visible experiment density before the scheduler gate and make the routing causally clear.

### Intake

- Show roughly 36 moving experiment arrows at once on desktop and a reduced but still dense group on mobile.
- Distribute the arrows across eight wide source lanes on desktop.
- Start the lanes at varied vertical positions along the left side of the GPU canvas.
- Curve each lane smoothly toward the scheduler gate at the center-left of the GPU grid.
- Stagger arrow timing, opacity, scale, and spacing with the existing seeded job data so the flow feels continuous rather than synchronized.

### Gate and GPU routing

- Make every incoming path meet the scheduler gate cleanly.
- Preserve the existing post-gate behavior where experiments fan out into individual GPU cells.
- Keep route spines extremely faint. The moving arrows and their short trails should carry the motion.
- Let the scheduler pulse intensify modestly as the intake compresses.
- Preserve the existing cumulative GPU illumination so each GPU becomes brighter as more experiments reach it.
- Do not add permanent bright lines, fabricated utilization numbers, or new dashboard panels.

The visual story should read immediately as:

```text
many experiments → one scheduler → available GPUs → brighter utilized fabric
```

## Responsive and Reduced-Motion Behavior

- Desktop keeps the full dense intake and all twelve GPU cells.
- Mobile uses fewer simultaneous arrows and fewer visible intake lanes to avoid noise, while preserving the same convergence and fan-out story.
- The simplified research legend may stack on mobile.
- The live-status strip may use the available width at the bottom of the instrument but must not obscure the story copy or result card.
- Reduced motion renders a stable resolved GPU state that still shows experiments converging through the scheduler and occupying the fabric.

## Implementation Boundaries

- Apply changes to the selected Rebirth homepage only.
- Preserve the current hero, rotating headline, top island navigation, section order, interest form, onboarding console, PostHog integration, and all CTA destinations.
- Preserve the existing research timeline and ending choreography unless a narrow layout or timing adjustment is required for the new status strip.
- Do not modify the product page.
- Do not touch production SEO files.
- Do not delete backup concept pages or their shared comparison styles.
- Do not add dependencies or a new animation framework.

## Verification

- Add or update static contract tests that confirm the selected homepage no longer contains the comparison chooser, concept label, top-right cryptic legend, or old three-cell metrics copy.
- Test the six approved live-status phrases and their phase mapping.
- Test the two simplified legend phrases and the revised Stop key.
- Add deterministic GPU-motion coverage for the denser intake, convergence point, and mobile density reduction where practical.
- Run the complete existing test suite and JavaScript syntax checks.
- Inspect the homepage at desktop and mobile widths for text fit, label collisions, horizontal overflow, console errors, and broken resources.
- Scroll through the full research and GPU sections to confirm smooth status changes, clean gate alignment, continuous intake, faint route spines, and cumulative GPU brightness.
- Verify reduced-motion behavior remains understandable without continuous animation.
- Confirm the product page, interest page, PostHog behavior, SEO files, and CTA destinations are unchanged.

## Success Criteria

The pass is complete when the selected homepage has no public prototype chooser, the model-improvement section uses one plain-language vocabulary, all important labels are readable, and the GPU animation clearly shows a dense field of experiments converging through one scheduler before spreading across the available GPUs.
