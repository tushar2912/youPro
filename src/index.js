import ConnectDb from "./db/dbConnect.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config();

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
