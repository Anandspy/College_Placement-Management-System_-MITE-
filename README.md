# Campus Placement Management System (CPMS) - MITE

A modern, full-stack recruitment portal designed for the **Mangalore Institute of Technology & Engineering (MITE)**. This platform facilitates seamless interaction between students, college administrators, and HR representatives during the campus placement process.

---

## 🚀 Overview

CPMS is built using the **MERN** stack, focusing on professional aesthetics, secure authentication, and real-time data tracking. It provides a centralized hub for managing student profiles, recruitment drives, and placement analytics.

### Key Features
- **Multi-role Authentication**: Secure login and registration for Students, Admins, and HRs with JWT-based sessions.
- **OTP Verification**: Email-based verification using Nodemailer for secure student onboarding.
- **Dynamic Student Dashboard**: Real-time tracking of profile completion, applied jobs, and upcoming placement drives.
- **Smart Eligibility Engine**: Automated eligibility checks (CGPA, backlogs, branch) for recruitment drives.
- **Resume Management**: Secure PDF resume uploads and management powered by Cloudinary.
- **Professional UI**: Built with a premium, corporate aesthetic using Tailwind CSS, Framer Motion, and Lucide icons.
- **Role-Based Access Control (RBAC)**: Strict permission handling to ensure data integrity across student, admin, and HR roles.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **State Management**: Redux Toolkit (with persistence and data-sync fixes)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

### Backend
- **Environment**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **File Storage**: Cloudinary (for Resumes)
- **Authentication**: JWT (Access & Refresh Tokens)
- **Email Service**: Nodemailer (Gmail SMTP)
- **Security**: Helmet, Rate Limiting, and Hashed Refresh Tokens

---

## 📁 Project Structure

```text
cpms-mini-project/
├── backend/            # Express API with Node.js
│   ├── controllers/    # Request handlers (Profile, Auth, Drives, Applications)
│   ├── middleware/     # Auth, Role, Rate Limiter, and Upload middleware
│   ├── models/         # Mongoose schemas (User, Profile, Drive, Application)
│   ├── routes/         # API endpoints
│   └── validators/     # Express-validator schemas
├── frontend/           # React Application
│   ├── src/
│   │   ├── features/   # Redux logic (Auth, Profile, Drives, Apps)
│   │   ├── pages/      # Dashboards, Profile, and Drive views
│   │   ├── components/ # Reusable UI components (Modals, Progress rings)
│   │   └── api/        # Axios communication layer
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- Gmail App Password (for email services)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Alok-Chandra108/Placement-management-system.git
   cd cpms-mini-project
   ```

2. **Backend Configuration**
   - Navigate to the `backend/` folder.
   - Create a `.env` file.
   - Install dependencies and start:
   ```bash
   npm install
   npm run dev
   ```

3. **Frontend Configuration**
   - Navigate to the `frontend/` folder.
   - Create a `.env` file.
   - Install dependencies and start:
   ```bash
   npm install
   npm run dev
   ```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_COLLEGE_DOMAIN=mite.ac.in
VITE_COLLEGE_NAME="Mangalore Institute of Technology & Engineering"
```

---

## 🏗️ Upcoming Features
- [ ] **Analytics Dashboard**: Comprehensive charts for placement statistics.

---

## 📄 License
This project is for internal use at **MITE Mangalore**. All rights reserved.

Created by [Alok Chandra](https://github.com/Alok-Chandra108)
