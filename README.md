# TaskFlow REST API

Production-ready Task & Workflow Management REST API built with **Express 5**, **TypeScript**, **PostgreSQL**, and **Sequelize ORM**.

---

## 🚀 Key Features Added

1. **Authentication & Authorization**:
   - JWT-based authentication (`Bearer <token>`).
   - Secure password hashing using `bcrypt`.
   - Role-Based Access Control (RBAC): `user` and `admin` roles.
   - Resource ownership enforcement (users can only access/modify their own tasks; admins have system-wide visibility).
   - Profile management (`/api/auth/me`, `/api/auth/profile`, `/api/auth/change-password`).

2. **Schema & Request Validation**:
   - Type-safe runtime validation using **Zod**.
   - Validates `body`, `query`, and `params` with meaningful, formatted error messages.
   - Strict string sanitization, email format checks, and password minimum requirements.

3. **TaskFlow Workflow & Core Features**:
   - Complete Task lifecycle with statuses: `TODO`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.
   - Priorities: `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
   - Due dates with automatic overdue detection.
   - Full-text search on task title and description.
   - Filtering by status, priority, and user ID.
   - Sorting (`createdAt`, `dueDate`, `priority`, `title`) and pagination (`page`, `limit`).
   - Dedicated task analytics and summary statistics endpoint (`/api/tasks/stats`).

4. **Robust Architecture & Error Handling**:
   - Standardized API response format (`{ success, message, data, pagination }`).
   - Centralized `ApiError` class and global error handling middleware.
   - Automatic handling of Sequelize database constraints (unique emails, foreign keys, validation).
   - 404 Route Not Found handler.

---

## 🛠️ Environment Configuration

Create a `.env` file in the root directory (refer to `.env.example`):

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskflow_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

---

## 📦 Scripts

```bash
# Run in development mode with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

---

## 📚 API Endpoints Reference

### 1. Health Check
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Check API server status | No |

---

### 2. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Login and obtain JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user's profile | Yes |
| `PUT` | `/api/auth/profile` | Update profile (name, email) | Yes |
| `PUT` | `/api/auth/change-password` | Change user password | Yes |

#### Example: Register User
```json
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123",
  "role": "user"
}
```

#### Example: Login
```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

---

### 3. Users Management (`/api/users`)
| Method | Endpoint | Description | Permissions |
|---|---|---|---|
| `POST` | `/api/users` | Create user | Public / Admin |
| `GET` | `/api/users` | List users with pagination and search | Admin only |
| `GET` | `/api/users/:id` | Get user by ID (includes their tasks) | Authenticated |
| `PUT` | `/api/users/:id` | Update user details, role, or active status | Admin only |
| `DELETE` | `/api/users/:id` | Delete user and their tasks | Admin only |

**Query parameters for `GET /api/users`**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Filter by name or email
- `role`: Filter by `user` or `admin`
- `isActive`: Filter by `true` or `false`

---

### 4. Tasks Workflow & Management (`/api/tasks`)
*All task routes require the `Authorization: Bearer <token>` header.*

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/tasks` | Create a new task |
| `GET` | `/api/tasks` | Get tasks (paginated, searchable, filterable) |
| `GET` | `/api/tasks/stats` | Get task metrics and summary statistics |
| `GET` | `/api/tasks/:id` | Get task details by ID |
| `PUT` | `/api/tasks/:id` | Update task details |
| `PATCH` | `/api/tasks/:id/status` | Quick status transition |
| `DELETE` | `/api/tasks/:id` | Delete a task |

#### Query parameters for `GET /api/tasks`:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `status`: `TODO` \| `IN_PROGRESS` \| `COMPLETED` \| `CANCELLED`
- `priority`: `LOW` \| `MEDIUM` \| `HIGH` \| `URGENT`
- `search`: Search query matching task title or description
- `sortBy`: `createdAt` \| `updatedAt` \| `dueDate` \| `priority` \| `title` (default: `createdAt`)
- `order`: `ASC` \| `DESC` (default: `DESC`)
- `userId`: Filter by specific user (Admin only)

#### Example: Create Task
```json
POST /api/tasks
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "title": "Build user dashboard",
  "description": "Implement metrics cards and task completion chart",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2026-11-01T12:00:00.000Z"
}
```

#### Example: Update Task Status
```json
PATCH /api/tasks/1/status
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "status": "COMPLETED"
}
```

#### Example: Get Task Stats (`GET /api/tasks/stats`)
```json
{
  "success": true,
  "message": "Task statistics calculated successfully",
  "data": {
    "totalTasks": 24,
    "byStatus": {
      "TODO": 8,
      "IN_PROGRESS": 10,
      "COMPLETED": 5,
      "CANCELLED": 1
    },
    "byPriority": {
      "LOW": 4,
      "MEDIUM": 12,
      "HIGH": 6,
      "URGENT": 2
    },
    "overdueTasks": 3,
    "completionRate": 21
  }
}
```
