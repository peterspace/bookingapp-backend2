const asyncHandler = require('express-async-handler');
const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

const protectAdmin = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401);
      throw new Error('Not authorized, please login');
    }

    // Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    // Get user id from token
    const user = await User.findById(verified.id).select('-password');

    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    // if (!user.isAdmin) { // if its not true
    if (!user.role !== "Admin") {
      // if its not true
      res.status(401);
      throw new Error('Not authorized, admin only');
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(403);
    throw new Error('Not authorized, please login');
  }
});


module.exports =  protectAdmin;

