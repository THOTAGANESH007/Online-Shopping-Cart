import { Router } from "express";
import {
  loginController,
  logoutController,
  registerUserController,
  uploadAvatar,
  verifyEmailController,
} from "../controllers/userController.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
const userRouter = Router();

userRouter.post("/register", registerUserController);
userRouter.post("verify-email", verifyEmailController);
userRouter.post("/login", loginController);
userRouter.get("/logout", auth, logoutController);
userRouter.put("/upload-avatar", auth, upload.single("avatar"), uploadAvatar);

export default userRouter;
