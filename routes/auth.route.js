const express = require("express");
const bcrypt = require("bcryptjs");

// models
const User = require("../models/user.model");
const Token = require("../models/token.model");
const VerificationCode = require("../models/verification_code.model");

// utilites
const generateVerificationCode = require("../utilities/verificationCode");

const router = express.Router();

router.post("/register", async (req, res) => {
    const {username, email, password} = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 10);

    try{
        const existing = await User.findOne({
            $or: [{username}, {email: normalizedEmail}]
        });
        if(existing) {
            if (existing.username == username) {
                return res.status(409).send({message: "Username already taken"});
            }
            else  {
                return res.status(409).send({message: "Email already taken"});
            }
        } 

        const user = new User({username,email: normalizedEmail, password: hashedPassword});
        await user.save();

        // http::localhost:3000?token="randomeString"
        // post(/verify, ())

        const newVerificationCode  = generateVerificationCode();
        const verificationCode = new VerificationCode({
            userId: user._id,
            code: newVerificationCode
        });

        await verificationCode.save();

        res.status(200).json({message: `User registered successfully: verification code: ${newVerificationCode}`})

    }
    catch (error) {
        console.error(`Error registering: ${error}`);
        res.status(500).json({message:"Internal sever error"});
    }
});

module.exports = router; 