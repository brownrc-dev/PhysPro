const express = require('express');
const hbs = require('hbs');
const mongodb = require('mongodb');
const futures = require('futures');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');

var MongoClient = mongodb.MongoClient;
var exp = express();
var server = http.createServer(exp);
var port = process.env.PORT || 3004;
var url = 'mongodb://nsreverse:Ro600620@ds155577.mlab.com:55577/heroku_l0dkglh0';
var publicPath = path.join(__dirname, './public');
var io = socketIO(server);

hbs.registerPartials(__dirname + '/views/partials');
exp.set('view engine', 'hbs');

exp.use(express.static(publicPath));

// Logging
var logFrontHTML = "<!DOCTYPE html>" + 
                    "<html>" +
                        "<head>"+
                            "<title>PhysPro Logs</title>" +
                            "<link rel='stylesheet' type='text/css' href='./css/index.css'>" +
                        "</head>"+  

                        "<body>" +
                        "<h1>Logs</h1>" +
                            "<table id='log-table'>" +
                                "<tr><th class='header'>Time</th><th class='header'>Information</th></tr>";

var logBackHTML =           "</table>" +
                        "</body>" +
                    "</html>";

var logs = [];

var pushLog = function(log) {
    console.log(log);
    
    logs.push({
        time: new Date(),
        info: log
    });
}

exp.get('/logs', function(request, response) {
    var logHTML = "";
    logHTML += logFrontHTML;

    for (var i = 0; i < logs.length; i++) {
        logHTML += "<tr><td>" + logs[i].time + "</td><td>" + logs[i].info + "</td></tr>";
    }

    logHTML += logBackHTML;

    response.send(logHTML);
});
// End Logging

// Main Express Routing
exp.get('/', function(request, response) {
    response.render('home.hbs', {

    });
});
// End Main Express Routing

// Database
/*
MongoClient.connect(url, function(err, database) {
    if (err) {

    }
});
*/
// End Database

// SocketIO
io.on('connection', function(socket) {
    var connectLog = '(PhysPro Server) > Client [' + socket.handshake.address + '] has connected to server. Awaiting response.';
    pushLog(connectLog);

    socket.on('performSearch', function(query) {
        pushLog('(Client [' + socket.handshake.address + ']) > ' + 'Search query \'' + query.text + '\'.');
    });

    socket.on('performCreate', function(query) {
        pushLog('(Client [' + socket.handshake.address + ']) > ' + 'is currently creating a patient profile. \'' + query.text + '\'.')
    });

    socket.on('disconnect', function() {
        pushLog('(PhysPro Server) > Client [' + socket.handshake.address + '] has disconnected.');
    });
});
// End SocketIO

server.listen(port);