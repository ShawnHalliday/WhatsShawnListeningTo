// server.js

const path = require('path');
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(cookieParser());

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = 'http://localhost:8888/callback'; // Your Redirect URI

let accessToken = '';
let refreshToken = '';

app.get('/login', (req, res) => {
  const scopes = 'user-read-currently-playing';
  res.redirect(
    'https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' +
      clientId +
      (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
      '&redirect_uri=' +
      encodeURIComponent(redirectUri)
  );
});

app.get('/callback', (req, res) => {
  const code = req.query.code || null;

  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    params: {
      code: code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(clientId + ':' + clientSecret).toString('base64'),
    },
  })
    .then(response => {
      if (response.status === 200) {
        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token;

        res.send('Authentication successful! You can close this window.');
      } else {
        res.send('Authentication failed.');
      }
    })
    .catch(error => {
      console.error(error);
      res.send('Authentication failed.');
    });
});

// Function to refresh access token
function refreshAccessToken() {
    axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      },
    })
      .then(response => {
        if (response.status === 200) {
          accessToken = response.data.access_token;
          console.log('Access token refreshed.');
        } else {
          console.error('Failed to refresh access token.');
        }
      })
      .catch(error => {
        console.error('Error refreshing access token:', error);
      });
  }
  
  // Refresh the access token every 50 minutes (token expires in 60 minutes)
  setInterval(refreshAccessToken, 3000000); // 50 minutes in milliseconds
  
app.get('/currently-playing', (req, res) => {
    if (!accessToken) {
      return res.status(400).send('Access token is missing.');
    }
  
    axios({
      method: 'get',
      url: 'https://api.spotify.com/v1/me/player/currently-playing',
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    })
      .then(response => {
        if (response.status === 200) {
          res.json(response.data);
        } else if (response.status === 204) {
          res.json({ is_playing: false });
        } else {
          res.status(response.status).send(response.statusText);
        }
      })
      .catch(error => {
        console.error('Error fetching currently playing track:', error);
        res.status(500).send('Internal Server Error');
      });
  });
  
  // Start the server
  app.listen(8888, () => {
    console.log('Server is running on http://localhost:8888');
  });
  