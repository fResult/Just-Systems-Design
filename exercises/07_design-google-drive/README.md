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

### 2. Coming Up With A Plan

It's important to organize ourselves and to lay out a clear plan regarding how we're going to tackle our design.\
What are the major, distinguishable components of our how system?

**First of all, we'll need to support the following operations:**

- For **Files**
  - *UploadFile*
  - *DownloadFile*
  - *DeleteFile*
  - *RenameFile*
  - *MoveFile*
- For **Folders**
  - *CreateFolder*
  - *GetFolder*
  - *DeleteFolder*
  - *RenameFolder*
  - *MoveFolder*

**Secondly, we'll have to come up with a proper storage solution for two types of data:**

- **File Contents:** The contents of the files uploaded to Google Drive.\
  These are opaque bytes with no particular structure or format.
- **Entity Info:** The metadata for each entity.\
  This might include fields like **entityID, ownerID, lastModified, entityName, entityType**.\
  This list is non-exhaustive, and we'll most likely add to it later on.

Let's start by going over the storage solutions that we want to use, and then we'll go through what happens when each of the operations outlined above is performed.

### 3. Storing Entity Info

To store entity information, we can use key-value stores.\
Since we need high availability and data replication, we need to use something like Etcd, Zookeeper, or Google Cloud Spanner (as a K-V store) that gives us both of those guarantees as well as consistency (as opposed to DynamoDB, for instance, which would give us only eventual consistency).

Since we're going to be dealing with many gigabytes of entity information (given that we're serving a billion users), we'll need to shard this data across multiple clusters of these K-V stores.\
Sharding on entityID means that we'll lose the ability to perform batch operations, which these key-value stores give us out of the box and which we'll need when we move entities around (for instance, moving a file from one folder to another would involve editing the metadata of 3 entities; if they were located in 3 different shards that wouldn't be great).\
Instead, we can shard based on the **ownerID** of the entity, which means that we can edit the metadata of multiple entities atomically with a transaction, so long as the entities belong to the same user.

Given the traffic that this website needs to serve, we can have a layer of proxies for entity information, load balanced on a hash of the **ownerID**.\
The proxies could have some caching, as well as perform **ACL** checks when we eventually decide to support them.\
The proxies would live at the regional level, whereas the source-of-truth key-value stores would be accessed globally.
