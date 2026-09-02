# System Architecture & Technical Design 🏛️

**RajSaurbh Tool Hub Pro** is built on a modern full-stack decoupled architecture designed for high throughput, sub-second client-side document manipulation, and scalable cloud processing.

---

## 1. High-Level Architecture Diagram

```
+─────────────────────────────────────────────────────────────+
|                       Client Browser                        |
|                                                             |
|   React 18 SPA (Vite + Tailwind CSS + Lucide + Redux Toolkit)|
|   ├── Client-Side Canvas & PDF Engines (pdf-lib, jsPDF)     |
|   ├── Protected & Admin Route Guards                        |
|   └── Axios Interceptors (JWT Token Injection & Error Norm) |
+───────────────────────────────┬─────────────────────────────+
                                │ HTTPS / REST API Calls
                                ▼
+─────────────────────────────────────────────────────────────+
|                    Express.js Backend API                   |
|                                                             |
|   ├── Security Layer (Helmet, CORS, MongoSanitize, HPP)     |
|   ├── Rate Limiting (Brute-force protection & upload quotas)|
|   ├── Authentication Middleware (JWT verification + bcrypt) |
|   ├── Multer File Stream Pipeline (MIME validation, 10MB)   |
|   └── Controllers & Seeders                                 |
+──────────────────┬───────────────────────────┬──────────────+
                   │                           │
                   ▼                           ▼
+──────────────────────────────────+  +──────────────────────────────+
|          MongoDB Atlas           |  |      Cloud Storage Engine    |
|                                  |  |                              |
|  - Users (Roles, Favorites)      |  |  - Cloudinary Cloud Storage  |
|  - Tools (Catalog, Usage Counts) |  |  - Local Fallback Directory  |
|  - Files (Cloud/Disk references) |  +──────────────────────────────+
|  - History (Auditing & Logs)     |
|  - Notifications                 |
+──────────────────────────────────+
```

---

## 2. Frontend Architecture

The frontend is a Single Page Application (SPA) built using **React 18**, **TypeScript**, and **Vite**:

### Key Layers:
- **`src/pages`**: Page components representing routes (Landing, Auth, User Dashboard, Admin Studio, Document Tools).
- **`src/components`**: Modular and reusable UI elements divided into:
  - `common/`: Navbar, Footer, Badge, Modal, ToolCard, NotificationsDropdown, EmptyState.
  - `dashboard/`: Analytics cards, Quick Actions, Activity charts.
  - `tools/`: Canvas controls, paper size pickers, filter sliders, image cropping panels.
- **`src/features`**: Redux Toolkit slices managing global state:
  - `authSlice`: User credentials, token hydration, profile status.
  - `toolsSlice`: Tool catalog, active filters, search index, favorite toggles.
  - `adminSlice`: User directory, system-wide metrics, moderation actions.
  - `notificationsSlice`: User inbox, real-time unread counts.
- **`src/routes`**: Route definitions utilizing React Router DOM v7:
  - `GuestRoute`: Blocks authenticated users from `/login` and `/register`.
  - `ProtectedRoute`: Guards user workspaces, history, files, and tools.
  - `AdminRoute`: Enforces `role: "admin"` for system governance pages.
- **`src/api`**: Configured Axios client with automatic Bearer token injection, request timeouts, and structured error interceptors.

---

## 3. Backend Architecture

The backend is built with **Node.js**, **Express**, and **TypeScript** adhering to a Layered Controller-Service-Repository pattern:

### Architectural Layers:
1. **Entry Point & Lifecycle (`server.ts`)**:
   - Environment variable validation (`validateEnv`) before server start.
   - Database connection management (`connectDB`) with auto-reconnect.
   - Initial tool registry auto-seeding (`seedInitialTools`).
   - Graceful shutdown listeners for `SIGINT` and `SIGTERM`.
2. **Application Middleware Pipeline (`app.ts`)**:
   - `helmet()` with tailored Content Security Policy and cross-origin resource policies.
   - `cors()` with origin validation based on production URL whitelist.
   - `express-mongo-sanitize` to strip NoSQL injection vectors.
   - `hpp` for HTTP Parameter Pollution prevention.
   - `express-rate-limit` for global API protection and specialized auth rate limiting.
   - `express.json` (10MB) & `express.urlencoded` (10MB).
   - `notFoundHandler` for 404 trapping.
   - `errorHandler` for standardized JSON error envelopes.
3. **Data Access Layer (`models/`)**:
   - **`User`**: Schema with bcrypt pre-save password hashing and method helpers.
   - **`Tool`**: Catalog schema with category taxonomy, slug indexing, and view counters.
   - **`File`**: File asset tracking with dual cloud/disk resolution and user references.
   - **`History`**: Action auditing and processing timestamps.
   - **`Notification`**: System and user messaging records.

---

## 4. Security & Privacy Model

1. **Password Security**: Passwords hashed with `bcryptjs` (salt rounds: 10). Passwords are never returned in queries (`select: false`).
2. **JWT Authentication**: High-entropy secret key verification, stateless session tracking with customizable expiry (default 7 days).
3. **Client-Side Document Processing**: Tools like Passport Photo Studio, Image to PDF, and PDF Merge execute in the user's browser runtime using Canvas & WebAssembly PDF engines, ensuring high privacy for sensitive documents (e.g. Aadhaar cards).
4. **File Upload Hardening**:
   - Strict MIME-type filtering (allowing only `image/jpeg`, `image/png`, `image/webp`, `application/pdf`).
   - File size caps at 10MB per upload.
   - Randomized collision-proof filenames.
5. **Role-Based Access Control (RBAC)**: All administrative routes are locked down via `requireAdmin` middleware.
