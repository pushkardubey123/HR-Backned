const express = require("express");
const router = express.Router();

const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkSubscription = require("../Middleware/checkSubscription");

const { 
  createTicket, 
  getManageTickets, 
  getMyTickets, 
  addTicketComment, 
  updateTicket, 
  getDashboardMetrics,
  getTicketComments,
  getTicketTimeline,
  getEmployeePerformanceReport
} = require("../Controllers/TicketController");

// ---------------------------------------------------
// 🧑‍💻 CORE ROUTES (Everyone has access, Controller handles filtering)
// ---------------------------------------------------

// 1. Raise a new ticket
router.post("/raise", auth, attachCompanyId, checkSubscription, createTicket);

// 2. View my personal requests
router.get("/my-tickets", auth, attachCompanyId, getMyTickets);

// 3. View the Team Queue / Company Queue (The controller will restrict visibility)
router.get("/manage", auth, attachCompanyId, checkSubscription, getManageTickets);

// 4. Update Ticket Status / Assignment
router.put("/:ticketId", auth, attachCompanyId, checkSubscription, updateTicket);

// ---------------------------------------------------
// 💬 CONVERSATION THREAD ROUTES
// ---------------------------------------------------

// Fetch chat history (Controller hides internal notes from regular employees)
router.get("/:ticketId/comments", auth, attachCompanyId, checkSubscription, getTicketComments);

// Add a reply or internal note
router.post("/:ticketId/comment", auth, attachCompanyId, checkSubscription, addTicketComment);

// ---------------------------------------------------
// 📊 DASHBOARD ROUTE (Restricted to Admin/Agents)
// ---------------------------------------------------
router.get("/dashboard/metrics", auth, attachCompanyId, checkSubscription, getDashboardMetrics);

// Imports me add karein: getEmployeePerformanceReport, getTicketTimeline

// End me add karein:
// 📜 TIMELINE ROUTE
router.get("/:ticketId/timeline", auth, attachCompanyId, checkSubscription, getTicketTimeline);

// 📈 EXTREME LEVEL REPORT ROUTE (Admin Only)
router.get("/reports/employee-performance", auth, attachCompanyId, checkSubscription, getEmployeePerformanceReport);

module.exports = router;