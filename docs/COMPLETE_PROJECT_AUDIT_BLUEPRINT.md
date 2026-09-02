# COMPLETE ARCHITECTURE AUDIT, BLUEPRINT & SYSTEM ANALYSIS
**Project Name:** Vikas Tool Hub Pro *(internal code namespace: `vikas-tool-hub-pro` / `RajSaurbh Tool Hub Pro`)*  
**Audit Date:** September 2, 2026  
**Auditor:** Senior MERN Stack Software Architect & Code Reviewer  
**Audit Scope:** Full Project Discovery, Static Code Analysis, Configuration Review, API & Database Blueprint, Security & Quality Assessment.

---

## 1. EXECUTIVE SUMMARY

### 1.1 What is this project?
**Vikas Tool Hub Pro** is a full-stack, enterprise-grade web application designed for high-speed document manipulation, biometric passport photo generation, ID card print formatting (Aadhaar & PM-JAY Ayushman), PDF compilation, and cloud file management.

### 1.2 What problem does it solve?
Citizens, cyber café operators, business centers, and digital service kiosks (*CSC / Jan Seva Kendra*) frequently struggle with formatting government ID cards, generating standardized 35×45mm passport photos with compliant margins and backdrops, merging multi-page application PDFs, and converting mobile scans into compliant print sheets. Existing tools often demand expensive desktop software (like Photoshop) or upload sensitive identity documents to untrusted third-party servers.

Vikas Tool Hub Pro solves this by providing:
1. **Zero-Latency Client-Side Processing:** Biometric cropping, canvas filtering, PDF generation, and PDF merging execute inside the client's browser (via Canvas API, `pdf-lib`, and `jspdf`), keeping sensitive biometric data private and fast.
2. **Centralized Cloud Vault & Synchronization:** An authenticated Express & MongoDB backend allows users to store files (via local storage or Cloudinary), track processing audit trails, receive system notifications, and bookmark favorite tools.
3. **Administrative Governance:** A dedicated role-protected Admin Dashboard for monitoring user registrations, storage metrics, tool status toggles, and user account management.

### 1.3 Who can use it?
- **Everyday Consumers:** For making passport/visa photos and converting scans to PDF.
- **Cyber Cafes & CSC Kiosk Operators:** For instant tiling of Aadhaar and Ayushman cards onto A4 paper sheets (up to 5 cards per page) for PVC and photo-paper printing.
- **Administrators:** For managing registered users, tools catalog, and storage quotas.

### 1.4 Main Purpose & Core Paradigm
A **hybrid client-server architecture**:
- Heavy media rendering (image cropping, canvas color replacement, PDF compilation, vector merging) is offloaded to the client machine to guarantee near-zero latency, low server bandwidth costs, and heightened data privacy.
- Authentication, authorization, metadata storage, file vaulting, user preferences, and analytics are centrally managed by an Express.js and MongoDB backend.

### 1.5 Technology Stack Summary
- **Frontend:** React 18.3, Vite 6.1, TypeScript 5.7, Tailwind CSS 3.4, Redux Toolkit 2.5, React Router 7.1, Axios 1.7, Lucide React, `pdf-lib`, `jspdf`, `pdfjs-dist`.
- **Backend:** Node.js (v20+), Express.js 4.21, TypeScript 5.7 (running via `tsx` watch), Mongoose 8.9, Multer 2.3, Cloudinary SDK 2.11, Bcryptjs 3.0, JSON Web Token (JWT) 9.0.
- **Security Middleware:** Helmet 8.3, Express-Mongo-Sanitize 2.2, HPP 0.2.3, Express-Rate-Limit 8.7, CORS.
- **Database:** MongoDB (Local or Atlas) managed through Mongoose Object-Document Mapper.

### 1.6 Core Questions Answered
| Question | Answer | Details |
| :--- | :---: | :--- |
| **Frontend only or Full Stack?** | **Full Stack** | Fully decoupled Vite React frontend + Express TypeScript backend. |
| **Authentication implemented?** | **Yes (Implemented)** | JWT Bearer tokens, bcrypt (10 rounds), protected routes, Redux auth slice. |
| **MongoDB connected?** | **Yes (Implemented)** | Mongoose connection with event listeners, graceful shutdown, auto-seeding. |
| **APIs implemented?** | **Yes (Implemented)** | 23 REST endpoints across Auth, Tools, Files, History, Users, Admin, Notifications, Health. |
| **File upload implemented?** | **Yes (Implemented)** | Dual storage: Multer disk storage fallback + Cloudinary buffer streaming. |

---

## 2. ACTUAL PROJECT STRUCTURE

```
c:\RajTools/
├── .env.example
├── .gitignore
├── README.md
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   ├── COMPLETE_PROJECT_AUDIT_BLUEPRINT.md
│   └── DEPLOYMENT.md
│
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── uploads/
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── test_cloudinary_step20.ts
│       ├── test_history_step16.ts
│       ├── config/
│       │   ├── database.ts
│       │   └── env.ts
│       ├── controllers/
│       │   ├── adminController.ts
│       │   ├── authController.ts
│       │   ├── fileController.ts
│       │   ├── health.controller.ts
│       │   ├── historyController.ts
│       │   ├── notificationController.ts
│       │   ├── toolController.ts
│       │   └── userController.ts
│       ├── middlewares/
│       │   ├── adminMiddleware.ts
│       │   ├── authMiddleware.ts
│       │   ├── errorHandler.middleware.ts
│       │   ├── notFound.middleware.ts
│       │   ├── rateLimiter.ts
│       │   └── uploadMiddleware.ts
│       ├── models/
│       │   ├── File.ts
│       │   ├── History.ts
│       │   ├── index.ts
│       │   ├── Notification.ts
│       │   ├── Tool.ts
│       │   └── User.ts
│       ├── routes/
│       │   ├── adminRoutes.ts
│       │   ├── authRoutes.ts
│       │   ├── fileRoutes.ts
│       │   ├── health.route.ts
│       │   ├── historyRoutes.ts
│       │   ├── index.ts
│       │   ├── notificationRoutes.ts
│       │   ├── toolRoutes.ts
│       │   └── userRoutes.ts
│       ├── services/
│       │   ├── cloudinaryService.ts
│       │   └── index.ts
│       ├── types/
│       │   └── express.d.ts
│       ├── utils/
│       │   ├── apiError.ts
│       │   ├── apiResponse.ts
│       │   ├── asyncHandler.ts
│       │   └── seedTools.ts
│       └── validators/
│           ├── auth.validator.ts
│           ├── index.ts
│           └── tool.validator.ts
│
└── frontend/
    ├── .env
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vercel.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx
        ├── index.css
        ├── main.tsx
        ├── vite-env.d.ts
        ├── api/
        │   ├── axiosClient.ts
        │   ├── filesApi.ts
        │   ├── historyApi.ts
        │   └── index.ts
        ├── assets/
        ├── components/
        │   ├── aadhaar/
        │   ├── ayushman/
        │   ├── common/
        │   ├── dashboard/
        │   ├── files/
        │   ├── history/
        │   ├── imageToPdf/
        │   ├── notifications/
        │   ├── passport/
        │   ├── pdfMerge/
        │   └── tools/
        ├── features/
        │   ├── admin/
        │   ├── auth/
        │   ├── notifications/
        │   ├── tools/
        │   ├── store.ts
        │   └── systemSlice.ts
        ├── layouts/
        ├── pages/
        ├── routes/
        ├── services/
        ├── types/
        └── utils/
```

---

## 3. TECHNOLOGY STACK SPECIFICATION

### 3.1 Frontend Dependencies
- `react` / `react-dom` (^18.3.1)
- `vite` (^6.1.0)
- `typescript` (^5.7.3)
- `@reduxjs/toolkit` (^2.5.1)
- `react-redux` (^9.2.0)
- `react-router-dom` (^7.1.5)
- `axios` (^1.7.9)
- `tailwindcss` (^3.4.17)
- `lucide-react` (^0.475.0)
- `pdf-lib` (^1.17.1)
- `jspdf` (^4.2.1)
- `pdfjs-dist` (^6.3.289)

### 3.2 Backend Dependencies
- `node.js` / `express` (^4.21.2)
- `mongoose` (^8.9.5)
- `jsonwebtoken` (^9.0.3)
- `bcryptjs` (^3.0.3)
- `multer` (^2.3.0)
- `cloudinary` (^2.11.0)
- `helmet` (^8.3.0)
- `cors` (^2.8.5)
- `express-rate-limit` (^8.7.0)
- `express-mongo-sanitize` (^2.2.0)
- `hpp` (^0.2.3)
- `dotenv` (^16.4.7)
- `tsx` (^4.19.2)

---

## 4. COMPLETE FEATURE ANALYSIS

| # | Feature | Status | Frontend File | Backend File | Database Model | Description |
| :---: | :--- | :---: | :--- | :--- | :---: | :--- |
| **1** | Home Page | **IMPLEMENTED** | `HomePage.tsx` | `health.route.ts` | N/A | Landing page with platform hero, live backend ping, feature grid. *(Note: Featured list uses `mockTools`)* |
| **2** | Dashboard | **PARTIALLY IMPLEMENTED** | `DashboardPage.tsx` | `historyRoutes.ts` | `HistoryRecord`, `FileRecord` | UI works and launches tools, but system metrics & recent activity display `mockData.ts` instead of live DB queries. |
| **3** | Authentication | **IMPLEMENTED** | `authSlice.ts` | `authRoutes.ts` | `User` | Complete JWT authentication flow with Bearer headers and localStorage persistence. |
| **4** | Register | **IMPLEMENTED** | `RegisterPage.tsx` | `authController.ts:25` | `User` | Name, email, password validation, duplicate check, bcrypt hash, 201 response. |
| **5** | Login | **IMPLEMENTED** | `LoginPage.tsx` | `authController.ts:69` | `User` | Email & password credential match, bcrypt compare, JWT generation. |
| **6** | Logout | **IMPLEMENTED** | `Navbar.tsx`, `Header.tsx` | N/A (Stateless JWT) | N/A | Clears token from Redux state and localStorage, redirects to `/login`. |
| **7** | JWT Authentication | **IMPLEMENTED** | `axiosClient.ts:14` | `authMiddleware.ts:24` | `User` | Signs token with `JWT_SECRET`, auto-attaches to Axios requests, validates user and `isBlocked` flag. |
| **8** | Protected Routes | **IMPLEMENTED** | `ProtectedRoute.tsx`, `AdminRoute.tsx` | `authMiddleware.ts` | `User` | Route guards preventing unauthenticated or non-admin access. |
| **9** | User Profile | **PARTIALLY IMPLEMENTED** | `authSlice.ts:59` | `authController.ts:110` | `User` | API `GET /api/auth/profile` works, but no dedicated `/profile` UI page exists (settings routes back to dashboard). |
| **10** | Tools Dashboard | **IMPLEMENTED** | `ToolsPage.tsx` | `toolRoutes.ts` | `Tool` | Filterable catalog showing all available tools fetched dynamically from MongoDB. |
| **11** | Tool Search | **IMPLEMENTED** | `ToolsPage.tsx:109` | `toolController.ts:53` | `Tool` | Real-time text search querying tool name, description, and category. |
| **12** | Tool Categories | **IMPLEMENTED** | `ToolCategoryFilter.tsx` | `toolController.ts:36` | `Tool` | Filtering across Photo, PDF, Document, Image with dynamic counts. |
| **13** | Favorite Tools | **IMPLEMENTED** | `FavoritesPage.tsx` | `userController.ts:84` | `User.favoriteTools` | Add/remove tool bookmarks saved atomically to user's MongoDB document. |
| **14** | Passport Photo Studio | **IMPLEMENTED** | `PassportPhotoStudioPage.tsx` | Client Engine | N/A | Comprehensive 4-step wizard: Crop -> Enhance -> Backdrop -> Print Sheet. |
| **15** | Image Upload | **IMPLEMENTED** | `PassportUploader.tsx` | `uploadMiddleware.ts` | N/A | Drag-and-drop file upload with format and dimension validation. |
| **16** | Image Preview | **IMPLEMENTED** | `PassportPreview.tsx` | Client Canvas | N/A | Interactive preview of single 35x45mm cutout and multi-copy print sheet. |
| **17** | Image Crop | **IMPLEMENTED** | `PhotoEditor.tsx` | `passportProcessor.ts` | N/A | 7:9 ratio biometric cropping with face/eye/chin guides and auto-center algorithm. |
| **18** | Brightness Control | **IMPLEMENTED** | `PhotoControls.tsx` | Client Canvas | N/A | Real-time canvas filter adjustment from -100 to +100. |
| **19** | Contrast Control | **IMPLEMENTED** | `PhotoControls.tsx` | Client Canvas | N/A | Real-time canvas filter adjustment from -100 to +100. |
| **20** | Background Selection | **IMPLEMENTED** | `BackgroundSelector.tsx` | `passportProcessor.ts:167` | N/A | Color replacement (White, Light Grey, Light Blue, Red, Custom hex) with tolerance matching. |
| **21** | Passport Print Layout | **IMPLEMENTED** | `PrintLayout.tsx` | Client Canvas | N/A | Generates sheets for A4 (8-24 copies) and 4x6" (4-8 copies) with cutting lines. |
| **22** | Image Download | **IMPLEMENTED** | `PassportPreview.tsx:39` | Client Browser | N/A | Export to high-res JPG, PNG, and PDF sheets at 300 DPI. |
| **23** | Image to PDF | **IMPLEMENTED** | `ImageToPdfPage.tsx` | `imageToPdfProcessor.ts` | N/A | Converts JPG/PNG/WEBP to PDF via `jspdf` with reordering, margins, auto-orientation. |
| **24** | PDF Merge | **IMPLEMENTED** | `PdfMergePage.tsx` | `pdfMergeProcessor.ts` | N/A | Browser-side PDF joining with `pdf-lib`, drag/drop ordering, page tally, instant download. |
| **25** | PDF Split | **PLANNED / NOT IMPLEMENTED** | N/A (Generic Modal) | N/A | `Tool` (Seeded) | Seeded in database, but clicking it opens a fallback modal. No split engine written. |
| **26** | Aadhaar Print Studio | **IMPLEMENTED** | `AadhaarPrintStudioPage.tsx` | `aadhaarProcessor.ts` | N/A | Crops Front & Back of Aadhaar cards (CR80 standard 85.6×54mm), tiles 1-5 cards on A4. |
| **27** | Ayushman Card Print | **IMPLEMENTED** | `AyushmanPrintStudioPage.tsx` | `ayushmanProcessor.ts` | N/A | PM-JAY card dual-side cropping, contrast enhancement, 1-5 cards on A4 print sheet. |
| **28** | File Upload | **IMPLEMENTED** | `FileUploadModal.tsx` | `fileController.ts:31` | `FileRecord` | Multipart upload with 10MB limit, mime-type verification, and disk/Cloudinary dispatch. |
| **29** | My Files | **IMPLEMENTED** | `MyFilesPage.tsx` | `fileController.ts:108` | `FileRecord` | File manager with storage statistics, search, type filtering, sorting, grid/table view. |
| **30** | File Download | **IMPLEMENTED** | `filesApi.ts:62` | `fileController.ts:200` | `FileRecord` | Triggers download stream for local files or redirects to Cloudinary secure URL. |
| **31** | File Delete | **IMPLEMENTED** | `FileDeleteModal.tsx` | `fileController.ts:244` | `FileRecord` | Deletes file record from MongoDB and unlinks from local disk or Cloudinary API. |
| **32** | Processing History | **PARTIALLY IMPLEMENTED** | `HistoryPage.tsx` | `historyController.ts` | `HistoryRecord` | Full CRUD backend & History viewer UI exist, but tools don't call `recordHistory` on completion. |
| **33** | Notifications | **IMPLEMENTED** | `NotificationBell.tsx` | `notificationController.ts` | `Notification` | In-app bell dropdown with unread badge, 60-second polling, mark as read, delete. |
| **34** | Admin Panel | **IMPLEMENTED** | `AdminLayout.tsx` | `adminRoutes.ts` | N/A | Dedicated navigation layout protected by `AdminRoute` and `requireAdmin` middleware. |
| **35** | User Management | **IMPLEMENTED** | `AdminUsersPage.tsx` | `adminController.ts:77` | `User` | Search users, block/unblock accounts, cascade delete users and their files/history. |
| **36** | Tool Management | **IMPLEMENTED** | `AdminToolsPage.tsx` | `toolController.ts:98` | `Tool` | Admin can create new tools, edit properties, toggle active/featured, and delete tools. |
| **37** | Cloudinary Integration | **IMPLEMENTED** | N/A (Backend service) | `cloudinaryService.ts` | `FileRecord` | Conditional storage engine: uses Cloudinary when credentials exist, local disk otherwise. |
| **38** | MongoDB Connection | **IMPLEMENTED** | N/A (Backend) | `database.ts` | All models | Resilient connection with auto-reconnect, URI credentials masking, auto-seeding. |
| **39** | Error Handling | **IMPLEMENTED** | `axiosClient.ts:32` | `errorHandler.middleware.ts` | N/A | Centralized Express error handler mapping CastError, JWT errors, validation errors to JSON. |
| **40** | Security Hardening | **IMPLEMENTED** | Client route guards | `app.ts:16-119` | N/A | Helmet CSP, HSTS, MongoSanitize, HPP, auth brute-force limiter, upload limiter. |

---

## 5. DATABASE ARCHITECTURE

### 5.1 Models Blueprint
- **User Model (`User.ts`)**: `name`, `email` (unique), `password` (hashed, select: false), `role` (`user`|`admin`), `isBlocked`, `favoriteTools`.
- **Tool Model (`Tool.ts`)**: `name`, `slug` (unique), `description`, `category`, `icon`, `isActive`, `isFeatured`.
- **FileRecord Model (`File.ts`)**: `user` (ref: User), `originalName`, `fileName`, `fileType`, `mimeType`, `fileSize`, `fileUrl`, `cloudinaryPublicId`, `storageProvider` (`local`|`cloudinary`).
- **HistoryRecord Model (`History.ts`)**: `user` (ref: User), `tool`, `toolName`, `inputFiles`, `outputFile`, `status` (`processing`|`completed`|`failed`), `metadata`.
- **Notification Model (`Notification.ts`)**: `user` (ref: User), `title`, `message`, `type`, `isRead`.

### 5.2 Entity-Relationship Diagram

```
                        ┌─────────────────────────┐
                        │          USER           │
                        ├─────────────────────────┤
                        │ _id: ObjectId           │
                        │ name: String            │
                        │ email: String (Unique)  │
                        │ password: Hash (Hidden) │
                        │ role: 'user' | 'admin'  │
                        │ isBlocked: Boolean      │
                        │ favoriteTools: [String] │
                        └────────────┬────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           │ 1:N                     │ 1:N                     │ 1:N
           ▼                         ▼                         ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│      FILERECORD      │  │    HISTORYRECORD     │  │     NOTIFICATION     │
├──────────────────────┤  ├──────────────────────┤  ├──────────────────────┤
│ _id: ObjectId        │  │ _id: ObjectId        │  │ _id: ObjectId        │
│ user: Ref(User)      │  │ user: Ref(User)      │  │ user: Ref(User)      │
│ originalName: String │  │ tool: String         │  │ title: String        │
│ fileUrl: String      │  │ status: String       │  │ message: String      │
│ storageProvider      │  │ inputFiles: [...]    │  │ type: String         │
│ fileSize: Number     │  │ outputFile: {...}    │  │ isRead: Boolean      │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘

                                     ▲
                                     │ References tool slug
                          ┌──────────┴──────────┐
                          │        TOOL         │
                          ├─────────────────────┤
                          │ _id: ObjectId       │
                          │ slug: String(Unique)│
                          │ name: String        │
                          │ category: String    │
                          │ isActive: Boolean   │
                          │ isFeatured: Boolean │
                          └─────────────────────┘
```

---

## 6. COMPLETE API ENDPOINTS REFERENCE

| Method | Endpoint | Auth Required | Rate Limit | Controller Handler | Purpose |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `GET` | `/api/health` | No | Global | `health.controller.ts:getHealthStatus` | Server uptime & DB connection probe |
| `POST` | `/api/auth/register` | No | 15 / 15min | `authController.ts:registerUser` | Register new user account |
| `POST` | `/api/auth/login` | No | 15 / 15min | `authController.ts:loginUser` | Login & obtain JWT Bearer token |
| `GET` | `/api/auth/profile` | **Bearer** | Global | `authController.ts:getUserProfile` | Fetch profile of authenticated user |
| `GET` | `/api/tools` | No | Global | `toolController.ts:getTools` | Query tools catalog (category, search) |
| `GET` | `/api/tools/:slug` | No | Global | `toolController.ts:getToolBySlug` | Get single tool specification |
| `POST` | `/api/tools` | **Admin** | Global | `toolController.ts:createTool` | Create a new tool definition |
| `PUT` | `/api/tools/:id` | **Admin** | Global | `toolController.ts:updateTool` | Update tool properties |
| `DELETE` | `/api/tools/:id` | **Admin** | Global | `toolController.ts:deleteTool` | Delete a tool from catalog |
| `POST` | `/api/files/upload` | **Bearer** | 30 / 10min | `fileController.ts:uploadFile` | Upload single file (max 10MB) |
| `GET` | `/api/files` | **Bearer** | Global | `fileController.ts:getUserFiles` | List authenticated user files & storage stats |
| `GET` | `/api/files/:id` | **Bearer** | Global | `fileController.ts:getFileById` | Get file metadata or download stream |
| `DELETE` | `/api/files/:id` | **Bearer** | Global | `fileController.ts:deleteFile` | Delete file from disk/cloud and database |
| `GET` | `/api/history` | **Bearer** | Global | `historyController.ts:getUserHistory` | Get user's processing history log |
| `POST` | `/api/history` | **Bearer** | Global | `historyController.ts:createHistoryEntry` | Record a completed tool processing action |
| `DELETE` | `/api/history` | **Bearer** | Global | `historyController.ts:clearUserHistory` | Purge user's processing history log |
| `GET` | `/api/users/favorites` | **Bearer** | Global | `userController.ts:getFavoriteTools` | Get user's bookmarked tools |
| `POST` | `/api/users/favorites/:toolId`| **Bearer** | Global | `userController.ts:addFavoriteTool` | Bookmark a tool |
| `DELETE` | `/api/users/favorites/:toolId`| **Bearer** | Global | `userController.ts:removeFavoriteTool` | Remove bookmark from a tool |
| `GET` | `/api/notifications` | **Bearer** | Global | `notificationController.ts:getNotifications` | Fetch user notifications & unread count |
| `PATCH` | `/api/notifications/read-all` | **Bearer** | Global | `notificationController.ts:markAllNotificationsRead` | Mark all notifications as read |
| `PATCH` | `/api/notifications/:id/read` | **Bearer** | Global | `notificationController.ts:markNotificationRead` | Mark single notification as read |
| `DELETE` | `/api/notifications/:id` | **Bearer** | Global | `notificationController.ts:deleteNotification` | Delete a notification |
| `GET` | `/api/admin/stats` | **Admin** | Global | `adminController.ts:getAdminStats` | Platform analytics & growth trends |
| `GET` | `/api/admin/users` | **Admin** | Global | `adminController.ts:getAdminUsers` | List all registered users (paginated) |
| `PATCH` | `/api/admin/users/:id/block` | **Admin** | Global | `adminController.ts:blockUser` | Suspend a user account |
| `PATCH` | `/api/admin/users/:id/unblock`| **Admin** | Global | `adminController.ts:unblockUser` | Restore a suspended user account |
| `DELETE` | `/api/admin/users/:id` | **Admin** | Global | `adminController.ts:deleteAdminUser` | Cascade delete user + files + history |
| `GET` | `/api/admin/files` | **Admin** | Global | `adminController.ts:getAdminFiles` | System-wide file audit with owner info |

---

## 7. SYSTEM BLUEPRINT

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             END USER / OPERATOR                             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REACT FRONTEND APPLICATION                          │
│                                                                             │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────┐  │
│  │   Navigation Views    │  │   Client Processors   │  │   State / API   │  │
│  ├───────────────────────┤  ├───────────────────────┤  ├─────────────────┤  │
│  │ • Home / Landing      │  │ • Passport Studio     │  │ • Redux Toolkit │  │
│  │ • Dashboard           │  │ • Aadhaar Studio      │  │ • Axios Client  │  │
│  │ • Tools Directory     │  │ • Ayushman Studio     │  │ • LocalStorage  │  │
│  │ • Cloud Vault (Files) │  │ • Image to PDF Engine │  │ • Notifications │  │
│  │ • History Audit Log   │  │ • PDF Merge Engine    │  │ • Route Guards  │  │
│  │ • Admin Portal        │  │ (Zero Server Latency) │  │                 │  │
│  └───────────────────────┘  └───────────────────────┘  └─────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       │ HTTPS / JSON / Multipart
                                       │ Authorization: Bearer <JWT>
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EXPRESS BACKEND APPLICATION                           │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Security Stack: Helmet CSP • CORS • MongoSanitize • HPP • Rate Limits │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌───────────────────────────────────┴───────────────────────────────────┐  │
│  │ Middleware & Routing: JWT AuthGuard • AdminRoleGuard • Multer Upload  │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌───────────────────────────────────┴───────────────────────────────────┐  │
│  │ Controllers: Auth • Tools • Files • History • Users • Admin • Notifs  │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌───────────────────────────────────┴───────────────────────────────────┐  │
│  │ Services: Cloudinary Streaming Service (Local disk /uploads fallback) │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       │
                                       │ Mongoose ODM (TLS / TCP)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MONGODB DATABASE                               │
│                                                                             │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────────┐  │
│  │     Users     │ │     Tools     │ │  FileRecords  │ │ HistoryRecords  │  │
│  └───────────────┘ └───────────────┘ └───────────────┘ └─────────────────┘  │
│  ┌───────────────┐                                                          │
│  │ Notifications │                                                          │
│  └───────────────┘                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. KEY FINDINGS & RECOMMENDED ROADMAP

### Issues Identified
1. **Dashboard Mock Data:** `DashboardPage.tsx` renders mock data from `mockData.ts` instead of querying live endpoints (`/api/history`, `/api/files`, `/api/users/favorites`).
2. **Missing History Trigger:** Tool execution components do not dispatch `historyApi.recordHistory()`, leaving processing history logs unpopulated until manual entries are added.
3. **Ayushman Slug Mismatch:** Seed data uses `ayushman-card-print` while frontend routes use `ayushman-print-tool`.
4. **Planned Tools Pending Pages:** `PDF Split` and `Image Compressor` are seeded in catalog but lack dedicated processing interfaces.

### Priority Action Plan
- **Phase 1 (Critical):** Wire `DashboardPage.tsx` to live backend stats and emit `historyApi.recordHistory()` from all 5 active tools.
- **Phase 2 (Enhancement):** Add a 1-click "Save to Cloud Vault" button in tool download modals.
- **Phase 3 (New Features):** Build dedicated `PdfSplitPage.tsx` and `ImageCompressorPage.tsx` processors.
