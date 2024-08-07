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
You can ignore those auxiliary services; focus on the primary user flow.\
That being said, one thing to note is that, by nature of the product, we're going to have access to a lot of user-activity data that's going to need to be processed in order to enable Netflix's recommendation system.\
You'll need to come up with a way to aggregate and process user-activity data on the website.

### Question 3

**Q:**\
*For this recommendation system, should I think about the kind of algorithm that'll fuel it?*

**A:**\
No, you don't need to worry about implementing any algorithm or formula for the recommendation engine.\
You just need to think about how user-activity data will be gathered and processed.

### Question 4

**Q:**

- *It sounds like there are 2 main points of focus in this system: the **video-serving** service and the **recommendation engine**.*
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

### 1. Gathering System Requirements

As with any systems design interview question, the first thing that we want to do is to gather system requirements; we need to figure out what system we're building exactly.

Here, we aim to build the core Netflix service, allowing users to stream movies and shows from the Netflix website.

**Specifically, we'll want to focus on:**

- Delivering large amounts of high-definition video content to hundreds of millions of users worldwide without too much buffering.
- Processing large amounts of user-activity data to support Netflix's recommendation engine.

### 2. Coming Up With A Plan

**We will break down the system into 4 main sections:**

- Storage (Video Content, Static Content, and User Metadata)
- General Client-Server Interaction (i.e., the life of a query)
- Video Content Delivery
- User-Activity Data Processing

### 3. Video-Content Storage

Netflix serves millions of customers with video content.\
This means they need *a lot* of storage space.\
They also need a system that can handle this.\
Let's start by estimating how much space we'll need.

We were told that Netflix has about 200 million users.\
So, we can make a few assumptions about other Netflix metrics (alternatively, we can ask our interviewer for guidance here):

- Netflix serves around 200 million users
- At any time, Netflix provides access to about 10,000 movies and shows.
- Videos average for 1 hour.\
  This average can be 2 hours and TV episodes range from 20 to 40 minutes.
- Every video is available in both **Standard Definition** (SD) and **High Definition** (HD).
  - **SD** videos use up about **10GB** per hour.
  - **HD** videos use about **20GB** per hour.

$$
\begin{aligned}
  &\sim 10\text{K videos (stored in SD \\& HD)}\\
  &\sim1\text{ hour average video length}\\
  &\sim10\text{ GB/h for SD} + \sim20\text {GB/h for HD} = 30\text{ GB/h per video}\\
  &\sim30\text{ GB/h} \times 10\text{K videos} = 300,000\text{ GB} = 300\text{ TB}
\end{aligned}
$$

> See storage estimation in the [cheat sheet](/05_storage/README.md#storage-scale-cheat-sheet)

This estimation shows the importance of calculations.\
We might assume Netflix stores petabytes of video, but a simple estimation reveals a few hundred terabytes suffice.\
Unlike platforms like YouTube, Google Drive, and Facebook, which allow users to upload unlimited amounts of video.\
Netflix has a fixed amount of video content.

Given this, we can use a simple blob storage solution like **S3** or **GCS** for reliable storage and replication of Netflix's video content.\
A more complex data storage solution isn't necessary.

Since we're only dealing with a few hundred terabytes of data, we can use a simple blob storage solution like **S3** or **GCS** to reliably handle the storage and replication of Netflix's video content; we don't need a more complex data-storage solution.

### 4. Static-Content Storage

In addition to video content, we'll want to store various pieces of static content for Netflix's movies and shows, such as titles, descriptions, and cast lists.\
This content is also limited in size by the number of movies and shows and takes up less space than video data.

We can store all this static content in a relational database or even a document store and cache most of it on our API servers.

### 5. User Metadata Storage

We'll store user metadata for each video on the Netflix platform.\
Such as the timestamp when a user left a video and user ratings on a video, etc...

Like the static content mentioned above, This metadata is tied to the number of videos.
But it grows with the user base because every user has user metadata.

**We can quickly estimate how much space we'll need for this user metadata:**

$$
\begin{aligned}
  \sim&200\text{M users}\\
  \sim&1\text{K videos watched per user per lifetime}\ (\sim10\\%\text{ of total content})\\
  \sim&100\text{ bytes/video/user}\\
  \sim&100\text{ bytes} \times 1\text{K videos} \times 200\text{M users} = 100\text{ KB} \times 200\text{M} = 1\text{ GB} \times 20\text{K} = 20\text{ TB}
\end{aligned}
$$

Surprisingly, the amount of user metadata is similar to the amount of video content.\
This is because of the fixed nature of Netflix's video content versus the growing user base.

We will probably need to search through this metadata.\
So, it's a good idea to use a relational database like **Postgres** for storage.\
This setup helps keep the search and save time fast for user data.

Since Netflix users do not interact with each other like they would on a social network.\
In simpler terms, operations such as *GetUserInfo* and *GetUserWatchedVideos* need quick responses and are focused on just one user.\
Meanwhile, more complex database operations that deal with of many users' metadata will probably be done as part of background jobs in data engineering.\
These jobs are less concerned with how fast they operate.\
Therefore, we can divide the user-metadata database into several parts, or shards.

Based on this, we can organize our user metadata database into a few shards.\
Each shard will handle 1 to 10 TB of data that we've indexed.\
With indexing, we ensure fast data lookups and updates for each user.

### 6. General Client-Server Interaction

The part of the system that handles serving user metadata and static content to users shouldn't be too complicated.\
We can apply straightforward round-robin load balancing to spread out network requests from users among our API servers.\
These servers can then distribute database requests by **`userId`**. This is because we organize our database into shards according to **`userId`**.

As mentioned above, we can cache our static content in our API servers, updating it periodically when new movies and shows are released.\
We can also cache user metadata using a write-through caching mechanism.

### 7. Video Content Delivery

Delivering Netflix's video content globally with minimal latency is crucial.\
We will estimate the highest bandwidth usage we might see at any moment.\
We expect that during peak times, such as the release of a popular movie, a large number of Netflix users will be watching videos concurrently

$$
\begin{aligned}
  \sim&200\text{M total users}\\
  \sim&5\\%\text{ of total users streaming concurrently during peak hours}\\
  \sim&20\text{ GB/h of HD video} \simeq 5 \text{MB/s of HD video}\\
  \sim&5\\%\text{ of }200\text{M} \times 5\text{ MB/s} = 10\text{M} \times 5\text{ MB/s} = 50\text{ TB/s}
\end{aligned}
$$

This level of bandwidth consumption means we can't serve the video content from a single data centre or even dozens of data centres.\
We need thousands of locations worldwide to distribute the content.\
**CDNs** solve this precise problem with their thousands of **Points of Presence (PoPs)** around the world.\
We can use a CDN like **Cloudflare** to serve our video content from the CDN's PoPs.

Because **PoPs** cannot cache all of Netflix's video metadata, an external service can regularly update CDN PoPs with the most popular content (the movies and shows viewers are most likely to watch).

> [!note]
> We can also use **Internet Exchange Point** (IXP) instance of *POP*.

### 8. User-Activity Data Processing

We need to process large amounts of user-activity data for Netflix's recommendation engine.\
This data will be in the form of logs generated by user actions, with terabytes of these logs generated daily.

**MapReduce** can help us here.\
We can store the logs in a distributed file system like **HDFS** and run *MapReduce* jobs to process massive amounts of data in parallel.\
The results can then be fed into machine learning pipelines or stored in a database.

**MapReduce** can help us here.\
We can store the logs in a distributed file system like **HDFS** and run *MapReduce* jobs to process massive amounts of data in parallel.\
The results can then be fed into some machine learning pipelines or stored in a database.

#### Map Inputs

**Our Map inputs can be our raw logs, which might look like:**

```json
{"userId": "userId1", "videoId": "videoId1", "event": "CLICK"}
{"userId": "userId2", "videoId": "videoId2", "event": "PAUSE"}
{"userId": "userId3", "videoId": "videoId3", "event": "MOUSE_MOVE"}
```

#### **Map Outputs / Reduce Inputs**

Our Map function will aggregate logs based on **`userId`** and return intermediary key-value pairs indexed on each **`userId`**, pointing to lists of tuples with **`videoIds`** and relevant events.

These intermediary k/v pairs will be shuffled appropriately and fed into our Reduce functions.

```python
{
  "userId1": [
    ("CLICK", "videoId1"),
    ("CLICK", "videoId1"),
    ...,
    ("PAUSE", "videoId2")
  ]
}
{
  "userId2": [
    ("PLAY", "videoId1"),
    ("MOUSE_MOVE", "videoId2"),
    ...,
    ("MINIMIZE", "videoId3")
  ]
}
```

#### **Reduce Outputs**

Our Reduce functions could return various outputs.\
They could return k/v pairs for each **`userId`** | **`videoId`** combination with a computed **score** for that user/video pairs.\
Alternatively, they could return k/v pairs indexed by **userId**, pointing to lists of **videoId** and **score** tuples, or stack-rankings of **videoIds** based on their computed score.

```jsonc
("userId1|videoId1", score)
("userId1|videoId2", score)

// OR

{"userId1": [("videoId1", score), ("videoId2", score), ..., ("videoId3", score)]}
{"userId2": [("videoId1", score), ("videoId2", score), ..., ("videoId3", score)]}

// OR

("userId1", ["videoId1", "videoId2", ..., "videoId3"])
("userId2", ["videoId1", "videoId2", ..., "videoId3"])
```

### 9. System Diagram

![Netflix System Diagram](./img/netflix-system-diagram.svg)

### Code

```typescript
type List<T> = Array<T>
type UserID = `userId${number}`
type VideoID = `videoId${number}`
type Score = number
type UserVideoCombinationID = `${UserID}|${VideoID}`

enum EventName {
  Click = "CLICK",
  Pause = "PAUSE",
  Play = "PLAY",
  MouseMove = "MOUSE_MOVE",
}

interface UserVideoEvent {
  userId: UserID;
  videoId: VideoID;
  event: EventName;
}

const mapInputs: List<UserVideoEvent> = [
  { userId: "userId1", videoId: "videoId1", event: EventName.Click },
  { userId: "userId1", videoId: "videoId1", event: EventName.Click },
  { userId: "userId1", videoId: "videoId1", event: EventName.Pause },
  { userId: "userId1", videoId: "videoId2", event: EventName.Play },
  { userId: "userId1", videoId: "videoId2", event: EventName.Pause },
  { userId: "userId2", videoId: "videoId1", event: EventName.MouseMove },
  { userId: "userId2", videoId: "videoId1", event: EventName.Click },
  { userId: "userId2", videoId: "videoId2", event: EventName.Play },
  { userId: "userId2", videoId: "videoId2", event: EventName.Pause },
  { userId: "userId2", videoId: "videoId2", event: EventName.Play },
  { userId: "userId3", videoId: "videoId1", event: EventName.MouseMove },
  { userId: "userId3", videoId: "videoId2", event: EventName.Click },
  { userId: "userId3", videoId: "videoId2", event: EventName.MouseMove },
]

function mapFunction(
  input: List<UserVideoEvent>
): Record<UserID, List<[VideoID, EventName]>> {
  return input.reduce<
    Record<UserID, List<[VideoID, EventName]>>
  >((acc, { userId, videoId, event }) => {
    return {
      ...acc,
      [userId]: acc[userId]
        ? [...acc[userId], [videoId, event]]
        : [[videoId, event]]
    }
  }, {})
}

function reduceFunction(
  input: Record<UserID, List<[VideoID, EventName]>>
): List<[UserVideoCombinationID, Score]> {
  return Object.entries(input).flatMap<
    [UserVideoCombinationID, Score]
  >(([userId, videoEvents]) => {
    const videoScoreDict: Record<VideoID, Score> = {}

    videoEvents.forEach(([videoId, event]) => {
      if (!videoScoreDict[videoId]) {
        videoScoreDict[videoId] = 0
      }
      videoScoreDict[videoId] += fakeScore(event)
    })

    return Object.entries(videoScoreDict).map<
      [UserVideoCombinationID, Score]
    >(([videoId, score]) => {
      const combinationId = `${userId}|${videoId}` as UserVideoCombinationID
      return [combinationId, score]
    })
  })
}

function fakeScore(event: EventName): Score {
  const eventScoreDict: Record<EventName, Score> = {
    [EventName.Play]: 2,
    [EventName.Pause]: 3,
    [EventName.Click]: 5,
    [EventName.MouseMove]: 1,
  }
  return eventScoreDict[event] || 0
}

const mapOutputs = mapFunction(mapInputs)
const reduceOutputs = reduceFunction(mapOutputs)

console.log("Map Outputs:", mapOutputs)
console.log("Reduce Outputs:", reduceOutputs)
```
