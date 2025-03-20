import sendEmail from "../config/sendEmail.js";
import UserModel from "../models/user.js";
import bcryptjs from "bcryptjs";
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import { request } from "express";
import uploadImageCloudinary from "../utils/uploadImageCloudinary.js";
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

export async function verifyEmailController(req, res) {
  try {
    const { code } = req.body;
    const user = await UserModel.findOne({ _id: code });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid Message", error: true, success: false });
    }
    const updateUser = await UserModel.updateOne(
      { _id: code },
      { verify_email: true }
    );
    return res.json({
      message: "Email Verification Done",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
}

export async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({
        message: "Missing Email or Password fields",
        error: true,
        success: false,
      });
    const existedUser = await UserModel.findOne({ email });
    if (!existedUser)
      return res.status(400).json({
        message: "User Doesnot exist",
        error: true,
        success: false,
      });

    if (existedUser.status !== "Active")
      return res
        .status(400)
        .json({ message: "Contact To Admin", error: true, success: false });

    const checkPassword = await bcryptjs.compare(
      password,
      existedUser.password
    );
    if (!checkPassword)
      return res.status(400).json({
        message: "Check Your Password",
        error: true,
        success: false,
      });
    const accessToken = await generateAccessToken(existedUser._id);
    const refreshToken = await generateRefreshToken(existedUser._id);

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    res.cookie("accessToken", accessToken, cookiesOption);
    res.cookie("refreshToken", refreshToken, cookiesOption);

    return res.json({
      message: "Login Successful!!!",
      success: true,
      error: false,
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function logoutController(req, res) {
  try {
    const userId = req.userId; //middleware
    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    res.clearCookie("accessToken", cookiesOption);
    res.clearCookie("refreshToken", cookiesOption);

    const removeRefreshToken = await UserModel.findByIdAndUpdate(userId, {
      refresh_token: "",
    });
    return res.json({
      message: "Logout Success!!",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function uploadAvatar(req, res) {
  try {
    const userId = req.userId; //auth middleware
    const image = req.file; //multer middleware
    if (!image) {
      return res
        .status(400)
        .json({ message: "No file uploaded", error: true, success: false });
    }

    const upload = await uploadImageCloudinary(image);
    const updateUser = await UserModel.findByIdAndUpdate(userId, {
      avatar: upload.url,
    });
    return res.json({
      message: "Uploaded Profile",
      data: {
        _id: userId,
        avatar: upload.url,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message, error: true, success: false });
  }
}

export async function updateUserDetails(req, res) {
  try {
    const userId = req.userId; //auth middleware
    const { name, email, password, mobile } = req.body;
    const hashPassword = "";
    if (password) {
      const salt = await bcryptjs.genSalt(7);
      hashPassword = await bcryptjs.hash(password, salt);
    }
    /*const updateUser = await UserModel.findByIdAndUpdate(userId, {
      ...(name && { name: name }),
      ...(email && { email: email }),
      ...(mobile && { mobile: mobile }),
      ...(password && { password: hashPassword }),
    });*/

    const updateUser = await UserModel.updateOne(
      { _id: userId },
      {
        ...(name && { name: name }),
        ...(email && { email: email }),
        ...(mobile && { mobile: mobile }),
        ...(password && { password: hashPassword }),
      }
    );

    return res.json({
      message: "User Details Updated",
      success: true,
      error: false,
      data: updateUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
}
