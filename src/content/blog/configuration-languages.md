---
title: "Unlock your Infrastructure-as-Code with the power of Configuration Languages"
description: "Stop writing JSON and YAML by hand and start authoring data like a pro."
date: 2025-01-30T18:22:00+2:00
# lastUpdated: 2023-02-08T00:03:00+13:00
# image:
#   url: "/assets/images/blog/10-reasons-medium_banner.webp"
#   alt: "Blog post banner image"
author: "Tom van Dinther"
tags: ["Configuration", "Kubernetes", "DevOps", "CUE", "KCL"]
categories: ["Discussion"]
draft: true
featured: true
---
If you regularly write JSON or YAML files and have found a need to adopt:
- Text templating tools like Mustache, Go Template, or Jinja;
- General purpose programming languages to manage infrastructure with tools like CDK or Pulumi;
- Or data-aware template tooling such as Jsonnet or Carvel ytt;

Then you will benefit greatly from a configuration language.

If you are a Platform or Cloud engineer, then this definitely applies to you as your daily interactions with code often involve Infrastructure as Code (IaC). Modern IaC tooling takes a declarative approach to defining infrastructure. It focuses on the outcomes we want irrespective of the steps taken to get there. IaC is a configuration of state, or put simply, data. Data which can be produced by a configuration language.

Now you know *if* you need a configuration language, the question is *what* exactly is a configuration language?

A configuration language is a language which is used to define data structures. Unlike programming languages, configuration languages do not need to be Turing-complete to be useful. In fact, those that aren't glean power from their simplicity and shallow learning curve. Another distinction is the relative purity of a configuration language. While a general purpose programming language is most often used to write programs which act upon the world, the goal of a configuration language is, given some input, to output data. Side effects such as file IO or network calls are either not directly supported or play only a supporting role in defining data.

There are many examples of configuration languages out there such as Vimscript, Jsonnet, Carvel ytt, and Nix. Some of these you may already be using, while others may be the more esoteric option if used outside of their intended domain. However, all of the options which existed before the year 2020 are either domain-specific, bound to a data format, or tightly scoped in its solution.

There is now a new wave of configuration languages which boast a more holistic approach to configuration, distinguishing themselves from the swathes of domain-specific cousins. So *why* exactly do you need a configuration language? Allow me to highlight two projects which offer complete configuration solutions worthy of defining even the most complex infrastructure.
## The New Wave
Born out of use cases which dealt with large-scale configuration and policy management, **[CUE](https://cuelang.org/)** and **[KCL](https://www.kcl-lang.io/)** offer complete solutions. Both are configuration languages which offer ways to enforce policy, and package and distribute code. These latter requirements are what define the new wave of configuration tooling and sets them apart from the previous generation of tooling such as Jsonnet and Carvel ytt.

> This is not a comparison of CUE and KCL, rather an introduction to the tooling void they are designed to fill. After reading this section I want you to feel excited about the possibilities of modern configuration languages!

---
<center>
	<img alt="Logo for CUE" title="CUE Logo" src="https://avatars.githubusercontent.com/u/62243907?s=200" />
</center>

> CUE stands for *Configure*, *Unify*, and *Execute*. CUE makes it easy to validate data, write schemas, and ensure configurations align with policies.

```json
// config.cue
import "strings"

_name: "CUE"

output: message: string & strings.MinRunes(1)
output: format: "YAML" | "JSON"

output: {
  message: "\(_name) is a configuration language"
  format: "YAML"
  messageLength: len(message)
}
```

```sh
❯ cue export config.cue --out yaml
output:
  message: CUE is a configuration language
  format: YAML
  messageLength: 31

```
*[Click here to play with this example on the CUE Playground](https://cuelang.org/play/?id=vY6vib6V5IE#w=function&i=cue&f=export&o=yaml)*

---

<center>
	<img alt="Logo for KCL" title="KCL Logo" src="https://raw.githubusercontent.com/kcl-lang/.github/refs/heads/main/profile/kcl-logo.png" />
</center>

> KCL is a CNCF Sandbox project and stands for *Kusion* *Configuration* *Language*. It is an open-source constraint-based record & functional language mainly used in configuration and policy scenarios. 

```python
# config.k
_name = "KCL"

schema Output:
  message: str
  format: "YAML" | "JSON"
  messageLength: int
  
  check:
    len(message) > 0, "Message must not be empty"

output = Output {
  message = "${_name} is a configuration language"
  format = "YAML"
  messageLength = len(message)
}
```

```sh
❯ kcl run config.k
output:
  message: KCL is a configuration language
  format: YAML
  messageLength: 31

```
*[Click here to play with this example on the KCL Playground](https://play.kcl-lang.io/?s=MQAgxg9gdgZglgcwHQGsBQB9KBDAtgUxAF4QAiAaQGEAZUtNAZzAAt9dsQB5AVwBcAHPgC40IEAQYNsCfEJANeAJ1EgYERe15zSATQCCAWVogAPmQBSAZU4A5OmIlSZ1fFAS9mcuFF4qVLfDAUETExABtXAApHaXwAShAAPhAABgAaMgN8SVjxbgUQKAheEAAjQjZ+XgBPOjQIPkESkh4BPhAAbxUYmWIyABIOrDx8AF8QOAYQDkhYRG5FbF44aBAw7DduWPtVdU0+3UNabuynfBc3Dz6IqGjT2Li0UaA)*

---
The examples shown above are only a very small part of the power of these languages, and although simple they are exciting to YAML wranglers like myself. As you can gather from the blurbs of CUE and KCL, they both talk about schema, validation, policy and configuration. These are high level concepts, and they need to be to fit on the home page of their websites, but what can you actually do with this?

![Configuration language use cases](/assets/images/blog/configuration-languages/configuration-language-uses.webp)


Use your imagination and reinvent anything that revolves around data. There are so many valuable uses for configuration languages, and they're all made possible by their defining characteristics. So let's talk about them.
### A Simplified Language
While inspired by general purpose languages, both CUE and KCL limit the number of language features on offer to keep the toolbox fit-for-purpose. This minimal approach reduces the amount of foot guns present in many other general purpose languages and simplifies the writing and reading of language syntax. A key in how both these languages operate is an effort in the reduction of indirection. In large, complex configurations it could be difficult to pinpoint the line of code responsible for a configuration outcome if complex inheritance structures or overlays and mutability were allowed. As such, both CUE and KCL prioritise immutability, albeit in different ways.
### First-Class Policies
Unlike configuration authoring tools in the past, CUE and KCL include ways to write and enforce policy directly in the language spec. CUE does this through a unique approach to narrowing data types using a [value lattice](https://cuelang.org/docs/concept/the-logic-of-cue/#the-value-lattice), while KCL achieves the result through a [schema check syntax](https://www.kcl-lang.io/docs/reference/lang/spec/schema#check-block) and [rules](https://www.kcl-lang.io/docs/reference/lang/tour#rule). Making policy a first class citizen with powerful expressiveness is an important part of forming the identity of these projects as configuration languages and sets them apart from the tools that came before.
### Modules
CUE and KCL have both embraced the OCI standard to package and distribute modules which can be imported into other modules to form your configuration. The implementation of these are particularly useful for distributing schemas or policy to users. Authors of APIs can provide schema modules such as those for Kubernetes, while security, cloud and platform engineers in the organisation can add policy and abstraction before redistributing it internally for developers to consume by supplying the final layer of data. This ability to import, enhance, and distribute configuration using OCI images is an incredible way to speed up developers, while ensuring correctness and compliance.
### Data Agnostic
There are many data models out there from JSON and YAML to Nix and Lisp. While many tools focus on just one, CUE and KCL have their own intermediate data formats and provide [integrations](https://cuelang.org/docs/integration/) which map data between it and the formats we use. While formats such as Nix and Lisp are not yet supported, many of the common ones are with the list growing over time.
![CUE data input and output formats](/assets/images/blog/configuration-languages/cue-import-export.webp)
![KCL data input and output formats](/assets/images/blog/configuration-languages/kcl-import-export.webp)
### SDKs
When a piece of the puzzle is missing for your use case, such as a certain import or export option, all is not lost. CUE and KCL both offer extensive SDKs to allow you to embed the usage of these configuration languages into your own programs. CUE provides a [very comprehensive Go API](https://cuelang.org/docs/concept/how-cue-works-with-go/#using-cues-go-api) to enable anything from using CUE as your application's primary configuration format to implementing a full test suite leveraging the power of CUE's [unification engine](https://cuelang.org/docs/tour/basics/unification/). KCL also offers [SDKs](https://www.kcl-lang.io/docs/reference/xlang-api/overview) across an extensive list of languages ranging from Go to Lua.
### Automation
Like tools that have come before, both CUE and KCL output data by invocation, either to stdout or to a provided output file. Though unlike many others, both CUE and KCL implement APIs to enable automation right in the language (this is where *Execute* comes into play for the **E** in CUE). The benefit of this is that you can implement your integration actions close to the data that drives them instead of finding another tool to parse and execute like you'd commonly find a Python script doing. CUE provides a tooling layer for enhancing the CLI with custom [workflow commands](https://cuelang.org/docs/howto/use-your-first-cue-workflow-command/) which can print various data to stdout, write to file, or even [make HTTP requests](https://cuelang.org/docs/howto/fetch-json-data-http/). KCL also offers [system packages](https://www.kcl-lang.io/docs/reference/model/overview) for writing to stdout and file IO with the opportunity to extend capabilities through custom plugins. Though it is important to note that as of the time of publishing, custom plugins require the usage of the KCL SDK rather than the CLI. Something I hope to see made possible via modules in the future.

---
> Will you pick the [CUE Playground](https://cuelang.org/play/) or the [KCL Playground](https://play.kcl-lang.io/)?

I strongly urge you to take a closer look at either CUE or KCL. Pick any and start having a play with them. I find it difficult to pick my favourite and keep going back and forth, they both have so much to offer. I would characterise CUE as the dogmatic choice and KCL as pragmatic. Given my love for Haskell, the poster child of dogmatic programming, CUE satisfies me in just the right way. However, KCL's roadmap has allowed it to tick a lot of the boxes early in development enabling it to already be a productive configuration language in many scenarios. At the time of writing, both are in initial development with major version zero and both projects have plans to tick boxes in all the same categories. I would absolutely recommend keeping your finger on this pulse.

 > Follow along the development through their GitHub repositories and check out their community links. I'll see you there!
 > 
 > **GitHub:** [CUE](https://github.com/cue-lang/cue) | [KCL](https://github.com/kcl-lang/kcl)  
 > **Community:** [CUE](https://cuelang.org/community/) | [KCL](https://www.kcl-lang.io/docs/community/intro/)  

