# Deployment Guide

This project is now prepared for a split deployment:

- `Frontend/` on `Vercel`
- `Backend/` on `Render`

## Backend

Deploy the `Backend` folder as a web service.

Build command:

```text
npm install
```

Start command:

```text
npm start
```

Environment variables:

```env
MONGO_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-strong-secret
GOOGLE_GENAI_API_KEY=your-gemini-api-key
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.vercel.app
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

Health check path:

```text
/api/health
```

## Frontend

Deploy the `Frontend` folder as a Vercel project.

Build command:

```text
npm run build
```

Output directory:

```text
dist
```

Environment variables:

```env
VITE_API_URL=https://your-backend-domain.onrender.com
```

## Notes

- Cookies are configured for cross-site auth in production.
- `Frontend/vercel.json` is included so client-side routes like `/interview/:interviewId` work after refresh.
- The frontend no longer hardcodes `localhost`; it uses `VITE_API_URL`.
- The backend no longer hardcodes `localhost`; it uses `CORS_ORIGIN` or `FRONTEND_URL`.
