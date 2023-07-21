const asyncHandler = require('express-async-handler');
const dotenv = require('dotenv').config();

const { fileSizeFormatter } = require('../utils/fileUpload');
const cloudinary = require('cloudinary').v2;
const User = require('../models/UserModel');

const Booking = require('../models/BookingModel');

const createBooking = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id); // get userId from "protect middleware"
  const { place, checkIn, checkOut, numberOfGuests, name, phone, price } =
    req.body;
  const newBooking = new Booking({
    place,
    checkIn,
    checkOut,
    numberOfGuests,
    name,
    phone,
    price,
    user: user._id,
  });

  const savedBooking = await newBooking.save();

  if (!savedBooking) {
    res.status(400).json({ message: 'booking unsucessful' });
  }
  console.log('booking:', savedBooking);
  res.json(savedBooking);
});

// Get all UserBookings
const getUserBookings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  // res.json(await Booking.find({ user: user._id }).populate('place'));
  res.json(await Booking.find({ user: user._id }).populate('place'));
});

// Get all UserBookings
// const getUserBookings = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id);
//   // res.json(await Booking.find({ user: user._id }).populate('place'));
//   res.json(await Booking.find({ user: user._id }));
// });

// Get all UserBookings
const getOneUserBooking = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { id } = req.params;

  res.json(
    await Booking.findOne({ user: user._id, _id: id }).populate('place')
  );
});

module.exports = {
  createBooking,
  getUserBookings,
  getOneUserBooking,
};

// {
//   "_id": {
//     "$oid": "6411ec9ff3fe0dbcc33097ea"
//   },
//   "place": {
//     "$oid": "6411e9e59d700a58fa910e9f"
//   },
//   "user": {
//     "$oid": "6411ec46f3fe0dbcc33097e2"
//   },
//   "checkIn": {
//     "$date": "2023-03-17T00:00:00.000Z"
//   },
//   "checkOut": {
//     "$date": "2023-03-19T00:00:00.000Z"
//   },
//   "name": "Peter Clark",
//   "phone": "+79800012333",
//   "price": 600,
//   "__v": 0
// }
