---
title: "ProDev"
description: "DevOps' yang."
date: 2023-09-21T22:50:00+12:00
# lastUpdated: 2023-02-08T00:03:00+13:00
image:
  url: "/assets/images/blog/its-okay-to-be-wet_banner.png"
  alt: "Blog post banner image"
author: "Tom van Dinther"
tags: ["???"]
categories: ["Discussion"]
featured: true
---
I once worked on a team delivering a SaaS product, and this team had a process that was interesting to me. They had a product support person directly feeding tickets into a board based on interactions they had had with the product's customers. Any issue that was not resolvable, any bugs that were discovered, or any workflow that got stuck. It became a ticket on this board. Every day at stand-up, any new tickets were briefly highlighted and it gave the development team a unique insight into how their product was used and where the pain points were.

On the surface this doesn't seem like a big deal, customer feedback is what drives product decisions, right? Though typically not as pure and unfiltered as this process. The development team could see real user stories implicated in these tickets untainted by the lens of product managers and business analysts.

Now I'm not saying that the role of product managers and business analysts is redundant, there is certainly value in big-picture product strategy. But perhaps smaller tactical product moves should be made by the developers. The developers, while learning about the issues faced by customers, and paired with their intimate knowledge of the software, can make rational and impactful decisions on where to effectively drive value. Small wins can be identified and bagged where team members without intimate knowledge of the codebase have oversight.

With this experience tucked away, my career lead me down a path of *DevOps* where I came to a realisation.

---

The realisation came when I started forming my own idea of what DevOps is. I would summarise it like this:

> DevOps is about being closer to your systems in production, so that you can directly observe how they are performing.

However, being close to your systems in production only allows you to observe performance metrics on the non-functional requirements. This is where my previous experience with the SaaS product team came back; perhaps there exists a different set of practices that allow you to observe performance on functional requirements.

So I propose a more accurate revision of DevOps:

> DevOps is a set of practices that aims to tighten the feedback loop on non-functional requirements.

<!-- This summary captures some the aspects which I believe are central to DevOps, and excludes some ideas that we currently associate with DevOps but which could be better placed elsewhere.

It states that DevOps is something that you do, not something that you are. It has relevance to an iterative development cycle, with feedback being the key piece of value gleaned from that process. It also tightly defines that the value is related to non-functional requirements, which is a key differentiator from other definitions. -->

If we accept this definition, there is a clear bisection to another potential set of practices. These practices would be about being closer to your customers, rather than your systems, and the value gleaned from these practices would be related to functional requirements.

For lack of a better term, we can call this ProDev.