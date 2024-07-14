# Design Slack

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

- *There are a lot of things that you can do on Slack.*
- *Primarily, you use Slack to communicate with people in one-on-one channels, private channels, or public channels, all within an organization.*
- *But you can also do a bunch of other things on Slack, like create and delete channels, change channel settings, change Slack settings, invite people to channels, etc..*
- *What exactly are we designing here?*

**A:**\
We're designing the core messaging functionality, which involves communicating in both one-on-one channels and group channels in an organization.\
You don't have to worry about channel settings and all of those extra functionalities.

### Question 2

**Q:**\
*Okay. Do you want me to take care of the concept of private channels at all?*

**A:**\
Let's just focus on users in a channel as far as access control is concerned; we can forget about the concept of a private channel.

### Question 3

**Q:**

- *Okay. And regarding communication, from my knowledge of Slack, when you load the web app or the desktop / mobile apps, you can obviously access all the messages of channels that you're in (including one-on-one channels), but you're also notified of channels that have unread messages for you and of the number of unread mentions that you have in each channel.*
- *Channels with unread messages are bold, if I remember correctly, and the number of unread mentions is simply visible next to channel names. Should we design our system to accommodate this?*

**A:**\
Yes, we should take care of this.\
And on that note, one thing we'll want to handle is cross-device synchronization.\
In other words, if you have both the Slack desktop app and the Slack mobile app open, and both apps are showing that one channel is unread, and you read that channel on one of the apps, the other app should immediately get updated and should mark the channel as read.\
You'll have to handle this.

### Question 4

**Q:**\
*Hmm, okay. Speaking of different applications, by the way, are we designing the various device / software apps, or just the backend systems that the frontends / clients communicate with?*

**A:**\
You'll only really focus on the backend systems for this question.

### Question 5

**Q:**

- *Okay. Also, there are a lot of different features in actual Slack messages.*
- *For example, adding custom emojis, pinning messages, saving messages, writing code snippets or text-blocks, etc..*
- *Do you want me to handle all of this?*

**A:**\
No, you can just treat messages as pure text for now.\
Of course, what you'll design will likely be extensible to different types of messages and will eventually be able to handle things like pinning or saving messages, but for this design, don't worry about that.

### Question 6

**Q:**

- *How many users do we expect to be building this for?*
- *And how large is the largest organization on slack?*
- *How many users does it have?*

**A:**\
Slack has about 10 to 20 million users, so let's go with 20 million.\
And as for organizations, let's say that the largest single Slack customer has 50,000 people in the same organization.\
We can also approximate that the largest channel will be of that same size if all of an organization's employees are in the same channel (the typical **#general** channel, for example).

### Question 7

**Q:**

- *Since this is a chat application, I'm assuming that low latency is one of our top priorities, and also, since this service impacts millions of users, I'm assuming that we should design with high availability in mind.*
- *Are these correct assumptions?*

**A:**\
Yes to both of those things, but for the sake of being a little more focused, don't worry about optimizing for availability.\
Let's focus primarily on latency and core functionality.

### Question 8

**Q:**\
**Okay. And are we building this for a global audience, or should we focus on a single region?**

**A:**\
Let's handle a single region for this question, but just like with availability, don't focus too much on this aspect of the design.

## Solution Walkthrough

### 7. System Diagram

![Slack System Diagram](./img/slack-system-diagram.svg)
