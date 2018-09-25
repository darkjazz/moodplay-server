var express = require('express');
var mp = require('./modules/moodplay');
var module_mp = express.Router();

/*
Module: Moodplay
*/

/*
Get Nearest Track: <span>/get_nearest_track/:valence/:arousal</span>
Example: https://moodplay-data.herokuapp.com/moodplay/get_nearest_track/-0.2/-0.3
*/
module_mp.get('/get_nearest_track/:valence/:arousal', function(req, res) {
  mp.get_nearest_track(req.params.valence, req.params.arousal, function(track) {
    res.send(track);
  })
});

/*
Get Track Metadata: <span>/get_track_metadata/:filename</span>
Example: https://moodplay-data.herokuapp.com/moodplay/get_track_metadata/62400-14.01.wav
*/
module_mp.get('/get_track_metadata/:filename', function(req, res) {
  mp.get_track_metadata(req.params.filename, function(track) {
    res.send(track);
  })
});

/*
Get Track Features: <span>/get_track_features_by_id/:id</span>
Example: https://moodplay-data.herokuapp.com/moodplay/get_track_features_by_id/55743cb9-46c0-4d45-96f4-f80ed9131450&14240d1b-1202-4535-b19d-bde56062654d
*/
module_mp.get('/get_track_features_by_id/:id', function(req, res) {
  mp.get_track_features_by_id(req.params.id, function(features) {
    res.send(features);
  })
});

/*
Get Track Features: <span>/get_track_features_by_uri/:id</span>
Example: https://moodplay-data.herokuapp.com/moodplay/get_track_features_by_uri/aHR0cHM6Ly9jZG5zLXByZXZpZXctNi5kemNkbi5uZXQvc3RyZWFtL2MtNjc2MTc3OTcxYjEyNWNmYjRkYjc0YzU3ZmJjMWJhYWYtNi5tcDM=
*/
module_mp.get('/get_track_features_by_uri/:uri', function(req, res) {
  var b = new Buffer(req.params.uri, 'base64')
  var uri = b.toString();
  mp.get_track_features_by_uri(uri, function(features) {
    res.send(features);
  })
});

/*
Get All Track Coordinates: <span>/get_all_coordinates/</span>
Example: https://moodplay-data.herokuapp.com/moodplay/get_all_coordinates/
*/
module_mp.get('/get_all_coordinates/', function(req, res) {
  mp.get_all_coordinates(function(coordinates) {
    res.send(coordinates);
  })
});

/*
Get All Artist Coordinates: <span>/get_artist_coordinates/</span>
Example: https://moodplay-data.herokuapp.com/moodplay/get_artist_coordinates/
*/
module_mp.get('/get_artist_coordinates/', function(req, res) {
  mp.get_artist_coordinates(function(coordinates) {
    res.send(coordinates);
  })
});

/*
Get Unique Coordinates: <span>/get_unique/</span>
Example: https://moodplay-data.herokuapp.com/moodplay/get_unique/
*/
module_mp.get('/get_unique/', function(req, res) {
  mp.get_unique(function(unique) {
    res.send(unique);
  })
});

/*
Get Mood Coordinates: <span>/get_moods/</span>
Example: https://moodplay-data.herokuapp.com/moodplay/get_moods/
*/
module_mp.get('/get_moods/', function(req, res) {
  mp.get_moods(function(moods) {
    res.send(moods);
  })
});

module.exports = module_mp;
