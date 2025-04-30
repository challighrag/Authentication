require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.route");

const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

// config/database.js
mongoose.connect(process.env.MONGODB_URI)
.then(() => {console.log("Connected to MONGO DB")})
.catch((error) => {console.log("Error connecting to MONGO DB: ",error)})

app.use("/auth", authRouter);

app.listen(3000,() => {
    console.log(`Server running on http://localhost:3000`);
});