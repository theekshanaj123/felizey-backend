const express = require("express");
const app = express();
const authRoutes = require("./routes/auth.routes");
const passwordRoutes = require("./routes/password.routes");
const userRoutes = require("./routes/user.routes");
const eventRoutes = require("./routes/event.routes");
const favoriteRoutes = require("./routes/favorite.routes");
const uploadRoutes = require("./routes/upload.routes");
const paymentRoutes = require("./routes/order.routes");
const ticketRoutes = require("./routes/ticket.routes");
const memberRoutes = require("./routes/member.routes");
const cronRoutes = require("./routes/cron.routes");
const organizerRoutes = require("./routes/organizer.routes");
const cors = require('cors');
require("dotenv").config();

app.set("trust proxy", true);

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
app.use("/api/cron", cronRoutes);

app.get("/api", (req, res) => {
  res.send("api working..");
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server Running...`);
});
