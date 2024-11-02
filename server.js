const express = require('express');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// Google API setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/auth/google/callback'
);

// Google SSO authentication flow
app.get('/login', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube.upload']
  });
  res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  // Handle successful login and redirect to root route
  res.redirect('/');
});

app.get('/auth/status', (req, res) => {
  res.json({ isLoggedIn: !!oauth2Client.credentials.access_token });
});

app.post('/logout', (req, res) => {
  oauth2Client.revokeToken(oauth2Client.credentials.access_token, (err) => {
    if (err) {
      console.error('Error revoking token:', err);
      res.status(500).send('Error logging out');
    } else {
      oauth2Client.credentials = {};
      res.send('Logged out successfully');
    }
  });
});

app.use('/upload', require('./routes/upload')(oauth2Client));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
