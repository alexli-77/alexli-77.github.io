---
title: "KDS：Kubernetes 自适应负载均衡调度器"
dek: "一个不需要人值守的控制回路，让 Pod 在 Kubernetes 集群里始终分布均匀。为 58 同城云搜索而做，已获中国发明专利授权。"
kicker: "系统 · 专利"
meta: ["2020", "唯一发明人 · CN112181605B", "Go · Kubernetes"]
---

- 时间：2020 年，58 同城，服务于 [WCS 云搜索平台](/zh/projects/wcs-cloud-search/)
- 角色：设计并实现 KDS；专利唯一发明人；把设计和实验整理成技术论文
- 专利：CN112181605B《负载均衡方法、装置、电子设备和计算机可读介质》，2020-10-27 申请，2025-03-11 授权（[Google Patents](https://patents.google.com/patent/CN112181605B/zh)）
- 代码：[github.com/alexli-77/KDS](https://github.com/alexli-77/KDS)
- 技术栈：Go · client-go · 基于 Kubernetes descheduler

![KDS 架构](/assets/projects/kds/architecture.svg)

## 问题

kube-scheduler 只在 Pod 创建时调度一次，之后不再过问。在 WCS 上这远远不够：搜索实例随着数据量和流量增长，第一天合理的分布，一个月后可能就成了热点。我们没有多余的机器可加，Pod 在少数节点上越堆越多，另一些节点却半空着。拥挤节点上的查询延迟上升，而过载的节点正是雪崩的起点。

手工均衡意味着盯监控、挑 Pod、一个个迁移。几百个搜索实例的资源用量一直在变，这样做又慢又有风险。我们需要一个均衡器，它要：

- 集群一出现倾斜就自己动手，同时不碰不能动的东西（proxy、DaemonSet、关键 Pod）；
- 根据集群当前状态生成策略，而不是靠一组需要有人持续调整的固定阈值；
- 运行成本几乎为零。

## 工作原理

KDS 分成两层：Controller 负责决策，Operator 负责执行。

**Data Collector（数据采集）。** 每个周期通过 client-go 读取节点和 Pod，并加载运行配置：周期、节点选择器、每个节点每轮最多驱逐的 Pod 数、驱逐模式和 dry run。

**Preprocessor（预处理）。** 只保留符合选择器、可调度的节点，排除 DaemonSet 和关键 Pod，再把每个节点和它上面的 Pod 对应起来，按 QoS 等级（BestEffort、Burstable、Guaranteed）分组。

**Data Processor（数据处理）。** 用一个加权分数给每个节点打分：

`u = α·cpu + β·mem + γ·pods`

每一项都是该节点占自身容量的比例：Pod CPU 之和除以节点 CPU，Pod 内存之和除以节点内存，Pod 数除以 Pod 容量。权重按集群配置。KDS 对节点排序，用最高和最低节点与集群平均值比较，然后重写本轮 `policy.yaml` 里的阈值。

**Operator（执行）。** 从超过阈值的节点上驱逐 Pod，QoS 等级最低的先走，每个节点每轮有上限。驱逐通过 Kubernetes 的 Eviction API 发起，而不是直接删除 Pod，所以会遵守 PodDisruptionBudget，不会把同一个服务的副本一次驱逐光。被驱逐的 Pod 由原来的 Deployment 重建，再由 kube-scheduler 放到有空间的节点上。当每个节点与集群平均值的差都不超过 1 时，回路停止动作。

## 关键设计

**1. 事后修正，而不是替换 kube-scheduler。** KDS 基于 Kubernetes descheduler：它只负责驱逐，重新放置交给默认调度器。调度链路完全不动，所以 KDS 即使出故障，后果也只是集群不再自动均衡，Pod 不会因此调度失败。

**2. 阈值从集群里算出来，而不是写在配置里。** 原生 descheduler 需要固定阈值，比如"低于 20% 算空闲，高于 50% 算过载"。这些数字因集群而异，负载一变就过时。KDS 每轮根据当前最高、最低节点和平均值重新计算，这就是"自适应"的含义。

**3. 一个综合分数，权重按集群配置。** CPU、内存、Pod 数合成一个数。在全是同规格搜索 Pod 的集群里，Pod 数起决定作用；在混合负载的集群里，CPU 和内存更重要。调整权重就能适配两种情况，不用改代码。

**4. 动作要轻。** 每个节点每轮的驱逐数有上限，QoS 等级低的先驱逐，用节点选择器把 proxy 节点排除在外，dry run 模式可以在生产环境安全试跑策略。有状态的搜索 Pod 也能放心驱逐，因为 WCS 的副本启动时会从同伴副本重建索引。

## 结果

论文在一个 20 节点的测试集群上评估 KDS，跑的是云搜索应用：3 个节点放 proxy，17 个节点放 96 个搜索 Pod，JMeter 持续施加 2000 QPS。

![KDS 均衡前后每个节点的 Pod 数](/assets/projects/kds/results.svg)

- **分布均匀。** 默认调度下，各节点有 2 到 14 个 Pod；在人为制造倾斜的实验里，一个节点上堆了 30 个。经 KDS 均衡后，每个节点都是 5 或 6 个，集群平均值为 5.65。
- **延迟下降。** Pod 堆积时搜索延迟大约 8–10 ms，KDS 均衡后稳定在 5.5–6 ms 左右，比默认的初始分布还低。这些数值读自论文中的延迟曲线图。
- **开销可以忽略。** KDS 部署在集群外，每个周期读一次集群状态。周期设为 60 秒时，对 API server 的请求约为每秒 0.017 次。
- **专利。** 该方法于 2025 年获中国发明专利授权，专利号 CN112181605B。

## 我的角色

- 在 WCS 的线上运维中发现问题，设计了 KDS 来解决它
- 基于 Kubernetes descheduler，用 Go 实现了 Controller
- 完成实验评估，并整理成技术论文
- 中国发明专利 CN112181605B 的唯一发明人
