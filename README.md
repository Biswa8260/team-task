# Team Task Manager (MERN Stack)

A professional, production-ready MERN (MongoDB, Express, React, Node.js) Stack web application designed to streamline team collaboration. It features role-based access control (RBAC) enabling Admins to manage projects and assign tasks, while Members can log in to view their workspace, track workloads, and update their assigned task progress.

The application boasts a premium, modern glassmorphic dark-theme UI with responsive sidebars, stats grids, deadline trackers, status indicators, and toast alerts.

---

## Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Routing**: React Router DOM (v6)
- **HTTP Client**: Axios (with interceptors for automatic JWT authentication)
- **Styling**: Tailwind CSS
- **Notifications**: React Toastify
- **Icons**: Lucide React
- **Typography**: Google Fonts (Inter & Outfit)

### Backend
- **Platform**: Node.js & Express.js
- **Database**: MongoDB Atlas via Mongoose ODM
- **Security**: JWT Authentication (JSON Web Tokens) & Bcrypt Password Hashing
- **Validations**: Express-Validator (robust input, role, status, priority, and date checking)

---

## Key Features

1. **Role-Based Access Control (RBAC)**:
   - **Admin**: Create, edit, and delete projects. Add/remove members. Create, assign, edit, and delete tasks. View total system metrics.
   - **Member**: Access a personal workspace showing assigned projects and tasks. Update task completion status. Track upcoming deadlines.
2. **Dashboard Analytics**:
   - Dynamic dashboard presenting customized cards (Total Projects, Members, Tasks, Completed, Pending, and Overdue tasks) and logs (Recent Tasks / Upcoming Deadlines) depending on the active role.
3. **Project Management**:
   - Custom workspace containers featuring collaborator list management, member avatar overlays, and project task breakdowns with keyword searching and sorting.
4. **Task Lifecycle Management**:
   - Advanced task creation linking projects, smart assignee dropdowns (filtering team members matching the selected project), priority ranks (Low, Medium, High), status flows (Todo, In Progress, Completed), and deadline dates.
5. **Overdue Task Tracking**:
   - Automatically computes and highlights overdue tasks when their deadline is past and status is not marked as `Completed`.

---

## Folder Structure

```text
Team Task Manager/
├── server/
│   ├── config/          # Database connection setup
│   ├── controllers/     # Controller handlers (Auth, Projects, Tasks, Dashboard)
│   ├── middleware/      # Auth protection, RBAC checks, Error and Validation interceptors
│   ├── models/          # Mongoose schemas (User, Project, Task)
│   ├── routes/          # Express routing endpoints
│   ├── app.js           # Core Express configurations (CORS, parser, routes mapping)
│   ├── server.js        # Backend entry point
│   ├── seed.js          # DB seeding script
│   └── .env             # Backend environment keys
└── client/
    ├── src/
    │   ├── components/  # Reusable UI elements (Badge, Button, Input, Modal, Spinner)
    │   ├── context/     # Global state container (AuthContext)
    │   ├── layouts/     # Route layout structures (AuthLayout, DashboardLayout)
    │   ├── pages/       # Page views (Dashboard, Login, ProjectsList, TaskForm, etc.)
    │   ├── routes/      # React routing definitions and Auth guards
    │   ├── services/    # Axios API client setup
    │   ├── index.css    # Tailwind base directives and glassmorphic helpers
    │   ├── App.jsx      # React router/auth provider wrapper
    │   └── main.jsx     # Vite client entry mounting
    ├── index.html       # HTML entry point (SEO optimized)
    ├── tailwind.config.js
    ├── postcss.config.js
    └── .env             # Frontend environment keys
```

---

## Environment Variables

Separate `.env` files must be placed in both the `server/` and `client/` directories.

### Backend (`server/.env`)
```ini
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/team-task-manager
JWT_SECRET=super_secret_jwt_key_team_task_manager_2026
NODE_ENV=development
```
*Note: Replace `MONGODB_URI` with your MongoDB Atlas connection string in production.*

### Frontend (`client/.env`)
```ini
VITE_API_URL=http://localhost:5000/api
```

---

## Demo Credentials

You can populate the database with these default profiles using the seed script.

- **Admin User**:
  - **Email**: `admin@test.com`
  - **Password**: `password123`
- **Member User**:
  - **Email**: `member@test.com`
  - **Password**: `password123`
- **Member User 2**:
  - **Email**: `member2@test.com`
  - **Password**: `password123`

---

## API Documentation

### Authentication Routes
- `POST /api/auth/register` - Create a new user (returns user info + JWT token)
- `POST /api/auth/login` - Authenticate credentials (returns user info + JWT token)
- `GET /api/auth/profile` - Retrieve current user profile (requires Bearer token)
- `GET /api/auth/users` - Fetch system user accounts (requires Admin token)

### Project Routes
- `GET /api/projects` - Get all projects (Admin sees all; Member sees assigned)
- `POST /api/projects` - Create a project workspace (requires Admin token)
- `GET /api/projects/:id` - Fetch project details by ID (requires membership)
- `PUT /api/projects/:id` - Edit project details (requires Admin token)
- `DELETE /api/projects/:id` - Delete project and all associated tasks (requires Admin token)
- `PUT /api/projects/:id/members` - Update list of members (requires Admin token)

### Task Routes
- `GET /api/tasks` - Fetch tasks (with filters `projectId`, `status`, `priority`, `search`)
- `POST /api/tasks` - Distribute new task (requires Admin token, verifies project and assignee)
- `GET /api/tasks/:id` - Fetch details for a single task
- `PUT /api/tasks/:id` - Update task (Admin can change all; Member can only update assigned status)
- `DELETE /api/tasks/:id` - Remove a task (requires Admin token)

### Dashboard Routes
- `GET /api/dashboard/stats` - Fetch customized stats grid details based on role

---

## Installation & Local Execution

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Server running locally or an Atlas account

### Backend Setup
1. Open a terminal and navigate to the backend:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables to `.env` and fill them out.
4. Populate database with seed data:
   ```bash
   npm run seed
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Open a new terminal and navigate to the frontend:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables to `.env` and fill out `VITE_API_URL`.
4. Start dev server:
   ```bash
   npm run dev
   ```
5. Open browser at: `http://localhost:5173`

---

## Deployment (Railway Compatible)

The application is structured to be deployed directly on **Railway**.

### Backend Deployment
1. Import your repository into Railway.
2. Select the `server` directory as the root of the service, or deploy it directly.
3. Configure the following variables in Railway:
   - `MONGODB_URI` (Point to your MongoDB Atlas cluster connection string)
   - `JWT_SECRET` (A strong cryptographical string)
   - `NODE_ENV` (`production`)
4. Railway will automatically detect the `package.json` file, install dependencies, and run `npm start`.

### Frontend Deployment
1. Select the `client` directory as the root of a second service.
2. Configure the following variable in Railway:
   - `VITE_API_URL` (Set this to the production URL of your backend, e.g., `https://your-backend-service.railway.app/api`)
3. Railway will run the build command and deploy the compiled static assets.
