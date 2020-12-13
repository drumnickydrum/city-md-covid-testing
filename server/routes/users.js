const express = require('express');
const router = express.Router();
const User = require('../models/User.model.js');
const Location = require('../models/Location.model.js');
const { update } = require('../models/User.model.js');

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
router.route('/appts').post(async (req, res) => {
  const { _id, date, time, location, type } = req.body;
  const newAppointment = { date, time, location, type };
  const updateLocation = await Location.findById(location, {}, (err) => {
    if (err) {
      console.log(err);
      return res.send('location not found');
    }
  });
  if (!updateLocation.available[date][time]) {
    return res.send('unavailable');
  } else {
    updateLocation.available[date][time] = false;
    updateLocation.markModified('available');
    updateLocation.save().catch((err) => {
      console.log(err);
      return res.status(400).send('location not updated');
    });
  }
  const user = await User.findById(_id, {}, (err) => {
    if (err) {
      console.log(err);
      return res.status(400).send('user not found');
    }
  });
  user.appointments.unshift(newAppointment);
  user
    .save()
    .then((user) => res.json(user))
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
