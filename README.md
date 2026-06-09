# 🌿 GramConnect AI — Smart Multi-Village Governance Platform

A production-ready MERN stack Digital Governance Platform for Indian villages, enabling citizens to report public issues directly to their Sarpanch.

---

## 🏗️ Architecture

```
GramConnect-AI/
├── backend/                 # Node.js + Express API
│   ├── config/              # DB, Cloudinary config
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Auth, error, validation
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routes
│   ├── seeds/               # DB seed scripts
│   ├── utils/               # JWT, notifications, escalation
│   └── server.js            # App entry point
│
└── frontend/                # React + Vite SPA
    └── src/
        ├── api/             # Axios instance with interceptors
        ├── components/      # Layouts per role
        ├── pages/           # All page components
        │   ├── auth/        # Login, Register, ChangePassword
        │   ├── citizen/     # Citizen panel pages
        │   ├── sarpanch/    # Sarpanch panel pages
        │   └── admin/       # Admin panel pages
        ├── store/           # Zustand auth store
        └── App.jsx          # Router + guards
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account

---

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see Environment Variables section below)
npm run seed:locations    # Seed India location data
npm run seed:admin        # Seed Super Admin account
npm run dev               # Start development server
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

---

## 🔑 Environment Variables

### Backend `.env`

Copy `.env.example` to `.env` and fill in your actual values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=<your_mongodb_atlas_connection_string>
JWT_SECRET=<random_string_min_32_chars>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=<different_random_string_min_32_chars>
JWT_REFRESH_EXPIRES=7d
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=<your_admin_email>
ADMIN_PASSWORD=<your_secure_admin_password>
ESCALATION_DAYS=15
```

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore`.

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=GramConnect AI
```

---

## 👥 User Roles

| Role | How Created | Access |
|------|-------------|--------|
| Super Admin | Via `npm run seed:admin` with your `.env` credentials | Full platform control |
| Sarpanch | Created by Admin from dashboard | Village dashboard |
| Citizen | Self-registered via the app | Complaint portal |

> 🔐 Admin credentials are configured in your `.env` file as `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Set strong values before seeding.

---

## 🌟 Features

### Citizen Panel
- ✅ Register with cascading State → District → Village dropdowns
- ✅ Submit complaints with images (up to 5, 5MB each)
- ✅ GPS location capture + OpenStreetMap marker
- ✅ Real-time complaint status tracking
- ✅ Timeline of all updates
- ✅ Notifications for every status change
- ✅ Profile management with photo upload

### Sarpanch Panel
- ✅ View all village complaints
- ✅ Update complaint status with remarks
- ✅ Upload resolution proof images
- ✅ Navigation link to complaint location
- ✅ Dashboard with charts (monthly trend, category distribution)
- ✅ View village citizens
- ✅ Real-time notifications for new complaints

### Super Admin Panel
- ✅ Full platform analytics dashboard
- ✅ Sarpanch Assignment Requests management
- ✅ One-click Sarpanch creation (auto-assigns all pending complaints)
- ✅ User management with activate/deactivate
- ✅ State-wise complaint analytics
- ✅ Add locations (states, districts, villages) dynamically
- ✅ Platform-wide complaint overview

---

## 🔐 Authentication System

- **Access Token**: 15 min expiry (JWT)
- **Refresh Token**: 7 day expiry with rotation
- **Silent refresh**: Automatic token refresh on 401
- **Persisted login**: Zustand + localStorage
- **Force password change**: On first Sarpanch login
- **Refresh token rotation**: Prevents token theft

---

## 🏘️ Smart Sarpanch Assignment

When a citizen registers in a village with no Sarpanch:
1. A `SarpanchRequest` record is created
2. Admin is notified
3. Citizens can still submit complaints (stored safely)
4. Complaints get status: `Awaiting Sarpanch Assignment`

When Admin creates a Sarpanch for that village:
1. Village is marked `hasSarpanch = true`
2. **All historical complaints auto-assigned** to new Sarpanch
3. Status changes to `Pending`
4. Sarpanch request marked fulfilled

---

## 📊 Database Collections

| Collection | Purpose |
|------------|---------|
| `users` | Citizens, Sarpanches, Admins |
| `states` | Indian states |
| `districts` | Districts per state |
| `villages` | Villages per district |
| `complaints` | All complaints with embedded updates |
| `notifications` | Per-user notifications |
| `sarpanchrequests` | Pending Sarpanch assignment requests |
| `activitylogs` | Audit trail (90-day TTL) |

---

## ☁️ MongoDB Atlas Setup

1. Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free M0 cluster
3. Add database user (username + password)
4. Add IP to allowlist (`0.0.0.0/0` for all, or your server IP for production)
5. Get connection string → paste into `MONGO_URI` in your `.env`

---

## 🖼️ Cloudinary Setup

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard
3. Copy: Cloud Name, API Key, API Secret
4. Paste into your backend `.env`

Images are auto-organized:
- Complaint images → `gramconnect/complaints/`
- Profile pictures → `gramconnect/profiles/`

---

## 🚀 Deployment Guide

### Overview

| Service | Provider | Notes |
|---------|----------|-------|
| Frontend | Vercel | Free tier works great |
| Backend | Render | Free tier (spins down after inactivity) |
| Database | MongoDB Atlas | Free M0 cluster |
| Media | Cloudinary | Free tier |

---

### Frontend Deployment on Vercel

1. **Push your project to GitHub** (ensure `.env` is in `.gitignore` ✅)

2. **Go to [vercel.com](https://vercel.com)** → Import your GitHub repo

3. **Configure build settings:**
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variables** in Vercel dashboard → Settings → Environment Variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_APP_NAME=GramConnect AI
   ```

5. **Add `vercel.json`** in the `frontend/` folder for SPA routing (already included):
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

6. Deploy — Vercel auto-deploys on every push to `main`.

---

### Backend Deployment on Render

1. **Go to [render.com](https://render.com)** → New → Web Service

2. **Connect your GitHub repo**

3. **Configure the service:**
   - Name: `gramconnect-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free (or Starter for always-on)

4. **Add Environment Variables** in Render dashboard → Environment:
   ```
   PORT=10000
   NODE_ENV=production
   MONGO_URI=<your_mongodb_atlas_uri>
   JWT_SECRET=<your_jwt_secret>
   JWT_ACCESS_EXPIRES=15m
   JWT_REFRESH_SECRET=<your_refresh_secret>
   JWT_REFRESH_EXPIRES=7d
   CLOUDINARY_CLOUD_NAME=<your_cloud_name>
   CLOUDINARY_API_KEY=<your_api_key>
   CLOUDINARY_API_SECRET=<your_api_secret>
   FRONTEND_URL=https://your-app.vercel.app
   ADMIN_EMAIL=<your_admin_email>
   ADMIN_PASSWORD=<your_secure_admin_password>
   ESCALATION_DAYS=15
   ```
   > ⚠️ Render assigns port dynamically via `PORT` env var. Make sure your `server.js` uses `process.env.PORT`.

5. Deploy and note your Render URL (e.g. `https://gramconnect-backend.onrender.com`)

---

### CORS Configuration

In your backend `.env`, set:
```
FRONTEND_URL=https://your-app.vercel.app
```

Your backend's CORS middleware uses this value to whitelist the frontend origin. If you add a custom domain, update this variable accordingly.

---

### Domain Configuration

**Custom domain on Vercel:**
1. Go to your Vercel project → Settings → Domains
2. Add your domain and follow DNS instructions
3. Update `VITE_API_URL` if needed (no change if backend URL stays the same)

**Custom domain on Render:**
1. Go to your Render service → Settings → Custom Domains
2. Add domain and configure DNS CNAME record as instructed
3. Update `FRONTEND_URL` in Render environment variables

---

### Post-Deployment Seed Steps

Run these once against your production database:

```bash
# From your local machine, with production MONGO_URI set:
cd backend
NODE_ENV=production MONGO_URI="your_atlas_uri" node seeds/locationSeed.js
NODE_ENV=production MONGO_URI="your_atlas_uri" node seeds/adminSeed.js
```

Or trigger via Render's shell (Dashboard → Shell tab).

---

### Build Commands Summary

| Step | Directory | Command |
|------|-----------|---------|
| Install backend deps | `backend/` | `npm install` |
| Start backend (prod) | `backend/` | `npm start` |
| Install frontend deps | `frontend/` | `npm install` |
| Build frontend | `frontend/` | `npm run build` |
| Preview build locally | `frontend/` | `npm run preview` |

---

## 🔄 Escalation System

A cron job runs every midnight. Complaints in `Pending`, `Assigned`, or `In Progress` status that haven't been resolved within `ESCALATION_DAYS` (default: 15) are automatically moved to `Escalated`. Citizens are notified.

---

## 🛡️ Security Features

- Helmet.js for security headers
- CORS with whitelist
- Rate limiting (300 req/15min global, 20 req/15min for auth)
- JWT with short-lived access tokens
- Refresh token rotation
- Password hashing (bcrypt, cost 12)
- Input validation (express-validator)
- Role-based access control middleware
- XSS protection via Helmet

---

## 📱 Tech Stack

**Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt, Multer, Cloudinary, node-cron

**Frontend**: React 18, Vite, TailwindCSS, TanStack Query, Zustand, Framer Motion, React Leaflet, Recharts, React Select, React Hot Toast, Lucide Icons

---

## 📞 Support

For issues, please check:
1. All environment variables are correctly set
2. MongoDB Atlas IP allowlist includes your server IP
3. Cloudinary credentials are correct
4. `FRONTEND_URL` in backend `.env` matches your actual frontend URL

---

*Built with ❤️ for Digital India — Empowering every village through technology*
