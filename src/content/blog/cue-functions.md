---
title: "CUE is functional without functions"
description: "You don't need the function pattern in CUE, try this instead."
date: 2025-02-27T12:10:00+1:00
author: "Tom van Dinther"
tags: ["CUE"]
categories: ["Discussion"]
---
CUE has been a difficult language for me to conceptualise. However the more I try to do with it, the more I start to see the intentions behind it. CUE is a logic-based language and trying to apply the procedural, imperative thinking I am accustomed to from popular general purpose programming languages is me trying to shove a a square peg in a round hole. And while this may have worked for the crew of Apollo 13, they did so out of necessity, not from design.

As a result, I often fall victim to trying to solve an [XY problem](https://xyproblem.info/) in CUE. This is quite common when you experience a paradigm shift and it is one of the reasons I recommend software developers to learn at least a little bit of Haskell. I encountered this sort of roadblock many times on my journey to learn Haskell until it eventually culminated into a moment of seeing the light. It meant that I could finally see how an alternative paradigm projects onto a particular problem space. This moment of seeing the light repeats continuously on the learning journey as you crest each local maxima of the learning curve.

Given this learning experience I had with Haskell, I try to approach learning CUE with the same mindset. Despite being aware of the XY problem, I repeat the pitfall over and over, eventually pulling myself out of it and seeing the light once again. Most recently, I experienced this in CUE with the concept of **functions**.

A function is a simple concept in procedural programming, and a whole other world in functional programming. In both cases we learn it as the foundational building block to building abstractions and driving code re-use. It doesn't take long in our CUE journey until we come across a pattern of data which we'd like to abstract away and the light bulb immediately turns on: I need a function.

After some searching on the CUE documentation you realise this is not a part of the language syntax. But after some clever hacking on your own or discovering patterns others have formed online, you mould your abstraction into something coined as the *function pattern*. The syntax isn't pretty and you ponder what an official syntactic sugar may look like.

```cue
#CelsiusToFahrenheit: {
    in: float
    out: in * (9/5) + 32
}

temperature: (#CelsiusToFahrenheit & {in: 18}).out
```

However, CUE isn't procedural or functional. It is a logical language, a language where relationships are defined between entities in a world modelled by structs, lists, booleans, strings, and numbers. I have devised for myself an overarching statement about CUE to help influence my design decisions. I expect it to evolve but for now it is this:

> A CUE configuration is the definition of a single truth within a given context. If you find that you have more than one truth, you must expand your context.

What it means in this example is that we have two competing truths for temperature: Celsius and Fahrenheit. In typical application design with general-purpose programming languages we either stick to one unit of measurement, or encapsulate it in a value object or type with unit-based accessors. In CUE, we need to unify this into a single truth which means we need to expand our context to include the units of measurement we care about.

Rather than thinking about a function for unit conversion, lets think about a definition for *temperature*.
```cue
#Temperature: {
    celsius: float & (fahrenheit -32) * (5/9)
    fahrenheit: float & celsius * (9/5) + 32
}
```

In our context we only work with the common units for measuring temperature, Celsius and Fahrenheit. So we can define this with a relationship between them. If we wanted to add additional units, we define additional relationships such that we have a strongly-connected graph.

> A directed graph is strongly connected if there is a path from each vertex to every other vertex.

```cue
#Temperature: {
    kelvin: float & celsius + 273.15
    celsius: float & kelvin - 273.15 & (fahrenheit -32) * (5/9)
    fahrenheit: float & celsius * (9/5) + 32
}
```

Now usage of this definition becomes intuitive and "unit-safe". Using a temperature value elsewhere in either a calculation or as an export, requires you to specify a field path to the desired unit.
```cue
temperature: #Temperature
temperature: celsius: 20.0

inFahrenheit: temperature.fahrenheit
```
unifies to
```cue
temperature: {
    kelvin:     293.15
    celsius:    20.0
    fahrenheit: 68.00
}

inFahrenheit: 68.00
```
---
Functions come up again in the context of building abstractions. Consider an example where you may want to build an interface for deploying an application to a Kubernetes cluster. In your abstraction you only want to specify a container image name, tag, application port, and hostname to reach it on. This requires quite a bit of Kubernetes manifest boilerplate which would fit nicely into an abstraction. Encapsulating this logic within a function is a logical step.

```cue
// app.cue
#App: {
    in: {
        image: name: string
        image: tag: string
        port: int & >0 & <=65535
        hostname: string
    }

    out: [
        {
            kind: "Ingress"
            spec: hostname: in.hostname
        },
        {
            kind: "Service"
            spec: port: in.port
        },
        {
            kind: "Deployment"
            spec: image: in.image
        }
    ]
}

manifests: (#App & {in: {
    image: {
        name: "my-app"
        tag: "v1"
    }
    port: 8080
    hostname: "myapp.example.com"
}}).out
```

```sh
$ cue eval app.cue -c
manifests: [{
    kind: "Ingress"
    spec: {
        hostname: "myapp.example.com"
    }
}, {
    kind: "Service"
    spec: {
        port: 8080
    }
}, {
    kind: "Deployment"
    spec: {
        image: {
            name: "my-app"
            tag:  "v1"
        }
    }
}]
```

Though a function viewed through the eyes of CUE is interesting. The *function pattern* is only half a configuration and masks the "inputs" with the "outputs". And viewed procedurally, this is exactly what a function is; a projection of inputs to outputs. As we saw in the previous example, a function's inputs and outputs fight for "truth".

Consider the Kubernetes resource definition, it is typically made up of metadata, specification, and status. In a Kubernetes resource, the specification is our abstraction and the status is the implementation of the abstraction. You could also look at this resource definition as a function with a unified input (spec) and output (status).

We can look at a CUE abstraction in the same way. The user's input is their specification, and the output the Kubernetes manifests. This structure starts to make a lot more sense when you start requiring the creation of declarative resources destined for consumers other than the Kubernetes API. Perhaps a GitHub actions file, metadata for an application registry, or a piece of documentation.

```cue
// app.cue
#App: {
	spec: {
		image: name: string
		image: tag:  string
		port:     int & >0 & <=65535
		hostname: string
	}

    let appSpec = spec // otherwise `spec` is masked by the manifest `spec` field

	kubernetesManifests: [
		{
			kind: "Ingress"
			spec: hostname: appSpec.hostname
		},
		{
			kind: "Service"
			spec: port: appSpec.port
		},
		{
			kind: "Deployment"
			spec: image: appSpec.image
		},
	]
}

app: #App
app: spec: {
	image: {
		name: "my-app"
		tag:  "v1"
	}
	port:     8080
	hostname: "myapp.example.com"
}
```

CUE offers path selectors to hone in on the configuration we are interested in, as well as the built-in CUE commands scripting layer. 
```sh
$ cue eval app.cue -c -e app.kubernetesManifests
[{
    kind: "Ingress"
    spec: {
        hostname: "myapp.example.com"
    }
}, {
    kind: "Service"
    spec: {
        port: 8080
    }
}, {
    kind: "Deployment"
    spec: {
        image: {
            name: "my-app"
            tag:  "v1"
        }
    }
}]
```
---
I won't be using the *function pattern* anymore. I believe that it is antithetical to CUE's design philosophy. From my experience, trying to force familiar patterns into a paradigm which rejects them only creates difficult and unmaintainable code. Learning to do something the way the design pushes to be natural always ends up being better in the long run. It is for this reason that I don't think CUE requires syntactic sugar for functions.

Try this approach for yourself for a while and see how you feel about it. I'm curious to hear about your thoughts and experiences using the unified mindset. Start a thread or find me in the [CUE slack community](https://cuelang.org/s/slack). I'll see you there!