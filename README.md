# Interview AI Project

A full-stack AI-powered interview preparation app that helps users turn a job description and resume into a personalized interview strategy.

Users can:
- create an account and log in securely
- upload a resume in `PDF` or `DOCX` format, or add a self-description
- generate an interview report using `Gemini`
- review technical questions, behavioral questions, skill gaps, and a preparation roadmap
- download a generated resume PDF

## Tech Stack

- Frontend: `React`, `Vite`, `React Router`, `Sass`, `Axios`
- Backend: `Node.js`, `Express`
- Database: `MongoDB`, `Mongoose`
- Authentication: `JWT` with cookie-based auth
- AI: `Google Gemini`
- File handling: `Multer`, `pdf-parse`, `mammoth`
- PDF generation: `Puppeteer`

## Features

- User registration and login
- Protected routes for authenticated users
- Resume upload support for `PDF` and `DOCX`
- File size validation up to `5MB`
- AI-generated interview report
- Match score for the target role
- Technical and behavioral interview questions
- Skill gap analysis
- Multi-day preparation roadmap
- Resume PDF export
- Recent interview report history

## Project Structure

```text
interview plan/
|- Frontend/      # React client
|- Backend/       # Express API
|- mongodb-data/  # Local MongoDB data files
|- sample-upload.pdf
```

## Frontend Routes

- `/register` - create a new account
- `/login` - sign in
- `/` - interview plan generator dashboard
- `/interview/:interviewId` - generated interview report page

## API Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/logout`
- `GET /api/auth/get-me`

### Interview

- `POST /api/interview/` - generate a new report
- `GET /api/interview/` - get all reports for the logged-in user
- `GET /api/interview/report/:interviewId` - get a single report
- `POST /api/interview/resume/pdf/:interviewReportId` - download generated resume PDF

## Environment Variables

Create a file at `Backend/.env` and add:

```env
MONGO_URI=mongodb+srv://your-user:your-password@your-cluster.mongodb.net/interview-ai
JWT_SECRET=replace-with-a-strong-random-secret
GOOGLE_GENAI_API_KEY=your-gemini-api-key
```

## Local Setup

### 1. Install dependencies

Backend:

```bash
cd Backend
npm install
```

Frontend:

```bash
cd Frontend
npm install
```

### 2. Start the backend

```bash
cd Backend
npm run dev
```

### 3. Start the frontend

```bash
cd Frontend
npm run dev
```

## Default Local URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## How It Works

1. The user signs up or logs in.
2. The user pastes a job description.
3. The user uploads a resume or writes a self-description.
4. The backend extracts resume text and sends the profile + job description to `Gemini`.
5. The app stores the generated report in `MongoDB`.
6. The frontend displays the report with questions, skill gaps, score, and roadmap.

## Important Notes

- The backend requires valid `MongoDB` and `Gemini API` credentials.
- CORS is currently configured for `http://localhost:5173`.
- Authentication uses cookies, so frontend and backend should run together locally.
- `mongodb-data/` appears to contain local database files and usually should not be pushed to GitHub unless intentionally required.
