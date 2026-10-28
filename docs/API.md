# CampusGig REST API Specification

The CampusGig REST API follows standard RESTful conventions, returning JSON responses with unified payload structures.

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://<api-domain>/api`

## Standard Response Format

### Success (2xx)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Failure (4xx, 5xx)
```json
{
  "success": false,
  "message": "A human-readable error description",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email address"
    }
  ]
}
```

---

## 1. System & Health
### `GET /api/health`
Checks server and MongoDB database health.
- **Access**: Public
- **Response**:
```json
{
  "status": "ok",
  "service": "campusgig-api",
  "timestamp": "2026-10-26T10:00:00.000Z",
  "database": "connected"
}
```

---

## 2. Authentication & Session
### `GET /api/auth/csrf`
Acquires a CSRF token and sets the `campusgig_csrf` cookie.
- **Access**: Public

### `POST /api/auth/register`
Creates a new student / client account.
- **Access**: Public (Rate-limited)
- **Body**:
```json
{
  "name": "Alex Johnson",
  "email": "alex@campus.edu",
  "username": "alexj",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "college": "State University"
}
```
- **Response**: Sets HttpOnly `campusgig_session` cookie and returns user object.

### `POST /api/auth/login`
Authenticates existing account.
- **Access**: Public (Rate-limited)
- **Body**:
```json
{
  "email": "alex@campus.edu",
  "password": "Password123!"
}
```
- **Response**: Sets HttpOnly cookie.

### `POST /api/auth/logout`
Clears session cookie.
- **Access**: Authenticated

### `GET /api/auth/me`
Retrieves current authenticated user session.
- **Access**: Authenticated

### `POST /api/auth/forgot-password`
Generates password reset token and dispatches email.
- **Access**: Public (Rate-limited)

### `POST /api/auth/reset-password`
Resets password with valid token.
- **Access**: Public (Rate-limited)

---

## 3. Services Marketplace
### `GET /api/services`
Retrieves published service listings with search, category filtering, price filtering, sorting, and pagination.
- **Access**: Public
- **Query Parameters**:
  - `search`: Keyword string (matches title, description, tags)
  - `category`: Category identifier (`tutoring`, `programming`, `graphic_design`, etc.)
  - `minPrice`: Minimum price in USD
  - `maxPrice`: Maximum price in USD
  - `sort`: `newest`, `oldest`, `price_asc`, `price_desc`
  - `page`: Integer page number (default 1)
  - `limit`: Number of results per page (default 12)

### `GET /api/services/:id`
Retrieves single service listing by MongoDB ObjectId. Increments view counter.
- **Access**: Public (Unpublished services visible only to owner/admin)

### `POST /api/services`
Publishes a new freelance service.
- **Access**: Authenticated
- **Body**:
```json
{
  "title": "Python Data Structures & Algorithm Tutoring",
  "description": "Comprehensive tutoring for university CS courses...",
  "category": "programming",
  "price": 30,
  "currency": "USD",
  "deliveryTime": 2,
  "tags": ["python", "algorithms", "data-structures"],
  "portfolioAssets": [],
  "portfolioUrl": "https://github.com/...",
  "status": "published"
}
```

### `PATCH /api/services/:id`
Updates existing service listing.
- **Access**: Authenticated (Owner or Admin only)

### `DELETE /api/services/:id`
Permanently deletes service listing.
- **Access**: Authenticated (Owner or Admin only)

### `GET /api/services/mine`
Retrieves all services owned by current authenticated user (including drafts and paused).
- **Access**: Authenticated

### `PATCH /api/services/:id/status`
Toggles status (`published`, `draft`, `paused`, `archived`).
- **Access**: Authenticated (Owner or Admin only)

---

## 4. Inquiries & Client Communication
### `POST /api/inquiries`
Submits an inquiry to a service listing.
- **Access**: Authenticated (Owner cannot inquire on own service)
- **Body**:
```json
{
  "serviceId": "653b...",
  "message": "Hi, are you available for a 2-hour tutoring session this weekend?"
}
```

### `GET /api/inquiries/received`
Retrieves inquiries addressed to the authenticated user.
- **Access**: Authenticated

### `GET /api/inquiries/sent`
Retrieves inquiries sent by the authenticated user.
- **Access**: Authenticated

### `GET /api/inquiries/:id`
Retrieves specific inquiry details.
- **Access**: Authenticated (Sender, Recipient, or Admin only)

### `PATCH /api/inquiries/:id/status`
Updates inquiry status (`pending`, `read`, `replied`, `closed`).
- **Access**: Authenticated (Sender, Recipient, or Admin only)

---

## 5. Freelancer Profiles
### `GET /api/profiles/:username`
Retrieves public profile, published services, and review statistics.
- **Access**: Public

### `PATCH /api/profiles/me`
Updates user's own profile (bio, college, skills, languages, avatar, links).
- **Access**: Authenticated

---

## 6. Uploads
### `POST /api/uploads`
Uploads sample portfolio asset (Image or PDF up to 5MB).
- **Access**: Authenticated (Rate-limited)
- **Form Data**: `file` (multipart/form-data)

### `DELETE /api/uploads/:id`
Removes an uploaded asset.
- **Access**: Authenticated (Uploader or Admin only)

---

## 7. Reviews
### `POST /api/reviews`
Submits a review for a service.
- **Access**: Authenticated (Unique per reviewer/service; cannot review own service)
- **Body**:
```json
{
  "serviceId": "653b...",
  "rating": 5,
  "comment": "Excellent tutor! Explained binary search trees clearly."
}
```

### `GET /api/reviews/:username`
Retrieves reviews received by a freelancer.
- **Access**: Public
