# NexCRM

Full-stack CRM built on: React 18 + Vite + Redux Toolkit + Tailwind/DaisyUI (frontend),
Node/Express + JWT + bcryptjs (backend), MongoDB Atlas + Mongoose (database),
Socket.IO (real-time), MongoDB GridFS (file storage).

## Folder structure

```
nexcrm/
├── client/      React + Vite frontend
├── server/      Express API + Socket.IO
└── .github/workflows/ci.yml
```

## 1. Backend setup

```
cd server
npm install
cp .env.example .env      # then fill in MONGODB_URI, JWT secrets, FRONTEND_URL
npm run dev                # starts on http://localhost:3001
```

Generate JWT secrets:
```
openssl rand -hex 32
```

## 2. Frontend setup

```
cd client
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:3001
npm run dev                # starts on http://localhost:5173
```

## 3. Try it

1. Register a user:
```
curl -X POST localhost:3001/api/v1/auth/register -H "Content-Type: application/json" \
  -d '{"firstName":"Ada","lastName":"Lovelace","email":"ada@nexcrm.com","password":"TestPass123","role":"ADMIN"}'
```
2. Open http://localhost:5173, log in with that email/password, and explore Dashboard, Contacts, and Leads.

## Deployment

- Frontend → Vercel (Root Directory: `client`)
- Backend → Render (Root Directory: `server`, Start Command: `node src/index.js`)
- Database → MongoDB Atlas (set `MONGODB_URI` in Render's environment variables)

Full step-by-step instructions are in the accompanying NexCRM Developer Guide document.
