var jsonfile = require('jsonfile');
var kdt = require('kd.tree')

const MAX_NODES = 1;

var data = {};
var coords = [];
var tree;
var urimap = {};

var moods;
var features;

var linlin = function(number, inMin, inMax, outMin, outMax) {
  if (number <= inMin) return outMin;
  if (number >= inMax) return outMax;
	return (number-inMin)/(inMax-inMin) * (outMax-outMin) + outMin;
}

var distance = function(a, b){
  return Math.pow(a.valence - b.valence, 2) +  Math.pow(a.arousal - b.arousal, 2);
}

var find_nearest = function(valence, arousal) {
  var nearest = tree.nearest({ valence: valence, arousal: arousal }, MAX_NODES);
  return nearest[0][0].filename;
}

var get_track = function(filename) {
  var track = {};
  if (filename in data) {
    return track = data[filename];
  }
  return track;
}

var get_limits = function() {
  limits = { max_valence: 0, min_valence: 0, max_arousal: 0, min_arousal: 0 }
  Object.keys(data).forEach(filename => {
    var track = data[filename];
    if (track.coords.valence > limits.max_valence) limits.max_valence = track.coords.valence;
    if (track.coords.valence < limits.min_valence) limits.min_valence = track.coords.valence;
    if (track.coords.arousal > limits.max_arousal) limits.max_arousal = track.coords.arousal;
    if (track.coords.arousal < limits.min_arousal) limits.min_arousal = track.coords.arousal;
  });
  return limits;
}

var get_unique = function() {
  var valence = {};
  var arousal = {};
  Object.keys(data).forEach(filename => {
    var track = data[filename];
    if (!(track.coords.valence in valence)) valence[track.coords.valence] = 0;
    if (!(track.coords.arousal in arousal)) arousal[track.coords.arousal] = 0;
    valence[track.coords.valence] += 1;
    arousal[track.coords.arousal] += 1;
  });
  return {
    valence: valence,
    arousal: arousal,
    unique_valence: Object.keys(valence).length,
    unique_arousal: Object.keys(arousal).length
  }
}

var get_artist_coordinates = function() {
  var artists = {};
  var artists_array = [];
  Object.keys(data).forEach(filename => {
    var track = data[filename];
    if (!(track.artist.name in artists)) {
      artists[track.artist.name] = {
        valence: 0, arousal: 0, track_count: 0
      }
    }
    artists[track.artist.name].valence += track.coords.valence;
    artists[track.artist.name].arousal += track.coords.arousal;
    artists[track.artist.name].track_count += 1;
  });

  Object.keys(artists).forEach(name => {
    artists_array.push({
      name: name,
      valence: artists[name].valence / artists[name].track_count,
      arousal: artists[name].arousal / artists[name].track_count,
      track_count: artists[name].track_count
    })
  });
  return artists_array;
}

var get_track_features = function(id) {
  tracks = {}
  id.split("&").forEach(_id => {
    if (_id in features) tracks[_id] = features[_id];
  });
  if (Object.keys(tracks).length === 0 && tracks.constructor === Object)
    tracks["error"] = "track id not found!";
  return tracks;
}

module.exports.get_artist_coordinates = function(cb) {
 cb(get_artist_coordinates())
}

module.exports.get_nearest_track = function(valence, arousal, cb) {
  cb(get_track(find_nearest(valence, arousal)));
}

module.exports.get_track_metadata = function(filename, cb) {
  cb(get_track(filename));
}

module.exports.get_track_features_by_id = function(id, cb) {
  cb(get_track_features(id))
}

module.exports.get_track_features_by_uri = function(uri, cb) {
  var urikey = uri.split("/").pop().split(".")[0];
  var id = urimap[urikey];
  if (id) cb(get_track_features(id)[id])
  else cb({"error": "track id not found!"})
}

module.exports.get_all_coordinates = function(cb) {
  cb(coords);
}

module.exports.get_moods = function(cb) {
  cb(moods);
}

module.exports.get_unique = function(cb) {
  cb(get_unique())
}

jsonfile.readFile('./static/deezer_tracks.json', function(err, obj) {
  if (err) console.log(err);
  data = obj;
  console.log("Moodplay static data loaded!");
  limits = get_limits();
  Object.keys(data).forEach(filename => {
    var track = data[filename];
    var valence = linlin(track.coords.valence, limits.min_valence, limits.max_valence, -1.0, 1.0);
    var arousal = linlin(track.coords.arousal, limits.min_arousal, limits.max_arousal, -1.0, 1.0);
    var coord = { valence: valence, arousal: arousal, uri: track.preview,
      filename: track.filename, artist: track.artist.name, title: track.song_title };
    coords.push(coord);
    var preview_id = track.preview.split("/").pop().split(".")[0];
    urimap[preview_id] = track._id;
  });
  tree = kdt.createKdTree(coords, distance, ['valence', 'arousal']);
  console.log("Created coordinates tree!");
});

jsonfile.readFile('./static/moods.json', function(err, obj) {
  if (err) console.log(err);
  moods = obj;
  console.log("Moodplay moods loaded!");
});

jsonfile.readFile('./static/features.json', function(err, obj) {
  if (err) console.log(err);
  features = obj;
  console.log("Moodplay features loaded!");
});
