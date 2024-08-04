# Design Airbnb

*Many systems design questions are intentionally left very vague and are literally given in the form of `Design Foobar`.*\
*It's your job to ask clarifying questions to better understand the system that you have to build.*

*We've laid out some of these questions below; their answers should give you some guidance on the problem.*\
*Before looking at them, we encourage you to take few minutes to think about what questions you'd ask in a real interview.*

## Table of Content

- [Clarifying Questions](#clarifying-questions-to-ask)
- [Solution](#solution-walkthrough)

## Clarifying Questions To Ask

### Question 1

**Q:**

*Like a lot of other sharing-economy products out there, Airbnb has two sides:*

- *A host-facing side and a renter-facing side.*
- *Are we designing both of these sides or just one of them?*

**A:**\
Let's design both of these sides of the product.

### Question 2

**Q:**\
*Okay. So we're probably designing the system for hosts to create and maybe delete listings, and the system for renters to browse through properties, book them, and manage their bookings afterwards. Is that correct?*

**A:**\
Yes for hosts; but let's actually just focus on browsing through listings and booking them for renters.\
We can ignore everything that happens after booking on the renter-facing side.

### Question 3

**Q:**\
*Okay, but for booking, is the idea that, when a user is browsing a property for a specific date range, the property gets temporarily reserved for them if they start the booking process?*

**A:**\
Yes. More specifically, multiple users should be allowed to look at the same property, for the same date range, concurrently without issues.\
But once a user starts the booking process for a property, it should be reflected that this property is no longer available for the dates in question if another user tries to book it.

### Question 4

**Q:**

- *I see. But so, let's say two users are looking at the exact same property for an overlapping date range, and one user presses "Book Now", at which point they have to enter credit card information.*
- *Should we immediately lock the property for the other user for some predetermined period of time, like maybe 15 minutes, and if the first person actually goes through with booking the property, then this "lock" becomes permanent?*

**A:**\
Yes, that makes sense.\
In real life, there might be slight differences, but for the sake of this design, let's go with that.

### Question 5

**Q:**\
Okay. And do we want to design any auxiliary features like being able to contact hosts, authentication and payment services, etc., or are we really just focusing on browsing and reserving?

**A:**\
Let's really just focus on browsing and booking. We can ignore the rest.

### Question 6

**Q:**

*I see. So, since it sounds like we're designing a pretty targeted part of the entire Airbnb service, I want to make sure that I know exactly every functionality that we want to support.*

- *My understanding is that users can go on the main Airbnb website or app, they can look up properties based on certain criteria, like location, available date range, pricing, property details, etc., and then they can decide to book a location.*
- *As for hosts, they can basically just create a listing and delete it like I said earlier.*

*Is that correct?*

**A:**\
Yes. But actually, for this design, let's purely filter based on location and available date range as far as listing characteristics are concerned.\
So, let's not worry about other criteria like pricing and property details.

### Question 7

**Q:**

- *What is the scale that we're designing this for?*
- *Specifically, roughly how many listings and renters do we expect to cater to?*

**A:**\
Let's only consider Airbnb's U.S. operations.\
So let's say 50 million users and 1 million listings.

### Question 8

**Q:**\
*Regarding systems characteristics like availability and latency, I'm assuming that, even if a renter looks up properties in a densely-populated area like NYC, where there might be a lot of listings, we care about serving these listings fast, accurately, and reliably. Is that correct?*

**A:**\
Yes, that's correct.\
Ideally, we don't want any downtime for renters browsing listings.

## Solution Walkthrough

### 1. Gathering System Requirements

As with any systems design interview question, the first thing that we want to do is to gather system requirements; we need to figure out what system we're building exactly.

We're designing the core system behind Airbnb.\
This system allows hosts to create property listings and renters to browse through these listings and book them.

**Specifically, we'll want to support:**

- **Hosts** creating and deleting listings.
- **Renters** browsing listings, viewing individual listings, and "reserving" listings.

**More about renter side:**

- "Reserving" a listing happens when a renter clicks the "Book Now" button.\
    This action should lock (or reserve) the listing for some time (say, 15 minutes).\
    Then prevent other renters from reserving or browsing it (unless they were already viewing it).
- We don't need to support post-reservation actions except for freeing up the reservation after 15 minutes if the renter doesn't follow through.\
    If the renter books the listing, the reservation becomes permanent.
- For listings, focus on browsing and reserving based on location and available date range.\
    We can ignore other property characteristics like price, number of bedrooms, etc.
- Browsing listings should be quick and reflect newly created listings as fast as possible.
- Reserved and booked listings should not be browsable by renters.

Our system should serve a U.S. audience with approximately 50 million users and 1 million listings.

### 2. Coming Up With A Plan

**We'll tackle this system by dividing it into two main sections:**

- The host side.
- The renter side.

**We can further divide the renter side as follows:**

- Browsing listings.
- Getting a single listing.
- Reserving a listing.

### 3. Listings Storage & Quadtree

First, we will store all our listings in a SQL table.\
This table will be the primary source of truth for Airbnb listings.\
Whenever a host creates or deletes a listing, the SQL table will also be updated.

To reduce latency when browsing listings based on their location.\
We will store the listings in a region quadtree.\
This quadtree will allow us to traverse all browsing functionality.

For speed optimization, it makes sense to store the quadtree in memory on an auxiliary machine, called a "geo index".\
We need to ensure that the quadtree fits in memory.

The quadtree will store all necessary information for the UI, such as the title, description, image link, and unique listing ID.

**Assuming each listing takes up about 10 KB of space (as an upper bound), we can calculate the memory requirement as follows:**

$$
\begin{aligned}
&\sim10\text{ kB per listing}\\
&\sim1\text{ million listings}\\
&\sim10\text{ kB}\times 1000^2 = 10\text{ GB}
\end{aligned}
$$

Because we store quadtree in memory.\
To prevent a single machine failure from disrupting browsing functionality, we will set up a cluster of machines.\
Each machine will hold an instance of the quadtree in memory.\
These machines will use leader election to safeguard us from machine failures.

**Our quadtree solution works as follows:**

- On system boot, the geo-index machines create the quadtree by querying the SQL table of `listings`.
- When listings are *created* or *deleted*, hosts first write to the SQL table.\
    Then, they synchronously update the geo-index leader's quadtree.
- Then every 10 minutes (interval), the geo-index leader and followers recreate the quadtree from the SQL table.\
    This keeps them up to date with new listings.
- If the leader dies, a follower will take its place.\
    Data in the new leader's quadtree will be stale for a few minutes until the interval forces a recreation.

### 4. Listing Listings

When renters browse listings, they hit the *ListListings* API endpoint.\
This API call searches the geo-index leader's quadtree for relevant listings based on the location provided by the renter.

Finding relevant locations should be straightforward and fast.\
We estimate that our quadtree will have a depth of about 10 (since  $4^{10}$ exceeds 1 million).

However, we must ensure that we do not return listings unavailable during the renter's specified date range.\
Each listing in the quadtree will include a list of unavailable date ranges.\
We can perform a simple binary search on this list to check if a listing is available and therefore browsable by the renter.

Additionally, our quadtree should return only a subset of relevant listings for **pagination**.\
We can determine this subset using an **offset**.\
For example, the first page of relevant listings would have an offset of 0.\
The second page would have an offset of 50 (if each page contains 50 listings).\
The third page would have an offset of 100, and so on.

### 5. Getting Individual Listings

This API call should be extremely simple; we can expect to have listing IDs from the list of listings that a renter is browsing through, and we can simply query our SQL table of `listings` for the given ID.

### 6. Reserving Listings

Reserved listings will need to be reflected both in our quadtree and in our persistent storage solution.

- In our quadtree, because they'll have to be excluded from the list of browsable listings
- In our persistent storage solution, because if our quadtree needs to have them, then the main source of truth also needs to have them.

We can have a second SQL table for **reservations**, holding listing IDs as well as date ranges and timestamps for when their reservations expire.\
When a renter tries to start the booking process of a listing, the `reservation` table will first be checked to see if there's currently a reservation for the given listing during the specified date range.

- If there is, an error is returned to the renter.
- If there isn't, a reservation is made with an expiration timestamp 15 minutes into the future.

Following the write to the `reservation` table, we synchronously update the geo-index leader's quadtree with the new reservation.\
This new reservation will simply be an unavailability interval in the list of `unavailabilities` on the relevant listing, but we'll also specify an expiration for this unavailability, since it's a reservation.

**A listing in our quadtree might look something like this:**

```json
{
  "unavailabilities": [
    {
      "range": ["2020-09-22T12:00:00-05:00", "2020-09-28T12:00:00-05:00"],
      "expiration": "2020-09-16T12:00:00-04:00"
    }
    {
      "range": ["2020-10-02T12:00:00-05:00", "2020-10-10T12:00:00-05:00"],
      "expiration": null
    },
  ],
  "title": "Listing Title",
  "description": "Listing Description",
  "thumbnailUrl": "Listing Thumbnail URL",
  "id": "Listing ID"
}
```

### 7. Load Balancing

On the host side, we can load balance requests to create and delete listings across a set of API servers using a simple round-robin approach.\
The API servers will then be in charge of writing to the SQL database and of communicating with the geo-index leader.

On the renter side, we can load balance requests to list, get, and reserve listings across a set of API servers using an API-path-based server-selection strategy.\
Since workloads for these three API calls will be considerably different from one another, it makes sense to separate these calls across different sets of API servers.

Of note is that we don't want any caching done at our API servers, because otherwise we'll naturally run into stale data as reservations, bookings, and new listings appear.

### 8. System Diagram

![Airbnb System Diagram](./img/airbnb-system-diagram.svg)
