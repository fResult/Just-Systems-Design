# Design The Twitch API

## Table of Content

- [Clarifying Questions](#clarifying-questions-to-ask)
- [Solution](#solution-walkthrough)

## Clarifying Questions To Ask

### Question 1

**Q:**

- *I'm going to list the different features on a streamer's channel page to confirm that I'm not missing any important functionality.*
- *A user can watch the actual video of the livestream (and pause / unpause it), they can see the stream's chat in real time, they can send messages in the chat, they can see the streamer's channel info (description text, follower count, etc.), they can follow and unfollow the streamer, they can subscribe to and unsubscribe from the streamer (they have to pay to subscribe), they can see the current number of concurrent viewers on the stream, and they can see other recommended channels that they follow on the left navbar. Does that cover everything?*

**A:**\
Yes, but you can ignore the recommended channels on the left navbar. Let's focus purely on the functionality that's relevant to the livestream on the page.

### Question 2

**Q:**\
*For subscriptions, as far as I know, a user subscribes on a monthly basis for a flat monthly fee. Is this correct?*

**A:**\
There might be different tiers of subscriptions, but you can capture that in some SubscriptionInfo entity that you don't need to explicitly define.

### Question 3

**Q:**

- *A lot of the information on the page is very dynamic and warrants getting updated frequently and automatically, like follower count, concurrent viewer count, and obviously chat messages and the livestream itself.*\
- *I'm assuming that we should design the various API endpoints with this in mind; does that sound good?*

**A:**\
Let's make sure that the actual video and chat are updated in real time, as you would expect.\
Then, let's try to have the number of concurrent viewers be updated every so often (say, every 30 seconds); we don't want that number to be constantly changing, because that could be jarring, especially if the streamer has thousands of viewers tuning in and out of the stream.\
As for the follower count, we can let that be updated on page refresh.

### Question 4

*Q:* \
*To clarify, for following and subscribing, we do want to show the current user's follow / subscription status to the streamer, and we want to immediately reflect changes to it on the UI when the user clicks on the relevant "Follow" / "Subscribe" buttons, right?*

**A:**\
Yes, absolutely.\
If a user isn't following a streamer, they should see that state reflected on the page, and if they press the "Follow" button, they should see the updated state immediately.\
The same goes for subscribing. What we don't care about is updating the total follower count in real time; that's what can be done on page refresh.

### Question 5

**Q:**

- *Regarding the chat, I know that users can send custom Twitch emotes as well as Cheermotes, which are special animated emotes that are purchased with Bits, Twitch's virtual currency.*
- *Should we handle these different kinds of emotes in our messaging API?*
- *What about other chat-related functionality, like being banned from the chat and the presence of chat moderators?*

**A:**\
You should handle basic Twitch emotes that are available to all Twitch users, but you can disregard custom emotes that are only available to subscribers as well as Cheermotes.\
In fact, you can disregard the concept of Bits altogether for this design.\
You can also disregard chat moderators, but you should cover the banning feature.\
Specifically, if a user is banned from the chat, they can't send messages, but they need to somehow be alerted about this in the chat box; they shouldn't be allowed to even try sending messages.

### Question 6

**Q:**\
*Regarding the actual video, I'm not very familiar with how videos—especially live videos—work on the web at scale, but is it fair to assume that the Twitch backend will be able to continuously provide some VideoInfo entity that will contain the data needed to display the video on the UI?*

**A:**\
Yes, for the sake of this design, that's totally fine.\
Don't worry about the underlying complexity of displaying live video, like the shape of the data and how to display it exactly.

## Solution Walkthrough

### 1. Gathering Requirements

As with any API design interview question, the first thing that we want to do is to gather API requirements; we need to figure out what API we're building exactly.

We're designing every API endpoint that's interacted with when a user is on an individual Twitch streamer's channel page, watching their livestream.

**Specifically, we need to handle:**

- displaying the streamer's channel info (description text, follower count, etc.)
- following and unfollowing the streamer
- subscribing to and unsubscribing from the streamer
- seeing the live chat and sending messages; sending messages should only be allowable if the user isn't banned
- seeing the livestream and being able to pause / unpause it
- seeing the number of concurrent viewers of the stream, which should automatically be updated every 30 seconds or so

### 2. Coming Up With A Plan

It's important to organize ourselves and to lay out a clear plan regarding how we're going to tackle our design.\
What are the major, potentially contentious parts of our API? Why are we making certain design decisions?

Fortunately for us, the various functionalities that we have to support effectively lay out a step-by-step plan for us, so we'll simply follow that.

Of note, all of the API endpoints that we'll define will take in, by default, the caller's user-specific authentication token as an authorization header.\
This token will be used by the backend to identify which user is calling each API endpoint.

We'll also be passing a *`channelId`* as a parameter to all of the endpoints, which will be the unique username of the streamer in question.

### 3. Channel Info

This is the most straightforward piece of functionality on the page, since it only consists of displaying static data about the streamer.

The user will call the *GetChannelInfo* endpoint, which will return the relevant entity, *ChannelInfo*, to be displayed on the page.

**ChannelInfo:**

- `name`: *string*
- `description`: *string*
- `currentStreamTitle`: *string*
- `followerCount`: *int*

This entity might have more fields, but these are the most important ones.

```txt
GetChannelInfo(channelId: string)
  => ChannelInfo
```
