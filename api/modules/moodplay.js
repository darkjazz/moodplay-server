var jsonfile = require('jsonfile');
var kdt = require('kd.tree')

var data = {};
var coords = [];
var tree;

var linlin = function(number, inMin, inMax, outMin, outMax) {
  if (number <= inMin) return outMin;
  if (number >= inMax) return outMax;
	return (number-inMin)/(inMax-inMin) * (outMax-outMin) + outMin;
}

var distance = function(a, b){
  return Math.pow(a.valence - b.valence, 2) +  Math.pow(a.arousal - b.arousal, 2);
}

var find_nearest = function(valence, arousal) {
  var nearest = tree.nearest({ valence: valence, arousal: arousal }, 1);
  console.log(nearest[0]);
  return nearest[0][0].filename;
}

var get_track = function(filename) {
  var track = {};
  console.log(filename);
  if (filename in data) {
    return track = data[filename];
  }
  return track;
}

module.exports.get_nearest_track = function(valence, arousal, cb) {
  cb(get_track(find_nearest(valence, arousal)));
}

module.exports.get_track_metadata = function(filename, cb) {
  cb(get_track(filename));
}

jsonfile.readFile('./static/mood.json', function(err, obj) {
  if (err) console.log(err);
  data = obj;
  console.log("Moodplay static data loaded!");
  Object.keys(data).forEach(filename => {
    var track = data[filename];
    var valence = linlin(track.coords.valence, -1.0, 1.0, 0.0, 1.0);
    var arousal = linlin(track.coords.arousal, -1.0, 1.0, 0.0, 1.0);
    var coord = { valence: valence, arousal: arousal, filename: track.filename };
    coords.push(coord);
  });
  tree = kdt.createKdTree(coords, distance, ['valence', 'arousal']);
  console.log("Created coordinates tree!");
});
