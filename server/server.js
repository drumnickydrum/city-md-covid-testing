const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = process.env.DB_URI;
mongoose.connect(
  uri,
  { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true },
  () => {
    console.log('Connected to database.');
  }
);

const usersRouter = require('./routes/users.js');
const locationsRouter = require('./routes/locations.js');

app.use('/users', usersRouter);
app.use('/locations', locationsRouter);

app.listen(port, () => {
  console.log('Server is running on port: ', port);
});
