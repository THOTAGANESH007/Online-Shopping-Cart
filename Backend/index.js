import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./config/connectDB.js";
dotenv.config();

const app = express();
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.get("/", (req, res) => {
  res.json({ message: "Server is Running..." });
});
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server is Running...");
    });
  })
  .catch(() => {
    console.log("Internal Server Error");
  });
