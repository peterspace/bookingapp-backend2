const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    photo: {
      type: String,
      default: 'https://i.ibb.co/4pDNDk1/avatar.png',
    },
    role: String, // "Admin", "User"
    cart: {
      type: Array,
      default: [],
    },
    // wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
    wishlist: [{ placeId: String, roomNumber: String }],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
