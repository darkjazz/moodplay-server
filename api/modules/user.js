var uuid = require('uuid/v4');
var time = require('time');

const base_uri = 'https://moodplay.github.io/party/';
const time_mimit = 10;

var parties = {
  'global': { id: 'global', owner_id: 'global', uri: base_uri + 'global', users: { } }
}

var check_user = function(uaid) {
  var check;
  Object.keys(parties).forEach( party_id => {
    var party = parties[party_id];
    Object.keys(party.users).forEach( user_id => {
      var user = party['users'][user_id];
      if (user.uaid === uaid) check = user;
    })
  });
  return check;
}

var add_party = function(user_id) {
  var id = uuid();
  var uri = base_uri + id;
  var party = {
    id: id,
    uri: uri,
    owner_id: user_id,
    updated: (new time.Date()).toString(),
    users: { }
  };
  party['users'][user_id] = parties['global']['users'][user_id];
  parties[id] = party
  return party;
}

var add_user = function(party_id, uaid, name) {
  var user = check_user(uaid);
  if (user) { return user; }
  else {
    var id = uuid();
    var uri = parties[party_id]['uri'] + '/' + id;
    user = {
      id: id,
      uaid: uaid,
      uri: uri,
      name: name,
      updated: (new time.Date()).toString(),
      current_coords: { valence: 0, arousal: 0, date: "0" },
      history: [ ]
    };
    parties[party_id]['users'][id] = user;
    return user
  }
}

var add_user_coordinates = function(party_id, user_id, valence, arousal) {
  var user = parties[party_id]['users'][user_id];
  if (user['current_coords']['date'] != "0") {
    user['history'].push(user['current_coords']);
  }
  user['current_coords'] = {
    date: (new time.Date()).toString(),
    valence: parseFloat(valence),
    arousal: parseFloat(arousal)
  };
  parties[party_id]['users'][user_id] = user;
  return parties[party_id];
}

module.exports.add_user_coordinates = function(party_id, user_id, valence, arousal, cb) {
  cb(add_user_coordinates(party_id, user_id, valence, arousal))
}

module.exports.add_user = function(party_id, uaid, name, cb) {
  cb(add_user(party_id, uaid, name))
}

module.exports.create_new_party = function(user_id, cb) {
  cb(add_party(user_id))
}
