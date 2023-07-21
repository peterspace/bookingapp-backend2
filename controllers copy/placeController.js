const asyncHandler = require('express-async-handler');
const { fileSizeFormatter } = require('../utils/fileUpload');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv').config();

const Place = require('../models/PlaceModel');
const User = require('../models/UserModel');

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_KEY_SECRECT,
});


// Create Prouct
const createPlace = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const {
    // userId,
    title,
    address,
    addedPhotos,
    description,
    price,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
  } = req.body;

  const placeDoc = await Place.create({
    owner: user._id,
    price,
    title,
    address,
    photos: addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
  });
  res.json(placeDoc);

  // const user = User.findById(userId);

  // const role = user.role;

  // if(role === "Admin"){
  //   const placeDoc = await Place.create({
  //     owner: userData.id,
  //     price,
  //     title,
  //     address,
  //     photos: addedPhotos,
  //     description,
  //     perks,
  //     extraInfo,
  //     checkIn,
  //     checkOut,
  //     maxGuests,
  //   });
  //   res.json(placeDoc);
  // }else{
  //   res.json({message: "Not Authorized"});

  // }
});

// Get all UserPlaces
// const getUserPlaces = asyncHandler(async (req, res) => {
//   const userId = await User.findById(req.user._id);
//   res.json(await Place.find({ owner: userId }));
// });

// const getUserPlaces = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id);
//   // const userId = user._id
//   const places = Place.find({ owner: user._id })
//   res.json(places);
// });

const getUserPlaces = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(await Place.find({ owner: user._id }));
});

// 

// Get single product
const getOnePlace = asyncHandler(async (req, res) => {
  const { id } = req.params;
  res.json(await Place.findById(id));
});

// Update Product
const updatePlaces = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const userId = user._id
  const {
    id,
    title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
    price,
  } = req.body;

  const placeDoc = await Place.findById(id);
  if (userId === placeDoc.owner.toString()) {
    placeDoc.set({
      title,
      address,
      photos: addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    });
    await placeDoc.save();
    res.json('ok');
  }
});

// Get all Places
const getAllPlaces = asyncHandler(async (req, res) => {
  res.json(await Place.find());
});

// const getAllPlaces = (async (req, res) => {
//   const places = Place.find()
//   res.status(200).json(places);
// });

//========{New place}===============================
// Delete Product
const deletePlace = asyncHandler(async (req, res) => {
  const { placeId } = req.params;
  const place = await Place.findById(placeId);
  // if place doesnt exist
  if (!place) {
    res.status(404);
    throw new Error('Place not found');
  }
  // Match place to its user
  if (place.owner.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }
  place.remove();
  res.status(200).json({ message: 'Place deleted.' });
});

module.exports = {
  createPlace,
  getUserPlaces,
  getOnePlace,
  updatePlaces,
  getAllPlaces,
  deletePlace,
};
