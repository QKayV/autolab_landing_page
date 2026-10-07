---
title: "Autolab Product | Autonomous AI Model Optimization"
description: "Autolab connects your GPUs, watches every training run, stops wasted work, and uses each result to choose the next experiment. See the full research loop."
url: https://www.autolab.ai/product.html
---

Autolab / system anatomy

# The research loop, running on your GPUs.

Connect a repository, an evaluation, and the compute you already have. Autolab proposes changes, runs and watches experiments, stops wasted work, and returns a reviewable research record.

[Get early access ↗](https://www.autolab.ai/interest.html) [Book a demo →](https://www.autolab.ai/demo)

YOUR SYSTEM
REPOSITORYEVALUATIONCONSTRAINTSGPU POOL

AUTOLAB
EXPERIMENT AGENTSSCHEDULERWATCHDOG
RESEARCH MEMORYNEXT EXPERIMENTS

YOUR TEAM **RESEARCH PACKET**
code · evidence · history · approval

▸ experiment □ GPU
○ evaluation ● selected result

Inputs / 01

## Connect what you already have.

Point Autolab at your repository, evaluation, constraints, and available compute. Machines across a workstation, cloud account, or cluster participate in one experiment queue.

PLATE 01 / INPUT TOPOLOGY solid = running · dashed = proposed · faint = history

CUSTOMER ENVIRONMENT

**REPOSITORYcode + branches**
**EVALUATIONthe metric to improve**
**CONSTRAINTScost + latency + quality**

▸ ▸ ▸ **AUTOLAB SCHEDULER**
assign the next useful experiment

LOCAL **□ GPU**

CLOUD **□ □ GPU**

CLUSTER **□ □ □ GPU**

Observe / 02

## See what every run is doing.

Autolab reads the proposed code change, assigned GPU, training trace, logs, checkpoints, and evaluation state while each experiment runs.

PLATE 02 / EXPERIMENT ANATOMY one running unit / six observed parts

▸ EXPERIMENT running unit

01 / CODE CHANGE **branch prepared**reviewable commit

02 / ASSIGNMENT **□ GPU ACTIVE**scheduler owned

03 / TRAINING TRACE **running**signals observed

04 / LIVE LOGS **signals streaming**failures retained

05 / CHECKPOINT **saved**artifact referenced

06 / EVALUATION **○ PENDING**your metric decides

Watchdog / 03

## Stop waste. Keep GPUs moving.

Watchdog models stop runs that have plateaued or are clearly trending toward failure. The evidence remains, and the freed GPU immediately becomes available to the next queued experiment.

Lineage / 04

## Turn every result into the next experiment.

Completed, stopped, and failed runs all add evidence. Autolab uses that history to propose concrete changes, avoid repeated dead ends, and choose the next experiments worth running.

PLATE 04 / EXPERIMENT LINEAGE solid = retained history · dashed = proposed next step

OUTCOMES RETAINED
● COMPLETED SELECTED RESULT

○ STOPPED plateau evidence

× FAILED failure evidence

dead ends remain useful evidence

RESEARCH MEMORY **OUTCOME + CHANGE + EVIDENCE**Each run stays attached to what changed and what happened.

NEXT BATCH
▸ PROPOSED CHANGE refine stopping rule

▸ PROPOSED CHANGE revise data schedule

▸ PROPOSED CHANGE test model change

useful results shape the next batch

Review / 05

## Review the full research record.

The winning change arrives with its configuration, evaluation state, logs, checkpoint reference, and experiment lineage. Your team decides what ships.

PLATE 05 / RESEARCH PACKET seven parts · one human decision

`− fixed training window + evidence-based stop rule `

**environment attached**repository · evaluation · constraints

**○ IMPROVED**your metric decides

**run record attached**events stay inspectable

**artifact referenced**state remains traceable

**history attached**completed · stopped · failed

DECISION BOUNDARY **HUMAN APPROVAL REQUIRED**YOUR TEAM DECIDES WHAT SHIPS

Autolab proposes. Your team approves.

Deployment / 06

## Deploy where your research already runs.

Run Autolab in your cloud account, on your cluster, on-prem, or with managed compute. Code, data, and model weights can remain inside your network.

PLATE 06 / DEPLOYMENT BOUNDARY customer infrastructure or managed compute

YOUR NETWORK customer controlled

CODE DATA WEIGHTS

01 / CUSTOMER **CUSTOMER CLOUD**your cloud account

02 / CUSTOMER **CLUSTER**your shared compute

03 / CUSTOMER **ON-PREM**your local hardware

04 / OUTSIDE YOUR NETWORK **MANAGED COMPUTE**an optional Autolab-managed pool

AUTOLAB **AUTOLAB CONTROL PLANE**scheduler · watchdog · research memory

Onboarding / 07

## Start this afternoon.

Install Autolab, connect the evaluation that prints your metric, and start a research loop from the tools you already use.

Choose your path

autolab / initialize 

CLI

Claude Code

Codex

```
$ curl -fsSL app.autolab.ai/install.sh | sh
$ autolab init # connect the evaluation that prints your metric
$ autolab start # begin proposing and running experiments
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

Technical FAQ

## Before you connect a run.

The short version of what Autolab touches, changes, and returns to your team.

What is autoresearch?Autoresearch is autonomous AI agents running the machine learning research loop: proposing experiments, writing the code, training and evaluating models, and deciding what to try next — while humans set the goal. Instead of one researcher hand-running one experiment at a time, an autoresearch platform runs thousands in parallel and merges only what improves the metric. [Read the full explanation →](https://www.autolab.ai/autoresearch.html)

What is Autolab?Autolab is an autoresearch platform for AI model training. You give it a goal and an eval; its agents read your repo, plan experiments, launch them across your GPUs, score every run against your metric, and keep iterating until the goal is met. It was built by ML researchers from MIT, Harvard, Stanford, and Google DeepMind.

What is agentic training of models?Agentic model training means AI agents, not humans, drive the training loop: they sweep learning rates, change data mixes, modify architectures, launch runs, read the training logs, and decide the next experiment. Autolab coordinates hundreds of these agents against a single goal, on your own compute.

How is this different from AutoML or hyperparameter tuning?AutoML and hyperparameter optimization search a fixed space with predefined strategies. Autoresearch agents write real code in your repository: new data pipelines, loss functions, kernels, quantization and serving configs — anything a researcher could try — and every change is scored against your own evals before it merges.

Where do the experiments run?On your cluster or in your cloud account. Code, data, and weights never leave your network, and on-prem installs are available for pilots. Autolab keeps whatever GPUs you have — from a spare 3090 to a multi-node H100 cluster — saturated with the next-most-valuable experiment.

What can Autolab optimize?Whatever your eval measures: model accuracy, training cost, inference latency, throughput. Teams use it for pre-training and fine-tuning experiments, post-training recipes, and inference optimization — the agents push the number, and nothing ships unless it moves.

Start with Autolab

## Get early access.

Open the app and start running experiments on your GPUs.

[Get early access ↗](https://app.autolab.ai)

autolab▮ © 2026
