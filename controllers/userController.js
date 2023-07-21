const asyncHandler = require('express-async-handler');
const User = require('../models/UserModel');
const Order = require('../models/orderModel');
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Token = require('../models/TokenModel');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { uploadImage } = require('../utils/uploadImage');
const validateMongoDbId = require('../utils/validateMongodbId');

//========={new features}===============================

const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');
const Place = require('../models/PlaceModel');

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be up to 6 characters');
  }

  // Check if user email already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('Email has already been registered');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  //   Generate Token
  const token = generateToken(user._id);

  // Send HTTP-only cookie
  res.cookie('token', token, {
    path: '/',
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: 'none',
    secure: true,
  });

  if (user) {
    const { _id, name, email, photo, role } = user;
    res.status(201).json({
      _id,
      name,
      email,
      photo,
      role,
      token,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate Request
  if (!email || !password) {
    res.status(400);
    throw new Error('Please add email and password');
  }

  // Check if user exists
  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error('User not found, please signup');
  }

  // User exists, check if password is correct
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  //   Generate Token
  const token = generateToken(user._id);

  if (passwordIsCorrect) {
    // Send HTTP-only cookie
    res.cookie('token', token, {
      path: '/',
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: 'none',
      secure: true,
    });
  }
  if (user && passwordIsCorrect) {
    const { _id, name, email, photo, phone, bio, role } = user;
    let response = {
      userId: _id,
      name,
      email,
      photo,
      phone,
      bio,
      role,
      token,
    };
    res.status(200).json(response);
  } else {
    res.status(400);
    throw new Error('Invalid email or password');
  }
});

// Logout User
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    path: '/',
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'none',
    secure: true,
  });
  return res.status(200).json({ message: 'Successfully Logged Out' });
});

// Get User Data
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { _id, name, email, photo } = user;
    res.status(200).json({
      _id,
      name,
      email,
      photo,
    });
  } else {
    res.status(400);
    throw new Error('User Not Found');
  }
});

// Get Login Status
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  // Verify Token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

// Update User
// const updateUser = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id);

//   if (user) {
//     const { name, email, photo} = user;
//     user.email = email;
//     user.name = req.body.name || name;

//     const url = await uploadImage(req.body.photo); // from frontEnd
//     if(url){
//       user.photo = url || photo;
//     }

//     const updatedUser = await user.save();
//     res.status(200).json({
//       _id: updatedUser._id,
//       name: updatedUser.name,
//       email: updatedUser.email,
//       photo: updatedUser.photo,
//     });
//   } else {
//     res.status(404);
//     throw new Error("User not found");
//   }
// });

// Update User
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { name, email, photo, phone, bio } = user;
    user.email = email;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;
    user.photo = req.body.photo || photo;

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      photo: updatedUser.photo,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, password } = req.body;

  if (!user) {
    res.status(400);
    throw new Error('User not found, please signup');
  }
  //Validate
  if (!oldPassword || !password) {
    res.status(400);
    throw new Error('Please add old and new password');
  }

  // check if old password matches password in DB
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  // Save new password
  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();
    res.status(200).send('Password change successful');
  } else {
    res.status(400);
    throw new Error('Old password is incorrect');
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User does not exist');
  }

  // Delete token if it exists in DB
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  // Create Reste Token
  let resetToken = crypto.randomBytes(32).toString('hex') + user._id;
  console.log(resetToken);

  // Hash token before saving to DB
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Save Token to DB
  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * (60 * 1000), // Thirty minutes
  }).save();

  // Construct Reset Url
  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  // Reset Email
  const message = `
      <h2>Hello ${user.name}</h2>
      <p>Please use the url below to reset your password</p>  
      <p>This reset link is valid for only 30minutes.</p>

      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

      <p>Regards...</p>
      <p>Pinvent Team</p>
    `;
  const subject = 'Password Reset Request';
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;

  try {
    await sendEmail(subject, message, send_to, sent_from);
    res.status(200).json({ success: true, message: 'Reset Email Sent' });
  } catch (error) {
    res.status(500);
    throw new Error('Email not sent, please try again');
  }
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  // Hash token, then compare to Token in DB
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // fIND tOKEN in DB
  const userToken = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error('Invalid or Expired Token');
  }

  // Find user
  const user = await User.findOne({ _id: userToken.userId });
  user.password = password;
  await user.save();
  res.status(200).json({
    message: 'Password Reset Successful, Please Login',
  });
});

const findUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id); // get user'sd from "protect middleware"
  if (user) {
    console.log('userData:', user);
    return res.json(user);
  }
});

// // Get All Users Data
// const getAllUsers = asyncHandler(async (req, res) => {
//   // const user = await User.findById(req.user._id);
//   res.json(await User.find())
// });

// Get All Users Data
const getAllUsers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.role === 'Admin') {
    res.json(await User.find({ role: 'User' }));
  }
});

// Get All Agents Data
const getAllAgents = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.role === 'Admin') {
    res.json(await User.find({ role: 'Agent' }));
  }
});

// Get All Admin Data
const getAllAdmins = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.role === 'Admin') {
    res.json(await User.find({ role: 'Admin' }));
  }
});

// Register User
const registerAgent = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be up to 6 characters');
  }

  // Check if user email already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('Email has already been registered');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'Agent',
  });

  //   Generate Token
  const token = generateToken(user._id);

  // Send HTTP-only cookie
  res.cookie('token', token, {
    path: '/',
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: 'none',
    secure: true,
  });

  if (user) {
    const { _id, name, email, photo, role } = user;
    res.status(201).json({
      _id,
      name,
      email,
      photo,
      role,
      token,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// Register User
const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be up to 6 characters');
  }

  // Check if user email already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('Email has already been registered');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'Admin',
  });

  //   Generate Token
  const token = generateToken(user._id);

  // Send HTTP-only cookie
  res.cookie('token', token, {
    path: '/',
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: 'none',
    secure: true,
  });

  if (user) {
    const { _id, name, email, photo, role } = user;
    res.status(201).json({
      _id,
      name,
      email,
      photo,
      role,
      token,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

//=============={New Features}================================================

// Get all users

const getallUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find().populate('wishlist');
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate('wishlist'); // Array
    res.json(findUser);
  } catch (error) {
    throw new Error(error);
  }
});

const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    let places = [];
    const user = await User.findById(_id);
    // check if user already have place in cart
    const alreadyExistCart = await Cart.findOne({ orderby: user._id });
    if (alreadyExistCart) {
      alreadyExistCart.remove();
    }
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.place = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;
      let getPrice = await Place.findById(cart[i]._id).select('price').exec();
      object.price = getPrice.price;
      places.push(object);
    }
    let cartTotal = 0;
    for (let i = 0; i < places.length; i++) {
      cartTotal = cartTotal + places[i].price * places[i].count;
    }
    let newCart = await new Cart({
      places,
      cartTotal,
      orderby: user?._id,
    }).save();
    res.json(newCart);
  } catch (error) {
    throw new Error(error);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.findOne({ orderby: _id }).populate('places.place');
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.findOneAndRemove({ orderby: user._id });
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

// coupon
const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (validCoupon === null) {
    throw new Error('Invalid Coupon');
  }
  const user = await User.findOne({ _id });
  let { cartTotal } = await Cart.findOne({
    orderby: user._id,
  }).populate('products.product');
  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);
  await Cart.findOneAndUpdate(
    { orderby: user._id },
    { totalAfterDiscount },
    { new: true }
  );
  res.json(totalAfterDiscount);
});

const createOrder = asyncHandler(async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    if (!COD) throw new Error('Create cash order failed');
    const user = await User.findById(_id);
    let userCart = await Cart.findOne({ orderby: user._id });
    let finalAmout = 0;
    if (couponApplied && userCart.totalAfterDiscount) {
      finalAmout = userCart.totalAfterDiscount;
    } else {
      finalAmout = userCart.cartTotal;
    }

    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: 'COD',
        amount: finalAmout,
        status: 'Cash on Delivery',
        created: Date.now(),
        currency: 'usd',
      },
      orderby: user._id,
      orderStatus: 'Cash on Delivery',
    }).save();
    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    });
    const updated = await Product.bulkWrite(update, {});
    res.json({ message: 'success' });
  } catch (error) {
    throw new Error(error);
  }
});

const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const userorders = await Order.findOne({ orderby: _id })
      .populate('products.product')
      .populate('orderby')
      .exec();
    res.json(userorders);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const alluserorders = await Order.find()
      .populate('products.product')
      .populate('orderby')
      .exec();
    res.json(alluserorders);
  } catch (error) {
    throw new Error(error);
  }
});
const getOrderByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const userorders = await Order.findOne({ orderby: id })
      .populate('products.product')
      .populate('orderby')
      .exec();
    res.json(userorders);
  } catch (error) {
    throw new Error(error);
  }
});
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          status: status,
        },
      },
      { new: true }
    );
    res.json(updateOrderStatus);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  registerUser,
  loginUser,
  logout,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
  findUser,
  getAllUsers,
  getAllAgents,
  getAllAdmins,
  registerAgent,
  registerAdmin,
  //======={New}=======================
  getWishlist,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  getAllOrders,
  getOrderByUserId,
  updateOrderStatus,
};
