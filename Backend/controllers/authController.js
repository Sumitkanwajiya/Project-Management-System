// authController.js
import asyncHandler from "../middleware/asyncHandler.js";
import { ErrorHandler } from "../middleware/error.js";
import User from "../models/user.js";
import { generateToken } from "../utils/generateToken.js";
import crypto from "crypto";
import sendEmail from "../services/emailService.js";
import { generateForgotPasswordEmailTemplate } from "../utils/emailTemplate.js";

// Register a new user
export const registerUser = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    let user = await User.findOne({ email });
    if (user) {
        return next(new ErrorHandler("User already exists with this email", 400));
    }

    user = await User.create({ name, email, password, role });

    generateToken(user, 201, "User registered successfully", res);
});

// Login
// Login
export const login = asyncHandler(async (req, res, next) => {
    console.log("Login Request Body:", req.body); // Debugging
    const { email, password, role } = req.body || {};
    if (!email || !password) {
        console.log("Login failed: Missing email or password"); // Debugging
        return next(new ErrorHandler("Please provide email and password", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        console.log(`Login failed: User not found for email ${email}`); // Debugging
        res.cookie("token", "", { expires: new Date(0) }); // Clear cookie
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    if (role && user.role.toLowerCase() !== role.toLowerCase()) {
        console.log(`Login failed: Role mismatch. Expected ${user.role}, got ${role}`); // Debugging
        return next(new ErrorHandler("User not found with this role", 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        console.log("Login failed: Password incorrect"); // Debugging
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    generateToken(user, 200, "User logged in successfully", res);
});

// Logout
export const logout = asyncHandler(async (req, res, next) => {
    const isProduction = process.env.NODE_ENV === 'production' || (process.env.FRONTEND_URL && process.env.FRONTEND_URL.includes('vercel.app'));
    res.status(200)
        .cookie("token", "", {
            expires: new Date(Date.now()),
            httpOnly: true,
            sameSite: isProduction ? "None" : "Lax",
            secure: isProduction,
        })
        .json({
            success: true,
            message: "Logged out successfully"
        });
});

// Get current logged-in user
export const getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        user
    });
});

// Forgot Password
export const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new ErrorHandler("Please provide email address", 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(new ErrorHandler("User not found with this email", 404));
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.Frontend_URL}/reset-password?token=${resetToken}`;
    const message = generateForgotPasswordEmailTemplate(resetUrl);
    console.log("DEBUG_RESET_URL:", resetUrl);
    console.log("DEBUG_RESET_TOKEN:", resetToken);

    try {
        await sendEmail({
            email: user.email,
            subject: "Password Reset Request",
            html: message
        });

        res.status(200).json({
            success: true,
            message: `Password reset email sent to ${user.email}`
        });
    } catch (error) {
        // Rollback token on email failure
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        console.error("Email send error:", error); // Added logging
        return next(new ErrorHandler("Email could not be sent. Try again later.", 500));
    }
});

// Reset Password
export const resetPassword = asyncHandler(async (req, res, next) => {
    // Basic validation first
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match", 400));
    }

    // Ensure token string is clean from URL artifacts
    const token = req.params.token ? String(req.params.token).trim() : "";

    if (!token) {
        return next(new ErrorHandler("Invalid token format", 400));
    }

    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({ resetPasswordToken });

    if (!user) {
        return next(new ErrorHandler("Reset Password Token is invalid or has expired", 400));
    }

    // Validate expiration manually to avoid MongoDB Date casting edge-cases across platforms
    if (user.resetPasswordExpire < Date.now()) {
        return next(new ErrorHandler("Reset Password Token is invalid or has expired", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    generateToken(user, 200, "Password updated successfully", res);
});
