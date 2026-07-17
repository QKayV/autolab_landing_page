# Autolab Singularity–Gradient Triptych

## Status

Approved visual direction. Build three directly comparable prototypes while preserving A1, A2, and the original singularity unchanged.

## Objective

Create an A3 family that keeps A2’s clear research narrative and Autolab brand language, restores the original singularity’s stronger gravitational motion, transforms that orbiting swarm into an interactive three-dimensional gradient/Pareto surface, and gives the surface a dramatic authored collapse.

The three prototypes must share the same page, timing, camera, particle population, copy hierarchy, and singularity-to-gradient choreography. Only the final collapse behavior changes. This makes the comparison about the ending rather than unrelated art direction.

## Artifacts

- `autolab-mog-a3-slingshot-v1.html`: gradient implodes; winner escapes and tears the scene back to light.
- `autolab-mog-a3-rebirth-v1.html`: gradient implodes into a luminous seed; seed unfolds into the result.
- `autolab-mog-a3-loop-v1.html`: gradient implodes into the winner; winner returns to the Autolab caret and resets the loop.
- `autolab-mog-a3-three-collapses-chooser-v1.html`: direct links and concise descriptions for comparing the three endings.
- One shared A3 stylesheet and one shared A3 JavaScript engine contain the identical visual system and motion phases. Each HTML file selects its ending explicitly and remains directly openable and visually complete.

All files live in the existing visual-companion content directory. No production landing-page files change during this visual exploration.

## Shared Visual System

The page begins in Autolab’s real visual language: warm paper, ink, mint, IBM Plex typography, terminal evidence, restrained grid, and the floating island navigation. The dark phase uses near-black green rather than generic blue-black or rainbow neon. Mint is reserved for active experiments, the winning lineage, and important state changes.

Motion carries the spectacle; supporting interface elements stay quiet. One vector always means one experiment. Trails communicate lineage. Height communicates evaluated performance. The event horizon communicates pruning pressure. The winning vector is visually unique before the ending begins.

No decorative destination box appears before impact. The logo caret is the only initiating object.

## Shared Choreography

### 1. Release

Immediately before the sticky sequence, the real Autolab caret stops blinking and holds. At sticky entry, it hands off exactly once to the in-flight object at the same screen coordinates. The original caret disappears only after that handoff. The object morphs from caret to experiment arrow while following one continuous path.

### 2. Singularity ignition

The experiment strikes empty space. Its impact creates the event horizon and drives a circular paper-to-dark wipe. The first experiment branches into a seeded, reproducible population of experiment vectors. They orbit on several elliptical planes with visible lineage trails, acceleration, and gravitational lensing around the center.

Pointer movement introduces a temporary second gravity well during this phase. It perturbs paths without breaking their orbit around the primary singularity.

### 3. Orbit becomes gradient

The orbital planes precess, flatten, and then lift into a three-dimensional research surface. This must read as a physical transformation of the same experiment population—not a cut to a new visualization. Circular paths stretch into ascent trajectories; the event horizon becomes the base contour; particle positions map continuously into surface coordinates.

The camera pushes through the forming surface, subtly orbits it, and then pulls back enough to reveal the Pareto ridge. Users can bend the surface with the pointer. Metrics transition from orbiting/pruned counts to experiments/frontier/best delta without introducing another panel.

### 4. Evaluation pressure

Dominated vectors lose altitude, desaturate, and fall toward the horizon. Strong lineages tighten around the mint ridge. The surface triangulates and begins folding inward along its grid lines. One winning vector remains bright, larger, and attached to its lineage.

### 5. Shared compression

Before the variants diverge, the entire gradient collapses toward a compact singularity. Grid lines fold like fabric under tension, vectors accelerate inward, trails wind into a helix, and the camera rapidly pulls back. The compression must retain enough structure that viewers understand the gradient is being reduced to one result.

The normalized scroll allocation is fixed across the triptych: Release `0.00–0.12`, singularity ignition and orbit `0.12–0.34`, orbit-to-gradient transformation `0.34–0.60`, evaluation pressure `0.60–0.76`, shared compression `0.76–0.86`, and variant ending `0.86–1.00`.

## Variant Endings

### A3-S: Implode → Slingshot

At maximum compression, the winning vector escapes along a tangent. It crosses the viewport with an afterimage and creates a high-contrast tear in the dark field. The tear expands into the light Autolab surface while the winner decelerates into the center of the diff. The diff unfolds behind its shockwave. This is the fastest and most aggressive ending.

### A3-R: Implode → Rebirth

The compressed singularity pinches down to one bright mint seed. After a brief still frame, the seed emits one pulse and unfolds through layered rings into the result card, as though the research artifact is germinating from the evidence. The paper background returns radially from the seed. This is the most sculptural and premium ending.

### A3-L: Implode → Loop

The winning vector exits the compression along the exact inverse of the launch path and reattaches to the Autolab wordmark as its blinking caret. That blink sends a thin mint scan line down the page, docking the completed diff beneath the navigation while the interface announces readiness for another instruction. This is the clearest product-loop ending.

## Content Hierarchy

Text remains provisional and subordinate to the motion. The four shared beats are Release, Ignite, Climb, and Collapse. Short labels explain the visual semantics:

- `▮ intent → ▸ experiment`
- `one vector = one experiment`
- `altitude = evaluated performance`
- `line = experiment lineage`

The final artifact always includes winner ID, primary metric, delta, runtime, lineage, exact diff, and human-approval state.

## Implementation Shape

Use the A2 structure as the visual shell and the original singularity as the physics reference. A seeded pseudo-random generator keeps the experiment population identical across all three variants and across reloads. A shared canvas engine owns vectors, lineage trails, orbital physics, projection, surface geometry, folding, and camera state. DOM layers own the island navigation, story copy, dark and light wipes, metrics, labels, and result card.

The variant is an explicit ending mode selected by each HTML file. Shared phases must not contain ending-specific branches. Each ending begins only after the common compression state, so timing and screenshots remain comparable.

Desktop uses at most 240 experiment vectors; mobile uses at most 112. Device pixel ratio is capped at 2. Reduced-motion mode removes autonomous orbiting and long trails, uses direct state interpolation, and preserves the semantic sequence.

## Interaction and State

Scroll is the primary timeline. Pointer motion affects gravity during orbit and surface curvature during the gradient phase. Pointer influence fades during compression so the ending remains authored and deterministic.

The sequence is reversible when scrolling upward. Every phase must derive from normalized scroll progress rather than one-way timers. The real logo caret must be visible before launch, absent while detached, and restored only according to the selected ending or after the sequence resets.

In Slingshot and Rebirth, the caret returns after the result fully resolves to communicate readiness for the next run. In Loop, its return is the central ending event and occurs before the completed diff docks beneath the navigation.

## Verification Criteria

For each variant, verify at 1440×913 and 390×844:

- A1, A2, and the original singularity files still exist and still return HTTP 200.
- Before sticky entry, the flight object has zero opacity and the real caret is visible.
- Release, ignition, orbit, gradient, compression, and ending frames activate in order while scrolling in both directions.
- The same vectors transform continuously from orbit to gradient; there is no population jump.
- Pointer gravity and surface bending activate only in their intended phases.
- The chosen ending resolves to a readable result without white-on-white or dark-on-dark intermediate states.
- The final diff fits the viewport and includes accountable-result metadata.
- The island navigation never overlaps stage content.
- No horizontal overflow, iframe, console error, console warning, or missing resource exists.
- Reduced-motion mode preserves comprehension without autonomous particle motion.
- JavaScript syntax checks pass and the companion serves every artifact with HTTP 200.

## Out of Scope

- Final marketing copy.
- Production integration or edits to `index.html`.
- Backend behavior, real experiment data, authentication, or analytics.
- Additional fourth endings or configuration controls beyond the three approved variants.
