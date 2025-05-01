const express = require("express");
const app = express();
const authRoutes = require("./routes/auth.routes");
const passwordRoutes = require("./routes/password.routes");
const userRoutes = require("./routes/user.routes");
const eventRoutes = require("./routes/event.routes");
const favoriteRoutes = require("./routes/favorite.routes");
require("dotenv").config();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/user", userRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/favorite", favoriteRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server Running...`);
});
