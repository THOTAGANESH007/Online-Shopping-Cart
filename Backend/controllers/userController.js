import sendEmail from "../config/sendEmail.js";
import UserModel from "../models/user.js";
import bcryptjs from "bcryptjs";
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";
export async function registerUserController(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({
        message: "Please Provide Name or Email or Password",
        error: true,
        success: false,
      });

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User Already Exists", error: true, success: false });
    }

    const salt = await bcryptjs.genSalt(7);
    const hashPassword = await bcryptjs.hash(password, salt);
    const payload = {
      //formatting
      name,
      email,
      password: hashPassword,
    };

    const newUser = new UserModel(payload);
    const save = await newUser.save();
    const verifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${save._id}`;

    // Send verification email
    const emailResponse = await sendEmail({
      to: email,
      subject: "Verify your email",
      html: verifyEmailTemplate({ name, url: verifyEmailUrl }),
    });

    if (!emailResponse) {
      return res.status(500).json({
        message: "User registered, but email sending failed",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "User Registration Successful",
      error: false,
      success: true,
      data: save,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
}
