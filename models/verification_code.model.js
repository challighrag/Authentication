const mongoose = require("mongoose");

const verificationCodeSchema = new mongoose.Schema({
    userId: {type: mongoose.SchemaTypes.ObjectId, ref: "User", required: true},
    code: {type: Number, required: true},
    createdAt: {type: Date, default: Date.now}, 
    expiresAt: {type: Date, default: () => {new Date(Date.now() + 1* 60 * 1000)}, index : {expoires: 0}}
});

const VerificationCode = mongoose.model("VerificationCode", verificationCodeSchema);

module.exports = VerificationCode;