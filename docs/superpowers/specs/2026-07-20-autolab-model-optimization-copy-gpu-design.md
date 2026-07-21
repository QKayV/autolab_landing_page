# Autolab Model Optimization Copy and GPU Efficiency Design

## Status

Approved creative direction, pending final spec review before implementation planning.

## Objective

Reframe the selected Rebirth landing page around the outcome users already understand: improving an AI model. Preserve the singularity, orbit, vector field, and gradient ascent as the page's visual signature, but make the visible language concrete enough that a researcher, an individual builder, or an enterprise team can immediately understand what Autolab does.

The narrative is:

```text
one goal → thousands of experiments → measured improvement → reviewable PR
```

The singularity is visual theater, not product terminology. `Autoresearch` remains useful for search, documentation, and category education, but it does not need to be explained above the fold.

## Positioning and Voice

Autolab is an automated model-improvement system. It takes a goal and an eval, runs experiments on available compute, learns from the results, verifies the strongest candidates, and returns reviewable code.

Visible copy should favor concrete nouns and actions:

- goal
- eval
- experiment
- metric
- baseline
- GPU
- verify
- PR
- merge

Use one memorable flourish in the hero and one in the close. Everywhere else, let the visuals carry the spectacle while the copy explains the product. Do not use visible phrases such as `motion kernel`, `singularity`, or unexplained `autoresearch`. Do not add unsupported experiment counts, utilization percentages, or speedup claims.

## Exact Page Copy

### Hero

- Eyebrow: `AI MODEL OPTIMIZATION, AUTOMATED.`
- Rotating headline: `Supercharge your research.` / `Supercharge your training.` / `Supercharge your inference.`
- Supporting copy: `Set a goal and an eval. Autolab's agents write, run, and score thousands of experiments on your compute—then turn the winners into reviewable PRs.`
- Primary CTA: `Start researching` → `#get-started`
- Enterprise CTA: retain `Book a demo` and its existing production calendar destination.

The spinner restores the original site's three-part language and is the hero's single copy flourish. Its sequence is `research`, `training`, `inference`.

### Direct hero-to-loop handoff

Do not insert a standalone copy interstitial between the hero and the model-improvement loop. The hero should move directly into the six-step research instrument, whose legend establishes that each vector is an experiment.

### Model-improvement loop

- Instrument title: `Autolab / model improvement loop`

1. Eyebrow: `Goal / 01`
   Headline: `Set the goal.`
   Body: `Tell Autolab what better means: the metric, constraints, and eval that matter.`
2. Eyebrow: `Explore / 02`
   Headline: `Run a thousand experiments.`
   Body: `Agents turn hypotheses into isolated runs across the GPUs available to them.`
3. Eyebrow: `Measure / 03`
   Headline: `Find what moves the metric.`
   Body: `Every result updates the frontier. Stronger directions earn the next run.`
4. Eyebrow: `Prune / 04`
   Headline: `Prune what doesn't work.`
   Body: `Dominated experiments stop. Their code, logs, and lineage remain inspectable.`
5. Eyebrow: `Verify / 05`
   Headline: `Verify what does.`
   Body: `The strongest candidates rerun against your evals and constraints until the improvement holds.`
6. Eyebrow: `Ship / 06`
   Headline: `Ship the improvement.`
   Body: `The winner arrives as a reviewable PR with the evidence behind it. You decide what merges.`

### GPU efficiency

- Eyebrow: `COMPUTE / CONTINUOUSLY SCHEDULED`
- Headline: `More insights. Same GPUs.`
- Supporting copy: `Autolab queues the next-most-valuable experiment the moment capacity opens. Dead ends stop consuming compute. Promising runs scale.`

Place this section after the model-improvement loop and before onboarding. The section should feel like the same experiments have reached the infrastructure layer, not like an unrelated feature card.

### Onboarding

- Eyebrow: `FROM INSTALL TO FIRST RUN`
- Headline: `Start this afternoon.`
- Supporting copy: `Install Autolab, point it at the eval that matters, and start your first run. Use the CLI, Claude Code, or Codex.`

Retain the enlarged command surface, the three approved onboarding modes, and the existing links into `#get-started`.

### Close

- Eyebrow: `RESEARCH AT MACHINE SCALE`
- Headline: `One researcher. A lab's worth of progress.`
- Supporting copy: `Every experiment stays reproducible. Every winning change stays reviewable. You decide what merges.`
- CTA: `Run Autolab` → `#get-started`

## GPU Efficiency Motion

The GPU section uses a dark instrument panel inside the light paper page. It begins as a continuation of the preceding experiment field:

1. Experiment vectors leave the evaluated topology and stream toward the compute panel.
2. Their existing identities become scheduled jobs; they do not transform into a second unexplained particle system.
3. Jobs enter a compact twelve-GPU fabric. Each cell is one GPU, labeled with restrained heterogeneous hardware such as `3090`, `A100`, and `H100`.
4. Four experiments route into each GPU. A persistent route spine may remain only as a very faint guide; the active vector and its short trail carry the visible motion.
5. Each GPU accumulates mint luminance as its four experiments arrive and exposes the current `FLOW n/4` state.
6. Dominated directions dim and terminate. Promising directions remain visually legible as the scheduler gives them more compute.
7. A verified winner expands across a larger multi-GPU block, resolving the section with an unmistakable optimization payoff.

Scroll updates set a target progress value; the rendered progress eases toward it in the animation frame. The panel opening and closing uses compositor transforms rather than changing layout dimensions, so the canvas does not resize while the user scrolls.

The panel should communicate scheduling, pruning, and scaling through motion and layout. It must not display fabricated values such as `96% utilization` or `4.8× throughput`. Small operational labels may expose real concepts—`queued`, `running`, `pruned`, `verified`—without turning the section into a dashboard.

On desktop, the fabric can use the full panel width and preserve visible job lineage. On mobile, use a smaller grid and fewer simultaneous jobs while retaining the same causal sequence. With reduced motion enabled, render a stable resolved state showing occupied capacity, pruned experiments, and one scaled winner.

## Visual and Interaction Boundaries

- Keep the selected Rebirth direction as the primary preview.
- Preserve Slingshot, Loop, A2, the original singularity, and the existing backup branches as rollback/reference points.
- Keep the floating island navigation, current orbital choreography, topology transition, collapse, and Rebirth ending unless a copy block requires a narrowly scoped timing adjustment.
- Apply the first implementation to Rebirth only. Shared-copy propagation to comparison variants is a later explicit decision.
- Treat canvas particles and the GPU motion instrument as decorative for accessibility; semantic section text must convey the complete product story.
- Give the rotating hero headline a stable accessible label. Reduced motion stops on `Supercharge your research.` rather than cycling.

## SEO Boundary

Preserve the root production SEO work already integrated from `origin/main`, including metadata, structured data, crawl files, and social assets. `Autoresearch` may remain in metadata, FAQ content, documentation, and other category-discovery surfaces even though the visible hero leads with model optimization.

No production SEO file should change as part of the prototype copy and GPU-motion pass.

## Implementation Sequence

Work block by block so each major visual and copy change can be reviewed before the next one begins:

1. Hero label, restored rotating headline, support copy, and CTA behavior.
2. Visual handoff and six-step model-improvement loop language.
3. GPU efficiency section and its experiment-to-compute choreography.
4. Onboarding and closing copy.

The hero is the first review checkpoint. Do not bundle all four blocks into one opaque visual revision.

## Verification

- Add static contract tests for the approved hero phrases, spinner sequence, GPU headline, CTA destinations, and section ordering.
- Run the complete existing test suite and JavaScript syntax checks.
- Inspect the Rebirth preview at desktop and mobile widths for copy fit, motion continuity, horizontal overflow, console errors, and broken resources.
- Inspect reduced-motion behavior: the spinner is stable and the GPU instrument resolves without relying on animation for meaning.
- Verify that the initial navigation contains no experiment counter and that all `Start researching` and `Run Autolab` actions land on `#get-started`.
- Diff the production SEO files against `origin/main` and confirm they remain unchanged.

## Non-goals

- Rewriting production SEO or structured data.
- Building a backend scheduler or displaying live utilization.
- Inventing benchmark claims or customer proof.
- Reusing competitor language verbatim.
- Redesigning unrelated page blocks or comparison variants.
- Changing onboarding commands, authentication, analytics, or deployment behavior.
