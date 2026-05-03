# Hospital Management System

Beginner-friendly MERN project for hospital workflows.

Features:
- Role-based login (admin, doctor, patient)
- Patient and doctor management
- Appointment booking with time slots
- Prescriptions and billing
- Dashboard and records

## 1. What You Need Before Running

Install these tools first:
- Node.js (recommended: version 20 or higher)
- npm (comes with Node.js)
- MongoDB (local database)

Check versions:

```bash
node -v
npm -v
```

## 2. Project Structure

```text
HMS/
  backend/   -> Express + MongoDB API
  frontend/  -> React + Vite UI
```

## 3. Install Dependencies

Open terminal in the HMS root folder and run:

```bash
npm install
```

That is enough because this project uses npm workspaces.

## 4. Create Environment Files

### backend/.env

Create this file at backend/.env and paste:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hms
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Email is optional.
# Keep EMAIL_HOST empty if you do not want email notifications in local setup.
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=Hospital Management <no-reply@hospital.com>

# Cloudinary is optional for local testing.
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### frontend/.env

Create this file at frontend/.env and paste:

```env
VITE_API_URL=http://localhost:5000/api
```

## 5. Start MongoDB

Make sure MongoDB service is running on your machine.

If MongoDB is not running, backend cannot connect.

## 6. Run the Project

From the HMS root folder:

```bash
npm run dev
```

This starts:
- Backend on http://localhost:5000
- Frontend on http://localhost:5173

Open in browser:

http://localhost:5173

## 7. Build for Production

```bash
npm run build
```

## 8. Useful Commands

- Run both apps in dev mode:

```bash
npm run dev
```

- Run only backend:

```bash
npm run dev --workspace backend
```

- Run only frontend:

```bash
npm run dev --workspace frontend
```

## 9. Common Errors and Fixes

### Error: listen EADDRINUSE 5000
Reason: Another backend process is already running on port 5000.

Fix:
- Stop old backend terminal (Ctrl + C)
- Start backend again
- Keep only one backend dev server running

### Error: Network Error on frontend
Reason: Backend is not running, wrong API URL, or CORS mismatch.

Fix:
- Check backend terminal is running on port 5000
- Check frontend .env has VITE_API_URL=http://localhost:5000/api
- Restart frontend after editing env

### Error: getaddrinfo ENOTFOUND smtp.example.com
Reason: Placeholder email host is being used.

Fix:
- Keep EMAIL_HOST empty for local development
- Or set real SMTP credentials

### MongoDB connection failed
Reason: MongoDB service not running or wrong MONGODB_URI.

Fix:
- Start MongoDB service
- Verify backend .env MONGODB_URI

## 10. API Quick List

Auth:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

Appointments:
- GET /api/appointments
- POST /api/appointments
- GET /api/appointments/slots/:doctorId

Prescriptions:
- POST /api/prescriptions
- GET /api/prescriptions/patient/:patientId

## 11. Notes for Students

- First run may take some time (package install).
- If you change any .env file, restart the corresponding server.
- Start with one role first (for example admin), then create doctor and patient users from the app.
