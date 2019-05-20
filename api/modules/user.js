var uuid = require('uuid/v4');
var time = require('time');
var mp = require('./moodplay');

const base_uri = 'https://moodplay.github.io/party/';
const vote_length = 11000;
const cursor_interval = 3000;
const num_bots = 10;
const global_ns = 'global';
const global_id = 'moodplay';
const names = [
  "atete", "kianda", "emotan", "ayaba", "gleti", "mawu", "kaikara", "aja", "oba",
  "oshun", "ayao", "mamlambo", "olapa", "nambi", "manat", "nuha", "bagmasti", "saris",
  "nane", "nar", "huba", "wala", "bila", "dilga", "ekhi", "tanit", "kuanja", "nagadya",
  "ashiakle", "mbokomu", "mulindwa", "bunzi", "velekete", "seta", "oxum", "ayizan",
  "marinette", "prende", "manaf", "chaabou", "anahit", "bagvarti", "selardi", "kunapipi",
  "anjea", "yhi", "karatgurk", "laima", "saule", "gabija", "milda", "lurbira", "ilazki",
  "tinjis", "lamia", "moneiba", "chaxiraxi", "hariti", "kamini", "tara", "ekajati",
  "cauri", "tummo", "shingwa", "iouga", "senuna", "verbeia", "epona", "andarta", "naria",
  "sequana", "airmed", "ernmas", "beira", "murigen", "mazu"
];
var io;
var bot_ids;
var bot_name;
var namespaces = { };
var parties = { };
parties[global_ns] = { id: global_ns, owner_id: global_id, uri: base_uri + global_ns, users: { } }

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
  party['users'][user_id] = parties[global_ns]['users'][user_id];
  parties[id] = party;
  create_namespace(id);
  return party;
}

var create_namespace = function(party_id) {
  var ns = io.of(party_id);
  namespaces[party_id] = ns;
  ns.on('connection', function(socket) {
    socket.on("user_coordinates", function(coords) {
      var party = add_user_coordinates(coords.partyID, coords.id, coords.valence, coords.arousal);
      ns.emit("party_message", party);
    })
  });
  setInterval(function() {
    var coords = calculate_average_coordinates(party_id);
    ns.emit("cursor_coordinates", coords);
  }, cursor_interval);
}

var add_bot = function(id) {
  var uri = parties[global_ns]["uri"] + '/' + id;
  var bot = {
    id: id,
    uaid: global_id,
    uri: uri,
    name: generate_name(),
    updated: Date.now(),
    current_coords: { valence: 0, arousal: 0, date: "0" },
    history: [ ]
  };
  parties[global_ns]['users'][id] = bot;
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
      vote_length: vote_length,
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
  if (count_human_users() == 0) {
    var id = get_random_bot_id();
    add_user_coordinates(global_ns, id, (Math.random()-0.5)*2.0, (Math.random()-0.5)*2.0);
    active_users = get_active_users(party_id);
    namespaces[party_id].emit("party_message", parties[party_id]);
  }
  Object.keys(parties[party_id].users).forEach(id => {
    var user = parties[party_id].users[id];
    if (Date.now() - user.current_coords.date < vote_length) {
      avg_coords.valence += user.current_coords.valence;
      avg_coords.arousal += user.current_coords.arousal;
    }
  });
  avg_coords.valence /= active_users.length;
  avg_coords.arousal /= active_users.length;
  avg_coords.dominance = 0;
  return avg_coords;
}

var count_human_users = function() {
  var users = [];
  Object.keys(parties[global_ns].users).forEach(id => {
    var user = parties[global_ns].users[id];
    if (user["uaid"] != global_id && Date.now() - user.current_coords.date < vote_length) {
      users.push(user);
    }
  });
  return users.length;
}

var get_active_users = function(party_id) {
  var active_users = [];
  Object.keys(parties[party_id].users).forEach(id => {
    var user = parties[party_id].users[id];
    if (Date.now() - user.current_coords.date < vote_length) {
      active_users.push(user);
    }
  });
  return active_users;
}

var generate_name = function() {
  var index = Math.floor((Math.random() * names.length));
  return names[index];
}

var get_random_bot_id = function() {
  var index = Math.floor((Math.random() * bot_ids.length));
  return bot_ids[index];
}

// change this to consider more tracks than just the nearest
// add track history, so the same tracks are not played for a period of time
var emit_track_coordinates = function() {
  var coords = calculate_average_coordinates(global_ns);
  mp.get_nearest_track(coords.valence, coords.arousal, function(track) {
    var track = {
        valence: coords.valence,
        arousal: coords.arousal,
        uri: track.preview,
        filename: track.filename,
        artist: track.artist.name,
        title: track.song_title
    };
    ns.emit("track_coordinates", track);
  })
}

var emit_cursor_coordinates = function() {
  var coords = calculate_average_coordinates(global_ns);
  ns.emit("cursor_coordinates")
}

bot_ids = Array.from({length: num_bots}, () => uuid());
bot_ids.forEach(id => add_bot(id));

module.exports.setIo = function(_io) {
  io = _io;
  create_namespace(global_ns);
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

module.exports.calculate_average_coordinates = function(party_id, cb) {
  cb(calculate_average_coordinates(party_id))
}

module.exports.get_active_users = function(party_id, cb) {
  cb(get_active_users(party_id))
}
