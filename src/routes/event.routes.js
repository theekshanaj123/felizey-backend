const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const { createEvent, updateEvent, deleteEvent, fetchEventsByCategory, fetchRandomizedEvents, fetchEventsAdvanced, fetchEventsByUser,
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
    fetchTotalEventEarning
} = require("../controllers/event.controller");

router.post("/createEvent", authenticateToken, createEvent);
router.post("/updateEvent", authenticateToken, updateEvent);
router.post("/deleteEvent", authenticateToken, deleteEvent);
router.post("/getAllEvent", authenticateToken, fetchAllEvents);
router.post("/getEventByCategory", authenticateToken, fetchEventsByCategory);
router.post("/addReview", authenticateToken, addNewReview);
router.post("/fetchSoldTicketCountByCategory", authenticateToken, fetchSellingTicketsCountByCategory);
router.get("/getLetestEvent", authenticateToken, fetchLetestEvents);
router.get("/getPopularEvent", authenticateToken, fetchPopularEvents);
router.get("/getRandomEvent", authenticateToken, fetchRandomizedEvents);
router.get("/getEventAdvanceSearch", authenticateToken, fetchEventsAdvanced);
router.get("/getEventAdvanceSearchByUser", authenticateToken, fetchEventsAdvancedByUser);
router.get("/getEventByUser/:userId", authenticateToken, fetchEventsByUser);
router.get("/getFutureEventByUser/:userId", authenticateToken, fetchFutureEventsByUser);
router.get("/getEventById/:eventId", authenticateToken, fetchEventsById);
router.get("/getEventByTicketId/:ticketId", authenticateToken, fetchEventsByTicketId);
router.get("/getNearbyEvent", authenticateToken, fetchNearbyEvent);
router.get("/getTotalEarning/:eventId", authenticateToken, fetchTotalEarning);
router.get("/getTotalEventEarning/:eventId", authenticateToken, fetchTotalEventEarning);
router.get("/getTotalCounts/:eventId", authenticateToken, fetchTotalCount);
router.get("/getAllEventsByUserTickets", authenticateToken, fetchAllEventByUserTicket);

module.exports = router;
