const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // user
  title: String,
  address: String,
  photos: [String],
  description: String,
  perks: [String], // features: free parking on premises, pets allowed, Long term stay allowed
  extraInfo: String,
  type: {
    type: String, // hotel, hotelApart,
  },
  city: {
    type: String,
  },
  rating: {
    // 1-5 stars
    type: Number,
    min: 0,
    max: 5,
    default: 1,
  },
  extraInfo: String,
  checkIn: Number,
  checkOut: Number,
  cheapestPrice: {
    type: Number,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  paymentOptions: [String], // features: "Master card", "Visa card", "QR code", "Apple", "USDT",
  ratings: [
    {
      star: Number,
      comment: String,
      postedby: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
  ],
  totalrating: {
    type: String,
    default: 0,
  },
});

const Place = mongoose.model('Place', placeSchema);

module.exports = Place;
