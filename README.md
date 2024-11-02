# YouTube-like Web Application

This is a web application that provides a YouTube-like experience, allowing users to log in with their Google accounts and upload videos to their YouTube channels.

## Features

- Google SSO authentication for user login
- Video upload functionality that saves the video to the user's YouTube account as public but not listed
- Display of the uploaded video's link in the web application

## Getting Started

1. Clone the repository and navigate to the project directory.
2. Install the dependencies by running `npm install`.
3. Obtain a Google API client ID and client secret, and update the corresponding values in the `index.js` file.
4. Start the development server by running `npm run dev`.
5. Open your web browser and navigate to `http://localhost:3000/login` to begin the Google SSO authentication flow.
6. After successful login, you can upload videos using the `/upload` endpoint.

## Technologies Used

- Express.js for the web server
- Google APIs (googleapis) for Google SSO and YouTube API integration
- Nodemon for automatic server restarting during development

## Future Improvements

- Implement a user interface for the video upload and display functionality
- Add error handling and validation for the video upload process
- Provide options for setting video privacy and metadata
- Integrate a database to store user and video information
