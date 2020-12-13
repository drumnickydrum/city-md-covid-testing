const fs = require('fs');

let times = [
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
  '5:00 PM',
  '5:30 PM',
  '6:00 PM',
  '6:30 PM',
];

let date = new Date(2021, 0, 12);
dates = [];
for (let i = 0; i < 365; i++) {
  date.setDate(date.getDate() + 1);
  dates.push({ date: date.toLocaleDateString(), times });
}

let data = JSON.stringify(dates);

fs.writeFile('dates.json', data, (err) => {
  if (err) throw err;
});
