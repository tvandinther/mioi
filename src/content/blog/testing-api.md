---
title: "Testing Web APIs"
description: "What are the basic areas at which to test an API? A high-level overview for testing web APIs"
date: 2022-08-01T16:20:23+12:00
lastUpdated: 2023-02-08T00:03:00+13:00
image:
  url: "/assets/images/blog/testing-api_banner.webp"
  alt: "Blog post banner image"
draft: false
author: "Tom van Dinther"
tags: ["Testing", "API"]
categories: ["Testing"]
featured: false
---
Testing a web API can appear to be quite different from testing a console application. While many of the same core elements exist in a web API, they also take on a new disguise. We will go over the high level structure of a web API and what some of the testing boundaries might be, and when you might want to test at each boundary.

A web API in many frameworks and languages follows a structure similar to the diagram shown below.

![Network <-> Host(Middleware <-> Endpoints <-> Services)](/assets/images/testing-api-1.webp)

In the diagram, the **network** refers to the outside world, specifically a network interface such as localhost or the external adapter. 

**Host** refers to the process. In a .NET environment, this process would be an ASP.NET host, in Python possibly Django, or maybe Express in a Node.js environment. 

**Middleware** is a pipeline of intermediate processors which see all requests coming in and make changes to it, formulate a response or pass it onto the next middleware in the pipeline. Examples of middleware are authentication, CORS, (de)serialisers, redirects etc. 

Then a request will reach a controller or endpoint which is configured to handle it. These handlers are best left to be as light as possible. A handler should at most deal with mapping DTOs and domain models, verifying requests (middleware verification is preferred for common patterns) and calling a service which performs the actual logic. 

That leaves the services, the top level abstraction for system logic.

## Where can we test?

Given this structure there are three obvious places to set a testing boundary; at the middleware, at the endpoints, and at the service level. Each boundary offers a different granularity for your tests, As you step closer to the network, the complexity of tests also increase, with more test setup required.

### Middleware Boundary

Testing at the middleware level will allow you to verify that middleware is properly configured for your requests. This is where you want to test if you want to validate:

- Authentication
- Authorisation
- (De)Serialisation
- CORS
- Routing
- Model Validation & Binding

To test at the boundary, you would create a test suite with access to an HTTP client. Test cases would set up a request, execute it against the host, and verify the response. Testing like this allows you to validate HTTP status codes, headers and payloads.

### Endpoint Boundary

At the endpoint or controller boundary you can verify that entities are mapped consistently, that data bindings are passed down correctly and bespoke request verifications have taken place. Testing at this boundary is often provides little value when applied across the board. Some endpoints may require more complex logic in which case a test case or two will provide some value. Although for most CRUD endpoints, there is very little being done in the handler that justifies testing.

To test at the endpoint boundary, you would simply call the handlers directly. Due to this, routing and other middleware functions are not tested at this boundary. Test cases would arrange models themselves, bypassing model validation & binding.

### Service Boundary

The service boundary offers the best place to test domain logic for your web API. Often, the service boundary is access-agnostic, meaning that it does not matter whether the services are being called by an HTTP request handler or by a console application. The work in both scenarios is the same, and the tests operate at this level of agnosticism too.

Testing at this boundary looks just like the tests you’re familiar with in console applications.

## What about integration testing?

What is this integration testing thing all about? Looking at each of the boundaries a question might arise: do you need to mock the layers below the testing boundary? For example, if we were to test the endpoint, do we mock the services?

The common sentiment is to favour using real implementations when testing for two main reasons. First, creating a convincing mock or test fake can often require just as much effort and nuance as the real implementation. The process of creating the test doubles then only serves to increase the amount of work for minimal benefit. Second, using the real implementation is closer to what runs in the production environment, and the goal of testing is to maximise confidence in the code that we ship.

If we were to test from the middleware or endpoint boundary while using real implementations, you can see that we are testing the aggregate of the layers, basically we are defining an integration test. Testing at the service boundary would be more like a unit test which you are familiar with from building a console application.

## Databases

![Network <-> Host(Middleware <-> Endpoints <-> Services) <-> Database](/assets/images/testing-api-2.webp)

I have a database, do I test this? No, but also yes. Including the database in your testing would qualify as an end-to-end test if going from the network boundary, and another form of integration test if going from the service boundary. For good, malleable, fast-running tests you will want to mock out the database by using an in-memory repository.

An important detail to consider is if you are using an object relational mapper (ORM) such as Entity Framework which will at some point in the process convert object getters into SQL. You will want to ensure that you are using the ORM’s API correctly and that data is fetched as expected. In these scenarios, there will often be a testing framework paired with the ORM or an in-memory data provider that can provide you with the same interface but keep things in-process to simplify testing. Double check with the ORM’s documentation to ensure that behaviour is consistent across data providers or write discovery tests (as described in Bob Martin’s Clean Code) to uncover the true behaviour of the ORM.

## End-to-end testing

It is always a good idea to include a few end-to-end tests for an application that presents a web API and uses a persistence layer. To orchestrate these tests you may find that using Docker simplifies the process. Docker offers a `docker compose` action which allows you to declaratively define a stack of containers together.

A common stack for performing an end-to-end test on a web API and database is to have three containers. The first is the database, the second is the web API and the third container is the test-suite using an HTTP client to access the web API. You can configure two separate networks to closely resemble a secure production environment where backend services such as databases are not discoverable by clients. The diagram below shows what such a container stack might look like and their networks.

![API Testing Client <-Public Network-> API Server <-Private Network-> Database](/assets/images/testing-api-3.webp)