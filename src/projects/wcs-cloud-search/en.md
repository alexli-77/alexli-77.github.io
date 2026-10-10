---
title: "WCS: 58.com Cloud Search Platform"
dek: "Dozens of separately deployed vertical search systems, consolidated into one multi-tenant platform on Kubernetes. A business team adds an SDK and a schema, and gets its own search service."
kicker: "Industry · 58.com"
meta: ["2018–2023", "Senior backend engineer", "200k+ peak QPS"]
---


- When: 2018–2023, Search & Recommendation / Cloud Search, 58.com
- Role: Senior backend engineer. Joined in 2018, when a first version already existed. Took part in the overall architecture design and in coding every module, helped build the production clusters from zero, and later owned day-to-day Kubernetes cluster operations
- Scale: 4 clusters, 396 servers, 300+ production businesses, 200k+ peak QPS
- Stack: Java · Spring Boot · in-house C++ search engine · Kafka · Kubernetes (fabric8) · brpc / Protobuf · Vue

![System architecture](/assets/projects/wcs-cloud-search/architecture.svg)

## Why it existed

58.com is a classifieds business: housing, jobs, used cars, local services. Every vertical needs its own search. At first each vertical ran its own search stack, which led to three concrete problems:

- Many systems on many versions. Upgrading the engine meant chasing each deployment one at a time.
- A new business that wanted search had to go from requesting machines to building indexes to launch, a process measured in weeks.
- Machines were dedicated per business, so capacity for low-traffic verticals sat idle.

Cloud Search turned "build a search system" into "request an app on the platform." Resources are scheduled centrally, the engine is upgraded once for everyone, and each business owns only its schema and its queries.

## Architecture

The system has a data plane and a control plane. Everything runs on Kubernetes.

**Access: wcs-agent SDK.** A client jar that business services embed. It offers an Elasticsearch-style query DSL (bool, term, range, geo, aggregations, sorting, highlighting, suggest), sync, async and bulk writes. It compiles queries into the engine's Protobuf format and sends them over 58's SCF RPC.

**Routing: route proxy.** Distribution only. It looks up the appId in the route table, picks an index version and cluster by weight, and forwards to that cluster's sink proxy. It is stateless and runs as multiple replicas that are not tied to any cluster: they can run in any of the 4 clusters and scale with traffic. The same image runs in query or index mode. It can also copy sampled traffic per app and per method to warm up new versions.

**Search clusters (×4): sink proxies + engine.**
- Query proxy: parses the DSL into an engine query, segments text, applies the query blacklist and sends the request to the merger. It then backfills stored fields from Wtable in one batch.
- Index proxy: checks the schema and CAS version, writes Wtable first (the source of truth for documents), then dual-writes the change to two Kafka clusters.
- The merger fans queries out to shards and merges the results. Each searcher pod runs the in-house C++ inverted-index engine plus a builder sidecar. Documents are sharded by murmur3(id) mod N.

**Data pipeline.** The builder has two modes: INST consumes Kafka for incremental updates, and MAIN rebuilds the full index from an HDFS snapshot of Wtable. Text fields go to edoc, a stateless tokenization service backed by in-house segmentation and NLP models. Edoc converts each document into the engine's index Protobuf, which the builder writes to the local engine. On restart the builder reads the engine's segment logs to find the right Kafka offset and replays from there, so no updates are lost.

**Control plane: wcs-manager.** A Vue + Spring Boot console that drives the full app lifecycle:
- Apps and fields go through approval. On approval, a Kafka topic and Wtable storage are allocated automatically.
- Deployments render versioned YAML templates into a Deployment and Service per shard and apply them to the target cluster through fabric8. Rollouts go in batches, with scaling, gray release and rollback.
- Route tables, schemas and segmentation dictionaries are pushed to the config center (WConfig), and merger shard lists to etcd. Proxies hot-reload them without a restart.
- Metrics flow through Micrometer → Kafka, Prometheus and Elasticsearch. Alerts go out by SMS, phone call and WeChat.

## Key design decisions

**1. Two-layer proxy: distribution separated from business logic.**

![Two-layer proxy routing](/assets/projects/wcs-cloud-search/routing.svg)

The route proxy answers one question: which cluster and which version. The sink proxies answer: how to run this query or write. With the two separated, gray release, rollback and moving an app between clusters are all a weight change in the config center, and callers never change code. Because the route proxy is stateless, its replicas can sit in any cluster, and if one cluster fails, replicas in the others keep forwarding. Sink proxies stay with their own cluster and upgrade per cluster, so one bad cluster does not take down the others.

**2. Reads and writes separated, with Wtable as the source of truth.**

Writes land in Wtable first and reach the index asynchronously through Kafka. Any index can be rebuilt from a Wtable snapshot, which is the safety net when the incremental path breaks. Queries take only doc IDs and sort values from the engine and backfill stored fields from Wtable, so engine memory goes to postings and sort attributes.

**3. App lifecycle fully automated.**

Every step an app goes through (request, approval, resource allocation, deployment, gray release, launch, retirement) is a state in MySQL, and the manager drives Kubernetes to reach it. Before launch, a new version must pass traffic-copy preheating and a diff test. Full rebuilds require an approved work order. To onboard, a business team defines a schema and calls the SDK.

**4. Tokenization as its own service.**

Segmentation is CPU-heavy and depends on models and dictionaries. Inside the engine it would compete for CPU and tie upgrades together. As the stateless edoc service it scales on its own, dictionaries are versioned per app, and a dictionary change needs no engine restart.

## Results

- **Fast onboarding:** a new business gets search in minutes by requesting an app, instead of building its own stack.
- **High utilization:** multi-tenant co-location replaced per-business machines. CPU and memory utilization stay dynamically above 80% while traffic remains balanced.
- **Lossless migration:** Kubernetes replicas, the index rebuild path and traffic routing together let a single replica move with no impact on traffic, so node maintenance and scaling are invisible to businesses.
- **Scale and stability:** 4 production clusters and 396 servers built from zero, serving 300+ production businesses at 200k+ peak QPS, with the company's core businesses running stably for years.

## Looking back

If I rebuilt it today, I would change three things:

- **Routing has three sources.** The route proxy reads WConfig, the sink proxies poll MySQL and the mergers read etcd. They stay consistent only because the manager writes to them in a fixed order. I would move to a single versioned routing source.
- **The write path blocks.** The index proxy holds an RPC thread while it waits for both Kafka acks, with acks=1 and no retries, so consistency really rests on Wtable and full rebuilds. I would acknowledge asynchronously and add a reconciliation job between Wtable and the index.
- **No rate limiting or circuit breaking at the proxies.** Protection comes from RPC timeouts and evicting bad nodes. In a multi-tenant system one app's traffic spike can starve a whole cluster, so I would add per-appId quotas.

## My role

- Took part in the overall architecture design, including the two-layer proxy split, read/write separation and the control plane.
- Wrote code for every module as part of the team: SDK, route proxy, sink query and index proxies, builder, the edoc tokenization service and wcs-manager.
- Helped build the production clusters from zero, ending at 4 clusters and 396 servers.
- Later owned Kubernetes cluster operations: node management, scaling, replica migration and production stability.
