const express = require('express');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const port = 3000;

// Google API setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/oauth2callback'
);

// Google SSO authentication flow
app.get('/login', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube.upload']
  });
  res.redirect(authUrl);
});

app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  // Handle successful login and proceed to video upload
  res.send('Login successful. You can now upload videos.');
});

// Video upload functionality
app.post('/upload', async (req, res) => {
  try {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const videoResponse = await youtube.videos.insert({
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title: 'My Uploaded Video',
          description: 'This video was uploaded through the YouTube-like web app.'
        },
        status: {
          privacyStatus: 'public'
        }
      },
      media: {
        body: req.body
      }
    });

    const videoUrl = `https://www.youtube.com/watch?v=${videoResponse.data.id}`;
    res.send(`Video uploaded successfully. Video link: ${videoUrl}`);
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).send('Error uploading video');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
