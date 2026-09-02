# RajSaurbh Tools_Hub 🚀

> **Enterprise-Grade All-in-One Document, Photo & PDF Processing Platform**  
> Engineered with a modern, high-performance MERN stack with complete end-to-end TypeScript, client-side zero-latency processing engines, and a sleek modern UI.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_Ready-brightgreen.svg)](https://www.mongodb.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

---

## 📖 Table of Contents

- [🌟 Features Overview](#-features-overview)
- [🛠 Technology Stack](#-technology-stack)
- [📂 Project Architecture & Directory Structure](#-project-architecture--directory-structure)
- [⚡ Quick Start Guide (Local Setup)](#-quick-start-guide-local-setup)
- [⚙️ Environment Variables](#️-environment-variables)
- [🏗 Production Build](#-production-build)
- [🚀 Deployment Recommendations](#-deployment-recommendations)
- [📡 API Endpoints Reference](#-api-endpoints-reference)
- [📚 Documentation Directory](#-documentation-directory)
- [🔒 Security & Privacy](#-security--privacy)
- [📄 License](#-license)

---

## 🌟 Features Overview

### 1. 📷 Photo & Document Studios (Client-Side & Server-Side)
- **Passport Photo Studio**:
  - Global preset standards (India 3.5×4.5cm, US 2×2", UK, Canada, Schengen, Custom).
  - Print sheet generator: Single, 4x6" (6 / 8 copies), A4 (8 / 16 / 32 / 36 copies).
  - Real-time controls: Brightness, Contrast, Saturation, Crop, and Border styling.
  - One-click instant high-resolution PNG & PDF downloads.
- **Aadhaar Print Studio**:
  - Smart Card & standard print layouts for Aadhaar identity cards.
  - Auto-formatting, border configuration, and multi-copy printing.
- **Ayushman Bharat Print Studio**:
  - Pre-configured PM-JAY PVC card and paper print layout templates.

### 2. 📄 PDF & Conversion Suite
- **Image to PDF Converter**:
  - Batch upload images (JPEG, PNG, WEBP).
  - Drag-and-drop reordering, page orientation (Portrait/Landscape), margin controls, and auto-scaling.
  - Lightning-fast client-side generation using `jsPDF`.
- **PDF Merge Studio**:
  - Multi-file PDF concatenation in user-defined order.
  - Powered by `pdf-lib` for zero-server data transfer overhead.

### 3. 👤 User Workspace & Activity
- **Authentication & Profiles**: JWT-based session security, profile management, and password hashing (`bcryptjs`).
- **Processing History**: Complete log of actions, processed tools, timestamp audits, and status tracking.
- **Favorites System**: Bookmark frequently used tools for one-click access.
- **Cloud & Local Storage**: Dual storage pipeline supporting **Cloudinary** and local disk storage fallback.
- **Interactive Notification Center**: In-app notifications and activity alerts.

### 4. 🛡️ Admin Management & Analytics
- **System Overview Dashboard**: User registration metrics, tool invocation rates, and storage consumption.
- **User Management**: Search, filter, inspect, ban/unban, and cascading delete user accounts.
- **Tool Management**: Dynamic tool catalog CRUD, slug resolution, and category tagging.
- **File Audit Center**: System-wide file audit with uploader identity and file storage sizes.

---

## 🛠 Technology Stack

### **Frontend**
- **Framework**: React 18 (TypeScript)
- **Bundler & Tooling**: Vite 6, PostCSS, Autoprefixer
- **Styling**: Tailwind CSS (with custom glassmorphism and modern dark/light themes)
- **Routing**: React Router DOM (v7) with Guest, Protected, and Admin Route guards
- **State Management**: Redux Toolkit & React-Redux
- **Client Processing**: `pdf-lib`, `jspdf`, HTML5 Canvas API
- **Icons**: Lucide React
- **HTTP Client**: Axios with centralized request/response interceptors

### **Backend**
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (TypeScript)
- **Database**: MongoDB via Mongoose ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **File Upload**: Multer with strict MIME validation & Cloudinary SDK
- **Security**: Helmet, CORS origin validation, `express-mongo-sanitize`, `hpp`, `express-rate-limit`
- **Compiler**: TypeScript Compiler (`tsc`) & TSX runner

---

## 📂 Project Architecture & Directory Structure

```
RajTools/
├── docs/                             # Full Project Documentation
│   ├── ARCHITECTURE.md               # System & Data Flow Design
│   ├── API_DOCUMENTATION.md          # REST API Specification
│   └── DEPLOYMENT.md                 # Vercel, Render, Atlas Guide
│
├── frontend/                         # React 18 + Vite SPA
│   ├── src/
│   │   ├── api/                      # Axios client & API connectors
│   │   ├── assets/                   # Static assets & graphics
│   │   ├── components/               # Common, layout, and studio UI components
│   │   ├── features/                 # Redux slices (auth, tools, admin, notifications)
│   │   ├── layouts/                  # MainLayout, DashboardLayout, AdminLayout
│   │   ├── pages/                    # 20+ Application pages & studios
│   │   ├── routes/                   # AppRoutes, ProtectedRoute, AdminRoute, GuestRoute
│   │   ├── services/                 # Tool processing service wrappers
│   │   ├── types/                    # Shared TypeScript interfaces
│   │   ├── utils/                    # Helper functions & formatting utilities
│   │   ├── App.tsx                   # Main React component
│   │   ├── main.tsx                  # Client entry point
│   │   └── index.css                 # Tailwind directives & theme styles
│   ├── .env.example                  # Frontend environment template
│   ├── package.json                  # Frontend dependencies
│   ├── tailwind.config.js            # Tailwind styling config
│   ├── tsconfig.json                 # Frontend TypeScript config
│   ├── vercel.json                   # Vercel SPA routing rewrite config
│   └── vite.config.ts                # Vite bundler configuration
│
├── backend/                          # Express.js + TypeScript API
│   ├── src/
│   │   ├── config/                   # Database (MongoDB) & Environment parsers
│   │   ├── controllers/              # Business controllers (Auth, Tools, Files, Admin, etc.)
│   │   ├── middlewares/              # Auth, Admin, Upload, RateLimit, Error handling
│   │   ├── models/                   # Mongoose schemas (User, Tool, File, History, Notification)
│   │   ├── routes/                   # Route declarations & router mounting
│   │   ├── services/                 # Cloudinary & cloud storage services
│   │   ├── types/                    # Backend TypeScript definitions
│   │   ├── utils/                    # ApiError, ApiResponse, seeders
│   │   ├── validators/               # Input validation rules
│   │   ├── app.ts                    # Express app initialization & security middlewares
│   │   └── server.ts                 # Server entry point & graceful shutdown
│   ├── .env.example                  # Backend environment template
│   ├── package.json                  # Backend dependencies
│   ├── tsconfig.json                 # Backend TypeScript config
│   └── uploads/                      # Local file storage fallback
│
├── .env.example                      # Root environment reference
├── .gitignore                        # Git exclusion rules
└── README.md                         # Project documentation
```

---

## ⚡ Quick Start Guide (Local Setup)

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MongoDB**: Local MongoDB instance or free MongoDB Atlas URI

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Rituraj2018/RajSaurbhTools_hub.git
cd RajSaurbhTools_hub

# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Files

Create `.env` in `backend/`:
```bash
cp .env.example .env
```
*(Fill in `MONGODB_URI` and `JWT_SECRET`)*

Create `.env` in `frontend/`:
```bash
cp .env.example .env
```

### 3. Start Development Servers

In terminal 1 (Backend):
```bash
cd backend
npm run dev
# Running at http://localhost:5000 (Health Check: http://localhost:5000/api/health)
```

In terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# Running at http://localhost:5173
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `5000` | Port for the Express server |
| `NODE_ENV` | Yes | `development` | Environment mode (`development` or `production`) |
| `MONGODB_URI` | Yes | `mongodb://localhost:27017/...` | MongoDB Atlas or local connection string |
| `JWT_SECRET` | Yes | *(Random hex in prod)* | JWT token signing key |
| `JWT_EXPIRES_IN` | No | `7d` | JWT lifespan duration |
| `CLIENT_URL` | Yes (in prod) | `http://localhost:5173` | Allowed CORS origin for frontend |
| `CLOUDINARY_CLOUD_NAME` | No | `""` | Cloudinary cloud account name |
| `CLOUDINARY_API_KEY` | No | `""` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | `""` | Cloudinary API secret |

### Frontend (`frontend/.env`)
| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | Yes | `http://localhost:5000/api` | Backend API URL |
| `VITE_APP_ENV` | No | `development` | App mode |

---

## 🏗 Production Build

To verify and produce optimized production bundles:

```bash
# Test & build backend
cd backend
npm run build
# Compiled JavaScript output placed in backend/dist/

# Test & build frontend
cd ../frontend
npm run build
# Optimized production SPA bundle placed in frontend/dist/
```

---

## 🚀 Deployment Recommendations

- **Frontend**: [Vercel](https://vercel.com) (zero-config Vite SPA support with `vercel.json` rewrite).
- **Backend API**: [Render](https://render.com) or [Railway](https://railway.app) (Node.js runtime with `npm run build && npm start`).
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (Managed cloud database).
- **Media Storage**: [Cloudinary](https://cloudinary.com) for cloud asset delivery.

👉 For detailed step-by-step deployment instructions, please refer to [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Auth Level |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | Service & DB Health Check | Public |
| `POST` | `/api/auth/register` | User Account Registration | Public |
| `POST` | `/api/auth/login` | User Login & JWT Generation | Public |
| `GET` | `/api/auth/profile` | Current Authenticated Profile | Authenticated |
| `GET` | `/api/tools` | List Tools Catalog | Public |
| `GET` | `/api/tools/:slug` | Retrieve Tool by Slug | Public |
| `POST` | `/api/files/upload` | Upload Document or Image | Authenticated |
| `GET` | `/api/files` | Get User's Uploaded Files | Authenticated |
| `DELETE` | `/api/files/:id` | Delete File Record & Asset | Authenticated |
| `GET` | `/api/history` | Retrieve User Activity History | Authenticated |
| `POST` | `/api/history` | Log Processing History | Authenticated |
| `GET` | `/api/users/favorites` | Get User Favorite Tools | Authenticated |
| `POST` | `/api/users/favorites/:toolId`| Add Tool to Favorites | Authenticated |
| `GET` | `/api/notifications` | User Inbox & Notifications | Authenticated |
| `GET` | `/api/admin/stats` | Admin Aggregated Statistics | Admin Only |
| `GET` | `/api/admin/users` | Admin User Directory | Admin Only |
| `PATCH` | `/api/admin/users/:id/block`| Block User Account | Admin Only |
| `GET` | `/api/admin/files` | Admin System Files Audit | Admin Only |

👉 For full parameters, schemas, and error responses, see [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md).

---

## 📚 Documentation Directory

- 🏛️ [System Architecture & Design Document](docs/ARCHITECTURE.md)
- 📡 [Complete REST API Reference](docs/API_DOCUMENTATION.md)
- 🚀 [Production Deployment Step-by-Step Guide](docs/DEPLOYMENT.md)

---

## 🔒 Security & Privacy

- **Data Privacy**: Client-side document and image generation runs locally in the browser memory whenever possible to protect sensitive personal records.
- **Input Sanitization**: Express request bodies, parameters, and query strings are sanitized with `express-mongo-sanitize` and `hpp` to block NoSQL injection and parameter pollution.
- **Security Headers**: Standardized HTTP security headers enforced via `helmet`.
- **Rate Limiting**: Tiered rate limiters protect auth and upload endpoints against brute-force and DDoS attacks.
- **Authentication**: Password hashes are secured with 10 salt rounds of `bcryptjs` and stateless JWTs.

---

## 📄 License

This project is licensed under the **ISC License**.
