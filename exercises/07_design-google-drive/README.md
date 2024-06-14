# Design Google Drive

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
