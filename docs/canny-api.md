# Canny API Documentation

## Overview

Canny's API lets you access and modify your Canny data programmatically. We also support webhooks, where we notify your server of events as they happen.

The API expects:
- Request method: POST
- Body format: JSON
- Content-Type header: "application/json"

This API enables you to seamlessly integrate Canny with your existing services.

## Authentication

API requests must be authenticated by including your secret API key. You can find your secret API key in your company settings. This key is secret! Store it on your server and don't share it.

You can include your secret API key in a request by adding it as a POST parameter with key `apiKey`.

Example request:
```bash
$ curl https://canny.io/api/v1/boards/list \
    -d apiKey=YOUR_API_KEY
```

## Categories

Posts can be assigned categories. Each category is for a specific board, not company-wide. The API allows you to list and retrieve categories. You can also change categories of posts.

### The category object

#### Attributes

| Field | Type | Description |
|-------|------|-------------|
| id | string | A unique identifier for the category. |
| board | Board object | The board this category is associated with. |
| created | string | Time at which the category was created, in ISO 8601 format. |
| name | string | The name of the category. |
| parentID | string | The id of the parent category. If this category is not a sub category, this field will be null. |
| postCount | number | The number of posts that have been assigned this category. |
| url | string | The URL to the board, filtered to just posts that have been assigned this category. |

Example category object:
```json
{
  "id": "553c3ef8b8cdcd1501ba12bb",
  "board": {
    "created": "2025-01-01T10:53:26.333Z",
    "id": "553c3ef8b8cdcd1501ba4400",
    "name": "Feature Requests",
    "postCount": 99,
    "url": "https://your-company.canny.io/admin/board/feature-requests"
  },
  "created": "2025-01-01T10:53:26.333Z",
  "name": "Example Category Name",
  "parentID": "552c3ef8b8cdcd1501ba12bb",
  "postCount": 12,
  "url": "https://your-company.canny.io/admin/board/feature-requests?category=example-category-name"
}
```

### List categories

Returns a list of categories. Include parameters to specify board and pagination. Sorted by newest.

**Arguments**

| Field | Type | Description |
|-------|------|-------------|
| apiKey | string | Your secret API key. |
| boardID | string (optional) | The id of the board you'd like to fetch categories for. |
| limit | number (optional) | The number of categories you'd like to fetch. Defaults to 10 if not specified. Max of 10000. |
| skip | number (optional) | The number of categories you'd like to skip before starting to fetch. Defaults to 0 if not specified. |

**Returns**

A dictionary with a "categories" property that contains an array of tag objects. There's also a "hasMore" property that specifies whether this query returns more categories than the limit.

**Endpoint**
```
https://canny.io/api/v1/categories/list
```

### Create category

Creates a new category.

**Arguments**

| Field | Type | Description |
|-------|------|-------------|
| apiKey | string | Your secret API key. |
| boardID | string | The id of the board you'd like to create the category for. |
| name | string | The name of the category. Must be between 1 and 30 characters long. |
| parentID | string (optional) | The id of the parent category. |
| subscribeAdmins | boolean | Whether or not the admins will be subscribed to the category. |

## Comments

Users and admins can leave comments on posts. Therefore, comment objects are always associated with a post. The API allows you to fetch a specific comment, or a list of comments for a post.

### The comment object

#### Attributes

| Field | Type | Description |
|-------|------|-------------|
| id | string | A unique identifier for the comment. |
| author | User object | The user who created the comment. |
| board | Board object | The board the comment is associated with. |
| created | string | Time at which the comment was created, in ISO 8601 format. |
| imageURLs | array | An array of the URLs of the images associated with this comment. |
| internal | boolean | Whether or not the comment is an internal comment. |
| likeCount | number | The number of likes a comment has received. |
| mentions | array | An array of user objects who are mentioned in the comment. |
| parentID | string | The id of the comment that this comment is a reply to. If this comment is not a reply, this field will be null. |
| post | Post object | The post the comment is associated with. |
| private | boolean | If the comment is private from other users, only applies if the "Allow end-users to see each others' comments" setting is disabled. |
| value | string | The text value of this comment. |

### List comments

Returns a list of comments. Include parameters to specify post, board, and pagination. Sorted by newest.

**Arguments**

| Field | Type | Description |
|-------|------|-------------|
| apiKey | string | Your secret API key. |
| authorID | string (optional) | The id of the author you'd like to fetch comments for. |
| boardID | string (optional) | The id of the board you'd like to fetch comments for. |
| companyID | string (optional) | If specified, will only fetch posts created by users linked to the company with this custom identifier. |
| limit | number (optional) | The number of comments you'd like to fetch. Defaults to 10 if not specified. |
| postID | string (optional) | The id of the post you'd like to fetch comments for. |
| skip | number (optional) | The number of comments you'd like to skip before starting to fetch. Defaults to 0 if not specified. |

### Create comment

Creates a new comment.

**Arguments**

| Field | Type | Description |
|-------|------|-------------|
| apiKey | string | Your secret API key. |
| authorID | string | The unique identifier of the comment's author. |
| postID | string | The unique identifier of the comment's post. |
| value | string | The comment value. Optional if imageURLs are provided. Must be under 2500 characters. |
| imageURLs | array (optional) | An array of the URLs of comment's images. |
| internal | boolean (optional) | Whether this comment is only available for internal usage. Default is false. |
| parentID | string (optional) | The unique identifier of the comment's parent, if this comment is a reply. |
| shouldNotifyVoters | boolean (optional) | Whether this comment should be allowed to trigger email notifications. Default is false. |

## Posts

A post is an object that represents an idea posted to a board. They are always associated with a user and a board. Users can vote on them. The API allows you to fetch a specific post, or a list of posts for a board.

### The post object

#### Attributes

| Field | Type | Description |
|-------|------|-------------|
| id | string | A unique identifier for the post. |
| author | User object | The user who authored the post. If the author's account has been deleted, this field will be null. |
| board | Board object | The board this post is associated with. |
| category | Category object | The category this post is assigned to, if any. |
| commentCount | number | The number of non-deleted comments associated with this post. |
| created | string | Time at which the post was created, in ISO 8601 format. |
| details | string | Any details the user included in the post. |
| eta | string | The month and year the post is estimated to be delivered. |
| imageURLs | array | An array of the URLs of the images associated with this post. |
| score | number | The number of votes that have been cast on this post. |
| status | string | The post's status: "open", "under review", "planned", "in progress", "complete", "closed". |
| tags | array | The list of tag objects associated with this post. |
| title | string | A brief title describing the post. |
| url | string | The URL to the post's page. |

### List posts

Returns a list of posts. Include parameters to specify board, pagination, filtering, and sorting.

**Arguments**

| Field | Type | Description |
|-------|------|-------------|
| apiKey | string | Your secret API key. |
| boardID | string (optional) | The id of the board you'd like to fetch posts for. |
| authorID | string (optional) | If specified, will only fetch posts by the author with this id. |
| companyID | string (optional) | If specified, will only fetch posts created by users linked to the company with this custom identifier. |
| tagIDs | array (optional) | If specified, will only fetch posts tagged with at least one of the tags in the array. |
| limit | number (optional) | The number of posts you'd like to fetch. Defaults to 10 if not specified. |
| search | string (optional) | If specified, will only fetch posts that match your search query. |
| skip | number (optional) | The number of posts you'd like to skip before starting to fetch. |
| sort | string (optional) | Options: "newest", "oldest", "relevance", "score", "statusChanged", "trending". |
| status | string (optional) | A comma separated list of statuses to fetch. |

### Create post

Creates a new post.

**Arguments**

| Field | Type | Description |
|-------|------|-------------|
| apiKey | string | Your secret API key. |
| authorID | string | The unique identifier of the post's author. |
| boardID | string | The unique identifier of the post's board. |
| title | string | The post title. |
| details | string | The post details. |
| categoryID | string (optional) | The unique identifier of the post's category. |
| imageURLs | array (optional) | An array of the URLs of post's images. |
| eta | string (optional) | Estimated completion date (MM/YYYY format). |

## Tags

Posts can be assigned multiple tags. Each tag is for a specific board, not company-wide.

### The tag object

#### Attributes

| Field | Type | Description |
|-------|------|-------------|
| id | string | A unique identifier for the tag. |
| board | Board object | The board this tag is associated with. |
| created | string | Time at which the tag was created, in ISO 8601 format. |
| name | string | The name of the tag. |
| postCount | number | The number of posts that have been assigned this tag. |
| url | string | The URL to the board, filtered to just posts that have been assigned this tag. |

### Create tag

Creates a new tag.

**Arguments**

| Field | Type | Description |
|-------|------|-------------|
| apiKey | string | Your secret API key. |
| boardID | string | The unique identifier of the board the tag should be created for. |
| name | string | The name of the tag. Must be between 1 and 30 characters long. |

## Users

Users can create posts, votes, and comments. Admins also have user accounts.

### The user object

#### Attributes

| Field | Type | Description |
|-------|------|-------------|
| id | string | A unique identifier for the user. |
| created | string | Time at which the user was created, in ISO 8601 format. |
| email | string | The user's email. |
| isAdmin | boolean | Whether or not the user is a Canny admin. |
| name | string | The user's name. |
| url | string | The URL of the user's profile. |
| userID | string | The user's unique identifier in your application. |

### Create or update user

Finds the id for a user. If the user does not exist, one is created, and its id is returned.

**Arguments**

| Field | Type | Description |
|-------|------|-------------|
| apiKey | string | Your secret API key. |
| email | string (optional) | The user's email. |
| name | string | The user's name. Must be between 1 and 50 characters. |
| userID | string | The user's unique identifier in your application. |
| avatarURL | string (optional) | The URL pointing to the user's avatar image. |
| created | date (optional) | The date the user was created in your system. |

## Votes

Users can vote on posts. Admins can also vote on behalf of users.

### The vote object

#### Attributes

| Field | Type | Description |
|-------|------|-------------|
| id | string | A unique identifier for the vote. |
| board | Board object | The board this vote is associated with. |
| created | string | Time at which the vote was first cast, in ISO 8601 format. |
| post | Post object | The post this vote is associated with. |
| voter | User object | The user this post is associated with. |

### Create vote

Creates a new vote.

**Arguments**

| Field | Type | Description |
|-------|------|-------------|
| apiKey | string | Your secret API key. |
| postID | string | The unique identifier of the post to vote on. |
| voterID | string | The unique identifier of the voter. |
| byID | string (optional) | The unique identifier of the admin voting on behalf of the voter. |

## Webhooks

By setting up webhooks, your server will be notified of Canny events as they happen.

### The event object

#### Attributes

| Field | Type | Description |
|-------|------|-------------|
| created | string | Time at which the event was created, in ISO 8601 format. |
| object | object | The object the event is about. |
| objectType | string | The type of object included in the event. |
| type | string | The type of event. |

### Event types

| Event | Description |
|-------|-------------|
| post.created | Occurs when a new post is created. |
| post.deleted | Occurs when a post is deleted. |
| post.status_changed | Occurs when a post's status is changed. |
| comment.created | Occurs when a new comment is created. |
| comment.deleted | Occurs when a comment is deleted. |
| vote.created | Occurs when a user votes on a post. |
| vote.deleted | Occurs when a user unvotes on a post. |

### Webhook signatures

Canny signs all webhooks it sends. Each request includes these headers:

| Header | Description |
|--------|-------------|
| canny-timestamp | The number of milliseconds since the UNIX epoch. |
| canny-nonce | A random string, unique per request. |
| canny-signature | An HMAC (SHA-256) signature of the nonce, using your team's API key, encoded in Base64. |

Example verification function:
```javascript
import crypto from 'crypto';

function verify(request) {
  const {
    'canny-nonce': nonce,
    'canny-signature': signature
  } = request.headers;

  const APIKey = 'YOUR_API_KEY';

  const calculated = crypto
    .createHmac('sha256', APIKey)
    .update(nonce)
    .digest('base64');

  return signature === calculated;
}
```
