# CampusGig — Production-Ready Student Freelance Marketplace

CampusGig is a full-stack, database-driven student freelance marketplace built using the **MERN** stack (MongoDB, Express, React + Vite, Node.js). It enables university students to offer academic tutoring, programming assistance, design, and writing services while allowing clients to search, evaluate, and collaborate with verified student freelancers.

---

## 🌟 Key Features Implemented

### 1. Authentication & Session Management
- **Registration & Login**: Full-name, unique email normalization, unique username validation, optional college/university, and password confirmation.
- **Security**: Salted password hashing with `bcryptjs` (12 rounds). Passwords never returned in responses.
- **HttpOnly Cookies**: Session tokens transported via `campusgig_session` HttpOnly cookies to protect against XSS token leakage.
- **CSRF Protection**: Double-submit cookie with `x-csrf-token` header validation for state-changing requests.
- **Session Restoration**: Application re-authenticates on page refresh via `GET /api/auth/me`.

### 2. Marketplace & Services
- **Real Database Persistence**: Services are stored in MongoDB with text indexing and compound filters. Zero fictional or mock listings.
- **Honest Empty States**: Clean, informative empty state renders when the database has no matching records.
- **Search & Filtering**: Real backend-powered keyword search, category filtering, price range (`minPrice` / `maxPrice`), and multi-mode sorting (`newest`, `oldest`, `price_asc`, `price_desc`).
- **Pagination**: Scalable server-side pagination.
- **Ownership Enforcement**: Only the authenticated owner can edit, toggle status (`published`, `draft`, `paused`, `archived`), or delete a listing. User B cannot modify User A's service by altering an ID.

### 3. File & Portfolio Uploads
- **Cloudinary Integration**: Authenticated portfolio uploads with direct streaming.
- **Safe Fallback**: Secure memory data-URI encoding when Cloudinary credentials are not configured, ensuring local development is unblocked.
- **File Validation**: Strict MIME allowlist (JPEG, PNG, WebP, GIF, PDF) and size limitation (5MB limit).
- **Metadata Persistence**: Uploader ID, size, and original filename stored in MongoDB.

### 4. Direct Client Inquiries
- **Inquiry Workflow**: Clients submit project inquiries directly from service listings.
- **Owner Derivation**: Recipient derived automatically on the backend from service ownership (client cannot tamper with recipient ID).
- **Privacy & Authorization**: Inquiries can only be inspected by the actual sender, recipient, or admin.
- **Status Updates**: Freelancer can update status (`pending`, `read`, `replied`, `closed`).

### 5. Client Reviews & Ratings
- **Database-Derived Ratings**: Average stars and review counts calculated dynamically from actual MongoDB records.
- **Duplicate Prevention**: Unique compound index `{ reviewer: 1, service: 1 }` prevents multiple reviews on the same service.
- **Self-Review Prevention**: Freelancers cannot review their own service listings.

### 6. Student Freelancer Workspace
- **Overview Dashboard**: Database-backed metrics (total services, published count, draft count, inquiries sent/received).
- **Service Management**: Interactive table with status toggling, quick editing, and deletion.
- **Profile Settings**: Custom bio, university affiliation, skills tags, spoken languages, and social links.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | Single-page application and fast client bundling |
| **Styling** | Tailwind CSS v3 | Modern responsive editorial design system |
| **State** | Redux Toolkit | Centralized authentication and session management |
| **Routing** | React Router v6 | Public routes, nested dashboard, and protected routes |
| **Validation** | Zod + React Hook Form | Type-safe form validation and backend schema checks |
| **Icons** | Lucide React | Clean, modern vector UI icons |
| **Backend** | Node.js + Express (ES Modules) | RESTful API, authentication middleware, controllers |
| **Database** | MongoDB + Mongoose | Schema definitions, compound indexes, text search |
| **File Storage** | Multer + Cloudinary | Secure portfolio file uploading |
| **Security** | Helmet, CORS, Rate Limiting, bcrypt | HTTP headers, origin checks, request throttling |
| **Testing** | Vitest + Supertest + RTL | In-memory integration tests and component tests |

---

## 📁 Project Structure

```
d:/m project/
│
├── client/                     # Frontend React + Vite application
│   ├── public/
│   ├── src/
│   │   ├── api/                # Centralized Axios instance & API modules
│   │   │   ├── axios.js
│   │   │   ├── auth.api.js
│   │   │   ├── services.api.js
│   │   │   ├── inquiries.api.js
│   │   │   ├── profiles.api.js
│   │   │   ├── uploads.api.js
│   │   │   └── reviews.api.js
│   │   ├── app/                # Redux store, Router, and Root App
│   │   ├── components/         # Common UI, Navbar, Footer, ServiceCard, EmptyState
│   │   ├── features/           # Redux slices (authSlice)
│   │   ├── layouts/            # DashboardLayout (Workspace sidebar)
│   │   ├── pages/              # Home, Browse, ServiceDetail, Profile, Workspace
│   │   ├── utils/              # Category constants, date/currency formatters
│   │   ├── tests/              # Frontend component tests
│   │   ├── index.css           # Tailwind base + custom tokens
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                     # Backend Express API
│   ├── src/
│   │   ├── config/             # Environment validation, database, Cloudinary
│   │   ├── controllers/        # Auth, service, inquiry, profile, review, upload
│   │   ├── middleware/         # Authenticate, authorize, CSRF, rate limit, error
│   │   ├── models/             # User, Service, Inquiry, Review, Upload schemas
│   │   ├── routes/             # Versioned REST endpoints
│   │   ├── validators/         # Zod request validators
│   │   ├── utils/              # Token signer, mailer, asyncHandler
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # Server listen & database connection
│   ├── tests/                  # In-memory integration tests (22 tests)
│   └── package.json
│
├── docs/                       # Project documentation
│   ├── API.md                  # Complete REST API reference
│   ├── DATABASE.md             # Schema definitions and index design
│   ├── SECURITY.md             # Security architecture & protection details
│   └── DEPLOYMENT.md           # Production deployment & hosting guide
│
├── API-EXAMPLES.md             # Practical curl request examples
├── package.json                # Root orchestration scripts
└── README.md
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js**: Version 20 or newer (`node -v`)
- **npm**: Version 10 or newer (`npm.cmd -v`)
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/campusgig`) OR a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection URI.

---

### Step 1: Install Dependencies
From the project root:
```bash
npm.cmd install
npm.cmd run install:all
```

---

### Step 2: Configure Environment Variables

#### Backend (`server/.env`):
```env
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

# Connect to local MongoDB or MongoDB Atlas
MONGODB_URI=mongodb://127.0.0.1:27017/campusgig

# Minimum 32-character secret for signing JWTs
JWT_SECRET=super_secret_jwt_key_at_least_32_characters_long_for_security_campusgig
JWT_EXPIRES_IN=7d
COOKIE_NAME=campusgig_session

# Optional Cloudinary (for live media uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
MAX_UPLOAD_MB=5

# Optional SMTP Email Delivery
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=noreply@campusgig.local
```

#### Frontend (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

### Step 3: Run the Automated Test Suite

Run all tests across backend and frontend:
```bash
# Run backend API integration tests (using an isolated in-memory MongoDB environment)
npm.cmd run test:server

# Run frontend component tests
npm.cmd run test:client

# Or run both simultaneously
npm.cmd test
```
*Current test status: 22 backend integration tests passed; 3 frontend tests passed.*

---

### Step 4: Build for Production
To verify production bundling:
```bash
npm.cmd run build
```
Generates minified, tree-shaken static assets in `client/dist`.

---

### Step 5: Start the Development Servers

Start both the backend API and frontend React application concurrently:
```bash
npm.cmd run dev
```

Alternatively, run in separate terminals:
- **Backend API**: `npm.cmd run dev:server` (running on `http://localhost:5000`)
- **Frontend App**: `npm.cmd run dev:client` (running on `http://localhost:5173`)

Endpoints to verify:
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Public Services API**: [http://localhost:5000/api/services](http://localhost:5000/api/services)

---

## 🗄️ Connecting to MongoDB Atlas

1. Create a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, add `0.0.0.0/0` or your server's public IP address.
3. Under **Database Access**, create a user (e.g. `campusgig_admin`) and generate a secure password.
4. Obtain the connection string from **Connect -> Drivers**:
   ```
   mongodb+srv://campusgig_admin:<password>@cluster0.mongodb.net/campusgig?retryWrites=true&w=majority
   ```
5. Paste this into `server/.env` under `MONGODB_URI`.
6. Restart the backend: `npm.cmd run dev:server`. The health endpoint at `/api/health` will report `"database": "connected"`.

---

## 🔒 Security Checklist Verification
- [x] bcrypt password hashing (12 rounds) with select: false
- [x] HttpOnly cookie session transport
- [x] Double-submit CSRF cookie & header validation
- [x] Backend-enforced ownership authorization on all updates and deletions
- [x] Cross-user data isolation (User B cannot modify User A's service or read private inquiries)
- [x] Zod schema validation on request body, params, and query strings
- [x] Rate limiting on auth, inquiries, and file uploads
- [x] Helmet security headers & explicit CORS allowlist
- [x] Memory storage file uploads with MIME allowlist and size checks
- [x] Zero hardcoded mock users, sample reviews, or fake marketplace listings
#   m i n o r  
 