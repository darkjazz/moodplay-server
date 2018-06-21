// require('dotenv').load();
var cors = require('cors')
var express = require('express');
var bodyParser = require('body-parser');
var front = require('./api/modules/front');

var app = module.exports = express();

var port = 7758; //process.env.PORT || 8080;

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/moodplay', require('./api/moodplay'));

app.get('/', function (req, res) {
  res.send(front.serve_front())
});

app.listen(port, function () {
  console.log('Moodplay server listening on port ' + port + '!')
});
