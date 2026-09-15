// --- Application State ---
let currentRole = "client"; // "client" | "creator"
let currentTab = "marketplace"; // "marketplace" | "post-gig" | "creator-dashboard" | "my-bookings"
let currentCategory = "all";
let searchDebounceTimer = null;
let allGigsCache = [];

// Stored active client identity (defaults to Jordan Reed for easy demoing)
let activeClientName = localStorage.getItem("activeClientName") || "Jordan Reed";

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  setRole("client");
  fetchGigs();
  updateBookingBadges();
}

// =========================================================================
// ROLE SWITCHING & NAVIGATION
// =========================================================================
function setRole(role) {
  currentRole = role;

  const btnClient = document.getElementById("roleBtnClient");
  const btnCreator = document.getElementById("roleBtnCreator");
  const tabMyBookings = document.getElementById("tabBtnMyBookings");
  const tabCreatorDash = document.getElementById("tabBtnCreatorDashboard");
  const tabPostGig = document.getElementById("tabBtnPostGig");

  if (role === "client") {
    // Styling
    btnClient.className = "px-3 py-1.5 rounded-lg transition-all duration-150 bg-white text-indigo-700 shadow-sm font-bold";
    btnCreator.className = "px-3 py-1.5 rounded-lg transition-all duration-150 text-slate-600 hover:text-slate-900";
    
    // Visibility
    tabMyBookings.classList.remove("hidden");
    tabCreatorDash.classList.add("hidden");
    tabPostGig.classList.add("hidden");

    // Default to marketplace when switching to client
    if (currentTab === "creator-dashboard" || currentTab === "post-gig") {
      switchTab("marketplace");
    }
  } else {
    // Creator mode styling
    btnCreator.className = "px-3 py-1.5 rounded-lg transition-all duration-150 bg-white text-indigo-700 shadow-sm font-bold";
    btnClient.className = "px-3 py-1.5 rounded-lg transition-all duration-150 text-slate-600 hover:text-slate-900";
    
    // Visibility
    tabMyBookings.classList.add("hidden");
    tabCreatorDash.classList.remove("hidden");
    tabPostGig.classList.remove("hidden");

    // Default to creator dashboard when switching to creator
    if (currentTab === "my-bookings") {
      switchTab("creator-dashboard");
    }
  }
}

function switchTab(tab) {
  currentTab = tab;

  // View sections
  const views = {
    marketplace: document.getElementById("viewMarketplace"),
    "post-gig": document.getElementById("viewPostGig"),
    "creator-dashboard": document.getElementById("viewCreatorDashboard"),
    "my-bookings": document.getElementById("viewMyBookings")
  };

  // Nav buttons
  const buttons = {
    marketplace: document.getElementById("tabBtnMarketplace"),
    "post-gig": document.getElementById("tabBtnPostGig"),
    "creator-dashboard": document.getElementById("tabBtnCreatorDashboard"),
    "my-bookings": document.getElementById("tabBtnMyBookings")
  };

  // Toggle view visibility
  Object.keys(views).forEach((key) => {
    if (views[key]) {
      if (key === tab) {
        views[key].classList.remove("hidden");
      } else {
        views[key].classList.add("hidden");
      }
    }
  });

  // Toggle nav button styling
  Object.keys(buttons).forEach((key) => {
    const btn = buttons[key];
    if (!btn) return;
    if (key === tab) {
      if (key === "post-gig") {
        btn.className = "px-3 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-700 shadow-sm ring-2 ring-indigo-400";
      } else {
        btn.className = "px-3 py-2 rounded-lg text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 relative";
      }
    } else {
      if (key === "post-gig") {
        btn.className = "px-3 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm";
      } else {
        btn.className = "px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative";
      }
    }
  });

  // Action on tab entry
  if (tab === "marketplace") {
    fetchGigs();
  } else if (tab === "creator-dashboard") {
    loadCreatorBookings();
  } else if (tab === "my-bookings") {
    loadClientBookings();
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// =========================================================================
// FEATURE 2: BROWSE & SEARCH (With Relevance First + Newest Ranking)
// =========================================================================
async function fetchGigs() {
  const searchInput = document.getElementById("searchInput");
  const query = searchInput ? searchInput.value.trim() : "";
  const resultsCount = document.getElementById("resultsCount");
  const gigsGrid = document.getElementById("gigsGrid");
  const noGigsState = document.getElementById("noGigsState");

  if (resultsCount) resultsCount.textContent = "Updating gigs...";

  try {
    const params = new URLSearchParams();
    if (query) params.append("search", query);
    if (currentCategory && currentCategory !== "all") params.append("category", currentCategory);

    const res = await fetch(`/api/gigs?${params.toString()}`);
    const data = await res.json();

    if (!data.success) throw new Error(data.error);

    allGigsCache = data.gigs;

    if (resultsCount) {
      resultsCount.textContent = `${data.count} ${data.count === 1 ? "gig" : "gigs"} available`;
    }

    if (data.gigs.length === 0) {
      gigsGrid.innerHTML = "";
      noGigsState.classList.remove("hidden");
    } else {
      noGigsState.classList.add("hidden");
      renderGigsGrid(data.gigs);
    }
  } catch (err) {
    console.error("Error fetching gigs:", err);
    if (resultsCount) resultsCount.textContent = "Failed to load gigs";
  }
}

function renderGigsGrid(gigs) {
  const container = document.getElementById("gigsGrid");
  if (!container) return;

  const categoryColorMap = {
    "Video Editing": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: "🎬" },
    "Graphic Design": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: "🎨" },
    "Voiceover & Audio": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "🎙️" },
    "Writing & Copy": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "✍️" },
    "AI & Automation": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "🤖" }
  };

  container.innerHTML = gigs
    .map((gig) => {
      const catStyle = categoryColorMap[gig.category] || {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        border: "border-indigo-200",
        icon: "⚡"
      };

      const dateStr = new Date(gig.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });

      // Escape HTML to prevent XSS
      const safeTitle = escapeHtml(gig.title);
      const safeDesc = escapeHtml(gig.description);
      const safeCreator = escapeHtml(gig.creatorName);

      return `
      <div class="gig-card bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
        <div>
          <!-- Header info -->
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${catStyle.bg} ${catStyle.text} border ${catStyle.border}">
              <span>${catStyle.icon}</span> ${escapeHtml(gig.category)}
            </span>
            <span class="text-xs text-slate-400 font-medium">${dateStr}</span>
          </div>

          <!-- Title -->
          <h3 class="text-base font-bold text-slate-900 leading-snug mb-2 hover:text-indigo-600 transition">
            ${safeTitle}
          </h3>

          <!-- Creator -->
          <div class="flex items-center space-x-2 mb-3">
            <div class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              ${safeCreator.charAt(0).toUpperCase()}
            </div>
            <span class="text-xs font-semibold text-slate-600">${safeCreator}</span>
          </div>

          <!-- Description -->
          <p class="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">
            ${safeDesc}
          </p>
        </div>

        <!-- Footer / Rate & Action -->
        <div class="pt-4 border-t border-slate-100 flex items-center justify-between mt-2">
          <div>
            <span class="text-xs text-slate-400 font-medium">Starting at</span>
            <p class="text-lg font-black text-slate-900">₹${gig.rate}</p>
          </div>
          
          <button
            onclick="openBookingModal('${gig.id}')"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition"
          >
            Book Gig →
          </button>
        </div>
      </div>
    `;
    })
    .join("");
}

// Category selection
function selectCategory(category) {
  currentCategory = category;

  // Update pills active styling
  const pills = document.querySelectorAll(".category-pill");
  pills.forEach((p) => {
    if (p.getAttribute("data-category") === category) {
      p.className = "category-pill active px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-600 text-white shadow-sm";
    } else {
      p.className = "category-pill px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:border-indigo-300";
    }
  });

  fetchGigs();
}

// Search handling
function handleSearchInput() {
  const input = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearSearchBtn");
  
  if (input.value.trim().length > 0) {
    clearBtn.classList.remove("hidden");
  } else {
    clearBtn.classList.add("hidden");
  }

  // Live search debounce (250ms)
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    fetchGigs();
  }, 250);
}

function triggerSearch() {
  clearTimeout(searchDebounceTimer);
  fetchGigs();
}

function clearSearch() {
  const input = document.getElementById("searchInput");
  if (input) input.value = "";
  const clearBtn = document.getElementById("clearSearchBtn");
  if (clearBtn) clearBtn.classList.add("hidden");
  selectCategory("all");
}

// =========================================================================
// FEATURE 1: POST A GIG (Creator View)
// =========================================================================
async function handlePostGig(event) {
  event.preventDefault();

  const creatorName = document.getElementById("gigCreatorName").value.trim();
  const title = document.getElementById("gigTitle").value.trim();
  const category = document.getElementById("gigCategory").value.trim();
  const rate = document.getElementById("gigRate").value.trim();
  const description = document.getElementById("gigDescription").value.trim();
  const submitBtn = document.getElementById("submitGigBtn");

  if (!creatorName || !title || !category || !rate || !description) {
    showNotification("Please fill in all required fields.", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Publishing...";

  try {
    const res = await fetch("/api/gigs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creatorName,
        title,
        category,
        rate: Number(rate),
        description
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    // Reset form
    document.getElementById("postGigForm").reset();

    showNotification(`🎉 Gig "${data.gig.title}" published! It is now ranked and visible in the marketplace.`);

    // Switch to marketplace to immediately show the new gig
    selectCategory("all");
    clearSearch();
    switchTab("marketplace");

  } catch (err) {
    console.error("Error creating gig:", err);
    showNotification(err.message || "Failed to publish gig.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Publish Gig to Marketplace";
  }
}

// =========================================================================
// FEATURE 3: BOOK A GIG (Client View Modal & Submission)
// =========================================================================
function openBookingModal(gigId) {
  const gig = allGigsCache.find((g) => g.id === gigId);
  if (!gig) return;

  document.getElementById("modalGigId").value = gig.id;
  document.getElementById("modalGigTitle").textContent = gig.title;
  document.getElementById("modalCreatorName").textContent = gig.creatorName;
  document.getElementById("modalGigRate").textContent = `₹${gig.rate}`;
  document.getElementById("modalGigCategory").textContent = gig.category;

  // Pre-fill client name if known
  const clientNameInput = document.getElementById("clientNameInput");
  if (clientNameInput && !clientNameInput.value) {
    clientNameInput.value = activeClientName;
  }

  // Set default min date to tomorrow
  const dateInput = document.getElementById("deliveryDateInput");
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    dateInput.value = tomorrow.toISOString().split("T")[0];
  }

  document.getElementById("bookingModal").classList.remove("hidden");
}

function closeBookingModal() {
  document.getElementById("bookingModal").classList.add("hidden");
  document.getElementById("bookingForm").reset();
}

async function handleBookingSubmit(event) {
  event.preventDefault();

  const gigId = document.getElementById("modalGigId").value;
  const clientName = document.getElementById("clientNameInput").value.trim();
  const clientContact = document.getElementById("clientContactInput").value.trim();
  const deliveryDate = document.getElementById("deliveryDateInput").value;
  const projectDetails = document.getElementById("projectDetailsInput").value.trim();
  const confirmBtn = document.getElementById("confirmBookingBtn");

  if (!gigId || !clientName || !clientContact || !projectDetails) {
    showNotification("Please fill in all required fields.", "error");
    return;
  }

  confirmBtn.disabled = true;
  confirmBtn.textContent = "Submitting...";

  try {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gigId,
        clientName,
        clientContact,
        deliveryDate,
        projectDetails
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    // Remember client name
    activeClientName = clientName;
    localStorage.setItem("activeClientName", clientName);

    closeBookingModal();
    showNotification(`✅ Booking confirmed! Reference: ${data.booking.id}. Status is currently "Pending".`);

    updateBookingBadges();
    
    // Switch to client bookings view so user immediately sees their new booking
    setRole("client");
    switchTab("my-bookings");

  } catch (err) {
    console.error("Error submitting booking:", err);
    showNotification(err.message || "Failed to submit booking.", "error");
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = "Confirm & Send Request";
  }
}

// =========================================================================
// FEATURE 4: CREATOR DASHBOARD (Accept / Decline Bookings)
// =========================================================================
async function loadCreatorBookings() {
  const container = document.getElementById("creatorBookingsList");
  const emptyState = document.getElementById("noCreatorBookingsState");
  const statPending = document.getElementById("statPendingCount");
  const statAccepted = document.getElementById("statAcceptedCount");
  const statDeclined = document.getElementById("statDeclinedCount");

  try {
    const res = await fetch("/api/bookings");
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    const bookings = data.bookings;

    // Calculate stats
    const pendingCount = bookings.filter((b) => b.status === "Pending").length;
    const acceptedCount = bookings.filter((b) => b.status === "Accepted").length;
    const declinedCount = bookings.filter((b) => b.status === "Declined").length;

    if (statPending) statPending.textContent = pendingCount;
    if (statAccepted) statAccepted.textContent = acceptedCount;
    if (statDeclined) statDeclined.textContent = declinedCount;

    // Update pending badge in nav
    const badge = document.getElementById("creatorPendingBadge");
    if (badge) {
      if (pendingCount > 0) {
        badge.textContent = pendingCount;
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }
    }

    if (bookings.length === 0) {
      container.innerHTML = "";
      emptyState.classList.remove("hidden");
      return;
    }

    emptyState.classList.add("hidden");

    container.innerHTML = bookings
      .map((b) => {
        let badgeHtml = "";
        let actionButtonsHtml = "";

        if (b.status === "Pending") {
          badgeHtml = `<span class="px-3 py-1 rounded-full text-xs font-bold status-badge-pending">⏳ Pending Review</span>`;
          actionButtonsHtml = `
            <div class="flex items-center space-x-2 mt-4 pt-3 border-t border-slate-100">
              <button
                onclick="updateBookingStatus('${b.id}', 'Accepted')"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                ✓ Accept Booking
              </button>
              <button
                onclick="updateBookingStatus('${b.id}', 'Declined')"
                class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                ✕ Decline Booking
              </button>
            </div>
          `;
        } else if (b.status === "Accepted") {
          badgeHtml = `<span class="px-3 py-1 rounded-full text-xs font-bold status-badge-accepted">✓ Accepted</span>`;
        } else if (b.status === "Declined") {
          badgeHtml = `<span class="px-3 py-1 rounded-full text-xs font-bold status-badge-declined">✕ Declined</span>`;
        }

        const dateStr = new Date(b.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });

        return `
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
              <div>
                <span class="text-xs text-slate-400">Booking #${b.id} &bull; Requested on ${dateStr}</span>
                <h3 class="text-base font-bold text-slate-900 mt-0.5">${escapeHtml(b.gigTitle)}</h3>
                <p class="text-xs text-indigo-600 font-semibold mt-0.5">Creator: ${escapeHtml(b.creatorName)}</p>
              </div>
              <div class="flex items-center space-x-3">
                <span class="text-lg font-black text-slate-900">₹${b.rate}</span>
                ${badgeHtml}
              </div>
            </div>

            <!-- Client info & Project scope -->
            <div class="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs space-y-2">
              <div class="flex flex-wrap items-center gap-x-6 gap-y-1 text-slate-600">
                <span><strong>Client:</strong> ${escapeHtml(b.clientName)}</span>
                <span><strong>Contact:</strong> ${escapeHtml(b.clientContact)}</span>
                <span><strong>Target Deadline:</strong> ${escapeHtml(b.deliveryDate)}</span>
              </div>
              <div class="text-slate-700 pt-1 border-t border-slate-200/60">
                <strong>Project Scope:</strong>
                <p class="mt-1 text-slate-600 whitespace-pre-line">${escapeHtml(b.projectDetails)}</p>
              </div>
            </div>

            ${actionButtonsHtml}
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error("Error loading creator bookings:", err);
  }
}

// Update status (Accept or Decline)
async function updateBookingStatus(id, newStatus) {
  try {
    const res = await fetch(`/api/bookings/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    showNotification(`Booking status updated to "${newStatus}".`);
    loadCreatorBookings();
    updateBookingBadges();
  } catch (err) {
    console.error("Error updating status:", err);
    showNotification("Failed to update booking status.", "error");
  }
}

// =========================================================================
// FEATURE 5 & DECISION POINTS 1 & 2: MY BOOKINGS (Client View)
// =========================================================================
async function loadClientBookings() {
  const container = document.getElementById("clientBookingsList");
  const emptyState = document.getElementById("noClientBookingsState");

  try {
    const res = await fetch("/api/bookings");
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    const bookings = data.bookings;

    if (bookings.length === 0) {
      container.innerHTML = "";
      emptyState.classList.remove("hidden");
      return;
    }

    emptyState.classList.add("hidden");

    container.innerHTML = bookings
      .map((b) => {
        let badgeHtml = "";
        let decisionPoint1Banner = "";

        if (b.status === "Pending") {
          badgeHtml = `<span class="px-3 py-1 rounded-full text-xs font-bold status-badge-pending">⏳ Pending Review</span>`;
        } else if (b.status === "Accepted") {
          badgeHtml = `<span class="px-3 py-1 rounded-full text-xs font-bold status-badge-accepted">✓ Accepted & Confirmed</span>`;
        } else if (b.status === "Declined") {
          badgeHtml = `<span class="px-3 py-1 rounded-full text-xs font-bold status-badge-declined">✕ Declined</span>`;
          
          // DECISION POINT 1:
          // "After a creator declines, the client should see the declined status and be able to return to the marketplace to find another gig."
          decisionPoint1Banner = `
            <div class="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center space-x-2.5">
                <span class="text-rose-500 text-lg">ℹ️</span>
                <div>
                  <p class="text-xs font-bold text-rose-800">This booking was declined by the creator</p>
                  <p class="text-xs text-rose-600">The creator is currently unavailable for this project. You can browse the marketplace to find and book another talented creator.</p>
                </div>
              </div>
              <button
                onclick="findAnotherGig()"
                class="whitespace-nowrap px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                🔍 Find Another Gig in Marketplace →
              </button>
            </div>
          `;
        }

        const dateStr = new Date(b.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });

        return `
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
              <div>
                <span class="text-xs text-slate-400">Booking #${b.id} &bull; ${dateStr}</span>
                <h3 class="text-base font-bold text-slate-900 mt-0.5">${escapeHtml(b.gigTitle)}</h3>
                <p class="text-xs text-slate-500 mt-0.5">Creator: <strong class="text-slate-700">${escapeHtml(b.creatorName)}</strong></p>
              </div>
              <div class="flex items-center space-x-3">
                <span class="text-lg font-black text-slate-900">₹${b.rate}</span>
                ${badgeHtml}
              </div>
            </div>

            <!-- Booking details -->
            <div class="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs space-y-1.5">
              <div class="flex flex-wrap items-center gap-x-6 gap-y-1 text-slate-600">
                <span><strong>Client Name:</strong> ${escapeHtml(b.clientName)}</span>
                <span><strong>Target Deadline:</strong> ${escapeHtml(b.deliveryDate)}</span>
              </div>
              <p class="text-slate-700 pt-1"><strong>Your Requirements:</strong> ${escapeHtml(b.projectDetails)}</p>
            </div>

            <!-- Decision Point 1 Banner for Declined Status -->
            ${decisionPoint1Banner}
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error("Error loading client bookings:", err);
  }
}

// Decision Point 1 Helper: Return to marketplace to find another gig
function findAnotherGig() {
  setRole("client");
  clearSearch();
  switchTab("marketplace");
}

// Helper: Badge counts in nav
async function updateBookingBadges() {
  try {
    const res = await fetch("/api/bookings");
    const data = await res.json();
    if (!data.success) return;

    const bookings = data.bookings;
    const clientBadge = document.getElementById("clientBookingsBadge");
    const creatorBadge = document.getElementById("creatorPendingBadge");

    if (clientBadge) {
      if (bookings.length > 0) {
        clientBadge.textContent = bookings.length;
        clientBadge.classList.remove("hidden");
      } else {
        clientBadge.classList.add("hidden");
      }
    }

    if (creatorBadge) {
      const pending = bookings.filter((b) => b.status === "Pending").length;
      if (pending > 0) {
        creatorBadge.textContent = pending;
        creatorBadge.classList.remove("hidden");
      } else {
        creatorBadge.classList.add("hidden");
      }
    }
  } catch (e) {
    // Silently continue
  }
}

// =========================================================================
// UTILITIES: NOTIFICATIONS & ESCAPING
// =========================================================================
let notificationTimer = null;

function showNotification(message, type = "success") {
  const banner = document.getElementById("globalNotification");
  const content = document.getElementById("notificationContent");
  const text = document.getElementById("notificationText");
  const icon = document.getElementById("notificationIcon");

  if (!banner || !content || !text) return;

  text.textContent = message;

  if (type === "error") {
    content.className = "p-4 rounded-xl flex items-center justify-between shadow-sm bg-rose-50 border border-rose-200 text-rose-800";
    icon.textContent = "⚠️";
  } else {
    content.className = "p-4 rounded-xl flex items-center justify-between shadow-sm bg-emerald-50 border border-emerald-200 text-emerald-800";
    icon.textContent = "✅";
  }

  banner.classList.remove("hidden");

  clearTimeout(notificationTimer);
  notificationTimer = setTimeout(() => {
    dismissNotification();
  }, 6000);
}

function dismissNotification() {
  const banner = document.getElementById("globalNotification");
  if (banner) banner.classList.add("hidden");
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
