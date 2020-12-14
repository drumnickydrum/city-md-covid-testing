const express = require('express');
const router = express.Router();
const Location = require('../models/Location.model.js');

// return all locations
router.route('/').get((req, res) => {
  Location.find()
    .then((locations) => res.json(locations))
    .catch((err) => res.status(400).json(err));
});

// add a location
router.route('/').post((req, res) => {
  newLocation = new Location(req.body);
  newLocation
    .save()
    .then((location) => res.json(location))
    .catch((err) => res.status(400).json(err));
});

// // update available appointments
// router.route('/avail').post((req, res) => {
//   const { location, available } = req.body;
//   console.log(available);
//   Location.findByIdAndUpdate(location, { available })
//     .then(() => res.send('all good!'))
//     .catch((err) => res.status(400).json(err));
// });

// router.route('/appts').post((req, res) => {
//   // add appointment to location
// });

// router.route('/appts').delete((req, res) => {
//   // delete appoint from location
// });

module.exports = router;
