const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();

const GO2RTC_HOST = process.env.GO2RTC_HOST || 'frigate';
const GO2RTC_PORT = process.env.GO2RTC_PORT || 1984;
const PORT = process.env.PORT || 3000;

const CAMERAS_PATH = path.join(__dirname, 'cameras.json');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function loadCameras() {
  try {
    return JSON.parse(fs.readFileSync(CAMERAS_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function saveCameras(data) {
  fs.writeFileSync(CAMERAS_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

app.get('/', async (req, res) => {
  try {
    const { data } = await axios.get(`http://${GO2RTC_HOST}:${GO2RTC_PORT}/api/streams`);
    const streams = Object.keys(data);
    res.render('index', { streams });
  } catch (err) {
    res.render('index', { streams: [], error: 'Could not connect to go2rtc: ' + err.message });
  }
});

app.get('/ping', async (req, res) => {
  res.json({ ok: true });
});

app.get('/map', async (req, res) => {
  try {
    const { data } = await axios.get(`http://${GO2RTC_HOST}:${GO2RTC_PORT}/api/streams`);
    const streams = Object.keys(data);
    const cameras = loadCameras();
    res.render('map', { streams, cameras });
  } catch (err) {
    const cameras = loadCameras();
    res.render('map', { streams: [], cameras, error: 'Could not connect to go2rtc: ' + err.message });
  }
});

app.get('/api/cameras', (req, res) => {
  res.json(loadCameras());
});

app.post('/api/cameras', (req, res) => {
  saveCameras(req.body);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
