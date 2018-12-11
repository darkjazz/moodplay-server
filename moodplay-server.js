// require('dotenv').load();
var cors = require('cors')
var express = require('express');
var bodyParser = require('body-parser');
var front = require('./api/modules/front');
var http = require('http');
var socket = require('socket.io');
var user = require('./api/modules/user');

var app = module.exports = express();
var server = http.Server(app);
var io = socket(server);
user.setIo(io);

var port = process.env.PORT || 8080;

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/moodplay', require('./api/moodplay'));
app.use('/user', require('./api/user'));

app.get('/', function (req, res) {
  res.send(front.serve_front())
});

// setInterval(function() {
//     user.calculate_average_coordinates('global', function(coords) {
//       console.log(coords.avg_coords, coords.active_users.map(user => user.name))
//     })
// }, 10000);

server.listen(port, function () {
  console.log('Moodplay server listening on port ' + port + '!')
});
