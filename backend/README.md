# Serenity Backend API

Express.js backend server for Serenity Mental Health Wellness App.

## Features

- User authentication endpoints
- Firebase Admin SDK integration
- Email services (SendGrid/Resend)
- CORS enabled for frontend communication
- RESTful API endpoints

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (in root `.env`):
```env
VITE_BACKEND_API_URL=http://localhost:3001
```

3. Place your Firebase service account key as `securityAccountKey.json`

## Running

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

- `POST /api/auth/check-user` - Check if user exists
- Add more endpoints as needed

## Port

Default: 3001
