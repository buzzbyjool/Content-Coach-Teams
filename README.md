# Content-Coach

A web application designed to manage customer questionnaires efficiently, with TypeForm integration and Firebase backend.

## Features

- User Registration and Login
- Company Coach Creation and Management
- TypeForm Integration
- Firebase Authentication and Storage
- Logo Upload Functionality
- Webhook Integration for Form Submissions

## Tech Stack

- React
- TypeScript
- Vite
- Firebase
- TailwindCSS
- Express (Webhook Server)

## Project Structure

```
content-coach-app/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Configuration and utilities
│   ├── pages/         # Page components
│   ├── server/        # Webhook server
│   └── types/         # TypeScript types
├── public/            # Static assets
└── package.json       # Project dependencies
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (for webhook server)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. For webhook server: `npm run start:webhook`

## Deployment

- Frontend: Deploy to your preferred hosting service (e.g., Netlify, Vercel)
- Webhook Server: Deploy to Render

## License

MIT