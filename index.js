const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoute = require('./routes/userRoute');

const contactRoute = require('./routes/contactRoute');
const errorHandler = require('./middleWare/errorMiddleware');
const cookieParser = require('cookie-parser');
const path = require('path');
const multer = require('multer');

//==========={using clodinary}===================

const { uploadImage } = require('./utils/uploadImage.js');

//=============={new Routes}==================================
const placeRoute = require('./routes/placeRoute');
const bookingRoute = require('./routes/bookingRoute');

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: [
      'http://127.0.0.1:5173',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      'https://crib.onrender.com/',
      'https://crib-eplr.onrender.com/',
    ],
    credentials: true,
  })
);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes Middleware
app.use('/users', userRoute);
app.use('/contactus', contactRoute);

//============={Hotel Reservation }========================

//============={places}================
app.use('/places', placeRoute);
//============={Bookings}================
app.use('/bookings', bookingRoute);
//============={rooms}================

//======={using cloudinary}==================================

app.post('/upload-by-link', async (req, res) => {
  const { link } = req.body;
  const url = await uploadImage(link);
  res.json(url);
});


const photosMiddleware = multer({ dest: '/tmp' });
app.post('/upload', photosMiddleware.array('photos', 100), async (req, res) => {
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    // const url = await uploadImage(req.files[i]);
    // uploadedFiles.push(url);

    const { path, originalname, mimetype } = req.files[i];

    console.log('originalPath', path);
    console.log('originalname', originalname);

    if (!mimetype.match(/jpe|jpeg|png|gif$i/)) {
      res.status(400).json('File is not supported');
    }

    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newFilename = Date.now() + '.' + ext;

    const url = await uploadImage(path);
    uploadedFiles.push(url);
  }
  res.json(uploadedFiles);
});

// Routes
app.get('/', (req, res) => {
  res.send('Home Page');
});

// Error Middleware
app.use(errorHandler);
// Connect to DB and start server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server Running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
