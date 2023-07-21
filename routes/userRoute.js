const express = require('express');
const router = express.Router();
const {
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

  //=============================================

  registerAgent,
  registerAdmin,

  //==========={Admin Only}======================
  getAllUsers,
  getAllAgents,
  getAllAdmins,

  //======={New}========================

  getWishlist,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
  getAllOrders,
  getOrderByUserId,
} = require('../controllers/userController');
// const protect = require('../middleWare/protect');
const protect = require('../middleWare/adminMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logout);
router.get('/getuser', protect, getUser);
router.get('/loggedin', loginStatus);
router.patch('/updateuser', protect, updateUser);
router.patch('/changepassword', protect, changePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);
router.get('/findUser', protect, findUser);

//==============================================

router.post('/register/partner', registerAgent);
router.post('/register/admin', registerAdmin);

//==========={Admin Only}======================

router.get('/getAllUsers', protect, getAllUsers);
router.get('/getAllAgents', protect, getAllAgents);
router.get('/getAllAdmins', protect, getAllAdmins);

router.post('/cart', protect, userCart);
router.post('/cart/applycoupon', protect, applyCoupon);
router.post('/cart/cash-order', protect, createOrder);
router.get('/get-orders', protect, getOrders);
router.get('/getallorders', protect, getAllOrders);
router.post('/getorderbyuser/:id', protect, getAllOrders);
router.get('/wishlist', protect, getWishlist);
router.get('/cart', protect, getUserCart);
router.delete('/empty-cart', protect, emptyCart);
router.put(
  '/order/update-order/:id',
  protect,
  // isAdmin,
  updateOrderStatus
);

router.get('/getOrderByUserId/:id', getOrderByUserId);

module.exports = router;
