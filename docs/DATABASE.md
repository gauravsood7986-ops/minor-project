# CampusGig Database Schema & Architecture

CampusGig uses **MongoDB** with **Mongoose ODM**. Application records are persisted in MongoDB collections with appropriate indexes, schema validations, and referential integrity checks.

---

## Collections Overview

```
User (users)
 ├── Owns 1..* Service
 ├── Sends 0..* Inquiry
 └── Receives 0..* Inquiry

Service (services)
 ├── Belongs to 1 User (owner)
 └── Receives 0..* Inquiry & Review

Inquiry (inquiries)
 ├── References 1 Service
 ├── References 1 Sender (User)
 └── References 1 Recipient (User)

Review (reviews)
 ├── References 1 Reviewer (User)
 ├── References 1 Recipient (User)
 └── References 1 Service

Upload (uploads)
 └── Belongs to 1 Uploader (User)
```

---

## 1. User Schema (`users`)

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique user identifier |
| `name` | String | Required, Trim, Max 100 | Full name |
| `email` | String | Required, Unique, Lowercase, Trim | Normalized email address |
| `username` | String | Required, Unique, Lowercase, Trim | Unique slug handle |
| `password` | String | Required, Select: false | bcrypt-hashed password (salt 12) |
| `role` | String | Enum: ['user', 'admin'], default 'user' | Access control role |
| `college` | String | Optional, Trim | University or college name |
| `bio` | String | Optional, Max 1000 | Freelancer biography |
| `skills` | [String] | Default: [] | List of tagged competencies |
| `languages`| [String] | Default: [] | Spoken languages |
| `avatar` | Object | `{ url, public_id }` | Profile picture reference |
| `socialLinks` | Object | `{ github, linkedin, website }` | External portfolio links |
| `isEmailVerified`| Boolean | Default: false | Email verification status |
| `emailVerifyToken`| String | Select: false | SHA-256 hashed verification token |
| `resetPasswordToken`| String | Select: false | SHA-256 hashed reset token |
| `resetPasswordExpires`| Date | Select: false | Expiration timestamp |
| `createdAt` | Date | Timestamp | Record creation |
| `updatedAt` | Date | Timestamp | Last modification |

**Indexes**:
- `email`: Unique index
- `username`: Unique index

---

## 2. Service Schema (`services`)

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique service identifier |
| `owner` | ObjectId | Ref: 'User', Required, Index | Freelancer who created the service |
| `title` | String | Required, Min 5, Max 120 | Service headline |
| `slug` | String | Unique Index | URL-friendly slug |
| `description` | String | Required, Min 20, Max 5000 | In-depth description |
| `category` | String | Required, Enum, Index | Categorical classification |
| `price` | Number | Required, Min 1, Max 10000 | Price in currency |
| `currency` | String | Default: 'USD' | Currency code |
| `deliveryTime` | Number | Required, Min 1, Max 90 | Delivery duration in days |
| `tags` | [String] | Index | Search tags |
| `portfolioAssets` | [Object] | Array of `{ url, public_id, name }` | Sample portfolio assets |
| `portfolioUrl` | String | Optional | External portfolio URL |
| `revisionPolicy` | String | Max 500 | Revision terms |
| `status` | String | Enum: ['draft', 'published', 'paused', 'archived'] | Visibility status |
| `views` | Number | Default: 0 | Listing view counter |
| `createdAt` | Date | Timestamp | Record creation |
| `updatedAt` | Date | Timestamp | Last modification |

**Indexes**:
- Compound: `{ status: 1, category: 1, price: 1 }`
- Compound: `{ status: 1, createdAt: -1 }`
- Compound Text Index: `{ title: 'text', description: 'text', tags: 'text' }`

---

## 3. Inquiry Schema (`inquiries`)

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique inquiry identifier |
| `service` | ObjectId | Ref: 'Service', Required, Index | Target service |
| `sender` | ObjectId | Ref: 'User', Required, Index | Inquiring client |
| `recipient` | ObjectId | Ref: 'User', Required, Index | Freelancer owner |
| `message` | String | Required, Min 5, Max 2000 | Client message text |
| `status` | String | Enum: ['pending', 'read', 'replied', 'closed'] | Current workflow state |
| `createdAt` | Date | Timestamp | Record creation |

**Indexes**:
- Compound: `{ recipient: 1, createdAt: -1 }`
- Compound: `{ sender: 1, createdAt: -1 }`
- Compound: `{ service: 1, sender: 1 }`

---

## 4. Review Schema (`reviews`)

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique review identifier |
| `reviewer` | ObjectId | Ref: 'User', Required | Client author |
| `recipient` | ObjectId | Ref: 'User', Required | Reviewed freelancer |
| `service` | ObjectId | Ref: 'Service', Required | Reviewed service |
| `rating` | Number | Required, Min 1, Max 5 | 1-5 star rating |
| `comment` | String | Required, Min 5, Max 1000 | Feedback text |
| `createdAt` | Date | Timestamp | Record creation |

**Indexes**:
- Compound Unique: `{ reviewer: 1, service: 1 }` (Prevents duplicate reviews)
- Compound: `{ recipient: 1, createdAt: -1 }`
