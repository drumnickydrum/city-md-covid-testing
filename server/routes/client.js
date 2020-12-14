const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const Client = require('../models/Client.model.js');
const Location = require('../models/Location.model.js');

// return all locations
router.route('/locations').get((req, res) => {
  Location.find()
    .then((locations) => res.json(locations))
    .catch((err) => res.status(400).json(err));
});

// add client to db with email and password
router.route('/register').post((req, res) => {
  const newClient = new Client(req.body);
  Client.findOne({ email: newClient.email })
    .then((client) => {
      if (client) {
        return res.send(false);
      } else {
        newClient
          .save()
          .then(() => res.send('success'))
          .catch((err) => res.status(400).json(err));
      }
    })
    .catch((err) => res.status(400).json(err));
});

// find client in db and return client info
router.route('/login').post((req, res) => {
  const { email, password } = req.body;
  Client.findOne({ email })
    .then((client) => {
      if (!client) {
        return res.send('invalid email');
      } else if (password !== client.password) {
        return res.send('invalid password');
      } else {
        return res.json(client);
      }
    })
    .catch((err) => res.status(400).json(err));
});

// add an appointment
router.route('/appointments').post(async (req, res) => {
  const { client, date, time, location, test } = req.body;
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
  appts.push({ date, time, test, client, _id });
  dbLocation.appointments = [...appts];
  dbLocation
    .save()
    .then(async () => {
      const newAppointment = { date, time, location, test, confirmation: _id };
      let dbClient = await Client.findById(client, {}, (err) => {
        if (err) {
          console.log(err);
          return res.status(400).send('client not found');
        }
      });
      let clientAppts = [...dbClient.appointments];
      clientAppts.push(newAppointment);
      dbClient.appointments = [...clientAppts];
      console.log(dbClient);
      dbClient
        .save()
        .then((client) => res.json(client))
        .catch((err) => res.status(400).json(err));
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).send('location not updated');
    });
});

router.route('/appointments').get(async (req, res) => {
  const client = req.body.client;
  const clientDoc = await Client.findById(client, {}, (err) => {
    if (err) {
      console.log(err);
      return res.status(400).send('client not found');
    }
  });
  return res.json(clientDoc.appointments);
});

router.route('/appointments').delete(async (req, res) => {
  const { client, location, confirmation } = req.body;
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
      let dbClient = await Client.findById(client, {}, (err) => {
        if (err) {
          console.log(err);
          return res.status(400).send('client not found');
        }
      });
      let clientAppts = [...dbClient.appointments];
      for (let [index, appt] of clientAppts.entries()) {
        if (appt.confirmation.toString() === confirmation)
          clientAppts.splice(index, 1);
      }
      dbClient.appointments = [...clientAppts];
      dbClient
        .save()
        .then((client) => res.json(client))
        .catch((err) => res.status(400).json(err));
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).send('location not updated');
    });
});

router.route('/update/basic').post((req, res) => {
  const { client, name, email, phone, dob } = req.body;
  if (!client) res.send('must provide client id');
  const createUpdateObj = () => ({
    ...(name && { name }),
    ...(email && { email }),
    ...(phone && { phone }),
    ...(dob && { dob }),
  });
  Client.findByIdAndUpdate(client, createUpdateObj(), { new: true })
    .then((client) => res.json(client))
    .catch((err) => res.status(400).json(err));
});

router.route('/update/address').post((req, res) => {
  const { client, street, city, state, zip } = req.body;
  if (!client) res.send('must provide client id');
  const createUpdateObj = () => ({
    ...(street && { street }),
    ...(city && { city }),
    ...(state && { state }),
    ...(zip && { zip }),
  });
  const address = createUpdateObj();
  Client.findByIdAndUpdate(
    client,
    { $set: { address: address } },
    { new: true }
  )
    .then((client) => res.json(client))
    .catch((err) => res.status(400).json(err));
});

router.route('/update/password').post((req, res) => {
  const { client, password } = req.body;
  if (!client) res.send('must provide client id');
  if (!password) res.send('must provide new password');
  Client.findByIdAndUpdate(client, { password }, { new: true })
    .then((client) => res.json(client))
    .catch((err) => res.status(400).json(err));
});

router.route('/update/insurance').post((req, res) => {
  const { client, ins_provider, ins_id } = req.body;
  if (!client) res.send('must provide client id');
  const createUpdateObj = () => ({
    ...(ins_provider && { ins_provider }),
    ...(ins_id && { ins_id }),
  });
  Client.findByIdAndUpdate(client, createUpdateObj(), { new: true })
    .then((client) => res.json(client))
    .catch((err) => res.status(400).json(err));
});

router.route('/update/econtact').post((req, res) => {
  const { client, name, phone, relation } = req.body;
  if (!client) res.send('must provide client id');
  const createUpdateObj = () => ({
    ...(name && { name }),
    ...(phone && { phone }),
    ...(relation && { relation }),
  });
  const econtact = createUpdateObj();
  Client.findByIdAndUpdate(
    client,
    { $set: { emergency_contact: econtact } },
    { new: true }
  )
    .then((client) => res.json(client))
    .catch((err) => res.status(400).json(err));
});

router.route('/update/travel').post((req, res) => {
  const { client, location, date } = req.body;
  if (!client) res.send('must provide client id');
  const createUpdateObj = () => ({
    ...(location && { location }),
    ...(date && { date }),
  });
  const travel = createUpdateObj();
  Client.findByIdAndUpdate(client, { $push: { travel: travel } }, { new: true })
    .then((client) => res.json(client))
    .catch((err) => res.status(400).json(err));
});

router.route('/').get((req, res) => {
  let client = req.body.client;
  Client.findById(client, {}, (err) => {
    if (err) {
      console.log(err);
      return res.status(400).send('client not found');
    }
  }).then((client) => res.json(client));
});

module.exports = router;
