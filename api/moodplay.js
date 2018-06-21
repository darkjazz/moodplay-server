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

module.exports = module_mp;
