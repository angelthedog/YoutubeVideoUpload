const express = require('express');
const path = require('path');
const { google } = require('googleapis');
const session = require('express-session');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set true if using HTTPS
}));

// Google API setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/auth/google/callback'
);

// Set up routes
app.use('/upload', require('./routes/upload')(oauth2Client));
app.use('/', require('./routes/auth')(oauth2Client));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/auth/status', (req, res) => {
  res.json({ isLoggedIn: !!req.session.isLoggedIn });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
