# Design Google Drive

## Table of Content

- [Clarifying Questions](#clarifying-questions-to-ask)
- [Solution](#solution-walkthrough)

## Clarifying Questions To Ask

### Question 1

**Q:**\
*Are we just designing the storage aspect of Google Drive, or are we also designing some of the related products like Google Docs, Sheets, Slides, Drawings, etc.?*

**A:**\
We're just designing the core Google Drive product, which is indeed the storage product.\
In other words, users can create folders and upload files, which effectively stores them in the cloud.\
Also, for simplicity, we can refer to folders and files as "entities".

### Question 2

**Q:**

- *There are a lot of features on Google Drive, like shared company drives vs. personal drives, permissions on entities (ACLs), starred files, recently-accessed files, etc.*
- *Are we designing all of these features or just some of them?*

**A:**\
Let's keep things narrow and imagine that we're designing a personal Google Drive (so you can forget about shared company drives).\
In a personal Google Drive, users can store entities, and that's all that you should take care of.\
Ignore any feature that isn't core to the storage aspect of Google Drive; ignore things like starred files, recently-accessed files, etc.\
You can even ignore sharing entities for this design.

### Question 3

**Q:**\
*Since we're primarily concerned with storing entities, are we supporting all basic CRUD operations like creating, deleting, renaming, and moving entities?*

**A:**\
Yes, but to clarify, creating a file is actually uploading a file, folders have to be created (they can't be uploaded), and we also want to support downloading files.

### Question 4

**Q:**\
*Are we just designing the Google Drive web application, or are we also designing a desktop client for Google drive?*

**A:**\
We're just designing the functionality of the Google Drive web application.

### Question 5

**Q:**\
*Since we're not dealing with sharing entities, should we handle multiple users in a single folder at the same time, or can we assume that this will never happen?*

**A:**\
While we're not designing the sharing feature, let's still handle what would happen if multiple clients were in a single folder at the same time (two tabs from the same browser, for example).\
In this case, we would want changes made in that folder to be reflected to all clients within 10 seconds.\
But for the purpose of this question, let's not worry about conflicts or anything like that (i.e., assume that two clients won't make changes to the same file or folder at the same time).

### Question 6

**Q:** *How many people are we building this system for?*

**A:** This system should serve about a billion users and handle 15GB per user on average.

### Question 7

**Q:**\
*What kind of reliability or guarantees does this Google Drive service give to its users?*

**A:**\
First and foremost, data loss isn't tolerated at all; we need to make sure that once a file is uploaded or a folder is created, it won't disappear until the user deletes it.\
As for availability, we need this system to be highly available.

## Solution Walkthrough

### 1. Gathering System Requirements

As with any systems design interview question, the first thing that we want to do is to gather system requirements; we need to figure out what system we're building exactly.

We're designing the core user flow of the **Google Drive** web application.
This consists of storing two main entities: folders and files.\
More specifically, the system should allow users to create folders, upload and download files, and rename and move entities once they're stored.\
We don't have to worry about ACLs, sharing entities, or any other auxiliary Google Drive features.

We're going to be building this system at a very large scale, assuming 1 billion users, each with **15GB** of data stored in Google Drive on average.\
This adds up to approximately **15,000 PB** of data in total, without counting any metadata that we might store for each entity, like its name or its type.

We need this service to be **Highly Available** and also very redundant.\
No data that's successfully stored in Google Drive can ever be lost, even through catastrophic failures in an entire region of the world.
