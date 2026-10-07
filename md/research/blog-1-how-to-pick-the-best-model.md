---
title: "How to Pick the Best Model for Autoresearch · Autolab"
description: "Opus, Fable, Inkling and Kimi head to head on real autoresearch tasks. Why single runs lie, rankings don't transfer, and which metric to optimize."
url: https://www.autolab.ai/research/blog-1-how-to-pick-the-best-model/
---

RESEARCH · NOTE 01 · 2026-07-22

# How to pick the best model for autoresearch

Last week was unusually rich in model releases, even by 2026 standards. First Inkling by Thinking Machines got everyone's attention as the first leading US open weights model in a while. A day later Moonshot AI released Kimi K3, a 2.8T open weights model with reported benchmark results ahead of most frontier models, with Fable 5 as the main exception. It is getting hard to follow which model is worth your time. At Autolab we care a lot about how well models run long-horizon autoresearch loops. So we put the new releases head to head to answer one question: which model should you use for autoresearch? It turns out "which model is best" is the wrong question. The post goes in three parts: the models and the setup, four rules for running the benchmarks, and the results.

THE CONTENDERS

## The models

New to the topic? Start with [what is autoresearch](https://www.autolab.ai/autoresearch.html).

### Inkling

Lab Thinking Machines

Released July 15

Price $1.87 / $4.68 [5]

A 975B parameter MoE with 41B active. Apache 2.0 open weights.

### Kimi K3

Lab Moonshot AI

Released July 16

Price $3.00 / $15.00 [6]

A 2.8T parameter MoE, the largest open weights model to date.

### Opus 4.8

Lab Anthropic

Released May 28

Price $5.00 / $25.00 [7]

The workhorse most agent harnesses were tuned on. Size unknown.

### Fable 5

Lab Anthropic

Released June 9

Price $10.00 / $50.00 [8]

First of the Claude 5 family, a tier above Opus. Size unknown.

Prices are USD per 1M input / output tokens on each provider's API.

All four drive the same Claude Code harness with identical prompts and tasks, so the model is the only thing that changes between runs.

THE SETUP

Tasks

We picked the 3 most standard benchmarks people compare autoresearch on. **Circle packing**: place 26 circles in a unit square to maximize the sum of radii, score = ratio to the 2.635 record[1]. **KernelBench**: write a faster LayerNorm kernel for an RTX PRO 6000 GPU, score = wall-clock speedup over PyTorch eager[2]. **NanoGPT Shakespeare**: train a small character level GPT on Tiny Shakespeare in fixed 20 minute training runs, score = negative validation loss.

Protocol

Each model x task gets 7 independent loops (Inkling: 3) from the same starting solution: about an hour each on circle packing and KernelBench, several hours on Shakespeare. Every evaluation's score and timestamp is logged.

Metric

Best score found so far, as a function of (a) how many evaluations the loop has made, (b) wall-clock time and (c) cumulative API cost.

PART 1

## How to run the benchmarks

It turns out that measuring autoresearch runs is not trivial: there are a few caveats, and missing them changes the conclusions. We distilled what we hit into four rules: variance, isolation, task choice, and the metric.

### Rule 1: Never trust a single run

LLMs are famously stochastic, and over a long run the randomness accumulates. To see how much, look at three Kimi K3 runs on KernelBench, launched with identical prompts and configs:

Three identical Kimi K3 loops on KernelBench, best score so far vs wall-clock. Hover for exact values.

For the rest of this post we display results as the average of 7 runs (3 for Inkling), with the variance across them shown as a lighter band. 3 runs is the absolute minimum to get any idea of how a model performs, and ideally it should be much more. A note on statistical significance: at these run counts only large gaps mean anything. The KernelBench gap between Fable 5 (21.7 ± 1.3) and Inkling (13.5 ± 0.0) is real; the Shakespeare gaps between the top three, whose means sit within 0.024 of each other while the stds reach 0.055, are not. When the bands overlap, read it as a tie.

### Rule 2: Isolate your runs

In our first batch of runs the models kept converging to the same scores, close enough to be basically indistinguishable from each other. The reason turned out to be simple: every insight an agent found was saved to Claude Code's global memory in ~/.claude/, and every later run started from it. Here is one agent opening its journal a few minutes into a "fresh" run:

Prior knowledge (from persistent memory of earlier experiments on this exact benchmark): [...] Stock baseline &asymp; -1.5728. Best known recipe (-1.3199): 5-member deep ensemble [...]

Fable 5, opening its journal a few minutes into a "fresh" run

We discarded all 18 of those runs. Beyond the shared memory, we also saw agents discover the directory of a neighboring run, from a different model, and study its commits. So isolate the environment of every run: ideally a fresh virtual machine each time, or at least a fresh Claude home directory, and block access to the directories of other runs.

### Rule 3: Know what your tasks measure

A word on task choice. In our experience, results generalize across tasks reasonably well, as long as the tasks stay within roughly the same complexity class. So we run the three benchmarks people already compare autoresearch systems on.

**Circle packing** is a small optimization problem that people use a lot, basically the hello world of autoresearch at this point[1][3]: place 26 circles inside a unit square so that the sum of their radii is as large as possible. It became a standard benchmark after the AlphaEvolve paper reported a record sum of 2.635[1]. Here is the best packing from our runs, found by Fable 5:

26 circles, sum of radii 2.6360, rendered from the solution of a Fable 5 run. The AlphaEvolve paper reports 2.635.

**KernelBench** is the standard benchmark for GPU kernel generation[2]. Our instance is one fixed problem from it: LayerNorm over a (16, 64, 256, 256) fp32 tensor, run on an RTX PRO 6000 (the original benchmark targets an H100). The agent writes the kernel in PyTorch, Triton, or inline CUDA; the output must match the fp32 reference, and the score is the measured wall-clock speedup over PyTorch eager. Averaged over runs (line = mean of best-so-far, band = ±1 std):

KernelBench, mean ± std over 7 runs per model (3 for Inkling). Left: progress per evaluation. Middle: progress per wall-clock hour, the dashed line marks the fixed 0.85 h cutoff used in the results table. Right: progress per dollar of API cost. Kimi K3's wide band comes from two runs that stalled near 15.5; one of them is the flat run in the Rule 1 figure.

**Fable 5 reaches 21.7 ± 1.3**, meaning its best kernel runs about 22x faster than eager, while **Inkling plateaus at 13.5 ± 0.0**, far outside the error bars. But on circle packing the same Inkling lands within 0.4% of the ceiling the other three hit.

**NanoGPT Shakespeare** is the closest to real autoresearch: the agent optimizes the training recipe of a small character level GPT on Tiny Shakespeare (about 1 MB of text), and every evaluation is a 20 minute training run. Score is negative validation loss, higher is better; guessing uniformly over the 65 character vocabulary scores -4.17:

NanoGPT Shakespeare, mean ± std over 7 runs per model (3 for Inkling). The dashed line on the wall-clock pane marks the fixed 4 hour cutoff used in the results table, the largest budget every run reached.

The ranking shuffles again. Inkling, near the ceiling on circle packing, is clearly behind here: -1.487 ± 0.006 at the 4 hour cutoff. The other three finish within noise of each other: Opus 4.8 at -1.395 ± 0.055, Fable 5 at -1.408 ± 0.049, Kimi K3 at -1.419 ± 0.024. For flavor, a sample from the model trained in the best Opus 4.8 run:

Nothing but one while I have no more.

LEONTES:
Thou art amazed.

PAULINA:
I go, my lord.

Lord:
I'll require thee from the Volsces well.

sample.txt from the run's final model, validation loss 1.327

Results are task-dependent, and these tasks are the community's warm-ups, not the final word. Before committing to a model, run it on your own problem.

### Rule 4: Score the resource you actually spend

The metric everyone reaches for is top score. But if top score is all you care about, the strategy is trivial: brute-force search with 1,000 GPUs and unlimited time. You don't have 1,000 GPUs and unlimited time. What you actually spend is wall-clock on a fixed budget, so the honest x-axis is time, not attempts. On circle packing, switching the axis changes the picture:

Circle packing, mean ± std (7 runs per model, Inkling: 3). Every run starts from the same 0.364 baseline below the zoomed axis. Left: per evaluation, Opus 4.8, Fable 5 and Kimi K3 are indistinguishable, all reach the 1.0004 ceiling within a few evaluations. Middle: per wall-clock, they are nothing alike. Kimi K3's line enters the frame at ~1.1 h because one run sat on the baseline until its second evaluation, 65 minutes in. Right: per dollar of API cost.

Per evaluation (left), three of the four models look identical. Per hour (middle), they separate widely. Time to reach the 1.000 ceiling:

Opus 4.8

5 min

mean, range 2-13

Fable 5

13 min

mean, range 3-37

Kimi K3

32 min

mean, range 10-86

Inkling

never

plateaus at 0.997

Same leaderboard by attempts, a 6x spread in time (32 min vs 5 min). The mechanism is cadence: on KernelBench, Opus 4.8 makes ~35 evaluations per hour while Kimi K3 makes ~13. Some models think longer per attempt, some attempt more. The time axis accounts for this; the attempts axis does not.

There is one exception: if your evaluation dominates the loop, evals are what you spend and per-attempt becomes the fair axis. The Shakespeare task above is that regime: with 20 minute training runs as evaluations, the models manage 1 to 3 evaluations per hour, and most of the wall-clock goes to training, not to the agent. The rule is not "always use time" but "score the resource you actually spend".

### Cost is a third axis

Attempts and hours are two of the budgets a loop spends; dollars are the third, and models price tokens very differently. So every figure above carries a third pane: best score against cumulative API cost. We compute it from the run transcripts: each API request's input, output, cache-read and cache-write tokens, priced at the provider's public per-token rates. Cache writes are priced at Anthropic's 1-hour-TTL write rate for the Claude models, and Inkling is priced at its 256K-context tier, the one these runs used.

The cost axis reorders the field once more. A mean KernelBench run costs $4.6 on Kimi K3 against about $20 on either Fable 5 or Opus 4.8. On Shakespeare the spread grows: $9 on Kimi K3 against $79 on Fable 5, because every token class costs more on Fable 5: cache reads at $1.00 per million against Kimi K3's $0.30, output at $50 against $15, plus 1-hour cache writes at $20 per million. If you run many loops, the cheapest model that reliably reaches your target score wins, and on these tasks that is Kimi K3 by a wide margin.

PART 2 · RESULTS

## So which model?

MODEL | KERNELBENCH @ 0.85 H | KERNELBENCH FINAL | CIRCLE PACKING FINAL | SHAKESPEARE @ 4 H | TIME TO CIRCLE CEILING | CADENCE, EVALS/H |

Fable 5 | 20.8 ± 2.5 | 21.7 ± 1.3 | 1.0004 ± 0.0000 | -1.408 ± 0.049 | 13 min | 17 |

Opus 4.8 | 21.0 ± 1.4 | 21.1 ± 1.2 | 1.0004 ± 0.0000 | -1.395 ± 0.055 | 5 min | 35 |

Kimi K3 | 19.6 ± 3.0 | 20.0 ± 3.4 | 1.0004 ± 0.0000 | -1.419 ± 0.024 | 32 min | 13 |

Inkling | 13.5 ± 0.0 | 13.5 ± 0.0 | 0.9965 ± 0.0032 | -1.487 ± 0.006 | never | 13 |

Mean ± std over 7 runs per model (3 for Inkling). "@ 0.85 h" and "@ 4 h" are best scores at fixed cutoffs; runs that plateaued and stopped before the cutoff carry their final score forward, and final scores alone would favor models whose runs happened to get more wall-clock. On Shakespeare the top three are within noise of each other, so no cell is bolded there. Cadence measured on KernelBench. Bold is best in column.

### Fable 5

The best KernelBench final, ties the circle packing ceiling. At the 0.85 h cutoff Opus 4.8's mean is slightly ahead. On Shakespeare it is within noise of Opus 4.8 and Kimi K3, and it is the most expensive model per run at API rates.

### Opus 4.8

A reasonable default: fastest to converge everywhere it converges, highest cadence, best Shakespeare mean, best KernelBench mean at the cutoff, cheaper per run than Fable 5. About 2% below Fable 5 on the KernelBench final.

### Kimi K3

Competitive on average, but KernelBench hides a 15.1 to 22.8 spread: two of seven runs stalled near 15.5. On Shakespeare it is the tightest of the top three (±0.024), and it is by far the cheapest per run. Budget extra runs to protect against a stuck one.

### Inkling

The most task-dependent result: near the ceiling on circle packing, behind on KernelBench and Shakespeare. Test it on your problem before ruling it in or out.

WHAT WE ARE NOT CLAIMING

Narrow slice

Three tasks, 7 runs per cell, one harness (Claude Code). A model could rank differently in a different scaffold or on your problem.

Saturation

Circle packing saturates: it measures speed to a ceiling, not quality beyond it.

List prices

Cost curves price tokens at each provider's public API rates as of 2026-08-02; provider prices change over time.

PART 3 · TL;DR

## Picking a loop model

- **Never trust a single run.** Loops are stochastic; three runs is the floor, and we run seven.

- **Isolate the runs.** Shared state between runs quietly inflates every number.

- **Benchmark on your problem.** Public tasks are warm-ups; results are task-dependent.

- **Score the resource you spend.** Best-so-far vs wall-clock on a fixed budget, unless your eval cost dominates. Dollars are a resource too: the same Shakespeare task costs $9 per run on Kimi K3 and $79 on Fable 5 at API rates.

- On our tasks, this week: **Fable 5** for the best KernelBench result, **Opus 4.8** for speed and consistency, **Kimi K3** for the lowest cost per run, no clear winner on the Shakespeare training task, and **Inkling** only after testing on your workload.

## More of these coming

Models will keep coming out, and we will keep running this comparison for the notable ones: same harness, 7 runs each. The current standings, updated with every notable release, are at the [running model comparison](https://www.autolab.ai/research/best-model/).

[Join our Discord](https://discord.gg/2ZVZmE8Ppb)
[Get alpha access](https://app.autolab.ai)
[Book an enterprise call](https://www.autolab.ai/demo)

Discord if you want to get pinged when the next comparison lands. Alpha access if you want to run autoresearch on your own GPUs. A call if you are an enterprise and want us to set it up with you.

Raw trajectories and all runs: [research.autolab.ai](https://research.autolab.ai).

## References

- [1] Novikov, A. et al. AlphaEvolve: A coding agent for scientific and algorithmic discovery. Google DeepMind, 2025. [deepmind.google](https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/) (source of the n=26 circle packing task and the 2.635 target)

- [2] Ouyang, A. et al. KernelBench: Can LLMs Write Efficient GPU Kernels? arXiv:2502.10517, 2025. [arxiv.org/abs/2502.10517](https://arxiv.org/abs/2502.10517)

- [3] Lange, R. T. et al. ShinkaEvolve: Towards Open-Ended and Sample-Efficient Program Evolution. Sakana AI, arXiv:2509.19349, 2025. [arxiv.org/abs/2509.19349](https://arxiv.org/abs/2509.19349)

- [4] Karpathy, A. autoresearch: AI agents running research on single-GPU nanochat training. GitHub repository, March 2026. [github.com/karpathy/autoresearch](https://github.com/karpathy/autoresearch)

- [5] Thinking Machines Lab. Inkling: Our Open-Weights Model. July 2026. [thinkingmachines.ai](https://thinkingmachines.ai/news/introducing-inkling/)

- [6] Moonshot AI releases Kimi K3. VentureBeat, July 2026. [venturebeat.com](https://venturebeat.com/technology/chinas-moonshot-ai-releases-kimi-k3-the-largest-open-source-model-ever-rivaling-top-u-s-systems)

- [7] Anthropic releases Opus 4.8. TechCrunch, May 2026. [techcrunch.com](https://techcrunch.com/2026/05/28/anthropic-releases-opus-4-8-with-new-dynamic-workflow-tool/)

- [8] Anthropic. Introducing Claude Fable 5 and Mythos 5. June 2026. [anthropic.com](https://www.anthropic.com/news/claude-fable-5-mythos-5)

autolab▮ © 2026 [autolab](https://www.autolab.ai/) [research](https://www.autolab.ai/research/) [what is autoresearch](https://www.autolab.ai/autoresearch.html) [vision](https://www.autolab.ai/manifesto.html) [discord](https://discord.gg/2ZVZmE8Ppb) [careers](https://www.autolab.ai/careers.html) [contact](mailto:team@autolab.ai)
