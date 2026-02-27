import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import { ErrorHandler } from "./error.js";
import User from "../models/user.js";

export const isAuthenticated = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }

  let decodedData;
  try {
    decodedData = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new ErrorHandler("Invalid or expired token. Please login again", 401));
  }

  const user = await User.findById(decodedData.id).select(
    "-resetPasswordToken -resetPasswordExpire -password"
  );

  if (!user) {
    return next(new ErrorHandler("User not found. Please login again", 401));
  }

  req.user = user;
  next();
});


export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    // Normalize user role and allowed roles to lowercase
    const userRole = req.user.role.toLowerCase();
    const allowedRoles = roles.map(role => role.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return next(new ErrorHandler(`Unauthorized. Only ${roles.join(", ")} can access this resource`, 403));
    }
    next();
  };
};
