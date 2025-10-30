# Serenity Frontend

React + TypeScript + Vite frontend application for Serenity Mental Health Wellness App.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **Firebase** - Authentication & Database
- **React Router** - Routing
- **Framer Motion** - Animations
- **Recharts** - Data visualization

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (in root `.env`):
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_BACKEND_API_URL=http://localhost:3001
```

## Running

Development:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── lib/            # Utility functions
├── firebase.ts     # Firebase configuration
└── main.tsx        # Entry point
```

## Features

- 🔐 Authentication (Email/Password, Google)
- 📧 Email Verification
- 🧠 AI Therapist Chat
- 📊 Mood Tracking
- 📝 Journal Entries
- 🎯 Goal Setting
- 📈 Progress Analytics
- 🆘 Emergency Support with Map
- 👥 Community & Support Groups
- 📚 Resources Library
- 🎨 Dark Mode Support
