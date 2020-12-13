const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
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
      date: String,
    },
  ],
  appointments: [
    {
      date: String,
      time: String,
      location: String,
      type: String,
    },
  ],
});

module.exports = mongoose.model('user', User);
