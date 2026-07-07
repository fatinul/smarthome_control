const express = require('express');
const axios = require('axios');

const app = express();

const GO2RTC_HOST = process.env.GO2RTC_HOST || 'frigate';
const GO2RTC_PORT = process.env.GO2RTC_PORT || 1984;
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
  try {
    const { data } = await axios.get(`http://${GO2RTC_HOST}:${GO2RTC_PORT}/api/streams`);
    const streams = Object.keys(data);
    res.render('index', { streams });
  } catch (err) {
    res.render('index', { streams: [], error: 'Could not connect to go2rtc: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
