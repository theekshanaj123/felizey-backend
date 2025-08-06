const eventController = require("../controllers/event.controller");

module.exports = (socket) => {
  socket.on("fetchTotalEventEarning", async (payload = {}) => {
    try {
      const { userId, eventId } = payload;

      const req = {
        user: { id: userId },           // controller reads req.user.id
        params: { eventId: eventId || undefined }, // controller reads req.params.eventId
      };

      // Build a mock `res` object that forwards to socket.emit
      const res = {
        status(code) {
          // return an object with json so controller can chain: res.status(...).json(...)
          return {
            json(payload) {
              socket.emit("totalEventEarning", { httpStatus: code, ...payload });
            },
          };
        },
        json(payload) {
          // default success path
          socket.emit("totalEventEarning", payload);
        },
      };

      // Call the same controller function you already have
      await eventController.fetchTotalEventEarning(req, res);
    } catch (err) {
      // If something unexpected goes wrong, send an error event
      socket.emit("totalEventEarning", {
        status: false,
        message: err?.message || "Internal server error",
      });
    }
  });
};
