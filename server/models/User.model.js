const mongoose = require('mongoose');

const User = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  dob: Date,
  ins_provider: String,
  ins_id: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zip: Number,
  },
  travel: [
    {
      location: String,
      date: Date,
    },
  ],
  appointments: [
    {
      location: String,
      date: Date,
    },
  ],
});

module.exports = mongoose.model(User);
