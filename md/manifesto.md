---
title: "Our Vision: The Era of Autonomous AI Research · Autolab"
description: "AI research is becoming an engineering discipline. Autolab's vision for autoresearch: infrastructure that lets AI agents run training experiments autonomously."
url: https://www.autolab.ai/manifesto.html
---

[auto/lab](https://www.autolab.ai/)

# our vision

AI research is becoming an engineering discipline.

The era of single-PhD-single-paper is ending. The best results
now come from systematic experimentation at scale, not individual
flashes of insight.

The researchers who win will be the ones who run the most
informative experiments per unit of compute, not the most
experiments total.

Agents are good at writing code. They are bad at understanding
what happened.

Autoresearch today is a 630-line system prompt. It works because
the codebase fits in a context window. It breaks the moment you
try anything real.

The bottleneck is not reasoning quality. It is context starvation.
Agents make bad decisions because they receive almost no structured
information about what actually happened during training.

The missing layer is intelligence infrastructure.

Someone needs to log everything that happens during a training run
without slowing it down. Compress it into structured, multi-resolution
summaries. Assemble the right context for each decision. Feed it to
the agent at the right time.

This is not a dashboard. This is not experiment tracking. This is a
new category of infrastructure that sits between your training code
and the agent that decides what to do next.

No compute should sit idle.

Every GPU cycle not running an experiment is money lost. Every hour
an engineer spends manually analyzing W&B dashboards is an hour the
agent should have spent planning the next run.

Heterogeneous compute matters. The 3090 sitting unused in your lab
can run ablations that inform what the H100 cluster does next.

The right interface is not a dashboard.

Dashboards are for humans staring at screens. The future of
research interaction is: you send a voice memo from the train
with a new idea, and the system implements it, tests it, and
tells you what happened.

The agent should explain its findings to you. Not the other way
around.

We are building this because we need it.

We are ML researchers at Harvard and MIT. We train models every day.
We have wasted weeks on bugs we should have caught in the first
60 seconds of a run.

We built autolab because the tools we needed did not exist.

Open research, closed loop.

The logging layer is open source. The intelligence layer is our
product. We give you deep visibility into your training runs for
free. We charge for the system that turns that visibility into
better experiments.

[back to autolab](https://www.autolab.ai/)
[what is autoresearch](https://www.autolab.ai/autoresearch.html)
[discord](https://discord.gg/2ZVZmE8Ppb)
[careers](https://www.autolab.ai/careers.html)
