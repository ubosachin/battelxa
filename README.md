# BATTLEXA (Battlexa) - Production-Ready Esports Tournament Platform

[![Next.js App Router](https://img.shields.io/badge/Next.js-16_App_Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB Mongoose](https://img.shields.io/badge/MongoDB-Atlas_%26_Mongoose-green?style=for-the-badge&logo=mongodb)](https://mongoosejs.com/)
[![Razorpay Payments](https://img.shields.io/badge/Razorpay-HMAC_SHA256_Verified-blue?style=for-the-badge&logo=razorpay)](https://razorpay.com/)

**BATTLEXA** is a complete, production-grade esports tournament platform purpose-built for **Free Fire MAX** and **Battlegrounds Mobile India (BGMI)**. Engineered with a unified Next.js App Router full-stack architecture, it delivers atomic capacity reservation, cryptographic payment verification, timed custom room credential distribution, and automated wallet prize payouts.

---

## 🎮 Platform Features & Architecture

### 1. Three Distinct Roles & Role-Based Access Control (RBAC)
- **PLAYER**:
  - Secure signup/login with password hashing via `bcryptjs` and session tokens signed with `jose`.
  - Contender profile management with game-specific IDs: **Free Fire UID** and **BGMI Character ID**.
  - Tournament discovery with multi-criteria filters (game, mode, free/paid, format, prize pool, date).
  - Atomic slot locking and entry fee deduction from wallet.
  - **Timed Custom Room Credential Vault**: Room ID and password remain strictly encrypted on the server until the configured release countdown (15 minutes prior to match start).
  - Esports Squad and Clan management with unique 6-character squad join codes.
  - Immutable Wallet Ledger with Razorpay top-up, prize money credit, and UPI/Bank withdrawal requests.
  - Referee dispute filing with scoreboard screenshot evidence attachment.
  - In-app notification center.

- **ORGANIZER**:
  - Host application process with admin compliance review and verified badges.
  - Tournament creation wizard: game selection, solo/duo/squad format, prize pool breakdown, slot caps, schedules, and custom rules.
  - Tournament status controller: `DRAFT` ➔ `PUBLISHED` ➔ `REGISTRATION_OPEN` ➔ `REGISTRATION_CLOSED` ➔ `CHECK_IN` ➔ `LIVE` ➔ `COMPLETED` / `CANCELLED`.
  - Room ID and password management with automated scheduled release.
  - Scorecard and match result submission with placement points, kill finishes, and mandatory screenshot proof.
  - Instant prize credit distribution to winning player wallets upon result finalization.
  - Participant roster export (CSV).
  - Organizer revenue payout requests.

- **ADMIN**:
  - High-security platform moderation dashboard.
  - Organizer verification, approval, and suspension portal.
  - Tournament supervision with emergency cancellation and automated entry fee refunds.
  - Financial payout clearance desk: review UPI VPAs / Bank account details and record UTR transaction references.
  - Referee Dispute Resolution portal with attached evidence inspection.
  - Immutable Administrator Audit Log tracking all privileged administrative operations.

### 2. 📱 Mobile App (PWA) Experience
- **Native Esports App Feel**: Built as an installable Progressive Web App (PWA) with `manifest.webmanifest`, standalone display mode, orientation locking, and zero-flicker overscroll containment.
- **Mobile Bottom Navigation Dock**: Role-adaptive bottom bar (Home, Tournaments, My Matches, Wallet with live balance badge, and Contender Profile) with haptic vibration feedback.
- **Top App Bar**: Header displays live wallet balance pill, instant notifications, and user avatar.
- **1-Tap PWA Install**: Automatic Chrome/Android install banner and iOS Safari "Add to Home Screen" instructions.
- **Touch-Friendly Filter Chips**: Horizontal swipeable chips for instant switching between Free Fire MAX and BGMI without opening dropdowns.
- **Mobile Sticky Join Dock**: On match detail screens, a sticky bottom dock provides 1-tap slot reservation and prize pool display.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js (App Router, Turbopack, Server Actions, Route Handlers) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 with bespoke Dark Gaming Esports design tokens |
| **Database** | MongoDB with Mongoose (cached connection for Vercel Serverless) |
| **Authentication** | `jose` (HS256 JWT tokens) + `bcryptjs` (Cost 12) + HttpOnly SameSite cookies |
| **Payments** | Razorpay Orders, HMAC-SHA256 signature verification, idempotent webhooks |
| **Media Storage** | Cloudinary signed uploads with MIME & file size security checks |
| **Testing** | Vitest unit and integration test suite |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v20+` or `v22+`
- npm `v10+`
- MongoDB local instance or MongoDB Atlas URI

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/battlexa.git
cd "BATTELXA - UBO"

# Install dependencies
npm install --legacy-peer-deps
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Configure your environment variables:
```env
NEXT_PUBLIC_APP_NAME="BATTLEXA"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

MONGODB_URI="mongodb://localhost:27017/battlexa"
JWT_SECRET="battlexa_super_secret_jwt_encryption_key_change_in_production_32chars!"
JWT_EXPIRES_IN="7d"

NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_BATTLEXA_DEV_KEY"
RAZORPAY_KEY_SECRET="BATTLEXA_DEV_SECRET_KEY_987654"
RAZORPAY_WEBHOOK_SECRET="BATTLEXA_WEBHOOK_SECRET_KEY_54321"

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="battlexa-cloud"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="sampleCloudinaryApiSecretKey"

ADMIN_BOOTSTRAP_EMAIL="admin@battlexa.gg"
ADMIN_BOOTSTRAP_PASSWORD="BattlexaSuperAdminPass2026!"
```

### 4. Database Seeding (Demo Data)
Populate the database with demo accounts, Free Fire MAX and BGMI tournaments, squads, and registrations:
```bash
npm run db:seed
```

#### Pre-Configured Demo Credentials:
| Role | Email | Password |
|---|---|---|
| **ADMIN** | `admin@battlexa.gg` | `BattlexaSuperAdminPass2026!` |
| **ORGANIZER** | `organizer@battlexa.gg` | `BattlexaHost2026!` |
| **PLAYER** | `player@battlexa.gg` | `BattlexaPlayer2026!` |

*(Note: The login page includes 1-click Demo Fill buttons for immediate evaluation).*

### 5. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Running Unit & Integration Tests
```bash
npm run test
```

### 7. Compiling Production Build
```bash
npm run build
```

---

## 🔒 Security & Compliance Architecture

1. **Server-Side Pricing & Entry Calculation**:
   - Client-submitted prices are never trusted. Entry fees are fetched and verified directly from the tournament database record on the server.
2. **Cryptographic Payment Integrity**:
   - Razorpay payment orders are verified using server-side HMAC-SHA256 signature verification (`crypto.createHmac('sha256', secret)`).
3. **Timed Room Credential Vault**:
   - Room ID and Password are not returned by public APIs. The `/api/tournaments/[id]/room-credentials` endpoint enforces:
     - Authentication verification
     - Confirmed registration check
     - Time barrier check (`releaseTime <= now`)
4. **Skill-Based Competition Compliance**:
   - BATTLEXA strictly complies with Indian skill-based gaming legal frameworks. No casino wagering, betting, or games of chance are permitted or implemented.

---

## 🚢 Deployment to Vercel

1. Push your code to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Set your environment variables (`MONGODB_URI`, `JWT_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`).
4. Vercel automatically detects Next.js App Router and applies `vercel.json`.
5. Deploy!

---

## 📜 License
MIT License. Built for the competitive esports ecosystem.
