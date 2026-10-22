# Northstar Careers — Job Application Portal

A MERN job portal for applicants, recruiters, and administrators. The client is a React/Vite single-page app; the API is an Express service backed by MongoDB and Mongoose.

## Features

- Applicant and recruiter registration; no public admin registration.
- JWT authentication in an HTTP-only cookie, bcrypt password hashing, role-gated API routes, protected frontend routes, and account activation controls.
- Recruiters can create and manage their own job listings; new jobs await administrator approval.
- Public job search by title/company, location, employment type, experience level, and skills.
- Applicants can maintain a profile, apply with a resume link and optional cover letter, track statuses, and withdraw non-finalized applications.
- Recruiters can search/filter applications, inspect applicant profiles, and update statuses.
- Admin dashboards and tools for user, job, and application management.
- Responsive layouts, validation messages, empty states, and delete confirmations.

## Requirements

- Node.js 20 or newer and npm.
- MongoDB local instance or MongoDB Atlas database.

## Local setup (Windows PowerShell)

Open two PowerShell terminals from the project root.

### 1. Configure and start the API

```powershell
cd server
Copy-Item .env.example .env
```

Edit `server\.env` and set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, and a private initial-admin password of at least 12 characters. `COOKIE_SECURE=false` is suitable for local HTTP development. For Atlas, use the connection string from the Atlas **Connect** dialog and allow your development IP in Network Access.

```powershell
npm install
npm run seed
npm run dev
```

The seed command creates the initial admin account only when absent and adds two approved demo jobs plus a demo recruiter when the jobs collection is empty. Demo recruiter credentials: `demo.recruiter@example.com` / `DemoRecruiter123!`. Change or remove the demo account before using a publicly accessible environment. Applicants can register through the site.

### 2. Start the frontend

```powershell
cd client
Copy-Item .env.example .env
npm install
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`). `VITE_API_URL` defaults to `http://localhost:5000/api`.

### Production build

```powershell
cd client
npm run build
cd ..\server
npm start
```

Set `NODE_ENV=production`, `COOKIE_SECURE=true` behind HTTPS, and configure `CLIENT_URL` to the deployed frontend origin. Never commit `.env` files or production credentials.

## API overview

All endpoints are prefixed with `/api`. The browser sends the session cookie automatically; API clients may also send `Authorization: Bearer <token>`.

| Area | Routes |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Jobs | `GET /jobs` (public filters), `GET /jobs/:id`, `GET /jobs/manage` (recruiter/admin), `POST /jobs`, `PUT /jobs/:id`, `DELETE /jobs/:id`, `PATCH /jobs/:id/status` (admin) |
| Applications | `POST /applications`, `GET /applications/my-applications`, `GET /applications/job/:jobId`, `GET /applications/:id`, `PATCH /applications/:id/status`, `DELETE /applications/:id`; admins also have `GET /applications` |
| Users | `GET /users`, `GET /users/:id` (admin), `PUT /users/profile`, `PATCH /users/:id/status`, `DELETE /users/:id` (admin) |
| Dashboard | `GET /dashboard/admin`, `/dashboard/recruiter`, `/dashboard/applicant` |

Job search query parameters: `q`, `location`, `employmentType`, `experienceLevel`, and comma-separated `skills`. Recruiter application filters: `q` and `status`.

## Postman smoke test

1. Set the collection base URL to `http://localhost:5000/api`; enable cookie persistence.
2. Register an applicant with `POST /auth/register` and JSON `{ "name": "Example Applicant", "email": "applicant@example.com", "password": "CandidatePass123!", "role": "applicant" }`.
3. Register a recruiter similarly with `"role": "recruiter"`; create a job with `POST /jobs`. It is `Pending` until approved.
4. Sign in as the seeded admin (`POST /auth/login`) and approve the job with `PATCH /jobs/{jobId}/status`, body `{ "status": "Approved" }`.
5. Sign in as the applicant, search `GET /jobs?q=developer&location=remote`, and apply with `POST /applications`, body `{ "jobId": "...", "resume": "https://example.com/resume.pdf", "coverLetter": "..." }`. A second submission for the same job returns HTTP 409.
6. Sign in as the recruiter and inspect `GET /applications/job/{jobId}`; update the status with `PATCH /applications/{applicationId}/status`, e.g. `{ "status": "Shortlisted" }`.
7. Sign back in as the applicant and verify `GET /applications/my-applications` reflects the updated status. Check role restrictions by calling the same protected routes under another role.

## GitHub collaboration

Use `main` for stable releases and `develop` for integration. Create focused branches such as `feature/authentication`, `feature/job-management`, `feature/applications`, and `feature/admin-dashboard`; open pull requests to `develop`, request review, and merge only after checks pass. Track work and bugs with GitHub Issues and a Project board using **To Do**, **In Progress**, and **Done**. Keep commits focused and meaningful. Never commit secrets, database credentials, or `.env` files.

## Notes

- The backend validates submitted values and scopes recruiter/applicant records by ownership.
- Duplicate applications are prevented by a MongoDB unique compound index.
- Resume handling accepts HTTPS/HTTP shareable URLs; binary file upload/storage is intentionally not configured.
- Add real mail delivery, cloud resume storage, and production monitoring before operating this as a public hiring service.
