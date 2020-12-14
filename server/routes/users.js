const express = require('express');
const router = express.Router();
const mongoose = require('express');
const { ObjectId } = require('mongodb');
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
router.route('/appointments').post(async (req, res) => {
  const { user, date, time, location, test } = req.body;
  const dbLocation = await Location.findById(location, {}, (err) => {
    if (err) {
      console.log(err);
      return res.send('location not found');
    }
  });
  let appts = [...dbLocation.appointments];
  for (let appt of appts) {
    if (appt.date === date && appt.time === time) {
      return res.send('unavailable');
    }
  }
  const _id = new ObjectId();
  appts.push({ date, time, test, user, _id });
  dbLocation.appointments = [...appts];
  dbLocation
    .save()
    .then(async () => {
      const newAppointment = { date, time, location, test, confirmation: _id };
      let dbUser = await User.findById(user, {}, (err) => {
        if (err) {
          console.log(err);
          return res.status(400).send('user not found');
        }
      });
      let userAppts = [...dbUser.appointments];
      userAppts.push(newAppointment);
      dbUser.appointments = [...userAppts];
      console.log(dbUser);
      dbUser
        .save()
        .then((user) => res.json(user))
        .catch((err) => res.status(400).json(err));
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).send('location not updated');
    });
});

router.route('/appointments').get(async (req, res) => {
  const user = req.body.user;
  const userDoc = await User.findById(user, {}, (err) => {
    if (err) {
      console.log(err);
      return res.status(400).send('user not found');
    }
  });
  return res.json(userDoc.appointments);
});

router.route('/appointments').delete(async (req, res) => {
  const { user, location, confirmation } = req.body;
  const dbLocation = await Location.findById(location, {}, (err) => {
    if (err) {
      console.log(err);
      return res.send('location not found');
    }
  });
  let appts = [...dbLocation.appointments];
  for (let [index, appt] of appts.entries()) {
    if (appt._id.toString() === confirmation) appts.splice(index, 1);
  }
  dbLocation.appointments = [...appts];
  dbLocation
    .save()
    .then(async () => {
      let dbUser = await User.findById(user, {}, (err) => {
        if (err) {
          console.log(err);
          return res.status(400).send('user not found');
        }
      });
      let userAppts = [...dbUser.appointments];
      for (let [index, appt] of userAppts.entries()) {
        if (appt._id.toString() === confirmation) userAppts.splice(index, 1);
      }
      dbUser.appointments = [...userAppts];
      dbUser
        .save()
        .then((user) => res.json(user))
        .catch((err) => res.status(400).json(err));
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).send('location not updated');
    });
});

router.route('/profile').get((req, res) => {
  // get user profile
});

router.route('/profile').post((req, res) => {
  // update user profile
});

module.exports = router;
