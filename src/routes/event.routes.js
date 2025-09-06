const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const {
  createEvent,
  updateEvent,
  deleteEvent,
  fetchEventsByCategory,
  fetchRandomizedEvents,
  fetchEventsAdvanced,
  fetchEventsByUser,
  fetchEventsById,
  fetchAllEvents,
  fetchLetestEvents,
  addNewReview,
  fetchPopularEvents,
  fetchNearbyEvent,
  fetchTotalEarning,
  fetchTotalCount,
  fetchSellingTicketsCountByCategory,
  fetchEventsByTicketId,
  fetchAllEventByUserTicket,
  fetchEventsAdvancedByUser,
  fetchFutureEventsByUser,
  fetchTotalEventEarning,
  updateEventStatus,
} = require("../controllers/event.controller");

router.post("/createEvent", authenticateToken, createEvent);
router.post("/updateEvent", authenticateToken, updateEvent);
router.post("/deleteEvent", authenticateToken, deleteEvent);
router.post("/getAllEvent", fetchAllEvents);
router.post("/getEventByCategory", fetchEventsByCategory);
router.post("/addReview", authenticateToken, addNewReview);
router.post(
  "/fetchSoldTicketCountByCategory",
  authenticateToken,
  fetchSellingTicketsCountByCategory
);
router.get("/getLetestEvent", fetchLetestEvents);
router.get("/getPopularEvent", fetchPopularEvents);
router.get("/getRandomEvent", fetchRandomizedEvents);
router.get("/getEventAdvanceSearch", fetchEventsAdvanced);
router.get("/getEventAdvanceSearchByUser", fetchEventsAdvancedByUser);
router.get("/getEventByUser/:userId", fetchEventsByUser);
router.get("/getFutureEventByUser/:userId", fetchFutureEventsByUser);
router.get("/getEventById/:eventId", authenticateToken, fetchEventsById);
router.get("/getEventByTicketId/:ticketId", fetchEventsByTicketId);
router.get("/getNearbyEvent", authenticateToken, fetchNearbyEvent);
router.get("/getTotalEarning/:eventId", authenticateToken, fetchTotalEarning);
router.get(
  "/getTotalEventEarning/:eventId",
  authenticateToken,
  fetchTotalEventEarning
);
router.get("/getTotalCounts/:eventId", authenticateToken, fetchTotalCount);
router.get(
  "/getAllEventsByUserTickets",
  authenticateToken,
  fetchAllEventByUserTicket
);

router.post("/changeEventStatus", authenticateToken, updateEventStatus);

module.exports = router;
