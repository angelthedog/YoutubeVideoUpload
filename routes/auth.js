const express = require('express');
const { google } = require('googleapis');
const router = express.Router();
require('dotenv').config();

module.exports = (oauth2Client) => {
  // Initiates the Google Login flow
  router.get('/auth/login', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.upload', // Required for uploading videos
        'https://www.googleapis.com/auth/youtube.force-ssl', // Optional, may be useful for additional YouTube operations
        'https://www.googleapis.com/auth/userinfo.profile', // Access to profile information
        'https://www.googleapis.com/auth/userinfo.email'    // Access to email information
      ]
    });
    res.redirect(url);
  });

  // Callback URL for handling the Google Login response
  router.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;

    try {
      // Exchange authorization code for access token
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Fetch user info from Google using the access token
      const people = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data } = await people.userinfo.get();

      // Save the token in session
      req.session.isLoggedIn = true;
      req.session.accessToken = tokens.access_token;
      req.session.username = data.name || 'UnknownUser';  // Use user's name or fallback

      // Redirect to the main page after login
      res.redirect('/');
    } catch (error) {
      console.error('Error during login:', error);
      res.redirect('/');
    }
  });

  // Logout route
  router.get('/auth/logout', (req, res) => {
    // Code to handle user logout
    req.session.isLoggedIn = false;
    req.session.accessToken = null;
    res.redirect('/');
  });

  return router;
};
