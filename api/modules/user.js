var uuid = require('uuid/v4');
var time = require('time');

const base_uri = 'https://moodplay.github.io/party/';
const time_limit = 10000;
const max_bots = 5;
const names = [
  "atete", "kianda", "emotan", "ayaba", "gleti", "mawu", "kaikara", "aja", "oba",
  "oshun", "ayao", "mamlambo", "olapa", "nambi", "manat", "nuha", "bagmasti", "saris",
  "nane", "nar", "huba", "wala", "bila", "dilga", "ekhi", "tanit"
];
var bot_names = [];
var bot_name;
var parties = {
  'global': { id: 'global', owner_id: 'moodplay', uri: base_uri + 'global', users: { } }
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
    updated: Date.now(),
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
      updated: Date.now(),
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
    date: Date.now(),
    valence: parseFloat(valence),
    arousal: parseFloat(arousal)
  };
  parties[party_id]['users'][user_id] = user;
  return parties[party_id];
}

var calculate_average_coordinates = function(party_id) {
  var avg_coords = { valence: 0, arousal: 0 };
  var active_users = get_active_users(party_id);
  if (active_users.length == 0) {
    var id = find_user_id_by_name('global', bot_name);
    add_user_coordinates('global', id, (Math.random()-0.5)*2.0, (Math.random()-0.5)*2.0);
    active_users = get_active_users(party_id);
  }
  Object.keys(parties[party_id].users).forEach(uaid => {
    var user = parties[party_id].users[uaid];
    if (Date.now() - user.current_coords.date < time_limit) {
      avg_coords.valence += user.current_coords.valence;
      avg_coords.arousal += user.current_coords.arousal;
    }
  });
  avg_coords.valence /= active_users.length;
  avg_coords.arousal /= active_users.length;
  return { avg_coords: avg_coords, active_users: active_users };
}

var get_active_users = function(party_id) {
  var active_users = [];
  Object.keys(parties[party_id].users).forEach(uaid => {
    var user = parties[party_id].users[uaid];
    if (Date.now() - user.current_coords.date < time_limit) {
      active_users.push(user);
    }
  });
  return active_users;
}

var find_user_id_by_name = function(party_id, name) {
  var id;
  Object.keys(parties[party_id].users).forEach(user_id => {
    var user = parties[party_id].users[user_id];
    if (user.name == name) {
      id = user.id;
    }
  });
  return id;
}

var generate_name = function() {
  var index = Math.floor((Math.random() * names.length)) - 1;
  return names[index];
}

bot_name = generate_name();
add_user('global', 'moodplay', bot_name);

// Array.from({length: max_bots}, (i) => {
//   bot_name[i] = generate_name();
//   add_user('global', 'moodplay', bot_name[i]);
// });

module.exports.add_user_coordinates = function(party_id, user_id, valence, arousal, cb) {
  cb(add_user_coordinates(party_id, user_id, valence, arousal))
}

module.exports.add_user = function(party_id, uaid, name, cb) {
  cb(add_user(party_id, uaid, name))
}

module.exports.create_new_party = function(user_id, cb) {
  cb(add_party(user_id))
}

module.exports.calculate_average_coordinates = function(party_id, cb) {
  cb(calculate_average_coordinates(party_id))
}

module.exports.get_active_users = function(party_id, cb) {
  cb(get_active_users(party_id))
}

module.exports.find_user_id_by_name = function(party_id, name, cb) {
  cb(find_user_id_by_name(party_id, name))
}
