# Taskflow — Trello-style Task Manager

A full-stack task management application inspired by Trello. Users can organize work using boards, lists, and tasks with a smooth drag-and-drop experience.

---

## 🚀 Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Zustand, dnd-kit  
**Backend:** Node.js, Express, MongoDB, Mongoose  
**Authentication:** JWT (HTTP-only cookies), bcrypt  
**Deployment:** Railway / Render (backend), Netlify (frontend)

---

## ✨ Features

- Secure user authentication (login, register, logout)
- Create and manage multiple boards
- Add, edit, and delete lists (columns)
- Create, update, and delete tasks (cards)
- Drag and drop tasks within and across lists
- Task priorities (Low, Medium, High, Urgent)
- Labels (Bug, Feature, Improvement, etc.)
- Due date indicators (overdue and today highlights)
- Activity tracking for task updates
- User-specific protected data

---

## 📁 Project Structure
trello-app/
├── backend/
│ ├── controllers/
│ ├── middleware/
│ ├── models/
│ ├── routes/
│ └── server.js
└── frontend/
└── src/
├── components/
│ ├── board/
│ └── common/
├── pages/
├── store/
└── utils/

---

## 🛠 Local Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
npm install
cp .env.example .env
Update .env with:
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
npm run dev
Backend runs on: http://localhost:5000


## Frontend

cd frontend
npm install
npm run dev

### Deployment

Backend (Render)
Set environment variables:
MONGODB_URI=your_database_url
JWT_SECRET=your_secret
CLIENT_URL=your_frontend_url
NODE_ENV=production
Start command:

node server.js
Frontend (Vercel)

Set:

VITE_API_URL=your_backend_url

Build:

npm run build

Deploy the dist folder.

🔐 API Overview
Auth
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
Boards
GET /api/boards
POST /api/boards
PUT /api/boards/:id
DELETE /api/boards/:id
Lists
GET /api/lists/board/:boardId
POST /api/lists/board/:boardId
PUT /api/lists/reorder
PUT /api/lists/:id
DELETE /api/lists/:id
Tasks
GET /api/tasks/board/:boardId
POST /api/tasks
PUT /api/tasks/reorder
PUT /api/tasks/:id/move
PUT /api/tasks/:id
DELETE /api/tasks/:id
