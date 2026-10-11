---
title: "WCS Suggest: real-time query auto-completion"
dek: "The search-suggestion engine behind 58.com's cloud search. Type a few characters, pinyin or initials and get the top 20 completions. I built its real-time indexing, so new and deleted suggestions take effect without a rebuild."
kicker: "Industry · Search engine"
meta: ["2019–2020", "C++", "Real-time indexing"]
---

- When: October 2019 to June 2020, at 58.com, as part of the [WCS cloud search platform](/projects/wcs-cloud-search/)
- Role: built the real-time indexing subsystem, the multi-tier query path and the ranking formula; 927 of the project's 938 commits
- Stack: C++ · FST · epoll networking · Protobuf · Kafka feed
- Code: closed source (58.com internal)

![WCS Suggest architecture](/assets/projects/wcs-suggest/architecture.svg)

## The problem

Every vertical on 58.com (cars, housing, jobs) has a search box, and every search box needs suggestions as the user types. Chinese users type in three ways: characters (宝马), full pinyin (baoma) or initials (bm), and all three should surface 宝马X5. The answer has to arrive within a keystroke; the engine's request budget was 30 ms.

The first version, built by my teammates, served a static index built from a data file. Adding or deleting a single suggestion meant rebuilding and reloading the whole index. Businesses wanted to write and delete suggestions in real time, the same way they used the rest of WCS.

## How it works

![Term expansion](/assets/projects/wcs-suggest/terms.svg)

**Index time does the work.** Each suggestion is expanded into every prefix a user might type: characters, full pinyin (every reading of a polyphonic character) and initials. Filter fields such as city and category are joined into the key, so `bao` in city 1, category 2 becomes `bao_1_2`. Each key maps through an FST to a posting list of at most 20 suggestions, already sorted by weight. A query is then a single exact lookup.

**Real-time writes go through tiers, like an LSM tree.**
- A write from the feed (JSON add or delete) is expanded and inserted into an in-memory memtable that keeps a top-20 heap per term. It is also appended to a log on disk, and deletes and versions are recorded in two maps.
- At 100,000 terms the memtable is sealed into a read-only segment. After 100 sealed segments, a background thread merges them into one FST segment and drops the small ones.
- Reader lists are swapped under a read-write lock, so a query never sees a half-built segment.
- On restart, the engine loads the static index and replays the log and the maps.

**A query reads every tier.** It looks up the key in all five tiers in parallel, drops deleted documents and stale versions, merges the results into one top 20 with a min-heap, and returns Protobuf with the matched span highlighted.

## Key design decisions

**1. Precompute prefixes, keep the query trivial.** Expanding at index time costs space, but a query becomes one exact lookup per tier instead of a prefix scan. Posting lists are cut to the top 20 when they are built, so a query never sorts a long list.

**2. Filters live in the key.** Joining city and category into the term makes filtering free at query time. The cost is one key per filter combination, which stays small because each business uses at most two filter fields.

**3. LSM-style tiers for real time.** Only the memtable is mutable; everything older is immutable and merged in the background. It is the LSM pattern, specialised to "term → top 20".

**4. Deletes and updates as tombstones.** Rewriting an FST for every delete would be expensive. Instead a delete map and an id → latest-version map filter results at query time. Both are persisted and replayed on restart.

**5. Prefix-first ranking.** The weight of a suggestion under a term is

`score + 40000 + 20·(matched length − suggestion length) − 700·match start`

The constants make the match position dominate: a match at the first character beats any match later in the word. Among those, the match covering more of the suggestion wins, and the suggestion's own score breaks ties.

## Results

- New and deleted suggestions are searchable as soon as they arrive, with no rebuild. They reach disk within about three minutes and survive restarts.
- A query costs at most five exact lookups and a 20-item heap merge, well inside the 30 ms budget.
- The same engine served both static and real-time suggestions, so businesses on WCS could use either without a separate system.

## My role

- Designed and built the real-time indexing subsystem: memtable, sealed segments, background FST merge, disk log, delete and version maps (about 40 files)
- Reworked the query path to read and merge all five tiers
- Designed the prefix-first ranking formula
- Wrote the real-time indexing design doc
- The static index (phase 1) came from my teammates, and the networking and logging libraries were shared company code
