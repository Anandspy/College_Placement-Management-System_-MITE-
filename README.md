# Campus Placement Management System (CPMS) - MITE

A modern, full-stack recruitment portal designed for the **Mangalore Institute of Technology & Engineering (MITE)**. This platform facilitates seamless interaction between students, college administrators, and HR representatives during the campus placement process.

---

## 🚀 Overview

CPMS is built using the **MERN** stack, focusing on professional aesthetics, secure authentication, and real-time data tracking. It provides a centralized hub for managing student profiles, recruitment drives, placement applications, and institutional notices.

### Key Features
- **Multi-role Authentication**: Secure login for Students, Admins, and HRs with JWT-based access & refresh token sessions.
- **OTP Verification**: Email-based OTP verification via Nodemailer for secure student onboarding.
- **Password Recovery**: Forgot password / reset password flow with time-limited secure tokens.
- **Admin Change Password**: Dedicated admin password change with extra validation.
- **Student Dashboard**: Real-time tracking of profile completion, applied jobs, eligibility, and upcoming placement drives.
- **Smart Eligibility Engine**: Automated eligibility checks (CGPA, backlogs, branch, course) for recruitment drives.
- **Resume Management**: Secure PDF resume uploads (max 2MB) and deletion powered by Cloudinary via Multer.
- **Placement Drives**: Full CRUD for recruitment drives with company logo uploads (image upload via Cloudinary), eligibility configuration, and drive details.
- **Applications System**: Students can apply to drives; admins/HRs can view applicants and update application statuses.
- **Notices Board**: Admins/HRs can create, update, and delete notices; all logged-in users can view them.
- **Student Directory**: Admin view of all registered students with profile modal and export functionality.
- **Analytics Dashboard**: Admin component with placement analytics using Recharts.
- **PDF Export**: Export reports using jsPDF and jspdf-autotable.
- **Professional UI**: Premium corporate UI with Tailwind CSS, Framer Motion animations, and Lucide icons.
- **Role-Based Access Control (RBAC)**: Strict permission handling across student, admin, and HR roles.
- **Rate Limiting**: API-level and auth-level rate limiting to prevent abuse.
- **Security**: Helmet headers, hashed refresh tokens stored in DB, httpOnly cookies.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite 8)
- **State Management**: Redux Toolkit (`authSlice`, `profileSlice`, `driveSlice`, `applicationSlice`, `noticeSlice`)
- **Styling**: Tailwind CSS v3
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form + Zod (via `@hookform/resolvers`)
- **Charts**: Recharts
- **PDF Export**: jsPDF + jspdf-autotable
- **HTTP Client**: Axios (with automatic token refresh interceptor)
- **Routing**: React Router DOM v7
- **Notifications**: React Hot Toast

### Backend
- **Environment**: Node.js
- **Framework**: Express.js v5
- **Database**: MongoDB (Mongoose ODM v9)
- **File Storage**: Cloudinary (resumes via `multer-storage-cloudinary`; images via `multer`)
- **Authentication**: JWT (Access Token 15m + Refresh Token 7d, stored as hashed in DB)
- **Email Service**: Nodemailer (Gmail SMTP) — OTP, password reset, welcome emails
- **Validation**: `express-validator` (per-route validation chains)
- **Security**: Helmet, `express-rate-limit`, bcrypt, httpOnly cookies
- **Logging**: Morgan (dev mode / admin route in production)

### Deployment
- **Backend**: Render (Node.js web service — `render.yaml`)
- **Frontend**: Render (Static site — Vite build, `dist/`)

---

## 📁 Project Structure

```text
cpms-mini-project/
├── backend/
│   ├── app.js                    # Express app setup (middleware, routes, error handler)
│   ├── server.js                 # HTTP server entry point
│   ├── config/
│   │   ├── cloudinary.js         # Cloudinary SDK config
│   │   ├── db.js                 # MongoDB connection
│   │   └── nodemailer.js         # Nodemailer transporter config
│   ├── constants/
│   │   └── roles.js              # Role constants (student, admin, hr)
│   ├── controllers/
│   │   ├── auth.controller.js    # Register, OTP verify, login, logout, refresh, forgot/reset password
│   │   ├── admin.controller.js   # Admin-specific operations
│   │   ├── profile.controller.js # Student profile CRUD + resume upload/delete
│   │   ├── drive.controller.js   # Placement drive CRUD (with logo upload)
│   │   ├── application.controller.js # Apply to drive, view applications, update status
│   │   └── notice.controller.js  # Notice board CRUD
│   ├── middleware/
│   │   ├── auth.middleware.js     # verifyAccessToken, restrictToRoles
│   │   ├── role.middleware.js     # requireRole (student-only routes)
│   │   ├── upload.middleware.js   # Multer: resume (PDF, 2MB) + image (logo) upload
│   │   ├── rateLimiter.js         # apiLimiter, authLimiter, sensitiveLimiter
│   │   ├── validateRequest.middleware.js # express-validator error aggregator
│   │   └── error.middleware.js    # Global error handler
│   ├── models/
│   │   ├── User.model.js          # User schema (all roles, refresh token hash)
│   │   ├── Admin.model.js         # Admin model
│   │   ├── StudentProfile.model.js # Full student academic & personal profile
│   │   ├── Drive.model.js         # Placement drive schema (eligibility, company info)
│   │   ├── Application.model.js   # Student drive application + status
│   │   ├── Notice.model.js        # Notice board schema
│   │   └── OTP.model.js           # OTP storage with TTL expiry
│   ├── routes/
│   │   ├── auth.routes.js         # /api/auth/*
│   │   ├── profile.routes.js      # /api/profile/* (student only)
│   │   ├── drive.routes.js        # /api/drives/*
│   │   ├── application.routes.js  # /api/applications/*
│   │   ├── notice.routes.js       # /api/notices/*
│   │   └── admin.routes.js        # /api/admin/*
│   ├── scripts/
│   │   └── seedAdmin.js           # Seed initial admin user
│   ├── services/
│   │   ├── email.service.js       # All email templates (OTP, reset, welcome)
│   │   └── token.service.js       # JWT sign/verify helpers
│   ├── utils/
│   │   ├── ApiResponse.js         # Standardised API response wrapper
│   │   └── generateOTP.js         # OTP generator utility
│   └── validators/
│       ├── auth.validators.js     # Validation chains for all auth routes
│       ├── profile.validators.js  # Profile update validation
│       ├── drive.validators.js    # Drive create/update validation
│       └── notice.validators.js   # Notice create/update validation
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── vercel.json
    └── src/
        ├── main.jsx               # React root, Redux Provider, QueryClient
        ├── App.jsx                # App entry with router
        ├── app/
        │   └── store.js           # Redux store configuration
        ├── api/
        │   ├── axiosInstance.js   # Axios base instance + refresh token interceptor
        │   ├── authApi.js         # Auth API calls
        │   ├── profileApi.js      # Profile API calls
        │   ├── driveApi.js        # Drive API calls
        │   ├── applicationApi.js  # Application API calls
        │   ├── noticeApi.js       # Notice API calls
        │   └── adminApi.js        # Admin API calls
        ├── features/
        │   ├── auth/
        │   │   ├── authSlice.js   # Auth state (user, tokens)
        │   │   └── authThunks.js  # Async login/logout/refresh thunks
        │   ├── profile/
        │   │   ├── profileSlice.js
        │   │   └── profileThunks.js
        │   ├── drives/
        │   │   └── driveSlice.js
        │   ├── applications/
        │   │   └── applicationSlice.js
        │   └── notices/
        │       └── noticeSlice.js
        ├── pages/
        │   ├── auth/
        │   │   ├── LoginPage.jsx
        │   │   ├── RegisterPage.jsx
        │   │   ├── VerifyEmailPage.jsx
        │   │   ├── ForgotPasswordPage.jsx
        │   │   ├── ResetPasswordPage.jsx
        │   │   ├── AdminLoginPage.jsx
        │   │   └── AdminChangePasswordPage.jsx
        │   └── dashboard/
        │       ├── StudentDashboard.jsx
        │       ├── StudentDashboardHome.jsx
        │       ├── StudentProfilePage.jsx
        │       ├── DrivesPage.jsx
        │       ├── DriveDetail.jsx
        │       ├── ApplicationsPage.jsx
        │       ├── NoticesPage.jsx
        │       ├── HRDashboard.jsx
        │       ├── AdminDashboard.jsx
        │       └── admin/
        │           ├── AdminOverview.jsx
        │           ├── AdminDrivesPage.jsx
        │           ├── AdminNoticesPage.jsx
        │           ├── DriveApplicationsPage.jsx
        │           ├── StudentDirectory.jsx
        │           ├── StudentProfileModal.jsx
        │           └── components/
        │               ├── DriveModal.jsx              # Create/Edit drive with logo upload
        │               ├── DriveDetailsModal.jsx       # View drive details
        │               ├── AnalyticsDashboard.jsx      # Recharts analytics
        │               └── ApplicationStatusManager.jsx
        ├── routes/
        │   ├── AppRouter.jsx       # All app routes
        │   ├── ProtectedRoute.jsx  # Auth guard
        │   ├── PublicRoute.jsx     # Redirect if logged in
        │   └── RoleRoute.jsx       # Role-based route guard
        ├── components/
        │   ├── CompanyLogo.jsx
        │   ├── ErrorBoundary.jsx
        │   ├── admin/
        │   ├── auth/
        │   ├── dashboard/
        │   └── layout/
        ├── hooks/
        │   ├── useAuth.js          # Auth state selector
        │   ├── useCountdown.js     # OTP countdown timer
        │   └── useEligibility.js   # Drive eligibility check logic
        ├── schemas/
        │   ├── authSchemas.js      # Zod schemas for auth forms
        │   └── profileSchema.js    # Zod schema for profile form
        ├── services/
        │   └── admin.service.js
        ├── utils/
        │   ├── exportUtils.js      # PDF/CSV export helpers
        │   ├── passwordStrength.js # Password strength indicator
        │   ├── profileUtils.js     # Profile completion calculation
        │   └── tokenUtils.js       # Token decode helpers
        └── lib/
            └── utils.js            # clsx/tailwind-merge utility
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for resume and logo uploads)
- Gmail App Password (for email services)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Alok-Chandra108/Placement-management-system.git
   cd cpms-mini-project
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file (see Environment Variables below)
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Create .env file (see Environment Variables below)
   npm run dev
   ```

4. **Seed Admin User** *(first-time setup)*
   ```bash
   cd backend
   node scripts/seedAdmin.js
   ```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@mite.ac.in
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_COLLEGE_DOMAIN=mite.ac.in
VITE_COLLEGE_NAME="Mangalore Institute of Technology & Engineering"
```

---

## 🌐 API Routes

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Student registration |
| POST | `/api/auth/verify-email` | Public | OTP email verification |
| POST | `/api/auth/resend-otp` | Public | Resend OTP |
| PUT | `/api/auth/update-verify-email` | Public | Update email & re-verify |
| POST | `/api/auth/login` | Public | Student/HR login |
| POST | `/api/auth/admin-login` | Public | Admin login |
| POST | `/api/auth/refresh-token` | Public | Refresh access token |
| POST | `/api/auth/forgot-password` | Public | Send password reset email |
| POST | `/api/auth/validate-reset-token` | Public | Validate reset token |
| POST | `/api/auth/reset-password` | Public | Reset password |
| POST | `/api/auth/logout` | Auth | Logout & clear tokens |
| POST | `/api/auth/admin-change-password` | Admin | Change admin password |
| GET | `/api/profile/me` | Student | Get own profile |
| PUT | `/api/profile/me` | Student | Update own profile |
| POST | `/api/profile/resume` | Student | Upload resume (PDF, ≤2MB) |
| DELETE | `/api/profile/resume` | Student | Delete resume |
| GET | `/api/drives` | Auth | List all drives |
| POST | `/api/drives` | Admin/HR | Create drive (with logo) |
| GET | `/api/drives/:id` | Auth | Get drive details |
| PATCH | `/api/drives/:id` | Admin/HR | Update drive |
| DELETE | `/api/drives/:id` | Admin/HR | Delete drive |
| POST | `/api/applications/apply/:driveId` | Student | Apply to a drive |
| GET | `/api/applications/my-applications` | Student | My applications |
| GET | `/api/applications/drive/:driveId` | Admin/HR | Applicants for a drive |
| PATCH | `/api/applications/:applicationId/status` | Admin/HR | Update application status |
| GET | `/api/notices` | Auth | List all notices |
| POST | `/api/notices` | Admin/HR | Create notice |
| GET | `/api/notices/:id` | Auth | Get notice details |
| PUT | `/api/notices/:id` | Admin/HR | Update notice |
| DELETE | `/api/notices/:id` | Admin/HR | Delete notice |

---

## 🚢 Deployment

This project is configured for deployment on **Render** via `render.yaml`:

- **Backend**: Node.js web service (`cpms-backend`) — `npm start` from `backend/`
- **Frontend**: Static site (`cpms-frontend`) — `npm run build` from `frontend/`, serving `dist/`

---

## 📄 License

This project is for internal use at **MITE Mangalore**. All rights reserved.

Created by [Alok Chandra](https://github.com/Alok-Chandra108)
