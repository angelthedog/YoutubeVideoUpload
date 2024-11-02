const express = require('express');
const { google } = require('googleapis');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');

module.exports = (oauth2Client) => {
  router.post('/', upload.single('videoFile'), async (req, res) => {
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
          body: fs.createReadStream(req.file.path)
        }
      });

      const videoUrl = `https://www.youtube.com/watch?v=${videoResponse.data.id}`;
      res.send(`Video uploaded successfully. Video link: ${videoUrl}`);
    } catch (error) {
      console.error('Error uploading video:', error);
      res.status(500).send('Error uploading video');
    }
  });

  return router;
};
