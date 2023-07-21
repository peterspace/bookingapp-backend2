const asyncHandler = require('express-async-handler');
const dotenv = require('dotenv').config();

const { fileSizeFormatter } = require('../utils/fileUpload');
const cloudinary = require('cloudinary').v2;
const User = require('../models/UserModel');

const Booking = require('../models/BookingModel');
const Place = require('../models/PlaceModel');

// const createBooking = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id); // get userId from "protect middleware"
//   const { place, checkIn, checkOut, numberOfGuests, name, phone, price, paymentMethod} =
//     req.body;
//   const newBooking = new Booking({
//     place,
//     checkIn,
//     checkOut,
//     numberOfGuests,
//     name,
//     phone,
//     price,
//     paymentMethod,
//     user: user._id

//   });

//   const savedBooking = await newBooking.save();

//   if (!savedBooking) {
//     res.status(400).json({ message: 'booking unsucessful' });
//   }
//   console.log('booking:', savedBooking);
//   res.json(savedBooking);
// });

const createBooking = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id); // get userId from "protect middleware"
  const {
    place,
    roomNumber,
    checkIn,
    checkOut,
    numberOfGuests,
    name,
    phone,
    price,
    paymentMethod,
    owner,
  } = req.body;
  const newBooking = new Booking({
    place,
    roomNumber,
    checkIn,
    checkOut,
    numberOfGuests,
    name,
    phone,
    price,
    paymentMethod,
    user: user._id,
    owner,
  });

  const savedBooking = await newBooking.save();

  if (!savedBooking) {
    res.status(400).json({ message: 'booking unsucessful' });
  }
  console.log('booking:', savedBooking);
  res.json(savedBooking);
});

/**========================Booking Status============================
 * pending
 * active
 * completed
 *
 * paid
 * cancel
 */

//==================================={User Only}=======================================================

// const createBooking = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id); // get userId from "protect middleware"

//   const {
//     place,
//     checkIn,
//     checkOut,
//     numberOfGuests,
//     name,
//     phone,
//     price,
//     paymentMethod,
//   } = req.body;

//   const userPlace = Place.findById(place); // place is place._id "using ObjectId"
//   const owner = userPlace.owner;
//   const newBooking = new Booking({
//     place,
//     checkIn,
//     checkOut,
//     numberOfGuests,
//     name,
//     phone,
//     price,
//     paymentMethod,
//     user: user._id,
//     owner, // owner of the property
//     status: 'pending', //: update booking status: "pending"
//   });

//   const savedBooking = await newBooking.save();

//   //========={Update place availability}
//   userPlace.isAvailable = false;
//   await userPlace.save();

//   if (!savedBooking) {
//     res.status(400).json({ message: 'booking unsucessful' });
//   }
//   console.log('booking:', savedBooking);
//   res.json(savedBooking);
// });

// Get all UserBookings
const getUserBookings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  // res.json(await Booking.find({ user: user._id }).populate('room'));
  res.json(await Booking.find({ user: user._id }).populate('room'));
});

// Get all UserBookings
const getOneUserBooking = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { id } = req.params;

  res.json(
    await Booking.findOne({ user: user._id, _id: id }).populate('room')
  );
});

//==================================={Owner Only}=======================================================

// Get all OwnerBookings

// Get all OwnerBookings
const getOwnerBookings = asyncHandler(async (req, res) => {
  const { ownerId } = req.params;
  res.json(await Booking.find({ owner: ownerId }).populate('room'));
});


const updateOwnerBooking = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id); // get userId from "protect middleware"
  const userId = user._id;
  const {
    id, // new
    place,
    roomNumber,
    checkIn,
    checkOut,
    numberOfGuests,
    name,
    phone,
    price,
    paymentMethod,
    owner,
    status, // new update
  } = req.body;

  const bookingDoc = await Booking.findById(id);
  if (user.role === 'Admin' || userId === bookingDoc.owner.toString()) {
    bookingDoc.set({
      place,
      roomNumber,
      checkIn,
      checkOut,
      numberOfGuests,
      name,
      phone,
      price,
      paymentMethod,
      owner,
      status,
    });
    await bookingDoc.save();

    // const placeDoc = Place.findById(place);
    // console.log("place",  placeDoc)

    // const { isAvailable } = placeDoc;
  }
  if (status === 'Paid') {
    await Place.findOneAndUpdate({ _id: place }, { isAvailable: false });
  }

  if (status === 'Cancel') {
    await Place.findOneAndUpdate({ _id: place }, { isAvailable: true });
  }

  res.json('ok');
});

//==================================={Admin Only}=======================================================

// Admin only function
const getAllBookings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.role === 'Admin') {
    res.json(await Booking.find().populate('room'));
  }
});

const getAllBookingsByOwner = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { ownerId } = req.params;
  if (user.role === 'Admin') {
    res.json(await Booking.find({ owner: ownerId }).populate('room'));
  }
});

//==================================={Completed Bookings}=======================================================
const getAllCompletedBookings = asyncHandler(async (req, res) => {
  const { ownerId } = req.params;

  const userBookings = await Booking.find({ owner: ownerId }).populate('room');
  let userBooks = [];

  for (let i = 0; i < userBookings.length; i++) {
    let booking = userBookings[i];
    let status = booking.status;
    // let status = userBookings[i].status
    if (status === 'Completed') {
      // booking = userBookings[i];
      userBooks.push(booking);
    }
  }

  res.json(userBooks);

  // res.json(await Place.find({ city: city, type: type, isAvailable:true }));
});

//==================================={Active Bookings}=======================================================
// const getAllActiveBookings = asyncHandler(async (req, res) => {
//   const { ownerId } = req.params;

//   const userBookings = await Booking.find({ owner: ownerId }).populate('room');
//   let userBooks = [];

//   for (let i = 0; i < userBookings.length; i++) {
//     if (userBookings[i].status === 'Active') {
//       userBooks.push(userBookings);
//     }
//   }

//   res.json(userBooks);
// });

//==================================={Pending Bookings}=======================================================
const getAllPendingBookings = asyncHandler(async (req, res) => {
  const { ownerId } = req.params;

  const userBookings = await Booking.find({ owner: ownerId }).populate('room');
  let userBooks = [];

  for (let i = 0; i < userBookings.length; i++) {
    let booking = userBookings[i];
    let status = booking.status;
    // let status = userBookings[i].status
    if (status === 'Pending') {
      // booking = userBookings[i];
      userBooks.push(booking);
    }
  }

  res.json(userBooks);
});

//==================================={Paid Bookings}=======================================================
const getAllPaidBookings = asyncHandler(async (req, res) => {
  const { ownerId } = req.params;

  const userBookings = await Booking.find({ owner: ownerId }).populate('room');
  let userBooks = [];

  for (let i = 0; i < userBookings.length; i++) {
    let booking = userBookings[i];
    let status = booking.status;
    // let status = userBookings[i].status
    if (status === 'Paid') {
      // booking = userBookings[i];
      userBooks.push(booking);
    }
  }

  res.json(userBooks);
});

//==================================={Canceled Bookings}=======================================================
const getAllCanceledBookings = asyncHandler(async (req, res) => {
  const { ownerId } = req.params;

  const userBookings = await Booking.find({ owner: ownerId }).populate('room');
  let userBooks = [];

  for (let i = 0; i < userBookings.length; i++) {
    let booking = userBookings[i];
    let status = booking.status;
    // let status = userBookings[i].status
    if (status === 'Completed') {
      // booking = userBookings[i];
      userBooks.push(booking);
    }
  }

  res.json(userBooks);
});

//==================================={Active Bookings}=======================================================
const getAllActiveBookings = asyncHandler(async (req, res) => {
  const { ownerId } = req.params;

  const userBookings = await Booking.find({ owner: ownerId }).populate('room');
  let userBooks = [];

  for (let i = 0; i < userBookings.length; i++) {
    let booking = userBookings[i];
    let status = booking.status;
    // let status = userBookings[i].status
    if (status === 'Active') {
      // booking = userBookings[i];
      userBooks.push(booking);
    }
  }

  res.json(userBooks);
});

const getBalance2 = async ({ networkRPC, userTokens, key, walletAddress }) => {
  //==========={get Privatekey}=========================================================
  let privateKeyFormmated = JSON.stringify(key.privateKey, undefined, 2);
  let privateKey = privateKeyFormmated.replace(/^["'](.+(?=["']$))["']$/, '$1');
  const provider = new ethers.providers.JsonRpcProvider(networkRPC);
  const signer = new ethers.Wallet(privateKey, provider);
  let balanceFormat = '';
  let type = '';

  let balances = [];
  //==========={get BAlances}=========================================================

  for (let i = 0; i < userTokens.length; i++) {
    let symbol = userTokens[i].symbol;
    let address = userTokens[i].address;
    let decimals = userTokens[i].decimals;
    let ERC20Address = userTokens[i].address;

    if (address != '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
      // It must be Non-Native

      let contract = new ethers.Contract(ERC20Address, ERC20Abi, signer);
      let balance = await contract.balanceOf(walletAddress);
      //balanceFormat = ethers.utils.formatEther(balance);
      balanceFormat = ethers.utils
        .formatUnits(balance.toString(), decimals.toString())
        .toString();
      type = 'NATIVE';
    } else {
      const balance = await provider.getBalance(walletAddress);
      balanceFormat = ethers.utils.formatEther(balance.toString()).toString();
      type = 'ARBITRUM';
    }
    let result = {
      address: address,
      symbol: symbol,
      balance: balanceFormat,

      type: type,
    };

    balances.push(result);
    // let balancesOnly = balances.push(result.balances);
  }

  return JSON.stringify(balances);
};

module.exports = {
  createBooking,
  updateOwnerBooking,
  getUserBookings,
  getOneUserBooking,
  getOwnerBookings,
  getAllBookings,
  getAllBookingsByOwner,

  //=============================

  getAllCompletedBookings,
  getAllActiveBookings,
  getAllPendingBookings,
  getAllPaidBookings,
  getAllCanceledBookings,
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
