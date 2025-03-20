import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./config/connectDB.js";
import userRouter from "./routes/userRoute.js";
dotenv.config();

const app = express();
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  })
);

app.use(cookieParser());
app.use(morgan());
app.use(express.urlencoded({ extended: true }));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Server is Running..." });
});

app.use("/api/user", userRouter);

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server is Running...");
    });
  })
  .catch(() => {
    console.log("Internal Server Error");
  });
