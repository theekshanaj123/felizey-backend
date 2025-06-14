const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const { createEvent, updateEvent, deleteEvent, fetchEventsByCategory, fetchRandomizedEvents, fetchEventsAdvanced, fetchEventsByUser,
    fetchEventsById,
    fetchAllEvents,
    fetchLetestEvents,
    addNewReview,
    fetchPopularEvents,
    fetchNearbyEvent
} = require("../controllers/event.controller");

router.post("/createEvent", authenticateToken, createEvent);
router.post("/updateEvent", authenticateToken, updateEvent);
router.post("/deleteEvent", authenticateToken, deleteEvent);
router.post("/getAllEvent", authenticateToken, fetchAllEvents);
router.post("/getEventByCategory", authenticateToken, fetchEventsByCategory);
router.post("/addReview", authenticateToken, addNewReview);
router.get("/getLetestEvent", authenticateToken, fetchLetestEvents);
router.get("/getPopularEvent", authenticateToken, fetchPopularEvents);
router.get("/getRandomEvent", authenticateToken, fetchRandomizedEvents);
router.get("/getEventAdvanceSearch", authenticateToken, fetchEventsAdvanced);
router.get("/getEventByUser/:userId", authenticateToken, fetchEventsByUser);
router.get("/getEventById/:eventId", authenticateToken, fetchEventsById);
router.get("/getNearbyEvent", authenticateToken, fetchNearbyEvent);

module.exports = router;
