const asyncHandler = require('express-async-handler');
const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

const protect = asyncHandler(async (req, res, next) => {
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
    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, please login');
  }
});

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
    if (!user.isAdmin !== true) {
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

//====================={New veryfications Methods}=============================================

export const verifyToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401);
    throw new Error('You are not authenticated!');
  }

  // Verify Token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  // Get user id from token
  const user = await User.findById(verified.id).select('-password');

  // jwt.verify(token, process.env.JWT, (err, user) => {
  //   if (err) {
  //     res.status(401);
  //     throw new Error(403, 'Token is not valid!');
  //   }

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  req.user = user;
  next();
});

export const verifyUser = asyncHandler(async (req, res, next) => {
  verifyToken(req, res, next, () => {
    if (req.user._id === req.params.id || req.user.isAdmin) {
      // if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403);
      throw new Error('You are not authorized!');
    }
  });
});

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  verifyToken(req, res, next, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403);
      throw new Error('You are not authorized!');
    }
  });
});

module.exports = {
  protect,
  protectAdmin,
  verifyToken,
  verifyUser,
  verifyAdmin,
};
