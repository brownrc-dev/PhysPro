const express = require('express');
const hbs = require('hbs');
const mongodb = require('mongodb');
const futures = require('futures');
const socketIO = require('socket.io');
const http = require('http');

var MongoClient = mongodb.MongoClient;
var exp = express();
var server = http.createServer(exp);
var port = process.env.PORT || 3004;
var url = 'mongodb://nsreverse:Ro600620@ds155577.mlab.com:55577/heroku_l0dkglh0';

hbs.registerPartials(__dirname + '/views/partials');
exp.set('view engine', 'hbs');

MongoClient.connect(url, function(err, database) {
    if (err) {

    }
});

exp.get('/logs', function(request, response) {
    response.send('<p>Top Kek</p>');
});

server.listen(port);