# Deployment Walkthrough: MrBikeBD

This document details the exact step-by-step plan you need to take to host your Next.js frontend on Vercel and your Django backend on Render, connected via your global GitHub repository.

## Phase 1: Deploying the Django Backend to Render

By providing a `render.yaml` file, we've automated the hard parts. Render calls this a "Blueprint" deployment, which reads properties directly from the repository.

1. **Push your code to GitHub.** Ensure `render.yaml` and `backend/build.sh` are pushed to your `main` branch.
2. Sign into [Render.com](https://render.com/).
3. On the dashboard, click the **"New +"** button, and select **"Blueprint"** (instead of Web Service).
4. Connect the Vercel/GitHub integration and select your `mrbike-production` repository.
5. Render will instantly read the `render.yaml` file and prepare the web service `mrbike-backend`.
6. Click **Apply**. Render will begin installing the web service framework.
7. **CRITICAL STEP - Provide Secrets**: Once the web service is created in the Render dashboard, go to its **Environment** tab, because we intentionally left `DATABASE_URL` and `REDIS_URL` blank (marked `sync: false`):
   * Add your Supabase Postgres string to `DATABASE_URL`.
   * Add a Redis string (e.g. from Upstash or a free internal Render Redis) to `REDIS_URL`.
   * Fill out other keys your Django project needs (e.g. `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `BREVO_SMTP_USER`, `BREVO_API_KEY`, etc.)
8. Once variables are added, trigger a "Manual Deploy". 
9. After deployment succeeds, copy your active Render Web URL (e.g., `https://mrbike-backend.onrender.com`).

> [!TIP]
> The build instructions for Render (`pip install`, `collectstatic`, `migrate`) are strictly defined in `backend/build.sh`. You can safely edit these later without breaking infrastructure!

---

## Phase 2: Deploying the Next.js Frontend to Vercel

Vercel natively understands Next.js workspaces and monorepos perfectly. 

1. Sign into [Vercel.com](https://vercel.com/) with your GitHub account.
2. Click **"Add New Project"**.
3. Import the `mrbike-production` repository.
4. **CONFIGURE ROOT DIRECTORY:** In the project config card before deploying, you will see a setting called **Root Directory**. Click "Edit" and choose `frontend`. 
   > *This is critical as it instructs Vercel to only build from the frontend folder.*
5. The Framework Preset will automatically switch to **Next.js**.
6. **Set Environment Variables:** Dropdown the "Environment Variables" section and paste in all required `.env` values found relative to your `frontend/.env` file:
   * `NEXT_PUBLIC_API_URL` = `https://mrbike-backend.onrender.com/api/v1` *(The URL you got from Phase 1, make sure to add `/api/v1` or `/api` as per your project routing).*
   * `NEXT_PUBLIC_APP_URL` = `https://mrbikebd.vercel.app` *(Your future Vercel domain)*
   * `NEXTAUTH_URL` = `https://mrbikebd.vercel.app`
   * `NEXTAUTH_SECRET` = *(Generate a secure string)*
   * `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` = *(Your Cloud Name)*
   * `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = *(Google OAuth Client ID)*
7. Click **Deploy**. Vercel will bundle your frontend.

---

## Phase 3: Synchronizing CORS & Webhooks

When both deployments finish, we need to ensure the backend officially allows requests coming from the newly generated Vercel frontend domain.

1. **Find Frontend Domain:** Note what domain Vercel assigned you (e.g., `https://mrbikebd.vercel.app` or if using a custom domain, `https://mrbikebd.com`).
2. **Setup Server CORS Origins:** Go back to your Render Dashboard -> "Environment" tab for your web service.
3. Update `CORS_ALLOWED_ORIGINS` to include your exact frontend URL (e.g., `value: "https://mrbikebd.vercel.app"`).
4. Update `ALLOWED_HOSTS` or `FRONTEND_URL` environment variables if your backend email templates/callbacks rely on them.
5. Render will prompt you to redeploy or save. 
6. Navigate to your Vercel URL and attempt to log in using Google OAuth (or credentials) to verify end-to-end communication!
