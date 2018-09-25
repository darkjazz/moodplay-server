var express = require('express');
var user = require('./modules/user');
var module_user = express.Router();

module_user.get('/create_new_party/:user_id', function(req, res) {
  user.create_new_party(req.params.user_id, function(party) {
    res.send(party);
  })
});

module_user.get('/add_user/:party_id/:uaid/:name', function(req, res) {
  user.add_user(req.params.party_id, req.params.uaid, req.params.name, function(user) {
    res.send(user);
  })
});

module_user.get('/add_user_coordinates/:party_id/:user_id/:valence/:arousal', function(req, res) {
  var party_id = req.params.party_id;
  var user_id = req.params.user_id;
  var valence = req.params.valence;
  var arousal = req.params.arousal;
  user.add_user_coordinates(party_id, user_id, valence, arousal, function(party) {
    res.send(party);
  })
});

module.exports = module_user;
