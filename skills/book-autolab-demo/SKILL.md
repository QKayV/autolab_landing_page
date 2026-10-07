---
name: book-autolab-demo
description: Help a person request an Autolab demo or early access. Use only when the person has asked to talk to Autolab or get access.
---

# Book an Autolab demo

Only act when the person explicitly asks to book a demo or request access, and confirm the details with them before submitting. Never submit on someone's behalf without their confirmation.

## Demo

Collect: name, role, company, work email, and a sentence or two about what they want to improve (model, metric, GPUs).

Either send them to https://www.autolab.ai/demo, or `POST https://www.autolab.ai/api/demo` with JSON `{"name","role","company","email","useCase"}` (all required). A `201` response includes `scheduleUrl`: give it to the person so they can pick a time.

## Early access

Send them to https://www.autolab.ai/interest.html or `POST https://www.autolab.ai/api/interest` with `{"email"}`.

Full API description: https://www.autolab.ai/openapi.json
