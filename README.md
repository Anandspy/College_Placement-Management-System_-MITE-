# Campus Placement Management System (CPMS) - MITE

A modern, full-stack recruitment portal designed for the **Mangalore Institute of Technology & Engineering (MITE)**. This platform facilitates seamless interaction between students, college administrators, and HR representatives during the campus placement process.

---

## 🚀 Overview

CPMS is built using the **MERN** stack, focusing on professional aesthetics, secure authentication, and real-time data tracking. It provides a centralized hub for managing student profiles, recruitment drives, and placement analytics.

### Key Features
- **Multi-role Authentication**: Secure login and registration for Students, Admins, and HRs.
- **OTP Verification**: Email-based verification using Nodemailer for secure student onboarding.
- **Dynamic Dashboard**: Real-time insights and profile management (In Progress).
- **Professional UI**: Built with a clean, corporate design using Tailwind CSS and Framer Motion.
- **Responsive Management**: Role-based access control (RBAC) to ensure data integrity.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation

### Backend
- **Environment**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (Access & Refresh Tokens)
- **Email Service**: Nodemailer (Gmail SMTP)
- **Middleware**: Helmet, Morgan, Express-Rate-Limit

---

## 📁 Project Structure

```text
cpms-mini-project/
├── backend/            # Express API with Node.js
│   ├── config/         # Database and app configurations
│   ├── controllers/    # Request handlers (logic)
│   ├── middleware/     # Auth and validation middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   ├── services/       # Business services (Email, Token)
│   └── utils/          # Error handlers and utility helper functions
├── frontend/           # React Application
│   ├── public/         # Static assets
│   └── src/
│       ├── assets/     # Images, SVG, Icons
│       ├── components/ # Reusable UI components
│       ├── pages/      # View layouts (Login, Dashboard, etc.)
│       ├── redux/      # Slices and Store configuration
│       └── services/   # API communication logic
└── render.yaml         # Blueprint for Render.com deployment
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
- [ ] **Resume Builder**: Integrated tool for students to create standardized CVs.
- [ ] **Cloudinary Integration**: Secure storage for profile pictures and resumes.
- [ ] **Placement Drive Tracking**: Real-time calendar and notifications for upcoming drives.
- [ ] **Analytics Dashboard**: Comprehensive charts for placement statistics.

---

## 📄 License
This project is for internal use at **MITE Mangalore**. All rights reserved.

Created by [Alok Chandra](https://github.com/Alok-Chandra108)
