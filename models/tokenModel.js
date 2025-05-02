const mongoose = require("mongoose");

// models/token.js
const tokenSchema = new mongoose.Schema({
    token: {type: String, required: true},
    userId: {type: mongoose.SchemaTypes.ObjectId,ref: "User", required: true},
    createdAt: {type: Date, default: Date.now}, 
    expiresAt: {type: Date, default: () => {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}, index : {expoires: 0}}
});
const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;