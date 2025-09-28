# EvePost

**Event Management System with QR Code Attendance Tracking**

A comprehensive full-stack application for seamless event management, featuring real-time QR code scanning, automated ticketing, and powerful admin analytics.

## 📸 Screenshots

### Website Landing Page
<img src="assets/website.png" alt="EvePost Website" width="800" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"/>

### Admin Dashboard
<img src="assets/admin-dashboard.png" alt="Admin Dashboard" width="800" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"/>

---

## 📋 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Configuration](#️-configuration)
- [📚 API Documentation](#-api-documentation)
- [🔧 Development](#-development)
- [🚢 Deployment](#-deployment)
- [🧪 Testing](#-testing)
- [🔒 Security](#-security)
- [🐛 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [📞 Support](#-support)

---

## 🎯 Project Overview

**EvePost** streamlines the entire event lifecycle from creation to execution. Built for reliability, security, and UX, it provides organizers with tools to manage events while giving attendees a seamless registration and check-in experience.

### 🎪 Use Cases
- **Corporate**: conferences, workshops, team building
- **Education**: seminars, webinars, training sessions
- **Community/Social**: meetups, hackathons, networking
- **Cultural**: festivals, exhibitions, performances

### 🎯 Target Audience
- **Event Organizers**: create, manage, and track events
- **Admins/SuperAdmins**: oversight across organizers and events
- **Attendees**: register and participate in events
- **Developers**: extend and customize the platform

---

## ✨ Features

### 🏗️ Core Features

#### Event Management
- Full CRUD for events
- Event categories and visibility
- Capacity and RSVP management
- Date/time with timezone awareness
- Location handling

#### QR Code System
- Unique QR codes per attendee/event
- Real-time scanning with instant validation
- Event-specific scanners for security
- Mobile-optimized scanning flow

#### User & Auth
- Roles: Admin, Organizer, Attendee
- JWT-based authentication
- Secure session handling
- Password hashing with bcrypt

#### Digital Ticketing
- PDF ticket generation with event/attendee details
- Embedded QR codes
- Auto-download after registration
- Branding support (logo/colors)

### 📊 Advanced Features

#### Admin Dashboard
- Live metrics and analytics
- Participant management
- Data export to CSV/Excel
- Dark theme UI

#### Data Integrity & UX
- Smart duplicate prevention
- Validation and sanitization
- Clean admin/public separation
- Polished UI with clear scanner feedback

### 🚧 Planned Features
- Advanced event controls (limits, visibility)
- Enhanced media (carousels, video)
- Deeper analytics and custom dashboards
- SuperAdmin organizer/account management
- Billing/subscriptions
- Mobile apps and push notifications
- Calendar integrations (Google/Outlook/iCal)

---

## 🏗️ Architecture

### System Diagram
```text
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend      │    │    Database     │
│   (Next.js)     │◄──►│   (Express.js)   │◄──►│   (MongoDB)     │
│                 │    │                  │    │                 │
│ • React 19      │    │ • REST API       │    │ • Mongoose ODM  │
│ • TypeScript    │    │ • JWT Auth       │    │ • Event Data    │
│ • Tailwind CSS  │    │ • QR Generation  │    │ • User Data     │
│ • shadcn/ui     │    │ • PDF Creation   │    │ • Attendance    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow
1. Admin creates event → Backend validates → DB stores
2. Attendee registers → Backend processes → QR ticket generated
3. QR scanned at entry → Backend verifies → Attendance updated
4. Dashboard aggregates → Reports exported

---

## 🛠️ Tech Stack

### Frontend
- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS 4, shadcn/ui, Framer Motion, Lucide Icons
- QR scanning: `qr-scanner`
- PDF generation: `jsPDF`

### Backend
- Node.js, Express.js
- MongoDB with Mongoose
- JWT auth, bcrypt password hashing
- `qrcode` for QR creation
- `multer` for uploads
- `exceljs` and `xlsx` for exports

---

## 📁 Project Structure

```text
EvePost/
├── frontend/                 # Next.js application
│   ├── app/                  # App Router pages (admin, auth, events,...)
│   ├── components/           # Reusable UI components
│   ├── lib/                  # Utilities
│   ├── public/               # Static assets
│   └── ...
│
├── backend/                  # Express.js API server
│   ├── config/               # DB configuration
│   ├── middleware/           # Request logging, errors, etc.
│   ├── models/               # Mongoose models
│   ├── routes/               # attendance, auth, dashboard, events, registrations
│   ├── utils/                # Helpers (e.g., cleanup tasks)
│   └── server.js             # Main server entry
│
├── assets/                   # Images/screenshots
└── README.md                 # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm
- MongoDB (local or Atlas)

### Installation
```bash
git clone https://github.com/yourusername/evepost.git
cd evepost/EvePost

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Environment Setup
```bash
# Backend
cp .env.example .env  # or create .env using values below

# Frontend
cp .env.local.example .env.local  # or create .env.local using values below
```

### Start Development Servers
```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd ../frontend
npm run dev
```

### Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

---

## ⚙️ Configuration

### Backend `.env`
```env
PORT=5001
NODE_ENV=development

# Mongo
MONGODB_URI=mongodb://localhost:27017/evepost
# Atlas example: mongodb+srv://username:password@cluster.mongodb.net/evepost

# Auth
JWT_SECRET=your-strong-secret
JWT_EXPIRE=7d

# CORS
CORS_ORIGINS=http://localhost:3000

# Uploads
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads/

# QR
QR_CODE_SIZE=256
QR_CODE_MARGIN=2
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📚 API Documentation

### Auth
```http
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile
```

### Events
```http
GET    /api/events
POST   /api/events
GET    /api/events/:id
PUT    /api/events/:id
DELETE /api/events/:id
GET    /api/events/:id/qr
```

### Registrations
```http
POST   /api/events/:id/register
GET    /api/events/:id/registrations
DELETE /api/registrations/:id
GET    /api/registrations/:id/ticket
```

### Attendance
```http
POST   /api/events/:id/attendance
GET    /api/events/:id/attendance
GET    /api/attendance/export
```

---

## 🔧 Development

### Workflow
- Feature-based pages under `frontend/app/`
- Shared components in `frontend/components/`
- Backend routes in `backend/routes/`

### Linting/Formatting
```bash
cd frontend && npm run lint
```

### Git Flow
```bash
git checkout -b feature/my-feature
git add . && git commit -m "feat: add my feature"
git push origin feature/my-feature
```

---

## 🚢 Deployment

### Docker Compose (example)
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5001:5001"
    environment:
      - MONGODB_URI=mongodb://db:27017/evepost
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:5001/api

  db:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

### Nginx (snippet)
```nginx
server {
  listen 443 ssl;
  server_name example.com;
  ssl_certificate /path/cert.pem;
  ssl_certificate_key /path/key.pem;

  location / { proxy_pass http://localhost:3000; }
  location /api/ { proxy_pass http://localhost:5001; }
}
```

---

## 🧪 Testing

- Unit: utilities, models
- Integration: API endpoints
- E2E: registration → ticket → scan

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

---

## 🔒 Security

- JWT auth with strong secrets
- Bcrypt password hashing
- Strict CORS via `CORS_ORIGINS`
- Security headers in `backend/server.js`
- Input validation & sanitization

Checklist:
- [ ] No secrets committed
- [ ] Strong `JWT_SECRET`
- [ ] HTTPS in production
- [ ] Dependencies updated regularly

---

## 🐛 Troubleshooting

### Common fixes
```bash
# Ports busy
lsof -i :3000; lsof -i :5001; kill -9 <PID>

# Next.js cache
cd frontend && rm -rf .next && npm run build

# MongoDB (macOS via Homebrew)
brew services start mongodb/brew/mongodb-community
```

---

## 🤝 Contributing

We welcome contributions! 

### Steps
1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "feat: add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

### Areas
- Bug fixes, features, documentation, UI/UX, testing

---

## 📄 License

MIT License. See `LICENSE`.

---

## 📞 Support

- Issues: open on the repository
- Discussions: start a thread
- Email: support@evepost.com (placeholder)

---
# EvePost made by Ishaan Upponi
