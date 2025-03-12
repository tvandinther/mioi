---
title: "It's Okay To Be WET"
description: "A critical look at the popular principle of \"Don't Repeat Yourself\" (DRY), and a brief detour about abstractions."
date: 2023-03-21T22:50:00+12:00
# lastUpdated: 2023-02-08T00:03:00+13:00
image:
  url: "/assets/images/blog/its-okay-to-be-wet_banner.webp"
  alt: "Blog post banner image"
draft: false
author: "Tom van Dinther"
tags: ["Refactoring", "Abstraction", "Hot Take"]
categories: ["Discussion"]
featured: true
---
You may have heard of **D**on’t **R**epeat **Y**ourself (DRY). For the uninitiated, it's about refactoring to remove repetition in your code. It’s often over-emphasised as a golden rule of software development—that duplicated code should be avoided. This type of refactoring isn't free, so consider whether the cost is worth the potential benefits. What if there is value to the contrarian backronym and to **W**rite **E**verything **T**wice (WET)?

> The price of the DRY refactor is *coupling*.
> 

The price of the DRY refactor is *coupling*. Once you extract a piece of common logic, every piece of code using it is now transitively coupled. Each time you use it, the cost of change increases.

## What if I create the right abstraction?

Of course, you could implement a carefully designed interface at the right level of abstraction such that the repercussions of changes to the extracted logic are contained. But no abstraction is perfectly immune to breaking changes. When the time comes to implement the breaking change, the cost is multiplied by each dependency it has.

I should acknowledge the value a good abstraction can bring. A good abstraction can reduce the cost of non-breaking changes significantly. However, ignoring the associated costs will not make them go away. A good abstraction requires a clear understanding of the problem, thoughtful design and iterative development to hone into the right balance of public and private concerns. This development time is an extra cost of abstraction.

## Repeated syntax does not always mean a repeated idea

It is easy to look at a piece of code, see a common group of tokens across several lines and conclude that it is a repeated bit of logic that requires extraction. However, this is just syntax. The syntax exists within a context that represents a more significant idea, and if this idea is different between these two pieces of code, they will be subject to different forces of change. Extracting the common pattern in this scenario will cause pain when the ideas diverge.

## Example

Consider a scenario where we have two functions in our code: one that calculates the average temperature over a week (`AverageTemperature`) and another that calculates the average test score for a class (`AverageTestScore`). Both functions contain an apparent repetition in code that calculates the average of a list of numbers.

```csharp
double AverageTemperature(List<double> temperatures) {
    return temperatures.Sum() / temperatures.Count;
}

double AverageTestScore(List<double> testScores) {
    return testScores.Sum() / testScores.Count;
}
```

### DRY Approach

For the DRY approach, we extract the common logic into a shared function and call it from both functions.
```csharp
double Average(List<double> values) {
    return values.Sum() / values.Count;
}

double AverageTemperature(List<double> temperatures) {
    return Average(temperatures);
}

double AverageTestScore(List<double> testScores) {
    return Average(testScores);
}
```
However, now a new requirement has been introduced:
> Use a weighted average for test scores  
>
This requires overloading the shared `Average` function and introducing additional complexity to handle both cases.
```csharp
double Average(List<double> values, List<double> weights = null) {
    if (weights == null) {
        // Unweighted average (used for temperatures)
        return values.Sum() / values.Count;
    } else {
        // Weighted average (used for test scores)
        double weightedSum = 0;
        for (int i = 0; i < values.Count; i++) {
            weightedSum += values[i] * weights[i];
        }
        return weightedSum / weights.Sum();
    }
}

double AverageTemperature(List<double> temperatures) {
    return Average(temperatures);
}

double AverageTestScore(List<double> testScores, List<double> weights) {
    return Average(testScores, weights);
}
```

### WET Approach
Now consider the WET approach. Given the same starting point:
```csharp
double AverageTemperature(List<double> temperatures) {
    return temperatures.Sum() / temperatures.Count;
}

double AverageTestScore(List<double> testScores) {
    return testScores.Sum() / testScores.Count;
}
```
We can add the new requirement with minimal changes.
```csharp
double AverageTemperature(List<double> temperatures) {
    return temperatures.Sum() / temperatures.Count;
}

double AverageTestScore(List<double> testScores, List<double> weights) {
    double weightedSum = 0;
    for (int i = 0; i < testScores.Count; i++) {
        weightedSum += testScores[i] * weights[i];
    }
    return weightedSum / weights.Sum();
}
```
At the outset, we mistakenly assumed that the two functions represented the same idea. However, the new requirement revealed that they represented different ideas, and the WET approach allowed us to make the change without introducing complexity to the `Average` function. Had we introduced the coupling of the DRY approach, we would have been required to make more complicated changes and manipulate the abstraction to fit the new requirement.

## When is it okay to be WET?

When the cost of abstraction outweighs the value it provides.

A poor abstraction will run you in the negatives; a good abstraction takes work. Evaluating this can be difficult, but as the size of the extraction increases, so does its impact, and the amount of consideration it requires should grow with it. Extracting a duplicated statement or expression into a local function can be done almost subconsciously. Creating a new microservice, on the other hand, requires careful consideration.

The choice between adhering to the DRY principle and allowing some repetition in code can be complicated. While the DRY principle can lead to cleaner, more maintainable code, it can also introduce coupling and increase the cost of change. On the other hand, embracing the WET approach can sometimes provide benefits when the cost of abstraction outweighs its value or when seemingly similar code represents different ideas that may diverge. As software developers, it's essential to carefully consider the trade-offs between these two principles and make informed decisions based on the specific context of each situation. The key is finding the right balance between abstraction and repetition to maximise your code's efficiency, maintainability, and adaptability.

So the next time you’re about to extract repetition, consider the implications. You may be better off without it.
