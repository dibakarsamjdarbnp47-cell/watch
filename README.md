# Watch Video, Dream in Hand - Direct Selling & MLM ERP

Production-ready Direct Selling, Dual-Leg Binary MLM ERP, E-Commerce Storefront, Order & Delivery Tracking, and Login ID-Based BP Wallet System.

---

## 🌐 HostyCare Deployment Guide (GitHub -> HostyCare)

This application includes a React + Vite frontend (`dist/`), an Express.js backend (`dist/server.cjs`), and a persistent SQLite database (`data/wdh_ecommerce.db`), ready for **HostyCare cPanel ("Setup Node.js App")** or **HostyCare VPS**.

### Option A: HostyCare cPanel (GitHub + "Setup Node.js App")

1. **Connect GitHub Repository in cPanel**:
   - Open **cPanel > Files > Git Version Control > Create** and clone your GitHub repository into an application folder (e.g., `/home/yourusername/wdh-app`).
   - *(Or upload project files excluding `node_modules/` and `data/`.)*
2. **Create the Node.js Application in cPanel**:
   - Open **cPanel > Software > Setup Node.js App > Create Application**.
   - Configure the following fields:
     - **Node.js version**: `20.x` or `22.x` (Recommended, minimum `18.x`)
     - **Application mode**: `Production`
     - **Application root**: `wdh-app` (your cloned repo folder)
     - **Application URL**: Your domain or subdomain (e.g., `yourdomain.com`)
     - **Application startup file**: `app.js`
   - Click **Create**.
3. **Configure Environment Variables**:
   - In **Setup Node.js App** (or in `.env` inside `wdh-app`), add:
     - `NODE_ENV` = `production`
     - `GEMINI_API_KEY` = *(Optional)* Your Gemini API key for AI Advisory
     - `RAZORPAY_KEY_ID` = *(Optional)* Your Razorpay Key ID for online payments
     - `RAZORPAY_KEY_SECRET` = *(Optional)* Your Razorpay Key Secret for payment verification
     - `DB_PATH` = *(Optional)* Custom writable path for SQLite DB (defaults to `data/wdh_ecommerce.db`)
   - Note: `PORT` is managed automatically by HostyCare/Passenger.
4. **Install Dependencies & Auto-Build**:
   - Click **Run NPM Install** in the cPanel Node.js App panel.
   - `postinstall` automatically runs `npm run build` to generate `dist/index.html` and `dist/server.cjs` (and `app.js` also auto-builds if `dist/` is missing).
   - Click **Restart** (or **Start App**).
   - Visit your domain — the storefront, API, and SQLite database (`data/wdh_ecommerce.db`) will initialize automatically.

### Option B: HostyCare VPS / Cloud Node.js (Ubuntu / Nginx / PM2)

```bash
git clone <your-repo-url> wdh-app
cd wdh-app
cp .env.example .env   # Fill in optional keys if needed
npm install
npm run build
npm install -g pm2
pm2 start app.js --name wdh-erp
pm2 save
```
Configure Nginx as a reverse proxy forwarding port `80`/`443` to `http://127.0.0.1:3000`.
