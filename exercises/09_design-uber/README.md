# Design The Uber API

*Many systems design questions are intentionally left very vague and are literally given in the form of `Design Foobar`.\
It's your job to ask clarifying questions to better understand the system that you have to build.*

*We've laid out some of these questions below; their answers should give you some guidance on the problem.\
Before looking at them, we encourage you to take few minutes to think about what questions you'd ask in a real interview.*

## Table of Content

- [Clarifying Questions](#clarifying-questions-to-ask)
- [Solution](#solution-walkthrough)

## Clarifying Questions To Ask

### Question 1

**Q:**

*Uber has a lot of different services: there’s the core ride-hailing Uber service, there’s UberEats, there’s UberPool—are we designing the API for all of these services, or just for one of them?*

**A:**
Let’s just design the core rides API — not UberEats or UberPool.

### Question 2

**Q:**\
*At first thought, it seems like we're going to need both a passenger-facing API and a driver-facing API--does that make sense, and if yes, should we design both?*

**A:**
Yes, that totally makes sense.\
And yes, let’s design both, starting with the passenger-facing API.

### Question 3

**Q:**

- To make sure we’re on the same page, this is the functionality that I'm envisioning this API will support: A user (a passenger) goes on their phone and hails a ride; they get matched with a driver; then they can track their ride as it’s in progress, until they reach their destination, at which point the ride is complete.
- Throughout this process, there are a few more features to support, like being able to track where the passenger's driver is before the passenger gets picked up, maybe being able to cancel rides, etc..
- Does this capture most of what you had in mind?

**A:**
Yes, this is precisely what I had in mind.\
And you can work out the details as you start designing the API.

### Question 4

**Q:**

- *Do we need to handle things like creating an Uber account, setting up payment preferences, contacting Uber, etc..?*
- *What about things like rating a driver, tipping a driver, etc.?*

**A:**
For now, let’s skip those and really focus on the core taxiing service.

### Question 5

**Q:**
Just to confirm, you want me to write out function signatures for various API endpoints, including parameters, their types, return values, etc., right?

**A:** Yup, exactly.

## Solution Walkthrough

### 1. Gathering Requirements

As with any API design interview question, the first thing that we want to do is to gather API requirements; we need to figure out what API we're building exactly.

We're designing the core ride-hailing service that Uber offers.\
Passengers can book a ride from their phone, at which point they're matched with a driver; they can track their driver's location throughout the ride, up until the ride is finished or canceled; and they can also see the price of the ride as well as the estimated time to destination throughout the trip, amongst other things.

The core taxiing service that Uber offers has a passenger-facing side and a driver-facing side; we're going to be designing the API for both sides.

### 2. Coming Up With A Plan

It's important to organize ourselves and to lay out a clear plan regarding how we're going to tackle our design.
What are the major, potentially contentious parts of our API? Why are we making certain design decisions?

We're going to center our API around a *Ride* entity; every Uber ride will have an associated *Ride* containing information about the ride, including information about its passenger and driver.

Since a normal Uber ride can only have one passenger (one passenger account—the one that hails the ride) and one driver, we're going to cleverly handle all permissioning related to ride operations through passenger and driver IDs.
In other words, operations like *GetRide* and *EditRide* will purely rely on a passed userId, the userId of the passenger or driver calling them, to return the appropriate ride tied to that passenger or driver.

We'll start by defining the *Ride* entity before designing the passenger-facing API and then the driver-facing API.
