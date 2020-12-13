const express = require('express');
const router = express.Router();
const User = require('../models/User.model.js');
const Location = require('../models/Location.model.js');

// add user to db with email and password
router.route('/register').post((req, res) => {
  const newUser = new User(req.body);
  User.findOne({ email: newUser.email })
    .then((user) => {
      if (user) {
        return res.send(false);
      } else {
        newUser
          .save()
          .then(() => res.send('success'))
          .catch((err) => res.status(400).json(err));
      }
    })
    .catch((err) => res.status(400).json(err));
});

// find user in db and return user info
router.route('/login').post((req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.send('invalid email');
      } else if (password !== user.password) {
        return res.send('invalid password');
      } else {
        return res.json(user);
      }
    })
    .catch((err) => res.status(400).json(err));
});

// add an appointment
router.route('/appts').post((req, res) => {
  const { _id, date, time, location, type } = req.body;
  const newAppointment = { date, time, location, type };
  Location.findById(location)
    .then((location) => {
      const available = location.available;
      //  change the data structure so
      //  dates are keys of the appointments object
    })
    .catch((err) => res.status(400).json(err));
  User.findById(_id)
    .then((user) => {
      const appointments = user.appointments;
      appointments.unshift(newAppointment);
      User.save()
        .then((user) => res.json(user))
        .catch((err) => res.status(400).json(err));
    })
    .catch((err) => res.status(400).json(err));
});

router.route('/appts').get((req, res) => {
  // get all appointments
});

router.route('/appts').delete((req, res) => {
  // delete selected appointment
});

router.route('/profile').get((req, res) => {
  // get user profile
});

router.route('/profile').post((req, res) => {
  // update user profile
});

module.exports = router;
