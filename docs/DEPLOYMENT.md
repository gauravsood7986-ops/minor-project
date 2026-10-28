# CampusGig Production Deployment Guide

This guide details deploying CampusGig across production infrastructure:
- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend API**: Render, Railway, AWS ECS, or DigitalOcean App Platform
- **Database**: MongoDB Atlas (Free or Dedicated M10+)
- **Storage**: Cloudinary
- **Email Delivery**: Brevo (Sendinblue), SendGrid, or AWS SES

---

## 1. MongoDB Atlas Setup
1. Log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create an **M0 (Free)** or higher cluster.
3. In **Database Access**, create a user (e.g., `campusgig_app`) with read & write privileges.
4. In **Network Access**, add the IP address of your API server or `0.0.0.0/0` (with strong password).
5. Click **Connect** -> **Connect your application** -> Copy URI:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/campusgig?retryWrites=true&w=majority
   ```
6. Set this value as `MONGODB_URI` in your backend environment variables.

---

## 2. Cloudinary Setup (Media & Portfolios)
1. Sign up for a free [Cloudinary](https://cloudinary.com) account.
2. In the Dashboard, copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Configure these exclusively on your backend server (`CLOUDINARY_*`). Never expose them in Vite/React client environment variables.

---

## 3. Backend Deployment (Render / Railway / VPS)

### Environment Variables (Server)
```env
NODE_ENV=production
PORT=5000
CLIENT_ORIGIN=https://your-campusgig-domain.vercel.app
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/campusgig?retryWrites=true&w=majority
JWT_SECRET=use_a_very_long_secure_random_string_of_at_least_64_characters
JWT_EXPIRES_IN=7d
COOKIE_NAME=campusgig_session
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MAX_UPLOAD_MB=5
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_smtp_key
FROM_EMAIL=support@campusgig.com
```

### Build & Start Commands
- **Root Directory**: `server`
- **Build Command**: `npm install --omit=dev`
- **Start Command**: `node src/server.js`
- **Health Check Path**: `/api/health`

---

## 4. Frontend Deployment (Vercel / Netlify)

### Environment Variables (Client)
```env
VITE_API_URL=https://your-api-domain.onrender.com/api
```

### Build & Output Settings
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Single-Page App (SPA) Rewrite Rule
For Netlify, add `client/public/_redirects`:
```
/*    /index.html   200
```
For Vercel, `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 5. Cookie & HTTPS Configuration
Because cookies are configured as `Secure` in production:
- Both frontend and backend must run over **HTTPS**.
- SameSite attribute is configured to `none` with `secure: true` for cross-site cookie sharing between frontend and API origins.
- Reverse proxies (like Cloudflare or AWS ALB) should set `app.set('trust proxy', 1)` if terminating SSL.
