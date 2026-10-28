# CampusGig Security Architecture

CampusGig follows defense-in-depth principles across authentication, authorization, session management, input validation, and file handling.

---

## 1. Authentication & Session Security
- **Password Storage**: Passwords are never stored in plaintext. They are salted and hashed using `bcryptjs` with 12 salt rounds before persisting to MongoDB.
- **Session Tokens**: JWT (JSON Web Tokens) are signed with a minimum 32-character secret (`JWT_SECRET`) and standard expiration (`7d`).
- **HttpOnly Cookies**: Session tokens are transported exclusively via `HttpOnly` cookies (`campusgig_session`). This prevents malicious scripts (XSS) from reading session credentials via `document.cookie`.
- **Production Cookie Flags**: In production (`NODE_ENV=production`), cookies are set with `secure: true` (HTTPS only) and `sameSite: 'none'` or `'lax'`.
- **Enumeration Prevention**: Authentication failures return generic messages (`Invalid email or password`) to prevent attacker account harvesting.

---

## 2. Cross-Site Request Forgery (CSRF) Protection
- **Double-Submit Pattern**: A distinct CSRF cookie (`campusgig_csrf`) is issued alongside authenticated sessions.
- **Header Verification**: All state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) require the `x-csrf-token` header matching the cookie.
- **Safe Method Bypass**: Read-only methods (`GET`, `HEAD`, `OPTIONS`) do not mutate state and are exempt.

---

## 3. Authorization & Ownership Enforcement
- **Backend Authorization**: UI buttons are conditionally shown in React, but the Express backend independently enforces ownership for every state-changing route.
- **Service Ownership**: Editing or deleting a service checks `service.owner.toString() === req.user._id.toString() || req.user.role === 'admin'`. Cross-user tampering attempts are rejected with `403 Forbidden`.
- **Inquiry Privacy**: Inquiries can only be inspected by their actual sender, recipient, or admin.
- **Self-Inquiry Prevention**: Service owners cannot submit inquiries to their own listings.

---

## 4. Input Validation & Query Safety
- **Strict Zod Schemas**: Every incoming API payload (`req.body`, `req.params`, `req.query`) is validated against strict Zod schemas before reaching business logic.
- **MongoDB Injection Prevention**: Parameterized queries and sanitized inputs ensure malicious query operators (`$gt`, `$ne`, etc.) are stripped or rejected.
- **ID Validation**: ObjectIds are validated with regex/mongoose before database querying to prevent `CastError` unhandled crashes.

---

## 5. File Upload Safety
- **Memory Storage**: Uploads are processed in-memory via `multer.memoryStorage()`, never touching temporary server disk paths.
- **Strict MIME Allowlist**: Only `image/jpeg`, `image/png`, `image/webp`, `image/gif`, and `application/pdf` are accepted.
- **File Size Limit**: Configurable limit (`MAX_UPLOAD_MB=5`) strictly enforced by Multer middleware.
- **Safe Identifiers**: Storage identifiers use cryptographically generated UUIDs (`crypto.randomUUID()`) rather than client-supplied filenames.
- **Cloudinary Integration**: When configured, uploads stream securely to Cloudinary with server-only credentials.

---

## 6. HTTP & Network Controls
- **Helmet**: Injects security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Cross-Origin-Resource-Policy`).
- **CORS Allowlist**: Explicitly allows only trusted origins (`CLIENT_ORIGIN`), rejecting wildcard origins when credentials are enabled.
- **Rate Limiting**:
  - Global API: 300 requests / 15 minutes
  - Auth (login / register): 20 requests / 15 minutes
  - Inquiries: 15 inquiries / 10 minutes
  - Uploads: 30 uploads / 15 minutes
