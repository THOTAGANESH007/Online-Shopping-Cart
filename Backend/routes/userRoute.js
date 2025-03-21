import { Router } from "express";
import {
  forgotPasswordController,
  loginController,
  logoutController,
  registerUserController,
  resetPassword,
  updateUserDetails,
  uploadAvatar,
  verifyEmailController,
  verifyForgotPasswordOtp,
} from "../controllers/userController.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
const userRouter = Router();

userRouter.post("/register", registerUserController);

userRouter.post("verify-email", verifyEmailController);

userRouter.post("/login", loginController);

userRouter.get("/logout", auth, logoutController);

userRouter.put("/upload-avatar", auth, upload.single("avatar"), uploadAvatar);

userRouter.put("/update-user", auth, updateUserDetails);

userRouter.put("/forgot-password", forgotPasswordController);

userRouter.put("verify-forgot-password-otp", verifyForgotPasswordOtp);

userRouter.put("/reset-password", resetPassword);

export default userRouter;
