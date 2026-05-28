# CPMS Admin Portal Implementation Plan

Based on your feedback, this revised implementation plan outlines the architecture for a fully distinct Admin Portal. We will focus on a separate visual layout, secure Super Admin initialization, and a structured, phased rollout of management features.

## Proposed Changes

We will execute this in **six logical phases** to ensure stability and focus.

---

### Phase 1: Super Admin Initialization & Secure Authentication

**Goal:** Establish a locked‑down entry point for administrators.

#### Backend
- **Super Admin Seeding Script** (`backend/src/scripts/seedAdmin.js`)
  - Inserts the Super Admin account (`11mt25mca082-t@mite.ac.in`) with the `ADMIN` role.
  - Generates a temporary strong password and flags the account for a forced password change on first login.
- **Auth Controller Adjustment**
  - Extend login logic to differentiate `ADMIN` role and enforce OTP verification for the admin account.
  - Return a distinct JWT claim (`role: 'ADMIN'`) used by front‑end guards.

#### Frontend
- **[NEW] AdminLoginPage.jsx** – Dedicated login page at `/admin/login` with a premium UI design.
- **Route Guard Enhancements** – Update `ProtectedRoute` and `RoleRoute` to read the new `ADMIN` claim.

---

### Phase 2: Distinct Layout & Core Shell

**Goal:** Provide a visual separation from the student portal.

#### Frontend Routing
- **[MODIFY] AppRouter.jsx** – Add a `/dashboard/admin/*` route that renders `AdminLayout`.

#### Layout Components
- **[NEW] AdminLayout.jsx** – Sidebar (Drives, Notices, Students, Settings) + Topbar with brand colors.
- **[NEW] AdminOverview.jsx** – Dashboard landing page with KPI cards (Total Students, Active Drives, Placed, Pending).
- **[NEW] StudentDirectory.jsx** – Paginated table of all student profiles with quick view links.

---

### Phase 3: Content Management (Drives & Notices)

**Goal:** Enable admins to create and manage the core data that students interact with.

#### Frontend Pages
- **AdminDrivesPage.jsx** – CRUD UI for placement drives (company, role, CTC, deadlines, eligibility).
- **AdminNoticesPage.jsx** – CRUD UI for announcements.

#### Backend
- Guard all `POST/PUT/DELETE` routes in `drive.routes.js` and `notice.routes.js` with `restrictToRoles('admin','hr')`.
- Add validation schemas for drive creation (min CGPA, max backlogs, eligible branches).

---

### Phase 4: Application Tracking & Workflow

**Goal:** Let admins monitor, evaluate, and progress applicant statuses.

#### Frontend Pages & Components
- **DriveApplicationsPage.jsx** – Table of applicants per drive, searchable, sortable.
- **ApplicationStatusManager.jsx** – Dropdown/modal within each row to set status (`Shortlisted`, `Interviewing`, `Selected`, `Rejected`).
- **CSV Export Button** – Exports current view to a CSV file (using `json2csv` on the client).

#### Backend Endpoints
- `GET /applications/drive/:driveId` – Returns applicants for a specific drive.
- `PATCH /applications/:appId/status` – Updates an applicant’s status (admin‑only).
- Add indexes on `driveId` and `status` for performance.

---

### Phase 5: Reporting, Analytics & Export

**Goal:** Provide actionable insights and easy data sharing with HR/companies.

#### Frontend
- **AnalyticsDashboard.jsx** (under admin) – Charts for application funnel, conversion rates, and time‑to‑hire.
- **Export Options** – CSV for raw data, PDF summary via `jspdf` for polished reports.

#### Backend
- New route `GET /reports/drive/:driveId` returning aggregated metrics (total applied, shortlist count, interview count, hire count).
- Secure the report routes with admin role checks.

---

### Phase 6: Deployment, Monitoring & Documentation

**Goal:** Ensure the new admin features are reliable in production.

#### CI/CD
- Add build steps for the new frontend assets.
- Include migration script for the seeding utility.

#### Monitoring
- Integrate request logging (e.g., `morgan`) for admin APIs.
- Add front‑end error boundaries and toast notifications for API failures.

#### Documentation
- Update README with admin setup instructions.
- Generate API Swagger docs for the new admin endpoints.

---

## Verification Plan

### Automated / Backend Verification
1. **Seeding Script:** Run `node backend/src/scripts/seedAdmin.js` and confirm the admin user exists with role `ADMIN`.
2. **Endpoint Protection:** Use Postman to attempt admin routes with a student JWT – expect `403 Forbidden`.
3. **Status Update Flow:** PATCH an application status and verify the DB field updates.
4. **CSV Export:** Trigger export and compare the file content with the API response.
5. **Report Generation:** Call `/reports/drive/:id` and validate the aggregated numbers.

### Manual UI Verification
1. **Distinct UI:** Navigate to `/admin/login` and visually confirm the premium design.
2. **Access Control:** Log in as a student and attempt to access any `/dashboard/admin/*` – should redirect to student dashboard.
3. **Application Workflow:** Change applicant statuses and verify the UI reflects the new badge colors.
4. **Analytics Dashboard:** Review charts for correctness against known data.
5. **Export & PDF:** Generate a CSV and PDF report; open them to ensure formatting.

---

### Open Questions
- **Export Format:** Should the CSV include all raw fields or only a curated subset?
- **Analytics Scope:** Do you need additional metrics (e.g., average interview score) beyond the basic funnel?
- **Deployment Target:** Will this be deployed to the existing Vercel setup or a separate sub‑domain?

Please review the expanded phases and let me know if any adjustments are needed before we start implementation.
