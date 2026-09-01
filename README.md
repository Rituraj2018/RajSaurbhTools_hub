# RajSaurbh Tool Hub Pro 🚀

> **All-in-One Document, Photo, and PDF Processing Platform**  
> Engineered with a production-ready, clean, and scalable MERN Stack architecture using end-to-end TypeScript and modern glassmorphic UI.

---

## 📖 Table of Contents

- [Project Overview](#-project-overview)
- [Technology Stack](#-technology-stack)
- [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
- [Prerequisites](#-prerequisites)
- [Installation Steps](#-installation-steps)
- [Environment Variables Setup](#-environment-variables-setup)
- [Running the Project](#-running-the-project)
  - [Run Backend](#1-run-backend)
  - [Run Frontend](#2-run-frontend)
- [API Endpoints](#-api-endpoints)
- [Future Roadmap](#-future-roadmap)

---

## 🌟 Project Overview

**Vikas Tool Hub Pro** is an enterprise-grade document, photo, and PDF processing platform designed to provide high-speed, secure, and privacy-preserving client-side & server-side processing utilities.

### Core Processing Suites (Upcoming Phase 2):
1. **PDF Processing Suite**: Merge, Split, Compress, Convert, Sign, and Protect PDFs.
2. **Photo & Image Studio**: AI Background Removal, Smart Resizing, WebP/PNG Compression, and Filters.
3. **Document & OCR Lab**: DOCX to PDF, Optical Character Recognition (OCR), Text Extraction, and Metadata Scrubber.

---

## 🛠 Technology Stack

### **Frontend**
- **Framework / Runtime**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS (with PostCSS & Autoprefixer)
- **Routing**: React Router DOM (v7)
- **State Management**: Redux Toolkit & React-Redux
- **HTTP Client**: Axios (with custom interceptors)
- **Icons**: Lucide React

### **Backend**
- **Runtime**: Node.js
- **Web Framework**: Express.js
- **Language**: TypeScript
- **Database ODM**: Mongoose (MongoDB)
- **Security & Utilities**: CORS, Dotenv, Async Handler, Custom Error Response Layer
- **Execution & Hot Reloading**: TSX (TypeScript Execute & Watch)

---

## 📂 Project Architecture & Directory Structure

```
vikas-tool-hub-pro/
│
├── frontend/                     # React + Vite + TypeScript Client
│   ├── src/
│   │   ├── api/                  # Axios HTTP client instance and API endpoint services
│   │   ├── assets/               # Static illustrations, logos, and icons
│   │   ├── components/
│   │   │   ├── common/           # Reusable UI elements (Navbar, Footer, Buttons, Badges)
│   │   │   ├── dashboard/        # Future tool dashboards and statistics widgets
│   │   │   └── tools/            # Future tool viewers and processing panels
│   │   ├── features/             # Redux Toolkit global store and system slices
│   │   ├── layouts/              # RootLayout with persistent navigation and footer
│   │   ├── pages/                # Route views (HomePage with live Health Monitor, NotFound)
│   │   ├── routes/               # React Router DOM route hierarchy definitions
│   │   ├── services/             # Client-side domain processing services
│   │   ├── types/                # Shared TypeScript interfaces & types
│   │   ├── utils/                # Utility helpers (formatters, parsers)
│   │   ├── App.tsx               # Root component wrapping Redux & Router
│   │   ├── main.tsx              # Application DOM entry point
│   │   └── index.css             # Tailwind directives and custom scrollbar theme
│   ├── .env.example              # Frontend environment variables template
│   ├── .env                      # Local frontend environment variables
│   ├── index.html                # HTML template with typography and SEO metadata
│   ├── package.json              # Frontend dependencies and scripts
│   ├── postcss.config.js         # PostCSS configuration
│   ├── tailwind.config.js        # Tailwind CSS theme extension
│   ├── tsconfig.json             # Frontend TypeScript configuration
│   ├── tsconfig.node.json        # Vite TypeScript build config
│   └── vite.config.ts            # Vite bundler configuration & path aliases
│
├── backend/                      # Node.js + Express + TypeScript API Server
│   ├── src/
│   │   ├── config/               # Environment variable parser and MongoDB connection
│   │   ├── controllers/          # Request handlers (e.g. HealthController)
│   │   ├── middlewares/          # Centralized error handler and 404 router
│   │   ├── models/               # Mongoose database models and schemas
│   │   ├── routes/               # API routes (Health check & route aggregator)
│   │   ├── services/             # Business logic layer
│   │   ├── utils/                # ApiError, ApiResponse, and asyncHandler
│   │   ├── validators/           # Request input validation schemas
│   │   ├── app.ts                # Express application configuration & CORS setup
│   │   └── server.ts             # Server bootstrap & graceful shutdown handler
│   ├── .env.example              # Backend environment variables template
│   ├── .env                      # Local backend environment variables
│   ├── package.json              # Backend dependencies and scripts
│   └── tsconfig.json             # Backend TypeScript compilation configuration
│
└── README.md                     # Project documentation
```

---

## ⚡ Prerequisites

Make sure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher (v20+ recommended)
- **npm**: `v9.0.0` or higher
- **MongoDB** (Optional for Phase 1, the backend automatically handles offline mode gracefully)

---

## 📥 Installation Steps

Clone or navigate into the project workspace:

```bash
# Navigate to workspace root
cd vikas-tool-hub-pro
```

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## ⚙️ Environment Variables Setup

Both frontend and backend include ready-to-use `.env.example` templates.

### Backend (`backend/.env`)
```env
MONGODB_URI=mongodb://localhost:27017/rajsaurbh_tool_hub_pro
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_ENV=development
```

---

## 🚀 Running the Project

Frontend and Backend can run completely independently in separate terminal windows.

### 1. Run Backend

From the `backend` folder:
```bash
cd backend

# Start development server with live reload:
npm run dev

# Or build for production:
npm run build
npm start

# Or perform TypeScript type-checking:
npm run typecheck
```

The backend server will start at:  
👉 **`http://localhost:5000`**

---

### 2. Run Frontend

From the `frontend` folder:
```bash
cd frontend

# Start Vite development server:
npm run dev

# Or build for production:
npm run build

# Or perform TypeScript type-checking:
npm run typecheck
```

The frontend application will start at:  
👉 **`http://localhost:5173`**

---

## 📡 API Endpoints

| Method | Endpoint | Description | Response Example |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health check & MongoDB status | `{"success": true, "message": "Server is running", "database": "connected"}` |

---

## 🔮 Future Roadmap (Upcoming Phases)

- **Phase 2**: Authentication & User Profile Management (JWT, Sessions, OAuth).
- **Phase 3**: Client-side & Worker-based PDF Tools (pdf-lib, pdfjs).
- **Phase 4**: Photo Editing & Processing Engine (Sharp, Canvas API, WebAssembly).
- **Phase 5**: OCR & Document Conversion Engine (Tesseract.js, Pandoc integrations).
- **Phase 6**: Cloud Storage (AWS S3 / Cloudinary) & Job Queues (BullMQ / Redis).

---

## 📄 License

This project is licensed under the ISC License.
