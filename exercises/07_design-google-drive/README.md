# Design Google Drive

*Many systems design questions are intentionally left very vague and are literally given in the form of `Design Foobar`.\
It's your job to ask clarifying questions to better understand the system that you have to build.*

*We've laid out some of these questions below; their answers should give you some guidance on the problem.
Before looking at them, we encourage you to take few minutes to think about what questions you'd ask in a real interview.*

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
As for availability, we need this system to be highly available (99.999%).

## Solution Walkthrough

### 1. Gathering System Requirements

As with any systems design interview question, the first thing that we want to do is to gather system requirements; we need to figure out what system we're building exactly.

- We're designing the core user flow of the **Google Drive** web application.
- The primary entities involved are **folders** and **files**.
- The system should enable users to **create folders**, **upload and download files**, and **rename** and **move these entities** post-storage.
- Features such as ACLs (Access Control List), sharing, and other auxiliary functionalities of Google Drive are not within the scope of this design.

- The design targets a massive scale, catering to 1 billion users, each storing an average of **15GB** of data on Google Drive.
- This equates to a total of about **15,000 PB** of data, excluding the additional metadata for each item, such as names or types.

- The system must offer **High Availability** (99.999%) and robust data redundancy.
- Ensuring no data loss even in the face of major regional disasters is a critical requirement.

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

- **File Contents:** The actual file contents, which are unstructured bytes.
- **Metadata:** Information about each entity, potentially including **`entityID`, `ownerID`, `lastModified`, `entityName`, `entityType`**, among others.\
  This list is non-exhaustive, and we'll most likely add to it later on.

The next steps, we will detail the storage solutions and the processes for each operation.

### 3. Storing Entity Info

For the storage of entity data, key-value databases are our choice.\
High availability and data replication are crucial for us, necessitating the use of technologies like Etcd, Zookeeper, or Google Cloud Spanner.\
These options offer the needed consistency and reliability, unlike DynamoDB which provides only eventual consistency.

Given our scale of serving a billion users, which translates to handling vast amounts of entity data, sharding this data across multiple clusters of these K-V stores becomes essential.\
Sharding by **`entityID`** would inhibit our batch operation capabilities, which these K-V stores give us out of the box, crucial for tasks like relocating entities (e.g., moving a file across folders would require updating three entities' metadata, a cumbersome task if they reside on different shards).\
A more efficient strategy involves sharding by **`ownerID`**, enabling atomic transactions for editing multiple entities' metadata, provided they belong to the same owner.

To efficiently manage the anticipated web traffic, a layer of proxy servers dedicated to entity data will be implemented.\
These proxies, balanced via a hash of the **`ownerID`**, will not only cache data but are also designed to enforce **ACL** checks upon future integration.\
Positioned at the regional level, these proxies serve as an intermediary, while the primary key-value stores remain globally accessible.

### 4. Storing File Data

For dealing with large file uploads and storage, breaking down data into smaller chunks, or blobs, is beneficial.\
We can reassemble these blobs to recreate the original file.\
During the upload process, **"blob splitters"** distribute the files across several servers.\
These servers split the files into manageable blobs for storage in a global blob-storage system like **GCS** or **S3**.\
Since our project aligns with **Google Drive**, GCS over S3 seems more appropriate.

A critical aspect to consider is ensuring data redundancy to prevent data loss.\
We aim to store data across 3 distinct ***GCS* buckets**.\
We consider the operation successful if at least 2 of these buckets successfully store the data.\
This strategy ensures data redundancy and maintains availability.\
In the background, we can have an extra service in charge of further replicating the data to other buckets in an async manner.\
We will choose these 3 buckets from different availability zones to protect against data loss from natural disasters or significant power failures.

To avoid storing duplicate blobs, we use a naming convention based on the content's hash.\
This method, known as **[Content-Addressable Storage](https://en.wikipedia.org/wiki/Content-addressable_storage)**, that all stored blobs are immutable.\
Thus, any file modification results in the creation and storage of new blobs with names derived from hashing their updated content.

This approach to immutability significantly simplifies the introduction of a caching layer between the *blob splitters* and the storage buckets.\
It eliminates concerns about cache coherence with the main source of truth, as any modification generates a completely different blob.

### 5. Entity Info Structure

To manage metadata for **files** and **folders** efficiently, we use a unified structure.\
We distinguish between them with specific flags and fields.\
***Folders*** have an **`is_folder`** flag set to `true` and contain a `children_ids` list.\
This list references the contents' entity information.\
***Files*** on the other hand, have the **`is_folder`** flag set to `false`.\
It also has a **`blobs`** field that lists the IDs of the blobs making up the file's data.\
Both entity types have a **`parent_id`** field.\
This field links them to their parent folder's entity information, making file and folder navigation and reorganization efficient.

- **File Info**

    ```txt
    {
      blobs: ['«blob_content_hash_0»', '«blob_content_hash_1»'],
      id: '«some_unique_entity_id»',
      is_folder: false,
      name: '«some_file_name»',
      owner_id: '«id_of_owner»',
      parent_id: '«id_of_parent»',
    }
    ```

- **Folder Info**

    ```txt
    {
      children_ids: ['«id_of_child_0»', '«id_of_child_1»'],
      id: '«some_unique_entity_id»',
      is_folder: true,
      name: '«some_folder_name»',
      owner_id: '«id_of_owner»',
      parent_id: '«id_of_parent»',
    }
    ```

### 6. Garbage Collection

Any change to existing files will create new blobs and de-reference the old ones.\
Similarly, deleting files will also de-reference the files' blobs.\
These actions lead to the accumulation of **orphaned** blobs that consume storage unnecessarily.\
To address this, a **Garbage Collection** mechanism is essential.

This mechanism involves a **Garbage Collection** service that monitors the entity-info K-V stores, and keeps the counts of the number of times every blob is referenced.\
These counts may be stored in a SQL database.

The reference count for each blob is updated with file uploads and deletions.\
Once a blob's reference count drops to zero, indicating no active references, the **Garbage Collector** marks it as orphaned within the blob storage systems.\
These *orphaned* blobs are then scheduled for safe deletion after some time if they haven't been accessed.

### 7. End To End API Flow

With the system fully designed, let's explore the sequence of operations when a user performs what we listed above.

*CreateFolder*, is simple.\
Given that folders do not require blob storage, this process solely involves the recording of metadata within our key-value storage system.

*UploadFile*, works in 2 steps.\
Initially, to store the blobs that make up the file in the blob storage.\
Following this, we can create a **file-info** object, store these blobs-content hashes in its **blobs** field, and then write this metadata to our K-V storage.

*DownloadFile* begins with fetching the file's metadata from our K-V stores using the file's ID.\
This metadata includes the hashes for all blobs that make up the file's content.\
These hashes enable the fetching of blobs from blob storage.\
Then, we can collect these blobs to reconstruct the original file and save it on the local disk.

Operations such as *Get*, *Rename*, *Move*, and *Delete* involve atomic changes to the metadata for one or more entities within our K-V storage.\
These operations use the transaction guarantees provided by the system.

### 8. System Diagram

![Google Drive System Diagram](./img/google-drive-system-diagram.svg)
