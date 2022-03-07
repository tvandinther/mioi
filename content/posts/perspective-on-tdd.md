---
title: "TDD: Some perspective"
description: "I discuss common beginner sticking points with TDD and share concepts that helped me overcome them."
date: 2022-03-02T12:59:47+12:00
draft: true
author: "Tom van Dinther"
prism_lineno: false
tags: ["TDD", "BDD", "concepts"]
categories: ["TDD"]
series: ["TDD"]
comments: true
bookcase_cover_src: "posts/docker-mongo.png"
bookcase_cover_src_dark: "posts/docker-mongo.png"
---

In my first post in the series about my journey with TDD, I talked about my initial experiences. I briefly mentioned my sticking points and the epiphany I had to turn it all around. In this instalment I want to give some more detail and dive into the drivers behind both my reluctance to accept TDD and the concepts which turned it all around. To do so, I will distil the sticking points into relatable frustrations and give my interpretation of the underlying cause of the frustration. Before finally presenting TDD in the context that brought it all together for myself.

## Writing tests is hard

Unsurprisingly, the pillar of test-driven development is software testing. Primarily we consider unit tests as the fundamental pillar as unit tests lay closest to the code it tests. This keeps abstractions light and the path between test code and production code *short*. On the surface, writing unit tests is straight-forward. A common model is the arrange-act-assert model whereby we structure a test into these three steps like a magnificent magic trick. One of my favourite movies is Nolan's The Prestige, where quite artfully (and very meta) the movie is arranged into the 3 phases of a magic trick. The movie's character Cutter puts it best, here's how he describes the first part:

##### Every great magic trick consists of three parts or acts. The first part is called "The Pledge". The magician shows you something ordinary: a deck of cards, a bird or a man. He shows you this object. Perhaps he asks you to inspect it to see if it is indeed real, unaltered, normal. But of course... it probably isn't. 

Just like a unit test, we make a pledge. Given the state of the program described here, I aim to satisfy the aim given in the title of the test.

##### The second act is called "The Turn". The magician takes the ordinary something and makes it do something extraordinary. Now you're looking for the secret... but you won't find it, because of course you're not really looking. You don't really want to know. You want to be fooled. But you wouldn't clap yet. Because making something disappear isn't enough; you have to bring it back. 

We execute the part of the unit we are testing. Like magic, perhaps the most overstated part of the test and certainly the most celebrated. Without acting on the system under test, there is nothing. But simply acting on it does not achieve anything. Like how making something disappear is not the most remarkable part of a trick yet necessary for the final part.

##### That's why every magic trick has a third act, the hardest part, the part we call "The Prestige".

The prestige. An assertion that ties it all together into a brilliant performance. This is certainly one of the harder parts of writing a unit test as it is the assertion that separates test success from failure. A poor assertion will hide failing code. While this analogy is mainly an excuse for me to talk about one of my favourite movies, it also aims to give perspective on the *magic* of unit tests and while in isolation, they appear to be trivial, short and simple; under the surface they tell a story about your code. And with that, here is the first epiphany.

## TDD is the narrator

Many great stories begin with the narrator. The narrator sets the scene, primes your emotions and your expectations. Creates a level of predictability for what's about to come but artfully omits the flavour. Your code is the protagonist. Edgy, unpredictable, full of life and flavour. Without the narrator, the world of the protagonist is chaotic but with the stage set, everything suddenly has context and we can enjoy the turbulent world of the protagonist with confidence in the trajectory of the story.

To be more explicit, TDD is the narrator that guides your code on the journey because it *creates context*. It tells us *why* a piece of code will exist and *what* the motives are for our protagonist, the code. *How* the code will complete their piece of the story is our implementation. Set the premise, then play the story out. TDD is just like storytelling.

A trap that I fell into when starting out with TDD is that I was trying to narrate *how* my code was going to complete its task. If you find yourself struggling to write a test before the code because you are unsure about what kind of arrangement it should need, then you are likely falling into the same trap. As I mentioned before, you want to narrate *what* your code is going to do given a premise. This change in perspective while important is not a golden bullet. I have still found myself unsure about what story I want to tell when writing tests and when this happens I find it is a symptom of a larger problem: a lack of direction.

## Stories need an arc

A good story has an arc. What that means is a good storyteller knows where they want to start a story, which conflicts to introduce into the story and where the story will end. This is the same for code. If writing tests is supposed to tell a story, then you ought to know where the story starts, what problems are in the path and where it will end. What this boils down to is having a plan. Often when we start out learning how to code, our learning cycles are extremely fast and we often end even a small project with a much better understanding than when we started. While this constant improvement never really disappears, in the beginning our "learning sponge" is much more absorbent.

