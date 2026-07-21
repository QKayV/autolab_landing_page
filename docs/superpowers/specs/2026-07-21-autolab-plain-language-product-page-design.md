# Autolab Plain-Language Homepage and Product Page Design

## Status

Approved direction from the July 21, 2026 review. This document defines the next implementation pass for the selected Rebirth prototype.

## Objective

Make Autolab understandable within ten seconds without weakening the existing visual identity or motion system.

The homepage remains cinematic and conversion-focused. A separate Product page gives a direct feature explanation. Both pages frame Autolab around one customer benefit:

> More useful experiments from every GPU hour.

The plain-language product explanation is:

> Connect your GPUs and set a goal. Autolab watches every experiment, stops runs once they stop improving or are clearly failing, and uses every result to decide what to try next.

## Product Truth

The following capabilities exist today and may be stated directly:

- Autolab connects the GPUs available to a customer.
- It monitors training jobs and their signals while they run.
- Watchdog models stop jobs that have plateaued or are clearly likely to fail.
- Freed GPU capacity is reassigned to the next useful experiment.
- Results from completed, stopped, and failed jobs inform which experiments Autolab proposes next.
- Winning changes remain reviewable by a human before they ship.

"Watchdog models" is a secondary technical explanation. Primary copy describes the recognizable user benefit: Autolab stops wasting GPU time on runs that are no longer useful.

## Audience and Page Jobs

The site serves two audiences without splitting the product:

- Individual builders and research teams who want to try Autolab on available compute.
- Enterprise teams that need deployment, security, and infrastructure conversations.

The homepage must:

1. Explain what Autolab does in plain language.
2. Demonstrate the scale and feedback loop through the existing motion system.
3. Convert visitors into early-access requests or demo bookings.

The Product page must:

1. Explain the five core product capabilities literally.
2. Show how GPU monitoring, stopping, reassignment, and experiment proposal form one loop.
3. Answer infrastructure and control questions without becoming a documentation site.

## Scope and Files

The first implementation remains inside the selected Rebirth prototype:

- Modify `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html`.
- Modify only the shared CSS and JavaScript required for the approved copy, headline layout, navigation, and early-access form.
- Add `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.html` for the separate Product page.
- Add focused Product-page CSS and JavaScript only when shared files cannot express the design cleanly.
- Add static, interaction, and motion contracts for all new behavior.

Root production files and the SEO changes already integrated from `origin/main` remain unchanged during this prototype pass. Promotion to the production root is a separate explicit step.

## Global Writing Rules

- No em dash character appears in visible copy.
- Explain an eval as "the metric that defines success" before relying on the term.
- Lead with actions visitors recognize: connect, watch, stop, learn, propose, and review.
- Use "watchdog models" only on the detailed Product page.
- Do not lead with autoresearch, Pareto frontiers, lineage, non-dominated results, or other category language.
- Technical terms may remain in small instrument labels when the surrounding primary copy is understandable without them.
- Do not invent utilization percentages, savings percentages, throughput multipliers, customer claims, or benchmark results.
- Keep sentences short, active, and concrete.

## Homepage Design

### Preserved visual system

Keep the following intact except for narrow layout changes required by the new copy:

- Floating island navigation.
- Rotating hero headline.
- Hero terminal.
- Experiment swarm.
- Singularity, gradient, collapse, and Rebirth sequence.
- GPU routing animation.
- Large CLI onboarding panel and its three tabs.
- Existing typography, palette, grain, grid, and instrument language.

Do not replace or wholesale retime the approved motion scenes.

### Navigation

Use these destinations:

- `Product` opens `autolab-mog-product-v1.html`.
- `How it works` scrolls to `#research-run` on the homepage.
- `Docs` opens `https://docs.autolab.ai`.
- `Book a demo` retains the existing production calendar URL.

The Product page uses the same navigation shell. Its wordmark returns to the homepage.

### Hero

Retain the eyebrow:

> AI model optimization, automated.

Retain the animated headline and word sequence:

> Supercharge your  
> research.

The rotating words remain `research`, `training`, and `inference`.

The complete green word and period must remain together on the second line at every supported width. Reserve enough line width for `inference.` so word changes do not shift adjacent elements or create a third line. The small cycle counter must not force the green word to wrap.

Replace the hero support copy with:

> Set a goal and connect your GPUs. Autolab's agents run experiments, stop jobs once they stop improving or are clearly failing, and use every result to decide what to try next.

Hero actions:

- Primary: `Get early access` to `#early-access`.
- Secondary: `Book a demo` to the existing calendar URL.
- Keep the CLI install command beneath the buttons and link it to the onboarding console.

### Model improvement loop

Keep the current six-stage animation and use this primary copy:

1. Label: `Goal / 01`  
   Headline: `Tell Autolab what to improve.`  
   Body: `Choose the metric that matters, such as accuracy, cost, or latency.`
2. Label: `Explore / 02`  
   Headline: `Turn ideas into experiments.`  
   Body: `Agents read your code and create concrete changes they can test.`
3. Label: `Run / 03`  
   Headline: `Run them across your GPUs.`  
   Body: `Autolab sends each experiment to the next available machine.`
4. Label: `Stop / 04`  
   Headline: `Stop wasted work early.`  
   Body: `Runs stop when they have plateaued or are clearly going to fail.`
5. Label: `Learn / 05`  
   Headline: `Choose what to try next.`  
   Body: `Every result helps Autolab propose a better next experiment.`
6. Label: `Return / 06`  
   Headline: `Return the best change.`  
   Body: `You get the winning code, its results, and the history behind it.`

Small instrument keys may continue to explain the vector, surface, and winner visual grammar. Replace em dash glyphs used as separators with a middle dot, slash, or a line glyph that is not the em dash character.

### GPU efficiency section

Retain the headline:

> More insights. Same GPUs.

Replace the primary paragraph with:

> Autolab watches every job. When a run stops improving or is clearly failing, it ends the job and gives that GPU to the next experiment.

Add the short payoff:

> More useful experiments finish without adding more compute.

Retain the current twelve-GPU fabric, four experiment arrivals per GPU, faint settled routes, active vector trails, cumulative GPU luminance, pruning, reassignment, and verified winner state.

The phase labels should favor plain operational language such as `watching every run`, `plateau detected`, `GPU reassigned`, and `next experiment running`.

### Early access and onboarding

Retain the existing two-column section and assign each side one job.

Left side:

- Eyebrow: `Start with Autolab`
- Headline: `Get early access.`
- Body: `Leave your email and we will send you access details.`
- Required field label: `Email address`
- Submit button: `Request access`
- Secondary text link: `Book a demo`

Right side:

- Label: `Already have access?`
- Keep the enlarged onboarding console.
- Keep the CLI, Claude Code, and Codex tabs and commands.

Preserve the outer section's existing `#get-started` anchor for compatibility. Give the form the `#early-access` anchor and the console the `#onboarding-console` anchor. Early-access buttons target the form. Installation links target the console.

### Early-access form behavior

The form accepts one required email address. Do not add name, company, role, team size, or a qualification questionnaire.

States:

- Invalid: `Enter a valid email address.`
- Submitting: `Requesting access...`
- Success: `You're on the list. We'll be in touch.`
- Failure: `Could not submit. Try again or email team@autolab.ai.`

Submission requirements:

- The form posts the email, source page, and submission timestamp to a real HTTPS endpoint supplied for the production deployment.
- Isolate the transport behind one small form module so the provider can change without changing markup or state handling.
- Disable duplicate submissions while a request is pending.
- Announce validation, success, and failure through an accessible live region.
- Never show the success state unless the endpoint returns success.
- If the prototype has no configured endpoint, show the failure message with the direct email fallback. Do not simulate a signup.

The repository does not currently contain an email-capture endpoint. A production endpoint or form-provider destination is required before deployment of the capture behavior.

### Closing section

Use:

- Eyebrow: `From GPU time to better models`
- Headline: `Every experiment improves the next one.`
- Body: `Autolab keeps the code, metrics, and history behind every run. You review the winning change and decide what ships.`
- CTA: `Get early access` to `#early-access`

## Product Page Design

### Visual direction

The Product page is a separate, quieter page in the same system. It reuses the island navigation, paper and ink palette, mint accent, serif display type, sans-serif body type, mono instrument labels, grids, and hairline rules.

It does not duplicate the full homepage scroll narrative. Its one signature animation is the watchdog handoff: a learning curve plateaus, the job stops, the GPU becomes available, and a new experiment begins.

Other product visuals should be restrained diagrams or compact instruments that clarify the feature beside them.

### Product hero

- Eyebrow: `The Autolab platform`
- Headline: `Your GPUs, running the next useful experiment.`
- Body: `Autolab connects your compute, watches every training run, stops wasted work, and uses each result to decide what to try next.`
- Primary CTA: `Get early access`
- Secondary CTA: `Book a demo`

The primary CTA targets the Product page's closing early-access form.

### Feature 1: connect compute

- Headline: `Connect the GPUs you already have.`
- Body: `Autolab connects machines across your cluster or cloud account and treats them as one experiment pool. A spare GPU and a multi-node cluster participate in the same queue.`
- Visual: a clean compute map feeding one scheduler.

### Feature 2: monitor jobs

- Headline: `Watch every experiment as it runs.`
- Body: `Autolab reads training metrics, logs, failures, checkpoints, and evaluation results while each job is running.`
- Visual: a compact live-jobs instrument with learning curves and plain status changes.

### Feature 3: stop wasted runs

- Headline: `Stop runs when they stop being useful.`
- Body: `Autolab's watchdog models detect experiments that have plateaued or are clearly likely to fail. Those jobs stop before they consume more GPU time.`
- Visual: the signature plateau, stop, reassign, and restart animation.

### Feature 4: choose the next experiment

- Headline: `Use every result to choose what comes next.`
- Body: `Completed, failed, and stopped experiments all produce information. Autolab uses that evidence to propose the next changes worth testing.`
- Visual: results returning to a branching experiment queue.

### Feature 5: review the result

- Headline: `Review what worked.`
- Body: `Winning experiments arrive with the code change, metrics, logs, and experiment history behind them. Your team decides what ships.`
- Visual: reuse the approved winning diff-card language.

### Infrastructure block

- Headline: `Your infrastructure or ours.`
- Body: `Run Autolab on your cluster or in your cloud account. Code, data, and model weights can stay inside your network.`

This is a compact proof block rather than a sixth feature chapter.

### Product close

Repeat the same early-access form states and transport contract. Offer `Book a demo` as the enterprise alternative. Do not repeat the full CLI console on the Product page.

## Responsive and Accessibility Requirements

- The hero's rotating word remains one unbroken second line from desktop through the smallest supported mobile width.
- Homepage animation semantics remain available in ordinary text outside decorative canvases.
- Product diagrams and canvases are decorative unless they convey information not already present in adjacent copy.
- Every form control has a visible label.
- Keyboard focus remains visible.
- Form status changes use an accessible live region.
- Reduced motion resolves every animation into a stable, meaningful final state.
- No viewport produces horizontal scrolling.

## Verification

- Add a static contract that rejects the em dash character in visible Rebirth and Product-page copy.
- Assert the approved hero copy, rotating words, CTA destinations, section order, Product-page features, and infrastructure copy.
- Add interaction tests for invalid email, pending submission, successful submission, server failure, and missing endpoint behavior.
- Confirm no success state appears without a successful response.
- Verify the CLI, Claude Code, and Codex tabs still work.
- Inspect both pages at desktop and mobile widths.
- Inspect reduced-motion behavior.
- Confirm no console errors, failed local resources, horizontal overflow, or clipped hero words.
- Confirm the existing research and GPU animations retain their approved choreography.
- Confirm production SEO files remain unchanged relative to `origin/main` during the prototype pass.

## Review Checkpoints

1. Homepage copy, hero wrapping, and no-em-dash pass.
2. Early-access form and preserved CLI onboarding.
3. Product page structure and feature visuals.
4. Final cross-page, responsive, accessibility, motion, and preservation audit.

## Non-goals

- Replacing the approved homepage motion system.
- Reframing Autolab as only a GPU monitoring or cost-control product.
- Adding a second How It Works page in addition to the Product page.
- Adding pricing, customer logos, benchmarks, or fabricated savings claims.
- Building a qualification flow or sales CRM.
- Changing root production pages during the prototype pass.
- Changing the product's implementation or scheduling behavior.
