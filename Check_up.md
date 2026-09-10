# PYTHON FROM HELL — OMNIROUTE RECOVERY + AUDIT HANDOFF

The OmniRoute gateway has already been independently verified as reachable and authenticated.

Known evidence:

```text
GET /api/monitoring/health
→ healthy
→ setupComplete: true

Authenticated GET /v1/models
→ SUCCESS
→ large model catalog returned
```

Known available text/reasoning-capable models include:

```text
gemini/gemini-3.7-flash
gemini/gemini-3.1-pro-preview
gemini/gemini-3.6-flash
gemini/gemini-3.8-flash
qwen-web/qwen3.7-max
qwen-web/qwen3.7-plus
qwen-web/qwen3.8-max
```

However, the coding agent has encountered:

```text
503 Service Unavailable

Service temporarily unavailable:
all targets were skipped by pre-dispatch filters

URL:
http://localhost:20128/v1/responses
```

---

# 1. DO NOT LOOP

Do NOT repeatedly retry the same failing request without learning anything new.

Do NOT repeatedly report the same 503.

Do NOT keep redesigning the application because of the 503.

Do NOT modify Python From Hell application code merely to hide the gateway problem.

Perform a bounded diagnosis.

---

# 2. DIAGNOSE THE ACTUAL REQUEST

Inspect the exact failed `/v1/responses` request.

Determine:

```text
requested model
input
tools
reasoning requirements
thinking requirements
modalities
provider restrictions
routing hints
capability requirements
```

Trace:

```text
REQUEST
↓
PARSE
↓
NORMALIZE
↓
CAPABILITY REQUIREMENTS
↓
MODEL FILTERING
↓
PROVIDER FILTERING
↓
HEALTH/CODOWN
↓
QUOTA
↓
PRE-DISPATCH FILTERS
↓
TARGET SELECTION
↓
REQUEST EXECUTION
```

Identify the exact point at which all targets are rejected.

---

# 3. IDENTIFY THE EXACT FILTER REASON

Do not merely say:

> "All targets were skipped."

Determine WHY.

For the affected targets, identify the actual exclusion reason.

Examples:

```text
gemini/gemini-3.7-flash
SKIPPED
reason = tool capability mismatch
```

```text
qwen-web/qwen3.8-max
SKIPPED
reason = endpoint incompatibility
```

```text
gemini/gemini-3.1-pro-preview
SKIPPED
reason = provider cooldown
```

The reason must come from actual logs/configuration/code/telemetry, not speculation.

---

# 4. MINIMAL MODEL TEST

Once the filtering cause is understood, perform ONE minimal request against a clearly compatible text model.

Preferred test target:

```text
gemini/gemini-3.7-flash
```

Use only:

```text
Reply with exactly:
OMNIROUTE TEXT TEST SUCCESS
```

Do not send the full Python From Hell prompt.

Do not send unnecessary tools.

Do not request unnecessary modalities.

The purpose is to establish whether a minimal real model request succeeds.

---

# 5. COMPARE ENDPOINTS

Where supported, compare:

```text
/v1/responses
```

and:

```text
/v1/chat/completions
```

Use the same minimal textual task where possible.

Determine whether the problem is:

```text
request format
endpoint compatibility
routing filter
provider capability
provider health
quota
```

Do not change production behavior simply to make the test pass.

---

# 6. DO NOT DISABLE SAFETY/HEALTH SYSTEMS

Do NOT solve the issue by:

* disabling provider health
* disabling capability checks
* removing cooldowns
* bypassing authentication
* deleting fallback logic
* forcing random models
* hard-coding one model everywhere
* removing telemetry

The correct fix must preserve the architecture.

---

# 7. DECISION POINT

After the bounded diagnosis:

## CASE A — REAL ROOT CAUSE FOUND AND FIXED

Verify the fix with one minimal real request.

Then report:

```text
Gateway:
PASS

Authentication:
PASS

Model discovery:
PASS

Known-good text model:
PASS

/v1/responses:
PASS / FAIL

/v1/chat/completions:
PASS / FAIL

Root cause:
...

Safe fix:
...

Application code changes:
NONE unless absolutely necessary
```

Then immediately continue to:

# PYTHON FROM HELL APPLICATION AUDIT

Do NOT stop after fixing OmniRoute.

---

## CASE B — OMNIROUTE ITSELF IS WORKING BUT CODEX'S REQUEST IS INCOMPATIBLE

Do NOT modify the Python From Hell product.

Clearly identify:

```text
Gateway:
PASS

Model discovery:
PASS

Provider:
PASS

Issue:
CODING-AGENT REQUEST / ENDPOINT COMPATIBILITY
```

Then continue the Python From Hell audit without pretending the gateway is fully fixed.

---

## CASE C — PROVIDER IS ACTUALLY UNAVAILABLE

Do not fabricate success.

Record:

```text
Provider:
UNAVAILABLE

Reason:
EXACT REASON

Fallback:
AVAILABLE / UNAVAILABLE
```

Then determine whether another compatible model can perform the audit.

Do not randomly switch providers.

---

# 8. TRANSITION TO APPLICATION AUDIT

Once the OmniRoute situation has been classified, STOP spending time on gateway diagnosis unless new evidence appears.

Now inspect the Python From Hell application.

Follow this exact order:

```text
PHASE 0
Project baseline

↓
PHASE 1
Build/static health

↓
PHASE 2
Application boot

↓
PHASE 3
Entry experience

↓
PHASE 4
Navigation

↓
PHASE 5
Learning flow

↓
PHASE 6
Real Python execution

↓
PHASE 7
Challenge judging

↓
PHASE 8
Learner state

↓
PHASE 9
Learner intelligence

↓
PHASE 10
Metric provenance

↓
PHASE 11
AI pipeline

↓
PHASE 12
AI context

↓
PHASE 13
OmniRoute integration

↓
PHASE 14
Fallback

↓
PHASE 15
Roast Engine

↓
PHASE 16
Debugging Dungeon

↓
PHASE 17
Project Factory

↓
PHASE 18
Audio/Voice

↓
PHASE 19
Persistence

↓
PHASE 20
Error handling

↓
PHASE 21
Security

↓
PHASE 22
Visual/UX

↓
PHASE 23
Interaction/motion

↓
PHASE 24
Responsive behavior

↓
PHASE 25
Accessibility

↓
PHASE 26
Performance

↓
PHASE 27
State architecture

↓
PHASE 28
Code quality

↓
PHASE 29
Documentation

↓
PHASE 30
Final end-to-end learner journey
```

---

# 9. CRITICAL METRIC RULE

Audit all learner-facing metrics.

NEVER invent:

```text
skill = 40
skill = 60
skill = 80
mastery = 70%
confidence = 75%
readiness = 65%
```

just because the UI needs a value.

Every metric must be traceable to real learner evidence.

When evidence is insufficient, use:

```text
Not assessed
Insufficient data
Awaiting assessment
```

Completion is not mastery.

Confidence is not skill.

AI-generated numbers without evidence are prohibited.

---

# 10. REAL FUNCTIONALITY RULE

Never accept these as evidence of completion:

```text
button exists
page renders
animation plays
component compiles
build succeeds
lint succeeds
```

A feature is complete only when the underlying functionality works.

Verify:

```text
real data
real execution
real tests
real state
real persistence
real AI interaction
real error handling
real integration
```

---

# 11. PREMIUM PRODUCT RULE

Python From Hell must be treated as a premium product.

The visual audit must evaluate:

```text
typography
spacing
hierarchy
navigation
editor
AI interface
dashboard
Debugging Dungeon
Project Factory
Bosses
progression
loading states
error states
success states
modals
notifications
motion
responsive behavior
accessibility
```

The application must not look like:

```text
generic SaaS
student prototype
template dashboard
basic chatbot
collection of disconnected cards
childish coding app
```

The product should feel:

```text
premium
immersive
technical
cinematic
intelligent
dangerous
humorous
cohesive
```

---

# 12. NO UNNECESSARY REWRITE

Preserve working code.

Do not rebuild the entire application.

Fix:

```text
broken functionality
fake functionality
incorrect learner state
incorrect AI behavior
persistence bugs
security problems
major UX problems
performance problems
visual inconsistencies
```

in that priority order.

---

# 13. FINAL REPORT

At the end provide:

```text
PYTHON FROM HELL — FINAL AUDIT

OMNIROUTE STATUS
APPLICATION STATUS
REAL FUNCTIONALITY STATUS
LEARNER INTELLIGENCE STATUS
AI STATUS
EXECUTION STATUS
PERSISTENCE STATUS
DEBUGGING STATUS
PROJECT STATUS
AUDIO/VOICE STATUS
VISUAL/UX STATUS
PERFORMANCE STATUS
SECURITY STATUS
```

Then classify every major area as:

```text
PASS
PASS WITH WARNINGS
PARTIAL
FAIL
NOT IMPLEMENTED
```

Then provide:

```text
CRITICAL ISSUES
HIGH-PRIORITY ISSUES
MEDIUM-PRIORITY ISSUES
POLISH OPPORTUNITIES
FIXES COMPLETED
REMAINING LIMITATIONS
SINGLE HIGHEST-VALUE NEXT ACTION
```

Do not exaggerate.

Do not claim something works unless verified.

---

# FINAL COMMAND

The 503 is a diagnostic problem, not permission to abandon the product audit.

Diagnose it once, establish the root cause, test a minimal real request, classify the result, and then continue the Python From Hell audit.

Do not get stuck in an endless OmniRoute retry loop.

The ultimate objective remains:

**Build a genuinely functional, intelligent, persistent, visually exceptional, premium Python learning platform — not merely a project that compiles.**
