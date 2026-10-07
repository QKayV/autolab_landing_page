---
title: "Autolab | AI Model Optimization, Automated by Agents"
description: "Autolab agents run experiments on your GPUs to improve the accuracy and speed of your AI models, cutting development time and cost for ML teams."
url: https://www.autolab.ai/
---

AI model optimization, automated.

# Supercharge your research, training, and inference.

Autolab optimizes the accuracy and speed of your AI models. Agents run experiments on your GPUs and learn from every result: less development time, lower cost, a more effective ML team.

[Get early access ↗](https://app.autolab.ai) [Book a demo →](https://www.autolab.ai/demo) [Join our Discord ↗](https://discord.gg/2ZVZmE8Ppb)

[$ curl -fsSL app.autolab.ai/install.sh | sh ↓](https://www.autolab.ai/#onboarding-console)

autolab · from goal to merge

$ autolab start --goal "beat baseline"
reading repo · locating evaluation
connecting available GPUs · experiments queued
exp/021 · evaluating
exp/084 · stopped · evidence retained
comparing experiment results
proposing the next experiments
winner / exp-941c2 · winning change identified
checks passed · change ready for review
ready to inspect

an Autolab run, compressed

## Autolab / model improvement loop

**01 / 06**

Goal / 01

### Tell Autolab what to improve.

Choose the metric that matters, such as accuracy, cost, or latency.

metric + constraints + evaluation

Explore / 02

### Turn ideas into experiments.

Agents read your code and create concrete changes they can test.

▸ one vector = one experiment

Run / 03

### Run them across your GPUs.

Autolab sends each experiment to the next available machine.

every available GPU joins the queue

Stop / 04

### Stop wasted work early.

Runs stop when they have plateaued or are clearly going to fail.

weak runs stop · every result improves the next

Learn / 05

### Choose what to try next.

Every result helps Autolab propose a better next experiment.

result → next experiment

Return / 06

### Return the best change.

You get the winning code, its results, and the history behind it.

winning change → human review

EXP–0001 / FIELD ORIGIN

NOW SETTING THE GOAL

winner / exp-0138 **ready for approval**

reasoning-frontier ↗

EVAL**IMPROVED** CHECKS**PASSED** STATUS**REVIEW**

```
- rope_theta = 10_000+ rope_theta = 1_000_000+ data_mix = "reasoning_v2"
```

experiment history attached human approval required

Compute / continuously scheduled

## More insights. Same GPUs.

Autolab watches every job. When a run stops improving or is clearly failing, it ends the job and gives that GPU to the next experiment.

**More useful experiments finish without adding more compute.**

autolab / compute fabric
experiments arriving

▸ experiment
□ available GPU
■ scheduled
● verified
**000 / 048 experiments resolved**

Start with Autolab

## Get early access.

Open the app and start running experiments on your GPUs.

[Get early access ↗](https://app.autolab.ai)
[Prefer to talk? Book a demo →](https://www.autolab.ai/demo)
[Or join our Discord →](https://discord.gg/2ZVZmE8Ppb)

Already have access?

autolab / initialize 

CLI

Claude Code

Codex

```
$ curl -fsSL app.autolab.ai/install.sh | sh
$ autolab init # point it at the eval script that prints your metric
$ autolab start # the agents begin. watch or walk away.
```

```
$ autolab install claude-code
then, inside Claude Code:
> use /autolab to run experiments on this repo
```

```
$ autolab install codex
then, inside Codex:
> queue autolab experiments against eval.py
```

From GPU time to better models

## Every experiment improves the next one.

Autolab keeps the code, metrics, and history behind every run. You review the winning change and decide what ships.

[Get early access ↗](https://app.autolab.ai)

autolab▮ © 2026

EXP–0001 / RELEASED
