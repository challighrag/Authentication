const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// models/user.js
const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    registeredAt: {type: Date, default: Date.now}, 
    isVerified: {type: Boolean, default: false}
});

const User = mongoose.model("User", userSchema);

module.exports = User;