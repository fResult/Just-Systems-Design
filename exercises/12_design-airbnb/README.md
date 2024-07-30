# Design Airbnb

*Many systems design questions are intentionally left very vague and are literally given in the form of `Design Foobar`.*
*It's your job to ask clarifying questions to better understand the system that you have to build.*

*We've laid out some of these questions below; their answers should give you some guidance on the problem.*
*Before looking at them, we encourage you to take few minutes to think about what questions you'd ask in a real interview.*

## Table of Content

- [Clarifying Questions](#clarifying-questions-to-ask)
- [Solution](#solution-walkthrough)

## Clarifying Questions To Ask

### Question 1

**Q:**

- *Like a lot of other sharing-economy products out there, Airbnb has two sides: a host-facing side and a renter-facing side.*
- *Are we designing both of these sides or just one of them?*

**A:**
Let's design both of these sides of the product.

### Question 2

**Q:**
*Okay. So we're probably designing the system for hosts to create and maybe delete listings, and the system for renters to browse through properties, book them, and manage their bookings afterwards. Is that correct?*

**A:**
Yes for hosts; but let's actually just focus on browsing through listings and booking them for renters.
We can ignore everything that happens after booking on the renter-facing side.

### Question 3

**Q:**
*Okay, but for booking, is the idea that, when a user is browsing a property for a specific date range, the property gets temporarily reserved for them if they start the booking process?*

**A:**
Yes. More specifically, multiple users should be allowed to look at the same property, for the same date range, concurrently without issues.\
But once a user starts the booking process for a property, it should be reflected that this property is no longer available for the dates in question if another user tries to book it.

### Question 4

**Q:**

- *I see. But so, let's say two users are looking at the exact same property for an overlapping date range, and one user presses "Book Now", at which point they have to enter credit card information.*
- *Should we immediately lock the property for the other user for some predetermined period of time, like maybe 15 minutes, and if the first person actually goes through with booking the property, then this "lock" becomes permanent?*

**A:**
Yes, that makes sense.\
In real life, there might be slight differences, but for the sake of this design, let's go with that.

### Question 5

**Q:**
Okay. And do we want to design any auxiliary features like being able to contact hosts, authentication and payment services, etc., or are we really just focusing on browsing and reserving?

**A:**
Let's really just focus on browsing and booking. We can ignore the rest.

### Question 6

**Q:**

- *I see. So, since it sounds like we're designing a pretty targeted part of the entire Airbnb service, I want to make sure that I know exactly every functionality that we want to support.*
- *My understanding is that users can go on the main Airbnb website or app, they can look up properties based on certain criteria, like location, available date range, pricing, property details, etc., and then they can decide to book a location.*
- *As for hosts, they can basically just create a listing and delete it like I said earlier. Is that correct?*

**A:**
Yes. But actually, for this design, let's purely filter based on location and available date range as far as listing characteristics are concerned; let's not worry about other criteria like pricing and property details.

### Question 7

**Q:**

- *What is the scale that we're designing this for?*
- *Specifically, roughly how many listings and renters do we expect to cater to?*

**A:**
Let's only consider Airbnb's U.S. operations.\
So let's say 50 million users and 1 million listings.

### Question 8

**Q:**
*Regarding systems characteristics like availability and latency, I'm assuming that, even if a renter looks up properties in a densely-populated area like NYC, where there might be a lot of listings, we care about serving these listings fast, accurately, and reliably. Is that correct?*

**A:**
Yes, that's correct.\
Ideally, we don't want any downtime for renters browsing listings.

## Solution Walkthrough

### 1. Gathering System Requirements

### 8. System Diagram

![Airbnb System Diagram](./img/airbnb-system-diagram.svg)
