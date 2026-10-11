---
title: "KDS: a self-adaptive rebalancer for Kubernetes"
dek: "A control loop that keeps Pods evenly spread across a Kubernetes cluster without an operator in the loop. Built for 58.com's cloud search and granted a Chinese invention patent."
kicker: "Systems · Patent"
meta: ["2020", "Sole inventor · CN112181605B", "Go · Kubernetes"]
---

- When: 2020, at 58.com, for the [WCS cloud search platform](/projects/wcs-cloud-search/)
- Role: designed and built KDS; sole inventor on the patent; wrote up the design and evaluation as a technical paper
- Patent: CN112181605B, *Load Balancing Methods, Apparatus, Electronic Devices, and Computer-Readable Medium*. Filed 2020-10-27, granted 2025-03-11 ([Google Patents](https://patents.google.com/patent/CN112181605B/en))
- Code: [github.com/alexli-77/KDS](https://github.com/alexli-77/KDS)
- Stack: Go · client-go · built on Kubernetes descheduler

![KDS architecture](/assets/projects/kds/architecture.svg)

## The problem

kube-scheduler places a Pod once, when it is created, and never looks at it again. On WCS that was not enough. Search instances grew with their data and traffic, so a placement that was fine on day one could become a hot spot a month later. We had no spare machines to add, and Pods piled up on a few nodes while others sat half empty. Query latency went up on the crowded nodes, and an overloaded node is where a cascade starts.

Rebalancing by hand meant watching dashboards, picking Pods and migrating them one by one. With hundreds of search instances whose usage keeps changing, that was slow and risky. We needed a rebalancer that:

- acts on its own whenever the cluster drifts, while leaving alone what must not move (proxies, DaemonSets, critical Pods);
- derives its policy from the current state of the cluster instead of fixed thresholds that someone has to keep tuning;
- costs almost nothing to run.

## How it works

KDS splits into a Controller that decides and an Operator that acts.

**Data Collector.** Reads nodes and Pods through client-go every interval, along with the run settings: interval, node selector, maximum Pods to evict per node, eviction mode and dry run.

**Preprocessor.** Keeps only the nodes that match the selector and can take Pods, drops DaemonSet and critical Pods, and maps each node to its Pods grouped by QoS class (BestEffort, Burstable, Guaranteed).

**Data Processor.** Scores every node with one weighted number:

`u = α·cpu + β·mem + γ·pods`

where each term is the node's share of its capacity: summed Pod CPU over node CPU, summed Pod memory over node memory, Pod count over Pod capacity. The weights are set per cluster. KDS ranks the nodes, compares the highest and lowest with the cluster average, and rewrites the thresholds in `policy.yaml` for this round.

**Operator.** Evicts Pods from nodes above the threshold, lowest QoS class first, at most a fixed number per node per round. It evicts through the Kubernetes Eviction API instead of deleting Pods, so PodDisruptionBudgets are respected and a service never loses all its replicas at once. The Pod's Deployment recreates it, and kube-scheduler places it on a node with room. The loop stops acting once every node is within 1 of the cluster average.

## Key design decisions

**1. Correct placement after the fact instead of replacing kube-scheduler.** KDS is built on the Kubernetes descheduler: it evicts, and the default scheduler re-places. The scheduling path stays untouched, so if KDS fails, the cluster just stops rebalancing. Pods never stop being scheduled.

**2. Thresholds come from the cluster, not from a config file.** The stock descheduler needs fixed thresholds such as "below 20% is underused, above 50% is overused". Those depend on the cluster and go stale as workloads change. KDS recomputes them each round from the current high, low and average nodes. That is what "self-adaptive" means here.

**3. One composite score, weighted per cluster.** CPU, memory and Pod count go into a single number. On a cluster of identical search Pods the Pod count dominates; on a mixed cluster CPU and memory matter more. Changing the weights adapts KDS to either case without code changes.

**4. Move gently.** A per-node cap on evictions per round, lowest QoS class first, a node selector that keeps proxy nodes out, and a dry-run mode for trying a policy on production safely. Stateful search Pods were safe to evict because WCS rebuilds a replica's index from its peers on startup.

## Results

The paper evaluates KDS on a 20-node test cluster running the cloud search application: 3 nodes host the proxies and 17 host 96 search Pods, under a steady 2,000 QPS from JMeter.

![Pods per node before and after KDS](/assets/projects/kds/results.svg)

- **Even spread.** With default placement, nodes held between 2 and 14 Pods. In a run skewed by hand, one node held 30. After KDS, every node held 5 or 6, against a cluster average of 5.65.
- **Lower latency.** With Pods piled up, search latency ran at roughly 8–10 ms. After KDS it settled around 5.5–6 ms, lower than the default initial placement. These values are read from the paper's latency chart.
- **Negligible overhead.** KDS runs outside the cluster and reads cluster state once per interval. At a 60-second interval that is about 0.017 requests per second against the API server.
- **Patent.** The method was granted Chinese invention patent CN112181605B in 2025.

## My role

- Found the problem while running WCS in production, and designed KDS to solve it
- Implemented the Controller in Go on top of the Kubernetes descheduler
- Ran the evaluation and wrote it up as a technical paper
- Sole inventor on Chinese invention patent CN112181605B
