require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
.then(() => {console.log("Connected to MONGO DB")})
.catch((error) => {console.log("Error connecting to MONGO DB: ",error)})

const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    registeredAt: {type: Date, default: Date.now}
});

userSchema.pre("save", async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10);
    };
    next();
});

const User = mongoose.model("User", userSchema);

const tokenSchema = new mongoose.Schema({
    token: {type: String, required: true},
    userId: {type: mongoose.SchemaTypes.ObjectId,ref: "User", required: true},
    createdAt: {type: Date, default: Date.now}
});
const Token = mongoose.model("Token", tokenSchema);

app.post("/auth/register", async (req, res) => {
    const {username, password} = req.body;
    try{
        const existing = await User.findOne({username});
        if(existing) return res.status(400).send({message: "Username already exists"});

        const user = new User({username, password});
        await user.save();

        res.status(200).json({message: "User registered successfully"});
    }
    catch (error) {
        console.error(`Error registering: ${error}`);
        res.status(500).json({message:"Internal sever error"});
    }
});

app.listen(3000,() => {
    console.log(`Server running on http://localhost:3000`);
});