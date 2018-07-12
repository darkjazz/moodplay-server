var express = require('express');
var mp = require('./modules/moodplay');
var module_mp = express.Router();

module_mp.get('/get_nearest_track/:valence/:arousal', function(req, res) {
  mp.get_nearest_track(req.params.valence, req.params.arousal, function(track) {
    res.send(track);
  })
});

module_mp.get('/get_track_metadata/:filename', function(req, res) {
  mp.get_track_metadata(req.params.filename, function(track) {
    res.send(track);
  })
});

module_mp.get('/get_all_coordinates/', function(req, res) {
  mp.get_all_coordinates(function(coordinates) {
    res.send(coordinates);
  })
});

module_mp.get('/get_artist_coordinates/', function(req, res) {
  mp.get_artist_coordinates(function(coordinates) {
    res.send(coordinates);
  })
});

module_mp.get('/get_unique/', function(req, res) {
  mp.get_unique(function(unique) {
    res.send(unique);
  })
});

module.exports = module_mp;
