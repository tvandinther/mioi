---
title: knit
description: A tool for managing kubernetes manifests with KCL.
date: 2025-01-03T16:33:00+1:00
banner: 
  url: /assets/images/projects/knit_banner.webp
  alt: knit banner image
  anchor: left
sourceCodeUrl: https://github.com/tvandinther/knit
featured: true
---
knit is a tool containing the missing pieces for using KCL to define kubernetes manifests when using the [rendered manifests pattern](https://akuity.io/blog/the-rendered-manifests-pattern).

It knits together **Helm** and **Kustomize**, with **KCL** to help keep code manageable and most imortantly, type-safe.

### KCL

[KCL](https://www.kcl-lang.io/) is a configuration language and a CNCF sandbox project. It is used as the way to define your data structures empowered with modern language features to enable you to write DRY code.

### Helm

knit incorporates **Helm** so that you can leverage existing charts in KCL without having to run a pipeline such as `helm template | kcl import`. Instead, you can add helm charts using `knit add helm` which will create a vendored KCL module for the chart which you can import. Then you can render out the chart using the `helm.template()` function within your KCL when `knit render` is run.

### Kustomize

knit also includes functions to interact with **Kustomize** to enable you to use existing transformations and overlays without requiring a full migration to KCL templating or to empower your KCL code with Kustomize features. Use the `kustomize.build()` function to run a kustomization.

### Contributing

If you'd like to contribute to the project, please contact me on the CNCF slack **[@Tom van Dinther](https://cloud-native.slack.com/team/U06JJH65BB8)**. In the meantime, see you at the KCL slack channel **[#kcl](https://cloud-native.slack.com/archives/C05TC96NWN8)**!
