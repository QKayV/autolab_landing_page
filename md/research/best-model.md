---
title: "Running Model Comparison: Best Model for Autoresearch"
description: "A running benchmark of frontier models, run through Claude Code on fixed research tasks. Updated for every release, with mean, variance and API cost."
url: https://www.autolab.ai/research/best-model/
---

RESEARCH · RUNNING BENCHMARK · UPDATED 2026-09-02

# Running model comparison

When a notable model comes out, we run Claude Code with it on fixed [autoresearch](https://www.autolab.ai/autoresearch.html) tasks and publish the trajectories here. Pick the resource you care about, the task and the models; the plot and the standings follow. Why we measure it this way is covered in [the blog post](https://www.autolab.ai/research/blog-1-how-to-pick-the-best-model/).

I care about

API cost

wall-clock time

attempts

Task

model training

kernel optimization

Line = mean of best-so-far, band = ±1 std, over each model&rsquo;s runs (n in the picker). Hover the plot for exact values, hover a model name anywhere for its card, and use the corner button to enlarge.

Prices are USD per 1M input / output tokens on each provider's first-party API as of 2026-09-02; Inkling is priced at its 256K-context tier, the one these runs used. Cost per run and the cost curves price every token from the run transcripts at these rates: cache reads at each provider's cached-input rate, cache writes at Anthropic's 1-hour-TTL write rate where applicable.

PROTOCOL

## How the benchmark works

- **Same harness.** Every model runs inside Claude Code (versions 2.1.215–2.1.257 across cohorts) with identical prompts and configs, so the model is the only thing that changes between runs.

- **7 runs per model per task.** A single run is mostly noise. We report mean ± std and keep every raw trajectory public. Inkling runs at 3.

- **Fixed budgets.** Runs get about an hour of wall-clock on KernelBench and several hours on Shakespeare; the standings also score everyone at fixed cutoffs so unequal run lengths can't tilt the comparison.

- **Costs are in current API pricing.** Token counts come from the run transcripts and are priced at each provider's public API rates, including cache reads and writes.

- **New releases get added.** When a model comes out, it goes into the queue and the standings update. The task set is growing too.

**changelog**

2026-09-02 · **Fable 5.1** added · Sonnet 5 repriced at its standard rate

2026-08-08 · **Qwen3.8 Max** added

2026-08-02 · **Sonnet 5** and **Haiku 4.5** added as baselines

2026-08-01 · run count raised from 3 to **7 per model** · **cost curves** and per-run token and cost columns added

2026-07-26 · **Opus 5** added

## Follow the standings

We ping the Discord when a new model is added to this page. Raw trajectories and every individual run: [research.autolab.ai](https://research.autolab.ai).

[Join our Discord](https://discord.gg/2ZVZmE8Ppb)
[Read the blog post](https://www.autolab.ai/research/blog-1-how-to-pick-the-best-model/)

autolab▮ © 2026 [autolab](https://www.autolab.ai/) [research](https://www.autolab.ai/research/) [what is autoresearch](https://www.autolab.ai/autoresearch.html) [vision](https://www.autolab.ai/manifesto.html) [discord](https://discord.gg/2ZVZmE8Ppb) [careers](https://www.autolab.ai/careers.html) [contact](mailto:team@autolab.ai)

×
