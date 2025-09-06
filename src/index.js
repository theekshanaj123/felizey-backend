const express = require("express");
const admin = require("firebase-admin");
const app = express();
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth.routes");
const passwordRoutes = require("./routes/password.routes");
const userRoutes = require("./routes/user.routes");
const eventRoutes = require("./routes/event.routes");
const favoriteRoutes = require("./routes/favorite.routes");
const uploadRoutes = require("./routes/upload.routes");
const paymentRoutes = require("./routes/order.routes");
const ticketRoutes = require("./routes/ticket.routes");
const memberRoutes = require("./routes/member.routes");
const organizerRoutes = require("./routes/organizer.routes");
const notificationsRoutes = require("./routes/notification.routes");

const eventSocketHandler = require("./socketHandlers/eventSocket");

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const cors = require("cors");

require("dotenv").config();

app.set("trust proxy", true);

const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/user", userRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/favorite", favoriteRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/order", paymentRoutes);
app.use("/api/ticket", ticketRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/organizer", organizerRoutes);
app.use("/api/notification", notificationsRoutes);

app.get("/api", (req, res) => {
  res.send("api working..");
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Attach our event socket handlers
  eventSocketHandler(socket);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server Running...`);
});
