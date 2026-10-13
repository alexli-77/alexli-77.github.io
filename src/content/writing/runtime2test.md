---
title: "Runtime2Test: can runtime facts help an LLM write unit tests?"
date: 2026-10-11
dek: "We gave a fine-tuned LLM what a Java program actually did at run time, hoping it would build better test setups. It didn't, and the reason points at the training data."
kind: Research
---

Ask an LLM to write a unit test and the assertion is rarely the hard part. The hard part is the Arrange step: building the object under test and its inputs in a state that is actually valid. That state often depends on hidden invariants, framework initialisation or side effects that are nowhere in the source code. So the model guesses, and a test with a guessed setup fails before it checks anything.

Runtime2Test asks a simple question: what if the model did not have to guess? If we record what a program really does on a real workload, can that information ground the model's test setup?

This was a course project for IFT 6289 at Université de Montréal, built with Mikhail Kamara and Ismail El Azhari. Code: [github.com/alexli-77/Runtime2Test](https://github.com/alexli-77/Runtime2Test).

## Starting from ProDJ

The project builds on [ProDJ](http://arxiv.org/pdf/2405.11294) (Wachter, Tiwari, Monperrus and Baudry, *Journal of Systems and Software*, 2025). ProDJ instruments a Java program, records how objects are constructed and mutated while it runs, and serialises those objects back into plain Java code that a developer can read and reuse as test setup. It then turns the recordings into tests with a deterministic code generator.

We kept ProDJ's capture side and replaced its code generator with a fine-tuned LLM.

![Runtime2Test pipeline](/assets/writing/runtime2test/pipeline.svg)

## What we built

**Capture (phases 1–3, from ProDJ).** A ByteBuddy Java agent instruments every public, non-trivial method of the target program. Under a representative workload it records three kinds of events: an object being constructed, a field being reassigned, and a method being called.

**Static snapshot.** Before any model call, Spoon parses the project and records, for each method under test, its source, parameter and return types, the calls it makes, and whether an existing test already reaches it. There is deliberately no Javadoc and no natural-language description: the model has to work from code and call-graph structure alone.

**Runtime facts.** For the hybrid mode we summarise the recorded events per method: how often it was called, how often it returned a value, how many nested and mocked calls it made, and the parameter types seen at run time. The busiest methods are sent to the model alongside the static snapshot.

**The model.** We fine-tuned Qwen2.5-Coder-7B-Instruct with QLoRA (rank 64, 4-bit NF4 weights, about 8 GB of VRAM) on roughly 5,000 method–test pairs from the context2test dataset. Budget limits cut training to 40 steps, about a third of an epoch, ending at a training loss of 1.53. An earlier attempt with CodeLlama-7B gave the same pattern of results.

**Post-processing.** Generated files are re-parsed to fix imports and drop test methods that obviously cannot compile.

We compared three modes on Apache PDFBox, a PDF library with plenty of complex object setup:

- **Baseline:** ProDJ-style trace replay, no LLM.
- **LLM static:** the fine-tuned model with the static snapshot only.
- **LLM hybrid:** the same model and checkpoint, with runtime facts added to the prompt.

## Results

| Metric | Baseline | LLM hybrid | LLM static |
|---|---|---|---|
| Test files | 26 | 29 | 29 |
| Test methods | 249 | 64 | 61 |
| Assertions | 297 | 89 | 102 |
| Tests per file | 9.6 | 2.2 | 2.1 |
| Assertions per test | 1.19 | 1.39 | 1.67 |

The baseline wins clearly. It writes four times as many tests, they follow the Arrange–Act–Assert structure consistently, and every one is grounded in an observed execution. The LLM writes fewer, denser tests with a wider mix of assertion types, but their formatting is less consistent and some have structural errors.

The result we cared about most is the comparison between the two LLM modes, and there the hypothesis failed: adding runtime facts did not help. The static mode even edged ahead on assertions per test.

## What I take from it

**Grounding at inference time is not enough.** The model was trained only on pairs of static code and tests. The first time it ever saw runtime facts was at evaluation. It had no reason to know what an invocation count or a return-value ratio should change about a test. If runtime information is going to help, the training data has to contain it: method, runtime context and test, together.

**We summarised away the useful part.** To keep the prompt short, the runtime facts were counts and type shapes, not the reconstructed objects themselves. But the Arrange problem is about object state, and ProDJ can already serialise that state as plain Java. The more promising experiment passes those reconstructed objects to the model directly.

**Structural metrics are a weak judge.** Counting tests and assertions says little about whether a test is useful. The next evaluation should measure whether tests compile and pass, and what coverage and mutation score they reach.

**A clear negative result is still a result.** We set out to show that runtime facts help, and under these conditions they did not. The experiment narrowed the question from "does runtime information help LLM test generation?" to "does it help once the model has learned to use it?" That second question is the one I want to answer next.
