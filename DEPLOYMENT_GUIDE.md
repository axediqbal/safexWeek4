# 🚀 DevPulse — Cloud Deployment & Live URL Guide

This guide enables you to deploy the **DevPulse Modern Code Intelligence Public API Platform** to the cloud for free in under 2 minutes, generating a permanent public HTTPS link (`https://devpulse-api.onrender.com`) ready to share on LinkedIn, GitHub, and resumes.

---

## 🌟 What the Single Live URL Serves

Once deployed, your single public cloud domain provides all 4 surfaces seamlessly:
- **`https://<your-app>.onrender.com/`** — Modern Code Intelligence Developer Portal & Interactive Studio
- **`https://<your-app>.onrender.com/app`** — React 2026 SaaS Intelligence Dashboard (Vite + React 19)
- **`https://<your-app>.onrender.com/docs`** — OpenAPI 3.0 Swagger UI Interactive Documentation
- **`https://<your-app>.onrender.com/health`** — Public System Health & Uptime Check
- **`https://<your-app>.onrender.com/api/v2/...`** — Commercial Code Intelligence Endpoints with Sliding-Window Rate Limiting

---

## ⚡ Option 1: Render (Recommended — 100% Free, Zero Config)

Render is the optimal host for DevPulse because its persistent Node service maintains in-memory sliding-window tenant rate limits and token buckets in real-time.

### Step 1: Push your Code to GitHub
Open your terminal in the project directory and run:

```bash
# 1. Initialize remote (replace with your GitHub repository URL)
git remote add origin https://github.com/<your-username>/devpulse-public-api.git

# 2. Push all code to GitHub
git branch -M main
git push -u origin main
```

*(If you already have a GitHub repo, simply run `git push origin main`)*

---

### Step 2: Deploy on Render in 2 Clicks
1. Go to **[https://dashboard.render.com](https://dashboard.render.com)** and sign in with GitHub.
2. Click the **"New +"** button in the top right and select **"Web Service"**.
3. Choose your repository: `devpulse-public-api` and click **Connect**.
4. Configure settings (or let Render auto-detect from `render.yaml`):
   - **Name:** `devpulse-api` *(or your custom name)*
   - **Runtime:** `Node`
   - **Region:** Any *(e.g., Frankfurt or Oregon)*
   - **Branch:** `main` *(or `master`)*
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Click **"Deploy Web Service"**!

🎉 **Done!** Within ~90 seconds, Render will build both backend and React frontend and give you your live HTTPS link:
```text
https://devpulse-api.onrender.com
```

---

## ⚡ Option 2: Vercel Deployment

If you prefer Vercel:

1. Install the Vercel CLI or import the GitHub repo on [vercel.com](https://vercel.com).
2. The project contains pre-configured [`vercel.json`](file:///c:/Users/Dell/Desktop/ahmed/AHMED%20INTERNSHIP%20SAFEX/week%204/vercel.json) and [`api/index.js`](file:///c:/Users/Dell/Desktop/ahmed/AHMED%20INTERNSHIP%20SAFEX/week%204/api/index.js).
3. Run:
```bash
npx vercel
```
4. Follow the prompt instructions to complete the deploy.

---

## 💼 Ready-to-Post LinkedIn Caption

Copy and customize this post for your LinkedIn profile:

```text
🚀 Excited to launch DevPulse — a production-grade Commercial Public API Product & Developer Studio for Software Engineering Intelligence! 

Built with Node.js, Express, React, Vite, and OpenAPI 3.0, DevPulse delivers developer tooling at scale:

✨ Core Highlights:
• Multi-Tenant Rate Limiting: High-performance Sliding-Window Counter algorithm preventing boundary burst attacks with sub-microsecond overhead.
• Tiered Commercial Monetization: Free (5 req/min), Developer (20 req/min), and Enterprise (100 req/min) quotas with automatic RFC 6585 (429 Too Many Requests) and Retry-After headers.
• Semantic Versioning Lifecycle: Dual-track v1 (with RFC 8594 Sunset deprecation headers) and breaking-change v2 support.
• 2026 Light Studio UI: Modern Developer Portal and React SaaS Dashboard inspired by Stripe & Linear.
• OpenAPI 3.0 Interactive Docs: Full Swagger UI specification with contract test suites.

🔗 Live WebApp & API: https://<your-app>.onrender.com/
📖 Interactive API Docs: https://<your-app>.onrender.com/docs
💻 GitHub Repository: https://github.com/<your-username>/devpulse-public-api

#softwareengineering #api #nodejs #reactjs #webdevelopment #backend #fullstack #systemdesign #developers
```
