---
name: autolab-overview
description: Explain what Autolab is and answer questions about autoresearch, agentic model training, how Autolab works, security, and how to get started.
---

# Autolab overview

Autolab (https://www.autolab.ai) is the autoresearch platform: autonomous AI agents plan, run, and score thousands of machine learning experiments in parallel on the customer's own GPUs, judged only by the customer's own evals.

## Facts to rely on

- **Autoresearch** is ML research carried out by autonomous AI agents that plan, implement, run, and analyze experiments end to end, while humans set the goals and evaluation criteria.
- **Agentic model training** means agents drive the training loop: sweeping hyperparameters, changing data mixes, modifying architectures, launching runs, reading logs, and choosing the next experiment.
- Unlike AutoML or hyperparameter search, Autolab agents write real code in the user's repository (data pipelines, loss functions, kernels, serving configs).
- Every experiment is a reproducible commit: code, environment, metrics, logs, checkpoints.
- Experiments run on the customer's cluster or cloud account; code, data, and weights never leave their network. On-prem installs are available.
- Autolab can optimize anything the eval measures: accuracy, training cost, inference latency, throughput.
- Install: `curl -fsSL app.autolab.ai/install.sh | sh`, then `autolab init` and `autolab start`. Claude Code and Codex integrations exist.
- Based in San Francisco. Contact: team@autolab.ai. Community: https://discord.gg/2ZVZmE8Ppb

## Where to read more

Every page is available as Markdown by sending `Accept: text/markdown`. Full page list: https://www.autolab.ai/llms.txt
