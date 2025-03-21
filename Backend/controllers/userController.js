import sendEmail from "../config/sendEmail.js";
import UserModel from "../models/user.js";
import bcryptjs from "bcryptjs";
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import { request } from "express";
import uploadImageCloudinary from "../utils/uploadImageCloudinary.js";
import generateOtp from "../utils/generateOtp.js";
import forgotPasswordTemplate from "../utils/forgotPasswordTemplate.js";
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

//forgot password without login
export async function forgotPasswordController(req, res) {
  try {
    const { email } = req.body;
    const isPresent = await UserModel.findOne({ email });
    if (!isPresent) {
      return res.status(400).json({
        message: "Email doesnot exist",
        error: true,
        success: false,
      });
    }
    const otp = generateOtp();
    const expireTime = new Date() + 60 * 60 * 1000; //1hr

    const update = await UserModel.findByIdAndUpdate(isPresent._id, {
      forgot_password_otp: otp,
      forgot_password_expired: new Date(expireTime).toISOString(),
    });

    await sendEmail({
      to: email,
      subject: "Forgot password From Magiccu",
      html: forgotPasswordTemplate({
        name: isPresent.name,
        otp: otp,
      }),
    });
    return res.json({
      message: "Check Your Email",
      error: false,
      success: true,
    });
  } catch (error) {
    return rres.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

//verify forgot password otp
export async function verifyForgotPasswordOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Provide required field email or otp",
        error: true,
        success: false,
      });
    }

    const isPresent = await UserModel.findOne({ email });
    if (!isPresent) {
      return res.status(400).json({
        message: "Email doesnot exist",
        error: true,
        success: false,
      });
    }

    const currentTime = new Date().toISOString();

    if (isPresent.forgot_password_expired < currentTime) {
      return res.status(400).json({
        message: "Otp is Expired",
        error: true,
        success: false,
      });
    }

    if (otp !== isPresent.forgot_password_otp) {
      return res.status(400).json({
        message: "Invalid Otp",
        error: true,
        success: false,
      });
    }

    //if otp isnot expired and matches db otp
    return res.json({
      message: "Verification of otp is done",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

//reset the password
export async function resetPassword(req, res) {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Provide required fields",
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email is not available",
        error: true,
        success: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "new Password & confirm Password not matched",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(7);
    const hashPassword = await bcryptjs.hash(newPassword, salt);

    const update = await UserModel.findOneAndUpdate(user._id, {
      password: hashPassword,
    });

    return res.json({
      message: "Password Updated Successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}
