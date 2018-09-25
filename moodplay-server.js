// require('dotenv').load();
var cors = require('cors')
var express = require('express');
var bodyParser = require('body-parser');
var front = require('./api/modules/front');
var http = require('http');
var socket = require('socket.io');

var app = module.exports = express();
var server = http.Server(app);
var io = socket(server);

var port = process.env.PORT || 8080;

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/moodplay', require('./api/moodplay'));
app.use('/user', require('./api/user'));

app.get('/', function (req, res) {
  res.send(front.serve_front())
});

io.on('connection', function(socket){
  console.log('a user connected');
});

server.listen(port, function () {
  console.log('Moodplay server listening on port ' + port + '!')
});
