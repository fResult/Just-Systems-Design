# Design Netflix

*Many systems design questions are intentionally left very vague and are literally given in the form of `Design Foobar`.\
It's your job to ask clarifying questions to better understand the system that you have to build.*

*We've laid out some of these questions below; their answers should give you some guidance on the problem.\
Before looking at them, we encourage you to take few minutes to think about what questions you'd ask in a real interview.*

## Table of Content

- [Clarifying Questions](#clarifying-questions-to-ask)
- [Solution](#solution-walkthrough)

## Clarifying Questions To Ask

### Question 1

**Q:**

- *From a high-level point of view, Netflix is a fairly straightforward service: users go on the platform, they're served movies and shows, and they watch them.*
- *Are we designing this high-level system entirely, or would you like me to focus on a particular subsystem, like the Netflix home page?*

**A:**\
We're just designing the core Netflix product—so the overarching system / product that you described.

### Question 2

**Q:**\
*Should we worry about auxiliary services like authentication and payments?*

**A:**\
You can ignore those auxiliary services; focus on the primary user flow.
That being said, one thing to note is that, by nature of the product, we're going to have access to a lot of user-activity data that's going to need to be processed in order to enable Netflix's recommendation system.
You'll need to come up with a way to aggregate and process user-activity data on the website.

### Question 3

**Q:**\
*For this recommendation system, should I think about the kind of algorithm that'll fuel it?*

**A:**\
No, you don't need to worry about implementing any algorithm or formula for the recommendation engine.
You just need to think about how user-activity data will be gathered and processed.

### Question 4

**Q:**

- *It sounds like there are 2 main points of focus in this system: the video-serving service and the recommendation engine.*
- *Regarding the video-serving service, I'm assuming that we're looking for high availability and fast latencies globally; is this correct?*

**A:**\
Yes, but just to clarify, the video-streaming service is actually the only part of the system for which we care about fast latencies.

### Question 5

**Q:** *So is the recommendation engine a system that consumes the user-activity data you mentioned and operates asynchronously in the background?*

**A:** Yes.

### Question 6

**Q:** *How many users do we expect to be building this for?*

**A:** Netflix has about 100M to 200M users, so let's go with 200M.

### Question 7

**Q:**\
*Should we worry about designing this for various clients, like desktop clients, mobile clients, etc.?*

**A:**\
Even though we're indeed designing Netflix to be used by all sorts of clients, let's focus purely on the distributed-system component—so no need to get into details about clients or to optimize for certain clients.

## Solution Walkthrough
