const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
  email: String,
  password: String,
  name: String,
  dob: String,
  ins_provider: String,
  ins_id: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zip: Number,
  },
  emergency_contact: {
    name: String,
    phone: String,
    relation: String,
  },
  travel: [],
  appointments: [
    {
      date: String,
      time: String,
      location: String,
      test: String,
      confirmation: String,
    },
  ],
});

module.exports = mongoose.model('user', User);
