const bcrypt = require("bcryptjs");

// models
const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const VerificationCode = require("../models/verificationCodeModel");

// utilites
const generateVerificationCode = require("../utilities/verificationCode");
const normalizeEmail = require("../utilities/email");


const register = ("/register", async (req, res) => {
    const {username, email, password} = req.body;

    const normalizedEmail = normalizeEmail(email);
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

const verify = ('/verify', async (req, res) => {
    const { email, code } = req.body;

    try {
        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({ message: `${normalizedEmail} not found` });
        }

        const verificationCode = await VerificationCode.findOne({ userId: user._id });

        if (!verificationCode) {
            return res.status(410).json({ message: "Verification code expired / invalid" });
        }

        // check if expired manually
        if (verificationCode.expiresAt < Date.now()) {
            return res.status(410).json({ message: "Code is expired" });
        }

        if (verificationCode.code !== Number(code)) {
            return res.status(400).json({ message: "Wrong verification code" });
        }

        user.isVerified = true;
        await user.save();

        res.status(200).json({ message: "User verified successfully" });

    } catch (error) {
        console.error("Error verifying the user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = {register, verify};