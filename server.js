const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- API ROUTES ---

// 1. GET /api/gigs - Browse & Search with Category Filter & Ranking (Feature 2 & Decision Point 3)
app.get("/api/gigs", (req, res) => {
  try {
    const { search = "", category = "all" } = req.query;
    const gigs = db.getGigs({ search, category });
    res.json({ success: true, count: gigs.length, gigs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. POST /api/gigs - Post a Gig (Feature 1)
app.post("/api/gigs", (req, res) => {
  try {
    const { title, category, rate, description, creatorName } = req.body;
    const newGig = db.addGig({ title, category, rate, description, creatorName });
    res.status(201).json({ success: true, gig: newGig });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 3. GET /api/bookings - Get Bookings for Client or Creator (Feature 4 & 5)
app.get("/api/bookings", (req, res) => {
  try {
    const { clientName, creatorName } = req.query;
    const bookings = db.getBookings({ clientName, creatorName });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. POST /api/bookings - Book a Gig (Feature 3 & Decision Point 2)
app.post("/api/bookings", (req, res) => {
  try {
    const { gigId, clientName, clientContact, projectDetails, deliveryDate } = req.body;
    const booking = db.addBooking({ gigId, clientName, clientContact, projectDetails, deliveryDate });
    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 5. PATCH /api/bookings/:id/status - Accept or Decline a Booking (Feature 4 & Decision Point 1)
app.patch("/api/bookings/:id/status", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = db.updateBookingStatus(id, status);
    res.json({ success: true, booking: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Catch-all route to serve the frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Creator Marketplace running on http://localhost:${PORT}`);
  console.log(`=========================================`);
});
