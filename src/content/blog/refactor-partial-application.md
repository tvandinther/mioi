---
title: "Refactoring With Partial Application"
description: "..."
date: 2023-03-13T10:18:00+12:00
# lastUpdated: 2023-02-08T00:03:00+13:00
# image:
#   url: "/assets/images/blog/refactor-partial-application.png"
#   alt: "Blog post banner image"
draft: true
author: "Tom van Dinther"
tags: ["functional programming", "refactoring"]
categories: ["refactoring"]
featured: false
---
Partial application is a useful concept from the functional programming paradigm. It takes a function of *n* arguments and returns the same function requiring a subset of its arguments. This concept can be a useful tool when refactoring code, and if the language you work with offers the ability to work with lambda expressions or other forms of anonymous functions, you can easily perform this refactor.

> **Note:** The number of arguments a function operates on is known as it’s arity, with special terminology:  
**nullary** — f()  
**unary** — f(x)  
**binary** — f(x, y)  
**ternary** — f(x, y, z)  
**n-ary** — f(x, y, z, n…)  
> 

We will use C# in the following examples.

Calling a function with 3 arguments is known as *applying* all 3 arguments followed by an invocation of the function. Most languages combine the total application and invocation steps into a single syntax: `(arguments...)`. Therefore, partially applying a function is to apply some of the 3 arguments and get back a new function requiring only the remaining *********unapplied********* arguments.

```csharp
int Add(int a, int b) => a + b;

int Add1(int a) => Add(a, 1);
```

In this example, we took the function `Add` and partially applied it to create a new function called `Add1` which only takes a single argument and always adds 1 to it. This can be done to more arguments, and using lambdas to imperatively define our argument application allows us to also reorder arguments if we wish to do so.

```csharp
IEnumerable<int> Range(int startInclusive, int endExclusive, int step);
IEnumerable<int> RangeFrom1(int step, int endExclusive) => Range(1, endExclusive, step);
```

# The Simple Refactor

Consider the following code to calculate employee bonus based on their graded performance:

```csharp
public static class BonusCalculator {
    public static decimal Calculate(int salary, PerformanceGrade performanceGrade)
    {
        return performanceGrade switch
        {
            PerformanceGrade.SmashedIt => CalculateBonus(salary, 0.05m),
            PerformanceGrade.OnTopOfIt => CalculateBonus(salary, 0.025m),
            PerformanceGrade.LearningIt => CalculateBonus(salary, 0.01m),
            PerformanceGrade.StepItUp => CalculateBonus(salary, 0.0m),
            _ => throw new UnreachableException($"Non-exhaustive pattern matching on {typeof(PerformanceGrade)}")
        };
    }
    
    private static decimal CalculateBonus(int salary, decimal bonusRate) => salary * bonusRate;
}
```

Notice how we repeat the same code `CalculateBonus(salary, ...)` in the switch expression. While there are many possible refactors we could use to improve this function, let's use our newly learned partial application tool to remove this duplication by defining a new local function with the salary partially applied.

```csharp
public static class BonusCalculator {
    public static decimal Calculate(int salary, PerformanceGrade performanceGrade)
    {
        decimal CalculateSalaryBonus(decimal rate) => CalculateBonus(salary, rate);
        
        return performanceGrade switch
        {
            PerformanceGrade.SmashedIt => CalculateSalaryBonus(0.05m),
            PerformanceGrade.OnTopOfIt => CalculateSalaryBonus(0.025m),
            PerformanceGrade.StepItUp => CalculateSalaryBonus(0.0m),
            PerformanceGrade.LearningIt => CalculateSalaryBonus(0.01m),
            _ => throw new ArgumentOutOfRangeException()
        };
    }
    
    private static decimal CalculateBonus(int salary, decimal bonusRate) => salary * bonusRate;
}
```

> Note: We define a partially applied function locally since the arguments we are applying only exist in the local scope, `salary`, in this example.
> 

Although the example is simple, the next time you see code repetition whereby a function is repeatedly called with some of the same arguments, you can create a local partially applied function to remove the repetition.

# Disguised Partial Application in OOP

If we consider a function a unit of deferred computation, we can trivialise the idea to classes. Consider the `Add` example from before, except this time we want a helper function `AddN` to perform the partial application for us.

```csharp
int Add(int a, int b) => a + b;

Func<int, int> AddN(int a) => (int b) => Add(a, b);

var add1 = AddN(1);

Console.WriteLine(add1(2)); // 3
```

Does this pattern look familiar? If not, let me present it in object-oriented terms.

```csharp
public class AddFactory
{
    public Add AddN(int operand) => new Add(operand);
}

public class Add
{
    private readonly int _operand;
    
    public Add(int operand)
    {
        _operand = operand;
    }
    
    public int Invoke(int value) => _operand + value;
}

var add1 = new AddFactory().AddN(1);
Console.WriteLine(add1.Invoke(2)); // 3
```

The factory pattern is extremely common in object-oriented code, but can be easily and succinctly expressed in terms of the partial application of functions. Using partial application, we cut down the lines of code used to express the idea significantly and removed the layer of indirection caused by using the factory pattern. Dependency injection is a common use-case for using the factory pattern and partial function application is one of the tools functional programmers use to address this.

```csharp
public static class Addition
{
    public static Func<int, int> AddN(int operand) => (int b) => Add(operand, b);
    private static int Add(int a, int b) => a + b;
}

var add1 = Addition.AddN(1);
Console.WriteLine(add1(2)); // 3
```

> You can control the exports of your namespace by using access modifiers, just like if you were to mark a class as `private` or `internal`. This way, users of the addition module must use the `AddN` constructor. The operand could just as easily be a database connection string.
> 

Next time you see the factory pattern, consider whether it could be improved with a refactor into a partially applied function. The factory and created class could likely coexist in a static class providing a namespace, positively increasing the cohesion in your code.
