const express = require('express');
const router = express.Router();
const Location = require('../models/Location.model.js');

router.route('/').get((req, res) => {
  Location.find()
    .then((locations) => res.json(locations))
    .catch((err) => res.status(400).json(err));
});

module.exports = router;
