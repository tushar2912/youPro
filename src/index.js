import ConnectDb from "./db/dbConnect.js";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

// Middleware to enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Middleware to parse incoming JSON requests with a size limit of 16KB
app.use(express.json({ limit: "16kb" }));

// Middleware to parse URL-encoded data with extended support and a size limit of 16KB
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static('public'))
app.use(express.cookieParser())

// Establish database connection and start the server
ConnectDb()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server started at Port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed", err);
  });
