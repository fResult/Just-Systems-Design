# Design Tinder

*Many systems design questions are intentionally left very vague and are literally given in the form of `Design Foobar`.\
It's your job to ask clarifying questions to better understand the system that you have to build.*

*We've laid out some of these questions below; their answers should give you some guidance on the problem.\
Before looking at them, we encourage you to take few minutes to think about what questions you'd ask in a real interview.

## Table of Content

- [Clarifying Questions](#clarifying-questions-to-ask)
- [Solution](#solution-walkthrough)

## Clarifying Questions To Ask

### Question 1

**Q:**

- *As far as I know, users who sign up on Tinder first create a profile (name, age, job, bio, sexual preference, etc.).\
  After which they can start swiping on other users near them, who appear in a stacked deck of potential matches on the main page of the app.*
- *If two users swipe right on each other, they match, and they can now directly communicate with one another.*
- *Are we designing all of this?*

**A:**\
Yes, but you don't have to design the messaging feature or any functionality that's available after two users match.\
You should also design both the Super Like feature and the Undo feature.\
Super Like allows a user to effectively arrive at the top of another user's deck, indicating that they super-liked them.\
Undo allows a user to unswipe the last user that they swiped on.\
So if they accidentally swiped left on someone, they can undo that.\
But this can only be done for the last user; you can't spam undo.

### Question 2

**Q:** *Regarding the Undo feature, can a user undo a match?*

**A:**\
For the sake of this design, let's only allow undoing when you swipe left—not when you swipe right.
And if you swipe left, then swipe right, you can no longer undo the left swipe from two swipes ago.

### Question 3

**Q:**

- *Do users have a limited number of right swipes, Super Likes, and Undos per day?*
- *What about the number of potential matches in their deck? Is there a daily cap on that number, like 100 or 200 potential matches per day?*

**A:**\
For the sake of this design, let's not have any caps whatsoever.\
In other words, users will be given an infinite amount of potential matches in their deck (within their distance parameters), and they can endlessly swipe right on them, Super Like them, and undo left swipes.\
Naturally, if a user were to swipe through every single potential match within their distance parameters, then they would run out of potential matches, but their deck would likely quickly get new potential matches as new users sign up on Tinder.

#### Question 4

**Q:**

- *Regarding the deck of potential matches, here are some assumptions that I'm making; let me know if this sounds appropriate.*
- *Every user has an endless deck of potential matches that are within their distance parameters, as we just mentioned, and this deck should be ordered in some way (perhaps based on a matchability score).*
- *The deck should only consist of users who have either already liked this user or not yet swiped on them.*
- *For users who have already swiped left on the main user, we should probably, in a best-effort type of way, try to remove them from the main user's deck.*
- *And then, of course, users who have super-liked the main user should be at the top of the deck.*
*Does this seem reasonable?*

**A:**\
This seems reasonable, but you don't actually need to worry about how decks are generated.\
In other words, you can assume that we have a smart matching algorithm that generates the decks for you based on matchability scores, preferences, distance, etc., and you should just rely on this algorithm and figure out where it fits into your design.\
So you don't even need to worry about whether potential matches who've swiped left on a user show up in the user's deck; the matching algorithm will take care of that for you.

### Question 5

**Q:** *Are we designing the part of the system that notifies users when they have a new match?*

**A:**\
You should think about how a user will be notified of a match if a match occurs in real time, as they swipe right on another user.\
Otherwise, don't worry about the match-notification system when the user is idle on the app or not using the app at all.

### Question 6

**Q:**\
*As far as scale is concerned, how many users are we designing Tinder for, and where in the world should we assume that they're located?*

**A:**
Let's assume that we have roughly 50 million users on Tinder.\
You can assume that they're evenly distributed across the globe, perhaps with hot spots in major urban areas.

### Question 7

**Q:**

- *As far as latency and reliability are concerned, I'm assuming that we want Tinder to be mostly highly available and that we want swipes to feel instant.*
- *Is it ok if there's a little bit of loading time when you first open the app or after you've swiped through, say, 200 profiles?*

**A:**\
What you described for latency is great.\
As far as reliability is concerned, let's not worry too much about it for the sake of this design.\
You can assume that you have a highly available SQL setup out of the box, without worrying about the availability details.

## Solution Walkthrough

### 1. Gathering System Requirements

As with any systems design interview question, the first thing that we want to do is to gather system requirements; we need to figure out what system we're building exactly.

We're designing the core system behind Tinder, which allows users to create a profile and swipe through a seemingly endless deck of potential matches.\
Users can also super-like potential matches, putting themselves at the top of the other users' decks, and they can undo their most recent swipe if it was a left swipe.\
Users don't have any limitations on the number of swipes, Super Likes, and Undos that they can do per day.

We're explicitly not designing any functionality that's available after two users match, including any kind of notification system to alert users that they've gotten a match, unless the match occurs directly when they swipe right on a potential match.

Our system should serve a global userbase of about 50 million users who are evenly distributed across the world, and we'd like to have mostly instant swipes, allowing for some latency when the Tinder app first loads up and after a user has swiped through a good number of potential matches.

We're told not to focus on the availability of our system, which should help us narrow down our design a little bit.

### 2. Coming Up With A Plan

**We'll tackle this system by dividing it into four main sections:**

- Storage Overview
- Profile Creation
- Deck Generation
- Swiping

We'll cover super-liking and undoing at the end, which will likely involve making tweaks to our design for swiping.

### 3. Storage Overview

Most of the data that we expect to store (profiles, decks, swipes, and matches), makes sense to be structured, so we'll use a SQL storage solution for it, and it'll be served directly from relevant SQL tables.

All of this data will be stored in regional databases, located based on user hot spots (e.g., a database on the east coast of the U.S., one in central U.S., one in western Europe, one in India, etc.), and users fetching Tinder data will be automatically routed to the closest regional database after being routed to intermediary API servers via some round-robin load balancing.

The only exception is users' profile pictures, which we'll store in a global blob store and which will be served via CDN.

We'll have some asynchronous replication between the regional databases, which should take anywhere from a few minutes to a few hours to occur.\
The asynchronicity of the replication should be fine, because the people that users interact with will usually, by the nature of the app, be close to them and therefore be using the same regional database as them.

