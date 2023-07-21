const express = require('express');
const router = express.Router();
const protect = require('../middleWare/authMiddleware');
const {
  createBooking,
  getUserBookings,
  getOneUserBooking,
  getOwnerBookings,
  updateOwnerBooking,
  getAllBookings,
  getAllBookingsByOwner,

  //=============================

  getAllCompletedBookings,
  getAllActiveBookings,
  getAllPendingBookings,
  getAllPaidBookings,
  getAllCanceledBookings,
} = require('../controllers/bookingController');

router.post('/', protect, createBooking);
router.get('/', protect, getUserBookings); // modified
router.put('/', protect, updateOwnerBooking); // by owner/admin only
// router.patch("/", updateOwnerBooking); // by owner/admin only

router.get('/:id', protect, getOneUserBooking); // modified
// router.get("/ownerbookings", protect, getOwnerBookings); // modified
router.get('/ownerbookings/:ownerId', getOwnerBookings); // modified
router.get('/allbookings', protect, getAllBookings); // modified
router.get('/allbookingsbyowner/:ownerId', protect, getAllBookingsByOwner); // modified

//============================={Get status}==============================================
router.get('/getAllCompletedBookings/:ownerId', getAllCompletedBookings); // modified
router.get('/getAllActiveBookings/:ownerId', getAllActiveBookings); // modified
router.get('/getAllPendingBookings/:ownerId', getAllPendingBookings); // modified
router.get('/getAllPaidBookings/:ownerId', getAllPaidBookings); // modified
router.get('/getAllCanceledBookings/:ownerId', getAllCanceledBookings); // modified

// updateOwnerBooking
module.exports = router;
