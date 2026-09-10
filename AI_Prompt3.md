Proceed with **all three enhancements**, but implement them sequentially in this order:

1. Interactive Python Debugger Mode
2. Project Director & Milestone Evaluator
3. Audio / Voice Multimodal Reactions

Do NOT implement them as superficial UI features.

Before changing anything, inspect the existing implementation and determine what already exists for each feature.

## 1. INTERACTIVE PYTHON DEBUGGER MODE

Build a real **"Find & Fix the Bug"** dungeon/challenge system.

The learner should receive intentionally broken Python code and must:

```text
Inspect
↓
Predict
↓
Identify the bug
↓
Explain what is wrong
↓
Modify code
↓
Run code
↓
Inspect actual result
↓
Fix again if necessary
↓
Pass tests
↓
Explain the final fix
```

Requirements:

* real Python execution
* real runtime errors
* deterministic tests
* hidden tests where appropriate
* intentional logic bugs, not just syntax errors
* multiple bug categories
* progressive difficulty
* persistent attempts
* hint tracking
* debugging time tracking
* debugging accuracy tracking
* repeated-error tracking
* misconception detection
* AI debugging coach
* integration with learner mastery
* integration with learner dependency detection
* event tracking
* persistent state

Do NOT simply give the learner the corrected code.

The AI should coach progressively and reduce assistance as independence improves.

Debugger scenarios should include things such as:

* syntax mistakes
* indentation mistakes
* incorrect conditions
* off-by-one errors
* wrong variable updates
* incorrect return statements
* scope mistakes
* mutable-state mistakes
* incorrect loop logic
* bad exception handling
* incorrect data structure usage
* subtle logical bugs

The Roast Engine should react contextually to the debugging situation without repeating the same insult.

---

## 2. PROJECT DIRECTOR + MILESTONE EVALUATOR

Build a real multi-file project system.

Projects should resemble actual Python work rather than oversized coding exercises.

Examples:

* CLI application
* API/data scraper
* automation tool
* database-backed application
* developer utility

Each project must contain real milestones.

Example:

```text
Project
↓
Milestone 1 — foundation
↓
Milestone 2 — core functionality
↓
Milestone 3 — error handling
↓
Milestone 4 — testing
↓
Milestone 5 — polish
↓
Final evaluation
```

The Project Director should:

* explain requirements
* establish milestones
* assign the next task
* inspect project files
* execute tests
* evaluate implementation
* detect weaknesses
* track progress
* determine milestone completion
* provide contextual feedback
* prevent premature advancement
* evaluate engineering decisions
* help with documentation

Milestones must be judged using actual evidence.

Do NOT allow the AI to simply say:

> "Looks good, milestone complete."

Use real:

* tests
* execution
* assertions
* required files
* expected behavior
* edge cases
* code-quality checks where appropriate

Project progress must persist.

Project performance must feed back into the learner model.

---

## 3. AUDIO / VOICE MULTIMODAL REACTIONS

After the first two systems are working, add optional voice/audio reactions.

Support where technically practical:

* Hindi/Hinglish voice
* English voice
* boss introductions
* boss defeats
* savage roast callouts
* achievement reactions
* important warnings
* milestone completion
* comeback reactions

The audio system must be event-driven.

Example:

```text
Boss completed
↓
Achievement event
↓
AI reaction selected
↓
Voice/audio generated
↓
UI playback
```

Do NOT add random sound effects everywhere.

Provide user controls such as:

* sound on/off
* voice on/off
* volume
* English/Hinglish preference

Do not create fake audio states.

If the provider or browser capability is unavailable, gracefully degrade without pretending voice was generated.

---

# CROSS-FEATURE REQUIREMENTS

All three features MUST integrate with:

```text
Learner Model
Mastery Engine
Adaptive Learning Engine
Misconception Detection
Roast Engine
AI Context Manager
AI Router
OmniRoute
Provider Health
Event Tracking
Persistence
Analytics
Gamification
Recommendations
```

The AI must know the learner's previous performance when entering any of these systems.

---

# IMPORTANT: NO FAKE METRICS

Do NOT invent:

* skill percentages
* mastery percentages
* confidence percentages
* readiness scores
* progress numbers
* debugging scores
* project scores

Every displayed metric must come from real learner evidence.

When insufficient data exists, display:

```text
Not assessed
Insufficient data
Awaiting assessment
```

instead of fabricating a number.

---

# IMPORTANT: NO FAKE IMPLEMENTATION

Do not create:

* placeholder buttons pretending to work
* simulated Python execution
* fake test results
* fake milestone completion
* fake AI analysis
* fake voice generation
* fake debugging scores

If something cannot yet be implemented because of an infrastructure limitation, isolate it and clearly document the limitation.

---

# ENGINEERING RULE

Implement one vertical slice at a time.

For each enhancement:

```text
Inspect
↓
Design
↓
Implement
↓
Integrate
↓
Test
↓
Verify
↓
Persist
↓
Document
```

Do not rewrite unrelated parts of the application.

Preserve working code.

Refactor only when necessary.

---

# VISUAL / UX REQUIREMENT

These features must look like premium parts of **Python From Hell**.

Do not create generic forms or ordinary CRUD screens.

Debugger Mode should feel like a dungeon.

Projects should feel like a serious engineering workspace.

Voice reactions should feel like part of the persistent AI character.

All three should match the existing visual language.

Use polished:

* transitions
* loading states
* success states
* failure states
* error states
* responsive layouts
* interaction feedback

Avoid:

* childish UI
* generic SaaS cards
* meaningless animations
* excessive effects
* visual clutter

---

# FINAL VERIFICATION

After implementing each enhancement, verify:

1. Does the feature actually work?
2. Does it use real execution/testing?
3. Does it persist after refresh?
4. Does it update learner state?
5. Does it affect mastery/adaptation?
6. Does AI have the correct learner context?
7. Does event tracking record the correct events?
8. Does failure handling work?
9. Does the UI reflect actual state?
10. Is anything fake or hard-coded?
11. Does it look like Python From Hell?
12. Does it improve learning rather than merely adding spectacle?

Do not move to the next enhancement until the current one is genuinely functional.

Start with **Interactive Python Debugger Mode** now.
