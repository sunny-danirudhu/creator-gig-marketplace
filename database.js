const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "data", "marketplace.json");

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { gigs: [], bookings: [] };
    }
    let raw = fs.readFileSync(DATA_FILE, "utf-8");
    if (raw.charCodeAt(0) === 0xFEFF) {
      raw = raw.slice(1);
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading data file:", err);
    return { gigs: [], bookings: [] };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing data file:", err);
    throw err;
  }
}

// 1. Get Gigs with Category Filtering and Decision Point 3 (Relevance first, then newest)
function getGigs({ search = "", category = "all" } = {}) {
  const data = readData();
  let gigs = [...data.gigs];

  // Category filter
  if (category && category.toLowerCase() !== "all") {
    gigs = gigs.filter(
      (g) => g.category.toLowerCase() === category.toLowerCase()
    );
  }

  const query = search.trim().toLowerCase();

  if (query) {
    const tokens = query.split(/\s+/).filter(Boolean);

    // Score each gig for search relevance
    const scored = gigs.map((gig) => {
      let score = 0;
      const title = (gig.title || "").toLowerCase();
      const desc = (gig.description || "").toLowerCase();
      const cat = (gig.category || "").toLowerCase();
      const creator = (gig.creatorName || "").toLowerCase();

      // Full phrase matches
      if (title === query) score += 100;
      else if (title.includes(query)) score += 50;

      if (cat === query) score += 40;
      else if (cat.includes(query)) score += 25;

      if (creator.includes(query)) score += 20;
      if (desc.includes(query)) score += 10;

      // Token matches
      tokens.forEach((tok) => {
        if (title.includes(tok)) score += 15;
        if (cat.includes(tok)) score += 10;
        if (creator.includes(tok)) score += 8;
        if (desc.includes(tok)) score += 4;
      });

      return { gig, score };
    });

    // Keep only matching gigs
    const matches = scored.filter((item) => item.score > 0);

    // Decision Point 3: Search relevance first, then newest gigs
    matches.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score; // Higher relevance score first
      }
      return new Date(b.gig.createdAt).getTime() - new Date(a.gig.createdAt).getTime(); // Newest first
    });

    return matches.map((item) => item.gig);
  }

  // If no search query: sort newest gigs first
  gigs.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return gigs;
}

// 2. Add Gig (Feature 1)
function addGig({ title, category, rate, description, creatorName }) {
  if (!title || !category || !rate || !description || !creatorName) {
    throw new Error("All fields (title, category, rate, description, creatorName) are required.");
  }

  const data = readData();
  const newGig = {
    id: `gig-${Date.now()}`,
    title: title.trim(),
    category: category.trim(),
    rate: Number(rate) || 0,
    description: description.trim(),
    creatorName: creatorName.trim(),
    createdAt: new Date().toISOString()
  };

  data.gigs.unshift(newGig);
  writeData(data);
  return newGig;
}

// 3. Get Bookings (Feature 4 & 5)
function getBookings({ creatorName, clientName } = {}) {
  const data = readData();
  let bookings = [...data.bookings];

  if (creatorName) {
    bookings = bookings.filter(
      (b) => b.creatorName.toLowerCase() === creatorName.trim().toLowerCase()
    );
  }

  if (clientName) {
    bookings = bookings.filter(
      (b) => b.clientName.toLowerCase() === clientName.trim().toLowerCase()
    );
  }

  // Sort newest bookings first
  bookings.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return bookings;
}

// 4. Add Booking (Feature 3 & Decision Point 2: Multiple Pending allowed)
function addBooking({ gigId, clientName, clientContact, projectDetails, deliveryDate }) {
  if (!gigId || !clientName || !clientContact || !projectDetails) {
    throw new Error("gigId, clientName, clientContact, and projectDetails are required.");
  }

  const data = readData();
  const gig = data.gigs.find((g) => g.id === gigId);
  if (!gig) {
    throw new Error(`Gig with id '${gigId}' not found.`);
  }

  const newBooking = {
    id: `book-${Date.now()}`,
    gigId: gig.id,
    gigTitle: gig.title,
    creatorName: gig.creatorName,
    clientName: clientName.trim(),
    clientContact: clientContact.trim(),
    projectDetails: projectDetails.trim(),
    deliveryDate: deliveryDate ? deliveryDate.trim() : "Flexible",
    rate: gig.rate,
    status: "Pending", // Default status is always Pending
    createdAt: new Date().toISOString()
  };

  data.bookings.unshift(newBooking);
  writeData(data);
  return newBooking;
}

// 5. Update Booking Status (Feature 4: Accept or Decline)
function updateBookingStatus(id, status) {
  const allowed = ["Accepted", "Declined", "Pending"];
  if (!allowed.includes(status)) {
    throw new Error(`Invalid status '${status}'. Must be one of: ${allowed.join(", ")}`);
  }

  const data = readData();
  const booking = data.bookings.find((b) => b.id === id);
  if (!booking) {
    throw new Error(`Booking with id '${id}' not found.`);
  }

  booking.status = status;
  booking.updatedAt = new Date().toISOString();
  writeData(data);
  return booking;
}

module.exports = {
  getGigs,
  addGig,
  getBookings,
  addBooking,
  updateBookingStatus
};
