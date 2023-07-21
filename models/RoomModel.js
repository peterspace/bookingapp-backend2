const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // user
    // placeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' }, // userId
    placeId: String, // userId
    title: String,
    address: String,
    city: String,
    photos: [String],
    description: String,
    perks: [String], // features: free parking on premises, pets allowed, Long term stay allowed
    roomPerks: [String], // features: free parking on premises, pets allowed, Long term stay allowed
    extraInfo: String,
    checkIn: Number,
    checkOut: Number,
    price: Number,
    type: {
      type: String, // hotel, hotelApart, apartment, resort
    },
    roomType: {
      type: String, //studio standard, superior, delux, suite
    },
    // roomType: String,
    price: Number,
    paymentOptions: [String], // features: "Master card", "Visa card", "QR code", "Apple", "USDT",
    unavailableDates: { type: [Date] }, // dates as an array
    maxGuests: Number, // 1, 2, 3
    roomNumber: String,
    isAvailable: {
      type: Boolean,
      default: true,
    },
    rating: {
      // 1-5 stars
      type: Number,
      min: 0,
      max: 5,
      default: 1,
    },
  },
  { timestamps: true }
);

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
