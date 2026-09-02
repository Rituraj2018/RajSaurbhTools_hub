# Deployment Guide — RajSaurbh Tool Hub Pro 🚀

This guide provides end-to-end instructions for deploying the **RajSaurbh Tool Hub Pro** application into a production environment.

---

## 🏗 Recommended Production Stack

| Component | Recommended Host | Alternative Hosts |
| :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com) | Netlify, Cloudflare Pages, AWS Amplify |
| **Backend API** | [Render](https://render.com) | [Railway](https://railway.app), AWS App Runner, Fly.io |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) | Self-hosted MongoDB, AWS DocumentDB |
| **Media/File Storage** | [Cloudinary](https://cloudinary.com) | AWS S3, local container volume |

---

## 1. 🗄 Database Deployment: MongoDB Atlas

1. **Sign Up / Log In**: Visit [MongoDB Atlas](https://www.mongodb.com/atlas) and create an account.
2. **Create a Cluster**:
   - Choose the free **M0 Shared** cluster tier (or higher for production).
   - Select your preferred cloud provider and closest region (e.g., AWS / Mumbai or US-East).
3. **Database User Configuration**:
   - Under **Security > Database Access**, click **Add New Database User**.
   - Select **Password Authentication**.
   - Create a username (e.g., `rajsaurbh_admin`) and a strong generated password.
   - Assign the **Read and write to any database** role.
4. **Network Access / IP Whitelist**:
   - Under **Security > Network Access**, click **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) so that hosting providers like Render/Railway can connect.
5. **Obtain Connection String**:
   - Navigate to **Database > Deployment > Connect > Drivers**.
   - Copy the MongoDB connection URI:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/rajsaurbh_tool_hub_pro?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database credentials.

---

## 2. ☁️ Backend Deployment: Render

1. **Sign Up / Log In**: Go to [Render](https://render.com).
2. **Create a Web Service**:
   - Click **New + > Web Service**.
   - Connect your GitHub repository (`RajSaurbhTools_hub`).
3. **Configure Service Settings**:
   - **Name**: `rajsaurbh-tools-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free` or `Starter`
4. **Configure Environment Variables**:
   In the **Environment** tab, add the following key-value pairs:
   - `NODE_ENV` = `production`
   - `PORT` = `5000` (or leave default Render port)
   - `MONGODB_URI` = `<Your MongoDB Atlas URI from Step 1>`
   - `JWT_SECRET` = `<Generate a 64-char hex string: openssl rand -hex 64>`
   - `JWT_EXPIRES_IN` = `7d`
   - `CLIENT_URL` = `https://your-frontend-domain.vercel.app` *(update once frontend is deployed)*
   - `CLOUDINARY_CLOUD_NAME` = `<Optional Cloudinary Cloud Name>`
   - `CLOUDINARY_API_KEY` = `<Optional Cloudinary API Key>`
   - `CLOUDINARY_API_SECRET` = `<Optional Cloudinary API Secret>`
5. **Deploy**:
   - Click **Create Web Service**.
   - Once deployed, copy your backend URL (e.g., `https://rajsaurbh-tools-backend.onrender.com`).
   - Verify health: `https://rajsaurbh-tools-backend.onrender.com/api/health`.

---

## 3. 🌐 Frontend Deployment: Vercel

1. **Sign Up / Log In**: Go to [Vercel](https://vercel.com).
2. **Import Project**:
   - Click **Add New... > Project**.
   - Import your GitHub repository (`RajSaurbhTools_hub`).
3. **Configure Framework & Root**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. **Configure Environment Variables**:
   Add the following environment variable:
   - `VITE_API_BASE_URL` = `https://rajsaurbh-tools-backend.onrender.com/api`
   - `VITE_APP_ENV` = `production`
5. **Deploy**:
   - Click **Deploy**.
   - Vercel will build and publish your SPA.
6. **SPA Routing Configuration (`vercel.json`)**:
   Ensure `frontend/vercel.json` exists for client-side routing fallback:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
7. **Synchronize CORS**:
   - Return to your backend settings on Render/Railway.
   - Update `CLIENT_URL` to match your Vercel URL (e.g. `https://rajsaurbh-tools.vercel.app`).
   - Trigger a redeploy of the backend so the updated CORS policy takes effect.

---

## 4. 🚂 Alternative Backend Deployment: Railway

If deploying backend on Railway:
1. Go to [Railway.app](https://railway.app).
2. Click **New Project > Deploy from GitHub repo**.
3. Select repo, then set **Root Directory** to `backend`.
4. In **Variables**, add all backend variables (`NODE_ENV`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, etc.).
5. In **Settings > Build**, verify build command `npm run build` and start command `npm start`.
6. Generate a public domain under **Networking**.

---

## 5. 🔒 Post-Deployment Verification Checklist

- [ ] **Health Endpoint**: Access `/api/health` and verify database shows `"connected"`.
- [ ] **Initial Seeding**: The server seeds default tools automatically upon first boot.
- [ ] **Authentication**: Register a new user account, log in, and verify JWT storage in localStorage.
- [ ] **Document Tools**:
  - Test **Passport Photo Studio** download / preview.
  - Test **Image to PDF** generation.
  - Test **PDF Merge** with 2+ sample PDFs.
  - Test **Aadhaar Print Studio** formatting.
  - Test **Ayushman Print Tool** processing.
- [ ] **File Storage**: Upload sample files and verify Cloudinary / disk storage retrieval.
- [ ] **History & Activity**: Check `/history` to ensure activities are logged.
- [ ] **Admin Dashboard**: Log in with an admin account and verify `/admin` metrics and user controls.
