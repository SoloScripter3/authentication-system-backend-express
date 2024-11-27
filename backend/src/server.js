require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");

const app = express();

connectDB();

app.use(express.json());
app.use("/auth", authRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`http://localhost:${port}`));
