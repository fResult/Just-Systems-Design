# Design The Reddit API

Design an API for Reddit subreddits given the following information.

**The API includes these 2 entities:**

- **User** | `userId`: *string*, ...
- **SubReddit** | `subredditId`: string, ...

Both of these entities likely have other fields, but for the purpose of this question, those other fields aren't needed.

Your API should support the basic functionality of a subreddit on Reddit.

Many systems design questions are intentionally left very vague and are literally given in the form of `Design Foobar`.\
It's your job to ask clarifying questions to better understand the system that you have to build.

We've laid out some of these questions below; their answers should give you some guidance on the problem.\
Before looking at them, we encourage you to take few minutes to think about what questions you'd ask in a real interview.

## Table of Content

- [Clarifying Questions](#clarifying-questions-to-ask)
- [Solution](#solution-walkthrough)

## Clarifying Questions To Ask

### Question 1

**Q:**\
*To make sure that we're on the same page: a subreddit is an online community where users can write posts, comment on posts, upvote / downvote posts, share posts, report posts, become moderators, etc. — is this correct, and are we designing all of this functionality?*

**A:**\
Yes, that's correct, but let's keep things simple and focus only on writing posts, writing comments, and upvoting / downvoting.\
You can forget about all of the auxiliary features like sharing, reporting, moderating, etc..

### Question 2

**Q:** *So we're really focusing on the very narrow but core aspect of a subreddit: writing posts, commenting on them, and voting on them.*

**A:** Yes.

### Question 3

**Q:**\
*I'm thinking of defining the schemas for the main entities that live within a subreddit and then defining their CRUD operations — methods like Create/Get/Edit/Delete/List\<Entity\> — is this in line with what you're asking me to do?*

**A:**\
Yes, and make sure to include method signatures — what each method takes in and what each method returns.\
Also include the types of each argument.

### Question 4

**Q:**\
*The entities that I've identified are Posts, Comments, and Votes (upvotes and downvotes).*\
*Does this seem accurate?*

**A:**\
Yes. These are the 3 core entities that you should be defining and whose APIs you're designing.

### Question 5

**Q:**\
*Is there any other functionality of a subreddit that we should design?*

**A:**\
Yes, you should also allow people to award posts.\
Awards are a special currency that can be bought for real money and gifted to comments and posts.\
Users can buy some quantity of awards in exchange for real money, and they can give awards to posts and comments (one award per post / comment).

## Solution Walkthrough

### 1. Gathering Requirements

As with any API design interview question, the first thing that we want to do is to gather API requirements; we need to figure out what API we're building exactly.

**From the answers we were given to our [clarifying questions](#clarifying-questions-to-ask):**

- We're designing the core user flow of the **subreddit** functionality on Reddit.
- Users can write posts on subreddits, comment on posts, and upvote/downvote posts and comments.
- We will define three primary entities: *Posts*, *Comments*, and *Votes*, along with their respective CRUD operations.
- We will also design an API for buying and giving awards on Reddit.

### 2. Coming Up With A Plan

It's important to organize ourselves and to lay out a clear plan regarding how we're going to tackle our design.\
We should identify major, potentially contentious parts of our API and justify our design decisions.

One key decision is whether to store votes directly on *Comments* and *Posts* (using *EditComment* and *EditPost*) or as separate to **Votes** entity (using *EditVote*).\
Storing them separately simplifies editing or removing votes, so we'll choose this approach.

We'll start with Posts, then move to Comments and Votes, as they share some common structure.

### 3. Posts

Posts will include an id, the id of their **creator** (`creatorId`), the id of the **subreddit** (`subredditId`) they belong to, a `title`, a `description`, and a timestamp for creation (`createdAt`).\
They will also have counts for **votes** (`votesCount`), comments, and **awards** (`awardsCount`), updated by backend services.\
Additionally, Posts will have optional **`deletedAt`** and **`currentVote`** fields for displaying deleted posts and the user's vote status, respectively.

SubReddits display posts that have been removed with a special message; we can use the **`deletedAt`** field to accomplish this.\
The **`currentVote`** field will be used to display to a user whether or not they've cast a vote on a post.\
This field will likely be populated by the backend upon fetching Posts or when casting Votes.

#### Post Fields

- `postId`: *string*
- `creatorId`: *string*
- `subredditId`: *string*
- `title`: *string*
- `description`: *string*
- `createdAt`: *timestamp*
- `votesCount`: *int*
- `commentsCount`: *int*
- `awardsCount`: *int*
- `deletedAt`: *timestamp?*
- `currentVote`: *enum UP/DOWN?*

Our *CreatePost*, *EditPost*, *GetPost*, and *DeletePost* methods will be very straightforward.\
One thing to note, however, is that all of these operations will take in the **`userId`** of the user performing them; this id, which will likely contain authentication information, will be used for ACL (Access Control List) checks to see if the user performing the operations has the necessary permission(s) to do so.

#### CRUD Operations - Post

```txt
CreatePost(userId: string, subredditId: string, title: string, description: string)
  => Post

EditPost(userId: string, postId: string, title: string, description: string)
  => Post

GetPost(userId: string, postId: string)
  => Post

DeletePost(userId: string, postId: string)
  => Post
```

Since we can expect to have hundreds, if not thousands, of posts on a given subreddit, our *ListPosts* method will have to be paginated.\
The method will take in optional **`pageSize`** and **`pageToken`** parameters and will return a list of posts of at most length **`pageSize`** as well as a **`nextPageToken`**—the token to be fed to the method to retrieve the next page of posts.

```txt
ListPosts(userId: string, subredditId: string, pageSize?: int, pageToken?: string)
  => (Post[], nextPageToken?)
```

### 4. Comments

Comments will be structured similarly to Posts but will also include an optional `parentId` for replies, enabling the UI to display comment trees properly.

**Key Differences from Posts:**

- Comments have a **`postId`** to indicate which post they belong to.
- They can have a **`parentId`**  to indicate if they are replying to another comment, and to allow Reddit UI to build comment trees (*indenting*).

#### Comment Fields

- `commentId`: *string*
- `creatorId`: *string*
- `postId`: *string*
- `createdAt`: *timestamp*
- `content`: *string*
- `votesCount`: *int*
- `awardsCount`: *int*
- `parentId`: *string?*
- `deletedAt`: *timestamp?*
- `currentVote`: *enum UP/DOWN?*

#### CRUD operations - Comment

```txt
CreateComment(userId: string, postId: string, content: string, parentId?: string)
  => Comment

EditComment(userId: string, commentId: string, content: string)
  => Comment

GetComment(userId: string, commentId: string)
  => Comment

DeleteComment(userId: string, commentId: string)
  => Comment

ListComments(userId: string, postId: string, pageSize?: int, pageToken?: string)
  => (Comment[], nextPageToken?)
```

The *CreateComment* method includes an optional **`parentId`** parameter for replies, while *ListComments* is paginated to handle potentially large numbers of comments.

### 5. Votes

Votes will have an id, the id of their **creator** (`creatorId`), the id of their **target** (`targetId` which is **post** or **comment**), and a **`type`** (enum UP/DOWN).\
A **`createdAt`** timestamp also be included.

#### Vote Fields

- `voteId`: *string*
- `creatorId`: *string*
- `targetId`: *string*
- `type`: *enum UP/DOWN*
- `createdAt`: *timestamp*

Since it doesn't seem like getting a single vote or listing votes would be very useful for our feature, we'll skip designing those endpoints (though they would be straightforward).

#### CRUD Operations - Vote

**Our *CreateVote*, *EditVote*, and *DeleteVote* methods will be simple and useful:**

- The *CreateVote* method will be used when a user casts a new vote on a post or comment
- The *EditVote* method will be used when a user has already cast a vote on a post or comment and casts the opposite vote on that same post or comment
- The *DeleteVote* method will be used when a user has already cast a vote on a post or comment and just removes that same vote

```txt
CreateVote(userId: string, targetId: string, type: enum UP/DOWN)
  => Vote

EditVote(userId: string, voteId: string, type: enum UP/DOWN)
  => Vote

DeleteVote(userId: string, voteId: string)
  => Vote
```

### 6. Awards

#### CRUD Operations - Award

**We will define endpoints for **buying** and **giving** awards:**

- The *BuyAwards* endpoint will take a **`paymentToken`** and **`quantity`**
- While the *GiveAward* endpoint will take a **`targetId`** (which means to *post* or *comment* that the user will give to).

```txt
BuyAwards(userId: string, paymentToken: string, quantity: int)

GiveAward(userId: string, targetId: string)
```

### 7. Diagram

```mermaid
erDiagram
  users {
    string id PK
    string username
    string email
    string password
    timestamp createdAt
  }

  subreddits {
    string id PK
    string name
    string description
    timestamp createdAt
  }

  posts {
    string id PK
    string creatorId FK
    string subredditId FK
    string title
    string description
    timestamp createdAt
    int votesCount
    int commentsCount
    int awardsCount
    timestamp deletedAt
    enum currentVote
  }

  comments {
    string id PK
    string creatorId FK
    string postId FK
    string content
    timestamp createdAt
    int votesCount
    int awardsCount
    string parentId FK
    timestamp deletedAt
    enum currentVote
  }

  votes {
    string id PK
    string creatorId FK
    string targetId FK
    enum type
    timestamp createdAt
  }

  awards {
    string id PK
    string userId FK
    string targetId FK
    timestamp createdAt
  }

  users ||--o{ posts : creates
  users ||--o{ comments : writes
  users ||--o{ votes : casts
  users ||--o{ awards : gives

  subreddits ||--o{ posts : contains

  posts ||--o{ comments : receives
  posts ||--o{ votes : receives
  posts ||--o{ awards : receives

  comments ||--o{ comments : replies
  comments ||--o{ votes : receives
  comments ||--o{ awards : receives
```
