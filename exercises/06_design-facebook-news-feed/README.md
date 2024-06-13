# Design Facebook News Feed

Many systems design questions are intentionally left very vague and are literally given in the form of `Design Foobar`.\
It's your job to ask clarifying questions to better understand the system that you have to build.

We've laid out some of these questions below; their answers should give you some guidance on the problem.\
Before looking at them, we encourage you to take few minutes to think about what questions you'd ask in a real interview.

## Table of Content

- [Clarifying Questions](#clarifying-questions-to-ask)
- [Solution](#solution-walkthrough)

## Clarifying Questions To Ask

### Question 1

**Q:**

- Facebook News Feed consists of multiple major features, like loading a user's news feed, interacting with it (i.e., posting status updates, liking posts, etc.), and updating it in real time (i.e., adding new status updates that are being posted to the top of the feed, in real time).
- *What part of Facebook News Feed are we designing exactly?*

**A:**\
We're designing the core functionality of the feed itself, which we'll define as follows: loading a user's news feed and updating it in real time, as well as posting status updates.\
But for posting status updates, we don't need to worry about the actual API or the type of information that a user can post; we just want to design what happens once an API call to post a status update has been made.\
Ultimately, we primarily want to design the feed generation/refreshing piece of the data pipeline (i.e, how/when does it get constructed, and how/when does it get updated with new posts).

### Question 2

**Q:**

- To clarify, posts on Facebook can be pretty complicated, with pictures, videos, special types of status updates, etc..
- *Are you saying that we're not concerned with this aspect of the system?*
- *For example, should we not focus on how we'll be storing this type of information?*

**A:**\
That's correct.
For the purpose of this question, we can treat posts as opaque entities that we'll certainly want to store, but without worrying about the details of the storage, the ramifications of storing and serving large files like videos, etc..

### Question 3

**Q:**\
*Are we designing the relevant-post curation system (i.e., the system that decides what posts will show up on a user's news feed)?*

**A:**\
No. We're not designing this system or any ranking algorithms; you can assume that you have access to a ranking algorithm that you can simply feed a list of relevant posts to in order to generate an actual news feed to display.

### Question 4

**Q:**

- *Are we concerned with showing ads in a user's news feed at all?*
- Ads seem like they would behave a little bit differently than posts, since they probably rely on a different ranking algorithm.

**A:**\
You can treat ads as a bonus part of the design; if you find a way to incorporate them in, great (and yes, you'd have some other ads-serving algorithm to determine what ads need to be shown to a user at any point in time).\
But don't focus on ads to start.

### Question 5

**Q:** *Are we serving a global audience, and how big is our audience?*

**A:**\
Yes — we're serving a global audience, and let's say that the news feed will be loaded in the order of 100 million times a day, by 100 million different users, with 1 million new status updates posted every day.

### Question 6

**Q:**

- **How many friends does a user have on average?**
- This is important to know, since a user's status updates could theoretically have to show up on all of the user's friends' news feeds at once.

**A:**\
You can expect each user to have, on average, 500 friends on the social network.\
You can treat the number of friends per user as a bell-shaped distribution, with some users who have very few friends, and some users who have a lot more than 500 friends.

### Question 7

**Q:**\
*How quickly does a status update have to appear on a news feed once it's posted, and is it okay if this varies depending on user locations with respect to the location of the user submitting a post?*

**A:**\
When a user posts something, you probably want it to show up on other news feeds fairly quickly.\
This speed can indeed vary depending on user locations.\
For instance, we'd probably want a local friend within the same region to see the new post within a few seconds, but we'd likely be okay with a user on the other side of the world seeing the same post within a minute.

### Question 8

**Q:** *What kind of availability are we aiming for?*

**A:**\
Your design shouldn't be completely unavailable from a single machine failure, but this isn't a high availability requirement.\
However, posts shouldn't ever just disappear.\
Once the user’s client gets confirmation that the post was created, you cannot lose it.

## Solution Walkthrough

Our solution walkthroughs are meant to supplement our video solutions.\
We recommend starting with the video solution and using the walkthrough either as a point of reference while you watch the video or as a review tool if you need to brush up on this question's solution later on.

### 1. Gathering Requirements

As with any systems design interview question, the first thing that we want to do is to gather system requirements; we need to figure out what system we're building exactly.

**From the answers we were given to our [clarifying questions](#clarifying-questions-to-ask):**

- We're designing the core user flow of the **Facebook News Feed**.\
  This involves loading a user's news feed, scrolling through relevant posts, posting status updates, and having friends' news feeds updated in real time.
- Specifically, we're focusing on the pipeline that generates and serves news feeds and handles updates when users post.
- The system will handle approximately 1 billion users, each with an average of 500 friends.
- Retrieving a news feed should be near-instant, and creating a post should update all friends' news feeds within a minute.
- There will be some variance in update times based on user regions.
- We cannot rely on a single cluster for global service due to **latency issues**.\
  So, we need a way to ensure feed updates within a minute across different regions.
- We can assume that the ranking algorithm for generating relevant news feeds is managed by another system we can access. (we need not to think of this)

### 2. Coming Up With A Plan

We'll start with the two main API calls, *CreatePost* and *GetNewsFeed*, then discuss the feed creation and storage strategy, our cross-region design, and finally tie everything together for speed and scalability.

### 3. CreatePost API

**For the purpose of this design, the *CreatePost* API will look like this:**

```txt
CreatePost(
  user_id: string,
  post: data,
)
```

When a user creates a post, the API call goes through a load balancer and lands on one of many stateless API servers.\
These API servers then publish a message on a Publish/Subscribe (Pub/Sub) topic, notifying subscribers about the new post creation.\
There are multiple subscribers listening to this Pub/Sub topic, and we'll refer to them as $S_1$.\
Each subscriber $S_1$ reads the message from the Pub/Sub topic about the new post.

### 4. Post Storage

A main relational database will store most of our system's data, including posts and users.\
This main database will contain very large tables to accommodate the massive amounts of data from billions of users and their posts.

### 5. GetNewsFeed API

**The *GetNewsFeed* API will look like this:**

```txt
GetNewsFeed(
  userId: string,
  pageSize: integer,
  nextPageToken: integer,
) => (
  posts: {
    userId: string,
    postId: string,
    post: data,
  }[],
  nextPageToken: string,
)
```

The *pageSize* and *nextPageToken* fields are used for pagination, which is necessary for handling large amounts of listed data.\
Each news feed may have up to 1000 posts, making pagination essential.

### 6. Feed Creation And Storage

Fetching news feeds from the main database every time a *GetNewsFeed* call is made is impractical due to the large size of our tables.\
Instead, we can store news feeds separately across an array of shards.\
A separate cluster of machines can aggregate posts, rank them using the provided algorithm, generate news feeds, and send them to the shards periodically (e.g., every 5, 10, or 60 minutes).

Assuming each post averages 10KB and each news feed contains 1000 posts, we estimate needing **10,000 TB** (10 PetaBytes) of storage for 1 billion users.\
And we assume that it's loaded 10 times per day per user, which averages at 10k QPS (Query per Second) for the news feed fetching.
We can use 1000 machines with 10 TB each as our news-feed shards.

$$
\begin{aligned}
&\phantom{=}\sim 10\text{KB per post}\\[*1.5pt]
&\phantom{=}\sim 1000\text{ posts per news feed}\\[*1.5pt]
&\phantom{=}\sim 1\text{ billion news feeds}\\[*1.5pt]
&\phantom{=}\sim 10 KB \times 1000 \times 1000^{3}  = 10 PB = 1000 * 10 TB
\end{aligned}
$$

News feeds will be sharded based on user ID.\
When a *GetNewsFeed* request comes in, it is load balanced to the appropriate shard, which returns the news feed by reading from local storage.\
If the news feed isn't available locally, it queries the main database through the ranking service, which increases latency but should be rare.

### 7. Wiring Updates Into Feed Creation

We now need to have a notification mechanism that lets the feed shards know that a new relevant post was just created and that they should incorporate it into the feeds of impacted users.

We can once again use a Pub/Sub service for this.\
Each one of the shards will subscribe to its own topic—we'll call these topics the **Feed Notification Topics (FNT)**—and the original subscribers $S_1$ will be the publishers for the FNT.\
When $S_1$ gets a new message about a post creation, it searches the main database for all of the users for whom this post is relevant (i.e., it searches for all of the friends of the user who created the post), it filters out users from other regions who will be taken care of asynchronously, and it maps the remaining users to the FNT using the same hashing function that our *GetNewsFeed* load balancers rely on.

For posts that impact too many people, we can cap the number of FNT topics that get messaged to reduce the amount of internal traffic that gets generated from a single post.\
For those big users we can rely on the asynchronous feed creation to eventually kick in and let the post appear in feeds of users whom we've skipped when the feeds get refreshed manually.

### 8. Cross-Region Strategy

When *CreatePost* gets called and reaches our Pub/Sub subscribers, they'll send a message to another Pub/Sub topic that some forwarder service in between regions will subscribe to.\
The forwarder's job will be, as its name implies, to forward messages to other regions so as to replicate all of the *CreatePost* logic in other regions.\
Once the forwarder receives the message, it'll essentially mimic what would happen if that same *CreatePost* were called in another region, which will start the entire feed-update logic in those other regions.\
We can have some additional logic passed to the forwarder to prevent other regions being replicated to from notifying other regions about the *CreatePost* call in question, which would lead to an infinite chain of replications; in other words, we can make it such that only the region where the post originated from is in charge of notifying other regions.

Several open-source technologies from big companies like Uber and Confluent are designed in part for this kind of operation.

### 9. System Diagram

![Facebook System Diagram](./img/facebook-system-diagram.svg)
