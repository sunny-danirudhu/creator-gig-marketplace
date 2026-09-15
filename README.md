# ⚡ CreatorGig Marketplace

**Track:** Track 2: Real-World AI Products  
**Brief:** Creator Economy — Creator Gig Marketplace  
**Hackathon Participant ID:** `AZIS-KMVAG6`  
**Deployed Public URL:** `https://creator-gig-marketplace.onrender.com` *(Placeholder: To be updated after live deployment)*

---

## 📖 Overview

**CreatorGig Marketplace** is a real-world, full-stack creator economy marketplace web application built for **Track 2: Real-World AI Products**. It connects creators offering creative, digital, and AI services (such as video editing, thumbnail design, voiceover, copy, and AI workflow automation) with clients looking to hire them for specific projects.

The project is architected with strict adherence to the hackathon brief: zero authentication/signups (utilizing a seamless top-level Role Switcher), persistent file-based data storage, clean responsive UI with Tailwind CSS, and a RESTful backend.

---

## 🌟 The 5 Required Features

1. **Post a Gig (Creator View)**:
   - Creators can publish new gigs with Title, Category, Rate (₹ INR), Description, and Creator Name.
   - Validates all required inputs and immediately persists the gig to the database.
2. **Browse & Search Marketplace**:
   - Lists all creator gigs in responsive cards with category badges, creator details, and rates.
   - Live category filtering (*Video Editing, Graphic Design, Voiceover & Audio, Writing & Copy, AI & Automation*).
   - Real-time search across gig titles, categories, descriptions, and creator names.
3. **Book a Gig (Client View)**:
   - Clients can click **"Book Gig"** on any marketplace card.
   - Booking modal collects: Client Name, Email/Contact Info, Target Delivery Date, and Project Scope & Requirements.
   - Submits the request with an initial status of `Pending` and provides immediate on-screen confirmation.
4. **Creator Dashboard**:
   - Creators can view all incoming booking requests with client details, rate, and project scope.
   - Shows real-time status tags: `Pending`, `Accepted`, `Declined`.
   - Actionable one-click **"Accept Booking"** and **"Decline Booking"** buttons that immediately update the booking status.
5. **My Bookings (Client View)**:
   - Clients track all their requests with color-coded status badges:
     - 🟡 **Pending**: Waiting for creator review.
     - 🟢 **Accepted**: Creator accepted the project; work is underway.
     - 🔴 **Declined**: Creator is unavailable for this booking.

---

## ⚖️ The 3 Product Decisions (DP1, DP2, DP3)

Detailed technical documentation is available in [DECISIONS.md](DECISIONS.md).

- **Decision Point 1 (DP1) — Recovery After Decline**:
  When a creator declines a booking, the client sees a clear `✕ Declined` status badge alongside an informational notice and a prominent button: **`🔍 Find Another Gig in Marketplace →`** allowing the client to return to the marketplace with zero friction to discover and hire another creator.
- **Decision Point 2 (DP2) — Multiple Pending Bookings**:
  Clients are allowed to submit multiple concurrent pending bookings without arbitrary locks or throttling, reflecting real-world creator workflows where pending status does not commit a creator.
- **Decision Point 3 (DP3) — Search Relevance First, Then Newest Gigs**:
  Gigs are ranked by search relevance score first (title match > category match > creator match > description match), with ties broken by creation timestamp (`createdAt` descending), giving newer creators immediate discovery.

---

## 🛠️ Technology Stack

- **Runtime & Server**: Node.js + Express.js (REST API, static file server)
- **Database**: Persistent JSON storage (`data/marketplace.json`) with atomic file writes
- **Frontend**: Responsive HTML5, Tailwind CSS (via CDN), Vanilla JavaScript
- **No-Auth Role Model**: Top navigation Role Switcher ("Client View" vs "Creator View") allowing instant switching and hassle-free judging
- **Testing**: Automated Node.js integration test runner (`test_app.js`)

---

## 🔌 API Information

| Method | Endpoint | Description | Request Body / Query Params |
|---|---|---|---|
| `GET` | `/api/health` | Service health status check | None |
| `GET` | `/api/gigs` | Fetch gigs (filtered & ranked) | Query: `?search={query}&category={cat}` |
| `POST` | `/api/gigs` | Publish a new creator gig | Body: `{ title, category, rate, description, creatorName }` |
| `GET` | `/api/bookings` | Fetch all bookings or filter | Query: `?clientName={name}&creatorName={name}` |
| `POST` | `/api/bookings` | Create a new booking request | Body: `{ gigId, clientName, clientContact, deliveryDate, projectDetails }` |
| `PATCH` | `/api/bookings/:id/status` | Accept or decline a booking | Body: `{ status: "Accepted" \| "Declined" }` |

---

## 💻 Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- Git

### Installation & Running

1. Clone or open the repository folder:
   ```bash
   cd creator-gig-marketplace
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run automated tests to verify functionality:
   ```bash
   npm test
   ```

4. Start the application server:
   ```bash
   npm start
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🚀 Free Deployment Guide (Render.com)

1. Push this repository to **GitHub**.
2. Visit [Render.com](https://render.com) and create a free account.
3. Click **New +** → **Web Service** and connect your GitHub repository.
4. Set the configuration:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
5. Click **Deploy Web Service**. Once deployed, copy your live HTTPS URL into the header of this README.
