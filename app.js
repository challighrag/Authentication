require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

//config/db.js
mongoose.connect(process.env.MONGODB_URI)
.then(() => {console.log("Connected to MONGO DB")})
.catch((error) => {console.log("Error connecting to MONGO DB: ",error)})

//models/user.js
const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    registeredAt: {type: Date, default: Date.now},
    verificationCode: {type: String},
    isVerified: {type: Boolean, default: false}
});

userSchema.pre("save", async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10);
    };
    next();
});

const User = mongoose.model("User", userSchema);

//models/token.js
const tokenSchema = new mongoose.Schema({
    token: {type: String, required: true},
    userId: {type: mongoose.SchemaTypes.ObjectId,ref: "User", required: true},
    createdAt: {type: Date, default: Date.now}
});
const Token = mongoose.model("Token", tokenSchema);

//utility/token.js
const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m"});
};
const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d"});
};

//routers/auth.js (Express.Router())
//controller/auth.js
app.post("/auth/register", async (req, res) => {
    const {username, email, password} = req.body;
    try{
        const existing = await User.findOne({
            $or: [{email}, {username}]
        });

        if(existing) {
            if(existing.username == username) {
                return res.status(409).send({message: "Username already exists"});
            }
            else {
                return res.status(409).send({message: "Email already exists"});
            }
        };

        const user = new User({username, email, password});
        await user.save();

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        const token = new Token({token: refreshToken, userId: user._id});
        await token.save();

        res
        .status(201)
        .cookie("refreshToken", {token: refreshToken}, {httpOnly: true, signed:true, secure:false, samesite: "strict"})
        .json({accessToken});
    }
    catch (error) {
        console.error(`Error registering: ${error}`);
        res.status(500).json({message:"Internal sever error"});
    }
});

app.listen(3000,() => {
    console.log(`Server running on http://localhost:3000`);
});