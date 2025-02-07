import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()


// Middleware to enable Cross-Origin Resource Sharing (CORS)
app.use(cors({
    origin: "http://localhost:2000", 
    credentials: true 
}));

// Middleware to parse incoming JSON requests with a size limit of 16KB
app.use(express.json({ limit: "16kb" }));

// Middleware to parse URL-encoded data with extended support and a size limit of 16KB
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static('public'));
app.use(cookieParser());


//routes

import userRoute  from "./routes/user.route.js";


app.use('/api/v1/user', userRoute)

export { app }