# Architectural & Product Decisions (DECISIONS.md)

**Project:** CreatorGig Marketplace  
**Track:** Track 2: Real-World AI Products — Creator Economy (Creator Gig Marketplace)  
**Hackathon ID:** AZIS-KMVAG6  

This document details the architectural rationale and implementation of the three required Product Decision Points (DP1, DP2, and DP3).

---

## 📌 Decision Point 1 (DP1): Client Recovery After Booking Decline

### Brief Requirement:
> *"After a creator declines, the client should see the declined status and be able to return to the marketplace to find another gig."*

### Implementation & User Experience:
1. **Backend State Transition**:
   - When a creator reviews an incoming request in the Creator Dashboard and clicks **"✕ Decline Booking"**, a `PATCH /api/bookings/:id/status` request is sent with `{ status: "Declined" }`.
   - The status is persisted atomically in the database (`data/marketplace.json`) with an `updatedAt` timestamp.
2. **Client View Representation**:
   - In the client's **"My Bookings"** tab, the booking card immediately reflects a distinct red/rose badge: `✕ Declined`.
3. **Seamless Marketplace Recovery**:
   - Rather than leaving the client at a dead end, a dedicated alert banner appears directly inside the declined booking card:
     > *"This booking was declined by the creator. The creator is currently unavailable for this project. You can browse the marketplace to find and book another talented creator."*
   - Inside this banner, a prominent action button is rendered: **`🔍 Find Another Gig in Marketplace →`**.
   - Clicking this button automatically switches the active view back to the **Marketplace**, resets search queries, and smoothly scrolls to the available gigs grid, enabling the client to discover and book an alternative creator with zero friction.

---

## 📌 Decision Point 2 (DP2): Multiple Concurrent Pending Bookings

### Brief Requirement:
> *"Multiple Pending bookings are allowed because Pending does not mean the creator has committed to the job."*

### Implementation & User Experience:
1. **Rationale**:
   - In a creator marketplace, creators work as independent freelancers who may take hours to review incoming requests or may be fully booked.
   - Forcing a client to wait for a creator's decision before submitting another request creates artificial bottlenecks and poor client retention.
2. **Non-Blocking Architecture**:
   - The backend `POST /api/bookings` endpoint creates independent booking entities without enforcing any single-pending lock or throttling by client identity.
   - Each booking is assigned a unique identifier (`book-{timestamp}`), tracks its own gig association (`gigId`), rate, delivery deadline, and maintains its independent lifecycle (`Pending` → `Accepted` or `Declined`).
3. **UI Transparency**:
   - The **"My Bookings"** tab includes an informational banner explaining:
     > *"💡 Decision Point 2: Multiple Pending bookings are allowed! A pending request does not lock you into a single creator."*
   - Clients can view and monitor multiple pending requests simultaneously, each displaying their individual submission times, project scopes, and live statuses.

---

## 📌 Decision Point 3 (DP3): Search Relevance First, Then Newest Gigs Discovery

### Brief Requirement:
> *"Gigs should be ranked by search relevance first, then newest gigs, so newer creators can be discovered."*

### Implementation & Ranking Algorithm:
1. **Two-Tier Ranking Algorithm** (implemented in `database.js`):
   ```javascript
   matches.sort((a, b) => {
     if (b.score !== a.score) {
       return b.score - a.score; // Primary: Search relevance score
     }
     return new Date(b.gig.createdAt).getTime() - new Date(a.gig.createdAt).getTime(); // Secondary: Newest first
   });
   ```
2. **Relevance Scoring Breakdown**:
   - **Exact Title Match / Phrase Contains**: Highest score weighting (+100 for exact, +50 for phrase match, +15 per token).
   - **Category Match**: High weighting (+40 for exact category, +25 for category contains).
   - **Creator Name Match**: Substantial weighting (+20 for creator name).
   - **Description Match**: Contextual weighting (+10 for description match).
3. **Discovery for Newer Creators**:
   - When users browse the marketplace without an active search query, gigs are sorted strictly by creation date descending (`createdAt`), ensuring that newly registered creators and recently published gigs immediately appear at the top of the feed.
   - For search results with identical match relevance scores, the tie-breaker always prioritizes the newest gig, guaranteeing that new creators are never buried behind older entries.
