const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const User = require('../models/User.model.js');
const Location = require('../models/Location.model.js');

// return all locations
router.route('/locations').get((req, res) => {
  Location.find()
    .then((locations) => res.json(locations))
    .catch((err) => res.status(400).json(err));
});

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
        if (appt.confirmation.toString() === confirmation)
          userAppts.splice(index, 1);
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

router.route('/update/basic').post((req, res) => {
  const { user, name, email, phone, dob } = req.body;
  if (!user) res.send('must provide user id');
  // conditionally create object properties
  const createUpdateObj = () => ({
    ...(name && { name }),
    ...(email && { email }),
    ...(phone && { phone }),
    ...(dob && { dob }),
  });
  User.findByIdAndUpdate(user, createUpdateObj(), { new: true })
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json(err));
});

router.route('/update/address').post((req, res) => {
  const { user, street, city, state, zip } = req.body;
  // conditionally create object properties
  if (!user) res.send('must provide user id');
  const createUpdateObj = () => ({
    ...(street && { street }),
    ...(city && { city }),
    ...(state && { state }),
    ...(zip && { zip }),
  });
  const address = createUpdateObj();
  User.findByIdAndUpdate(user, { $set: { address: address } }, { new: true })
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json(err));
});

router.route('/update/password').post((req, res) => {
  const { user, password } = req.body;
  if (!user) res.send('must provide user id');
  if (!password) res.send('must provide new password');
  User.findByIdAndUpdate(user, { password }, { new: true })
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json(err));
});

router.route('/update/insurance').post((req, res) => {
  const { user, ins_provider, ins_id } = req.body;
  if (!user) res.send('must provide user id');
  // conditionally create object properties
  const createUpdateObj = () => ({
    ...(ins_provider && { ins_provider }),
    ...(ins_id && { ins_id }),
  });
  User.findByIdAndUpdate(user, createUpdateObj(), { new: true })
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json(err));
});

router.route('/update/econtact').post((req, res) => {
  const { user, name, phone, relation } = req.body;
  // conditionally create object properties
  if (!user) res.send('must provide user id');
  const createUpdateObj = () => ({
    ...(name && { name }),
    ...(phone && { phone }),
    ...(relation && { relation }),
  });
  const econtact = createUpdateObj();
  User.findByIdAndUpdate(
    user,
    { $set: { emergency_contact: econtact } },
    { new: true }
  )
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json(err));
});

router.route('/update/travel').post((req, res) => {
  const { user, location, date } = req.body;
  // conditionally create object properties
  if (!user) res.send('must provide user id');
  const createUpdateObj = () => ({
    ...(location && { location }),
    ...(date && { date }),
  });
  const travel = createUpdateObj();
  User.findByIdAndUpdate(user, { $push: { travel: travel } }, { new: true })
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json(err));
});

router.route('/').get((req, res) => {
  let user = req.body.user;
  User.findById(user, {}, (err) => {
    if (err) {
      console.log(err);
      return res.status(400).send('user not found');
    }
  }).then((user) => res.json(user));
});

module.exports = router;
