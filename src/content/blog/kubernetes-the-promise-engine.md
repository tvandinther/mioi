---
title: "Kubernetes: The Promise Engine"
description: "Kubernetes is the Promise Engine which forms the core of a GitOps-driven platform. How do we go from a promise to a control plane?"
date: 2025-03-12T13:02:00+1:00
author: "Tom van Dinther"
tags: ["Kubernetes", "GitOps"]
categories: ["Discussion"]
featured: true
---
Kubernetes is an orchestrator, an API, a scheduler, a distributed systems manager. While all of these things together make Kubernetes a powerful tool, I argue that at its core, Kubernetes is a **promise engine**. A system which continuously works to deliver a promise to its users; that your declared state will be represented within the system. It is this aspect of Kubernetes which makes it the right tool to launch your GitOps journey. This is how we can build from a promise, to a control plane.

## A Promise

Traditional infrastructure-as-code tooling has generally revolved around extending the efficacy of scripts. They are based on imperative commands structured to take a system from *state A* to *state B*. Idempotent commands take a step towards making scripts useful for taking systems from an unknown state to *state B*. Naturally, a declarative syntax emerges. Rather than describing a transition of states through imperative commands, we can describe our final desired state.

This is the point at which most infrastructure-as-code tools stop. They are designed as one-shot actions for transitioning a system from some unknown state into a desired state. Configuration drift starts to occur. Our systems are not designed to be immutable and as a result, state diverges from what we originally declared. Kubernetes identifies this issue and architects itself around the concept of a control loop—a promise.

## Continuous Reconciliation

The fourth principle of [GitOps](https://www.devoteam.com/expert-view/gitops-the-future-of-devops-how-the-industry-is-shifting-towards-a-more-automated-and-efficient-workflow/) asserts that system state and desired state are **continuously reconciled**. This means that throughout a system's life, drift in configuration is constantly identified and corrected back to the desired configuration. Unlike traditional deployment pipelines which are driven by triggers such as changes to the desired state, reconciliation is driven by divergence between what is actually observed and what is desired. This is a powerful distinction as it protects against external factors influencing misbehaviour in systems over time by tackling the backwards propagation of changes from downstream subsystems.

> "In Kubernetes, controllers are control loops that watch the state of your [cluster](https://kubernetes.io/docs/reference/glossary/?all=true#term-cluster), then make or request changes where needed. Each controller tries to move the current cluster state closer to the desired state." — https://kubernetes.io/docs/concepts/architecture/controller/

Kubernetes controllers are a practical embodiment of this principle with operators extending this idea to encompass both the controller and the set of data structures it has agency over. This is the primary way in which a Kubernetes cluster is extended to provide more functionality.

## State Management

The operators running in a Kubernetes cluster operate on desired state stored in etcd, a mutable and unversioned storage. The second GitOps principle asserts that the desired state is stored in an **immutable** and **versioned** storage which contains a history of changes, such as a git repository. To ensure that a Kubernetes controller acts on immutable and versioned desired state we can utilise a tool such as [Argo CD](https://www.devoteam.com/expert-view/argo-cd-unlock-gitops-for-kubernetes-now/) to sync our desired state from a git repository into etcd. Contrary to its namesake, Argo CD does not actually perform *continuous deployment*. It is only one tool in our GitOps process responsible for syncing data from one data store to another.

>  Though *git* shares its name with *GitOps*, a git repository is not a required part of a GitOps process. Anything which shares the **immutable** and **versioned** properties git is designed around will be fit for purpose.

## A Control Plane

It is often not the case that all of your infrastructure runs within the walled garden of a single Kubernetes cluster. Whether you require systems to stretch across multiple clusters, or incorporate services from cloud hyperscalers and other third parties. You will find that you need control over more. Now Kubernetes presents an opportunity beyond container orchestration, what if we built operators which look outward, beyond the cluster walls. We could leverage all of the benefits of GitOps from inside the cluster, outside the cluster.

Thankfully, you do not need to build this yourself as there are many options out there. AWS, Azure, and Google Cloud each offer operators specific to their platforms, and there is also Crossplane which offers operators across the aforementioned hyperscalers as well as many additional third parties. The Kubernetes Cluster API project is yet another example of leveraging the Kubernetes control loop for something more than itself.

While these tools are not necessarily made with GitOps in mind, they synergise extremely well with state synchronisers such as Argo CD and Flux. Bridging the gap between git and infrastructure.

![git <-Argo CD syncs-> Kubernetes <-Crossplane syncs-> AWS)](/assets/images/gitops-argocd-crossplane-synergy.webp)
> Argo CD reconciles state between git and Kubernetes while Crossplane reconciles state between Kubernetes and external infrastructure. Together they form a complete bridge from git to external infrastructure.
## Your GitOps Platform

The Kubernetes control loop is the important piece of your puzzle in building a GitOps-driven platform. The extensibility of operators allows you to build a platform with offerings to meet the needs of its users, while tools such as Argo CD and Flux bridge your versioned immutable state with the brain of Kubernetes. While numerous factors contribute to a complete and well-rounded platform, these tools and architectures form the foundation of one that is robust, secure, and extensible.