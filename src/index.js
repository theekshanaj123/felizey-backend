const express = require("express");
const app = express();
const authRoutes = require("./routes/auth.routes");
const passwordRoutes = require("./routes/password.routes");
const userRoutes = require("./routes/user.routes");
require("dotenv").config();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/user", userRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server Running...`);
});
