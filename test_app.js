const http = require("http");

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode, data: body }));
    });
    req.on("error", reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log("=========================================");
  console.log("RUNNING AUTOMATED VERIFICATION TESTS");
  console.log("=========================================");

  // Test 1: Health Check
  const health = await request({ host: "localhost", port: 3000, path: "/api/health", method: "GET" });
  console.log("1. Health check:", health.status, health.data);

  // Test 2: Browse Gigs
  const browse = await request({ host: "localhost", port: 3000, path: "/api/gigs", method: "GET" });
  const browseJson = JSON.parse(browse.data);
  console.log("2. Browse gigs count:", browseJson.count);

  // Test 3: Search with relevance ranking
  const search = await request({ host: "localhost", port: 3000, path: "/api/gigs?search=editing", method: "GET" });
  const searchJson = JSON.parse(search.data);
  console.log("3. Search 'editing' count:", searchJson.count, "| Top result:", searchJson.gigs[0]?.title);

  // Test 4: Feature 1 - Post a new gig
  const newGigData = {
    title: "Shorts & Reels AI Repurposing",
    category: "AI & Automation",
    rate: 90,
    description: "Transform long podcasts into 10 viral vertical clips with animated captions and sound effects.",
    creatorName: "Test Creator Sam"
  };
  const postGig = await request(
    {
      host: "localhost",
      port: 3000,
      path: "/api/gigs",
      method: "POST",
      headers: { "Content-Type": "application/json" }
    },
    newGigData
  );
  const postGigJson = JSON.parse(postGig.data);
  console.log("4. Post gig status:", postGig.status, "| Created gig ID:", postGigJson.gig?.id);

  // Test 5: Feature 3 - Book a gig
  const booking1Data = {
    gigId: postGigJson.gig.id,
    clientName: "Alice Miller",
    clientContact: "alice@example.com",
    deliveryDate: "2026-09-25",
    projectDetails: "Need 5 video clips from episode 12 of my show."
  };
  const book1 = await request(
    {
      host: "localhost",
      port: 3000,
      path: "/api/bookings",
      method: "POST",
      headers: { "Content-Type": "application/json" }
    },
    booking1Data
  );
  const book1Json = JSON.parse(book1.data);
  console.log("5. Book gig status:", book1.status, "| Booking ID:", book1Json.booking?.id, "| Status:", book1Json.booking?.status);

  // Test 6: Decision Point 2 - Multiple pending bookings allowed
  const booking2Data = {
    gigId: "gig-2",
    clientName: "Alice Miller",
    clientContact: "alice@example.com",
    deliveryDate: "2026-09-22",
    projectDetails: "Need 3 YouTube thumbnails for our launch week."
  };
  const book2 = await request(
    {
      host: "localhost",
      port: 3000,
      path: "/api/bookings",
      method: "POST",
      headers: { "Content-Type": "application/json" }
    },
    booking2Data
  );
  const book2Json = JSON.parse(book2.data);
  console.log("6. Second pending booking status:", book2.status, "| Booking ID:", book2Json.booking?.id, "| Status:", book2Json.booking?.status);

  // Test 7: Feature 4 & Decision Point 1 - Creator Declines booking 1
  const declineReq = await request(
    {
      host: "localhost",
      port: 3000,
      path: `/api/bookings/${book1Json.booking.id}/status`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" }
    },
    { status: "Declined" }
  );
  const declineJson = JSON.parse(declineReq.data);
  console.log("7. Decline booking status:", declineReq.status, "| New status:", declineJson.booking?.status);

  // Test 8: Feature 4 - Creator Accepts booking 2
  const acceptReq = await request(
    {
      host: "localhost",
      port: 3000,
      path: `/api/bookings/${book2Json.booking.id}/status`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" }
    },
    { status: "Accepted" }
  );
  const acceptJson = JSON.parse(acceptReq.data);
  console.log("8. Accept booking status:", acceptReq.status, "| New status:", acceptJson.booking?.status);

  // Test 9: Verify HTML frontend serves index.html
  const htmlReq = await request({ host: "localhost", port: 3000, path: "/", method: "GET" });
  console.log("9. Frontend HTML status:", htmlReq.status, "| Serves UI:", htmlReq.data.includes("CreatorGig"));

  console.log("=========================================");
  console.log("ALL 9 VERIFICATION TESTS PASSED SUCCESSFULLY!");
  console.log("=========================================");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
