# AddisRide Project

A full-stack application for managing bus routes, drivers, vehicles, and real-time tracking. The project consists of a **React/Vite frontend** and an **Express/MongoDB backend**.

---

## Overview

- **Frontend** located in `addisride-frontend/` built with React, Vite, and Redux Toolkit.
- **Backend** located in `backend/` built with Node.js, Express, and MongoDB (Mongoose).
- Supports authentication for admins, drivers, and users, plus route/vehicle management and live location updates.

## Features

- User authentication (login, register, role selection)
- Admin dashboard for managing users, routes, and vehicles
- Driver dashboard with live vehicle location updates
- Static file upload support for driver documents
- RESTful API with error handling and CORS configured

## Project Structure

```
addisride-frontend/          # React frontend (Vite + Redux Toolkit)
  ├── src/                  # React source code
  │   ├── components/       # Reusable UI components
  │   │   ├── buses/        # Bus-related components
  │   │   │   ├── BusCard.jsx
  │   │   │   ├── BusList.jsx
  │   │   │   └── BusStatus.jsx
  │   │   ├── common/       # Header, Footer, Loader, etc.
  │   │   ├── map/          # Map components (BusMap, RouteMap, controls)
  │   │   ├── modals/       # e.g. LoginModal
  │   │   └── routes/       # RouteCard, RouteList
  │   ├── pages/            # Page-level components
  │   │   ├── Admin/        # Admin dashboard pages
  │   │   ├── Auth/         # Login/Register/ChooseRole
  │   │   ├── Driver/       # Driver dashboard pages
  │   │   ├── Home.jsx
  │   │   ├── LiveMap.jsx
  │   │   ├── NotFound.jsx
  │   │   └── Routes.jsx
  │   ├── services/         # API and socket helpers
  │   │   ├── api.js
  │   │   └── socket.js
  │   ├── store/            # Redux store configuration
  │   │   ├── store.js
  │   │   └── slices/        # Redux slices (auth, bus, route)
  │   ├── utils/            # Constants and helper functions
  │   ├── App.jsx
  │   ├── main.jsx
  │   └── index.css
  ├── package.json
  ├── vite.config.js
  └── README.md

backend/                    # Express backend
  ├── controllers/          # Route handlers
  ├── models/               # Mongoose schemas
  ├── routes/               # API endpoints
  ├── middleware/           # Auth and other middleware
  ├── config/               # DB connection
  ├── server.js             # Entry point
  ├── scripts/              # Utilities (e.g. simulateBus.js)
  ├── uploads/              # Static file storage
  └── .env                  # Environment variables
```

## Setup Instructions

### Prerequisites

- Node.js (>=14)
- npm or yarn
- MongoDB instance (local or cloud)
- Optional: `createAdmin.js` script for seeding an initial admin user

### Backend

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` based on `.env.example` (if provided) and set:
   - `MONGO_URI` – your MongoDB connection string
   - `PORT` (optional, defaults to 5000)
4. (Optional) Run `node createAdmin.js` to create an admin user.
5. Start the server:
   ```bash
   npm run dev
   ```
6. The API will be available at `http://localhost:5000`.

### Frontend

1. Navigate to `addisride-frontend/`:
   ```bash
   cd ../addisride-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create any necessary environment variables (e.g., API base URL) in a `.env` file.
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Access the app at `http://localhost:5173` (or whichever port Vite assigns).

## Environment Variables

Both frontend and backend may require environment variables:

| Variable       | Description                       | Location                      |
| -------------- | --------------------------------- | ----------------------------- |
| `MONGO_URI`    | MongoDB connection string         | `backend/.env`                |
| `PORT`         | Backend server port               | `backend/.env` (default 5000) |
| `VITE_API_URL` | Base URL for API calls (frontend) | `addisride-frontend/.env`     |

## Testing

- No automated tests included yet.
- Manual testing can be done via Postman.

## Notes & Tips

- Use `scripts/simulateBus.js` to simulate bus movements for development.
- Uploads are stored in `backend/uploads/documents` and served at `/uploads`.
