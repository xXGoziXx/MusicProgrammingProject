/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
('use strict');

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const request = require('request'); // "Request" library
const secureCompare = require('secure-compare');
admin.initializeApp();
const db = admin.firestore(); // get firestore database
const settings = { /* your settings... */ timestampsInSnapshots: true };
db.settings(settings);

exports.refreshspotifyaccesstoken = functions.https.onRequest((req, res) => {
  const key = req.query.key;
  console.log('Got into Cloud Function with Key: ' + key);
  console.log(
    'The results are in: ' + secureCompare(key, functions.config().cron.key)
  );
  // Exit if the keys don't match.
  if (!secureCompare(key, functions.config().cron.key)) {
    console.log(
      'The key provided in the request does not match the key set in the environment. Check that',
      key,
      'matches the cron.key attribute in `firebase env:get`'
    );
    res
      .status(403)
      .send(
        'Security key does not match. Make sure your "key" URL query parameter matches the ' +
          'cron.key environment variable. Cause yours was ' +
          key
      );
    return null;
  }
  console.log('Got past key checker');
  // Made these envioronment variables using `firebase functions:config:set <name> = <value>` in terminal
  // Use `firebase functions:config:get` to see the environment variables
  var client_id = functions.config().spotify.client_id; // Your client id
  var client_secret = functions.config().spotify.client_secret; // Your secret

  // your application requests authorization
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization:
        'Basic ' +
        new Buffer(client_id + ':' + client_secret).toString('base64'),
    },
    form: {
      grant_type: 'client_credentials',
    },
    json: true,
  };

  request.post(authOptions, (error, response, body) => {
    console.log('Posting request...');
    if (!error && response.statusCode === 200) {
      // use the access token to access the Spotify Web API
      var token = body.access_token;
      // Set the 'capital' field of the city
      var updateSingle = db
        .collection('SecretAccountData')
        .doc('SAD')
        .update({ access_token: token });
      console.log('I GOT THE TOKEN: ' + token);
      var options = {
        url: 'https://api.spotify.com/v1/users/littlelokko',
        headers: {
          Authorization: 'Bearer ' + token,
        },
        scopes: 'user-read-private user-read-birthdate user-read-email playlist-read-private user-library-read user-library-modify user-top-read playlist-read-collaborative playlist-modify-public playlist-modify-private user-follow-read user-follow-modify user-read-playback-state user-read-currently-playing user-modify-playback-state user-read-recently-played',
        json: true,
      };
      request.get(options, (error, response, body) => {
        console.log(body);
        return body;
      });
    } else {
      console.log(error);
      console.log('Status Code: ' + response.statusCode);
      console.log('Body: ' + JSON.stringify(body));
    }
    return null;
  });
  return 'refreshspotifyaccesstoken triggered!';
});
