import express, { json } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "./models/User.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import { WebSocketServer } from 'ws'
import cookieParser from 'cookie-parser'
import { Message } from "./models/Messages.js";

dotenv.config();
console.log(process.env.MONGO_URL);
mongoose.connect(process.env.MONGO_URL);
const jwtSecret = process.env.JWT_SECRET;
const app =express();
app.use(cors({
    credentials : true,
    origin : "http://localhost:5173"
}));
app.use(express.json());
app.use(cookieParser());
app.get("/test", (req, res) => {
    res.json('test ok')
})

app.post("/register", async (req, res) => {
    try {
        const {username , password} = req.body;
        const user = await User.findOne({username : username});
        if(user) {
            console.log('User already exists')
            throw new Error('User already exists')
        }
        const createdUser = await User.create({ username, password});
        const token = await jwt.sign({userId : createdUser._id, username : username}, jwtSecret);
        if(!token) {
            throw new Error('Token creation failed')
        }
        res.cookie('token', token).status(201).json({
            id : createdUser._id,
            username : createdUser.username
        });
    } catch (error) {
        res.status(400).json({error : error.message})
    }
})

app.post("/login", async (req, res) => {
    try {
        const {username , password} = req.body;
        const foundUser = await User.findOne({username : username});
        if(!foundUser) {
            console.log('User does not exists')
            throw new Error('User does not exists, please register')
        }
        if(foundUser.password !== password) {
            console.log('Password does not match')
            throw new Error('Password does not match')
        } 
        const token = await jwt.sign({userId : foundUser._id, username : username}, jwtSecret);
        if(!token) {
            throw new Error('Token creation failed')
        }
        res.cookie('token', token).status(201).json({
            id : foundUser._id,
            username : foundUser.username
        });
    } catch (error) {
        res.status(400).json({error : error.message})
    }
})
app.get('/message/:userId', async (req, res) => {
    try {
            const {userId} = req.params;
        const token = req.cookies?.token;
        if(token) {
            const userData = await jwt.verify(token, jwtSecret);
            const messages = await Message.find({sender : {$in : [userId, userData.userId]}, recipient : {$in : [userId, userData.userId]}}).sort({createdAt : 1});
            console.log("Messages are : ", messages);
            res.json(messages);
        } else {
            console.log('Unauthorized')
            res.status(401).json({error : 'Unauthorized'})
        }
    } catch (error) {
        console.log("Error is : ", error.message);
        res.status(400).json({error : error.message})
    }
})

const server = app.listen(4000, ()=> {
    console.log('Server is running on port 4000')
})

const wss = new WebSocketServer({ server : server });
wss.on('connection', async (ws, req) => {
    const cookies = req.headers.cookie;
    console.log("Cookies are : ", cookies);
    if(cookies) {
        const token = cookies.split('=')[1];
        if(token) {
            const userData = await jwt.verify(token, jwtSecret);
            console.log("User data is : ", userData);
            const {userId, username} = userData;
            ws.userId = userId;
            ws.username = username;
        }
    }
    console.log("No of clients : " + wss.clients.size);
    wss.clients.forEach(client => {
        const clientsInfo = [...wss.clients].map(c => ({ userId: c.userId, username: c.username }));
        client.send(JSON.stringify({ online: clientsInfo }));
    });
    ws.on('message', async (message) => {
        const messageData = JSON.parse(message.toString());
        await Message.create({
            sender : messageData.sender,
            recipient : messageData.recipient,
            text : messageData.text
        });
        console.log("Message is : ", messageData);
        const {recipient, text } = messageData;
         if(recipient && text) {
            [...wss.clients].filter(c => c.userId === recipient).forEach(client => client.send(message.toString()));
         }
    })
})