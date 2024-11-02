const express = require('express');
const { google } = require('googleapis');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: uploadDir });

module.exports = (oauth2Client) => {
  router.post('/', upload.single('videoFile'), async (req, res) => {
    try {
      // Retrieve the username from the session or request body
      const username = req.session.username || 'Video';

      // Create a datetime string
      const datetime = new Date().toISOString().split('.')[0].replace(/:/g, '-');

      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
      const videoResponse = await youtube.videos.insert({
        part: 'snippet,status',
        requestBody: {
          snippet: {
            title: `${username}${datetime}`,
            description: 'This video was uploaded through the web app.'
          },
          status: {
            privacyStatus: 'unlisted'
          }
        },
        media: {
          body: fs.createReadStream(req.file.path)
        }
      });

      const videoUrl = `https://www.youtube.com/watch?v=${videoResponse.data.id}`;
      res.send(`Video uploaded successfully. Video link: ${videoUrl}`);

      // Cleanup: delete the uploaded file after successful upload
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log(`File ${req.file.path} deleted successfully`);
        }
      });
      
    } catch (error) {
      console.error('Error uploading video:', error);
      res.status(500).json({ success: false, message: 'Error uploading video. Please try again.' });
    }
  });

  return router;
};
