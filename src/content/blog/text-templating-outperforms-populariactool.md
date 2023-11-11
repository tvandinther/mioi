---
title: "Text templating outperforms {{popularIaCTool}}"
description: "An underdog in the IaC toolbox, text templating is a better idea than you think."
date: 2023-11-10T21:56:00+1:00
# lastUpdated: 2023-02-08T00:03:00+13:00
image:
  url: "/assets/images/blog/text-templating-outperforms-populariactool_banner.webp"
  alt: "Blog post banner image"
author: "Tom van Dinther"
tags: ["DevOps"]
categories: ["Discussion"]
featured: true
---
With the proliferation of infrastructure-as-code (IaC), everybody from developers to infrastructure specialists are writing markup to declare their resources. IaC is just one part of the anything-as-code movement and I welcome it as a way to define anything from infrastructure to diagrams to documentation. The reason the anything-as-code movement is so popular is because of its natural synergy with version control systems (VCS). We glean all of the benefits of VCS such as scalability and replayability because we are simply dealing with text.

But in the land of IaC, we often need to repeat ourselves such as when we reuse components or declare resources in multiple environments. Therefore the natural progression is to parameterise our markup. However, markup is static so we need to introduce dynamism either by preprocessing it with some basic text substitution, or postprocessing it through an extended syntax.

These approaches work well until we want to use higher levels of abstraction to define our resources. We need conditionals, loops, mappings, transforms, string operations, and compound expressions. We begin to realise that our markup language is not a programming language and so we start to look for ways to make it one.

Developers with their love of {{favouriteProgrammingLanguage}} opt to taking preprocessing to the extreme by writing a library which generates the markup file they need through a domain-specific interface. Infrastructure specialists with their time-tested ~~XML~~ ~~JSON~~ ~~YAML~~ TOML decide to go further into postprocessing and power up their markup language of choice with server-interpreted macros. Now at the AWS conference, the developers are telling everyone how they should be using the CDK and the infrastructure guys are not in attendance because they're at home writing custom CloudFormation macros.

Postprocessing your markup by supercharging it with macros is turning a string substitution engine into a full blown interpreter. You are left writing unchecked YAML, creating a worse experience than programming with a dynamically typed language and foolishly hoping that the JSON Schema magically downloaded into your VS Code session from one of the hundred installed extensions will save you.

![Google Search: How to attach a debugger to YAML](/assets/images/google-how-to-attach-debugger-yaml.png)

I would like to draw your attention to another realm in which we take these different approaches to generating dynamic markup. The web. Specifically, HTML. JSX is an HTML preprocessor taken to the extreme as it allows you to generate HTML (markup) with JavaScript. But this produces its own problems and if you dislike JSX (in lieu of React), you probably have the same issues with CDKs. The primary isue is that logic permeates your markup reducing the expressiveness of the markup and the readability of the code. For some, this is considered the price for strong colocation, and that the drawbacks can be mitigated with strong design standards and patterns. Though any tool with sufficient footguns is not the right tool for the job.

If you're not using JSX or some derivative, you're probably using a templating language which binds variables within your web framework to the HTML template. This is plain and simple text templating and it is powerful enough to power the web for a long time before React.

The secret to making text templating work for your IaC is right there in the best HTML templating engines. Templated preprocessing. Specifically, maintaining the markup and preprocessing the data which goes into the template. Take whatever shape of input data you were using to generate your markup and preprocess it using {{favouriteProgrammingLanguage}} into a shape that is easy to work with in your text templating tool. Use JavaScript, Python, Go, Haskell or even jq. Turn complex nested objects into flat discriminated structures and convert your enums into flags. You don't need to compromise on the expressiveness of your markup or the readability of your code. You can have both.

> Keep it simple. Use a logicless templating spec such as [mustache](https://mustache.github.io/) to remove any footguns.

A markup file with simple templating directives is easy to read. Templates are inherently declarative and so they do not interrupt the flow of the markup. Simple constructs such as substitutions, list expansions, positive blocks and negative blocks are a lot easier to mentally parse than the the imperative alternatives. You also retain control over the generation process, so debugging is as simple as checking the output before it gets sent to the the parser.

With this decoupled solution, I surmise that there is no requirement that cannot be met by the simple two-step process of preprocessing and templating. You can utilise the full power of whichever tooling you need for the preprocessing of data before passing it to your templating engine saving you from blockers when the alternative combined tooling is not powerful enough to meet your requirements.

I've worked on a project that utilised text templating and I've worked on a project that pushed the limits of postprocessing (is CloudFormation turing complete yet?). In both cases the final artifact was a CloudFormation template. The project which utilised text templating was able to grow to high levels of complexity to meet requirements without sacrificing readability or maintainability. Meanwhile, the supercharged templates of CloudFormation were not enough to satisfy the growing requirements of the templating and despite the lower levels of relative complexity, the readability and maintainability of the templates plummeted.

Text templating is a straightforward solution to so many problems that combines the simplicity of traditional markup with the versatility of preprocessing. It is a solution that has been tried and tested in the web for decades and it is also a perfectly valid approach to other uses of markup such as IaC. Don't confuse modernity with progress, it's time to stop writing logic in markup and markup in logic. Skip the learning curve of {{popularIaCTool}} and use text templating.

Just make sure to run your text templates through the templating engine before you send it to your mailing list.

Thanks for reading, {{firstName}}.