---
title: "Skills for Self-Management: Covey's 7 Habits as agent skills"
date: 2026-10-11
dek: "Eight small Claude skills that review my plans the way Stephen Covey would. The AI acts as a critic of the planning system, not as a to-do app."
kind: Notes
---

I keep a layered planning system: a mission statement, a five-year plan, a yearly plan, quarterly goals and a weekly schedule. The system itself is not the problem. The problem is that it drifts. Weekly tasks stop tracing back to anything I said mattered, goals that depend on other people slip in, and the review that should catch this is the first thing I skip.

I wanted a reviewer that knows a framework well and has no reason to be polite. So I turned Stephen Covey's *The 7 Habits of Highly Effective People* into a set of Claude Agent Skills. Code: [github.com/alexli-77/skills-self-management](https://github.com/alexli-77/skills-self-management).

## Eight skills, one persona

The collection is one dispatcher plus eight single-purpose skills. The dispatcher, `stephen-covey`, provides the persona and routes a request to the right lens:

| Skill | Habit | What it checks |
|---|---|---|
| circle-of-influence | 1 · Be proactive | Is this goal something I can act on, or only worry about? |
| life-center-diagnosis | 2 · prerequisite | What is actually at the centre of my decisions right now? |
| personal-mission-statement | 2 · Begin with the end in mind | Write or audit the mission statement |
| quadrant-ii-time-management | 3 · First things first | Where does the week's time really go? |
| win-win-agreement | 4 · Think win-win | Structure a negotiation around both sides' real needs |
| seek-first-to-understand | 5 · Listen first | Break a recurring argument |
| emotional-bank-account | 4–6 · Trust | Deposits and withdrawals in a relationship |
| sharpen-the-saw | 7 · Renewal | A four-part check for burnout |

It started from [sethmblack/paks-skills](https://github.com/sethmblack/paks-skills), a single skill file of almost 3,000 lines. I split it because a skill that small is loaded only when it is needed, so it costs less context. Each skill can also be updated on its own and installed on its own. I also translated the whole set into Chinese, tuned each skill's description so Claude triggers it reliably, and added a short conversational mode next to the full analysis.

## Three ways I use it

**Vertical alignment, every quarter.** Walk the plan from the top down and check that each item serves the level above it. This surfaces two things I would not notice myself: zombie tasks that trace back to nothing, and priorities named in the mission statement that have vanished from every lower level.

**Quadrant check, every Sunday.** Sort the week's tasks into Covey's four quadrants and measure the share of Quadrant II, the important but not urgent work. If it is far below half, the question becomes which urgent but unimportant tasks I can decline, and which crises earlier Quadrant II work would have prevented.

**Circle of influence, for goals.** For each goal, decide whether I control it. "Grow the product to 100k users" depends on other people; "ship two retention features a month and run three user interviews a week" does not. The skill rewrites the first kind into the second.

## What I learned building it

**A critic is more useful than an assistant.** The most valuable output is the uncomfortable sentence: "Family is second in your mission statement and appears nowhere in this week's plan." A to-do app would never say that. A reviewer with a fixed framework says it every time.

**Small skills beat one big prompt.** Splitting by habit made each skill easier to trigger, test and change. It is the same single-responsibility argument as in code, and it holds for prompts too.

**The review has to be scheduled, too.** The skills only help if the review happens. The weekly and quarterly reviews belong in the calendar as fixed blocks, treated as Quadrant II work like anything else.

For the automated version of this loop, which reads the week's plan from Lark, compares it with what happened and drafts next week, see the companion repo [life-review-os](https://github.com/alexli-77/life-review-os).
