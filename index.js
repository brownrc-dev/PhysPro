const express = require('express');
const hbs = require('hbs');
const mongodb = require('mongodb');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');

var MongoClient = mongodb.MongoClient;
var exp = express();
var server = http.createServer(exp);
var port = process.env.PORT || 3004;
var url = 'mongodb://heroku_j9sx6sss:ds85unjk2vli05c743krkcoad2@ds259250.mlab.com:59250/heroku_j9sx6sss';
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
                            "<link rel='stylesheet' type='text/css' href='./css/logs.css'>" +
                        "</head>"+  

                        "<body>" +
                        "<h1>Logs</h1>" +
                            "<table id='log-table'>" +
                                "<tr><th class='header'>Time</th><th class='header'>Information</th></tr>";

var logBackHTML =           "</table>" +
                        "</body>" +
                    "</html>";

var logs = [];
var troubleTickets = [];

var pushLog = function(log) {
    console.log(log);
    
    logs.push({
        time: new Date(),
        info: log
    });
}

var pushTroubleTicket = function(reporter, info) {
    var ticket = {
        client: reporter,
        information: info,
        ticketNumber: assignTicketNumber()
    };

    troubleTickets.push(ticket);

    insertTCIntoDatabase(ticket);

    return ticket;
}

var assignTicketNumber = function() {
    var min = 1000;
    var max = 9999;

    return "PTC" + Math.floor((Math.random() * (max - min) + min));
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
    response.render('home.hbs', {});
});
// End Main Express Routing

// Database
MongoClient.connect(url, function(err, database) {
    if (err) {
        pushLog('(PhysPro Database) > ' + err);
    }
    else {
        pushLog('(PhysPro Database) > Database connection successful.');

        addCollection(database, 'patients');
        addCollection(database, 'physicians');
        addCollection(database, 'troubleTickets');
        addCollection(database, 'patientInteractions');

        getAllTroubleTickets(database);
    }
});

var getAllTroubleTickets = function(database) {
    var ticketCollection = database.db("heroku_j9sx6sss").collection('troubleTickets').find();

    ticketCollection.each(function(err, currentItem) {
        if (currentItem == null) {
            return;
        }

        troubleTickets.push({
            client: currentItem.client,
            information: currentItem.information,
            ticketNumber: currentItem.ticketNumber
        });
    });
}

var addCollection = function(database, collectionName) {
    var dbo = database.db("heroku_j9sx6sss");
    
    dbo.createCollection(collectionName, function(err, res) {
        if (err) {
            pushLog("(PhysPro Database) > Unable to add collection: " + err);
        }
        else {
            pushLog("(PhysPro Database) > Collection '" + collectionName + "' added.");
        }
    });
}

var closeDatabase = function(database) {
    pushLog("(PhysPro Database) > Closing Database.")
    database.close();
}

var insertTCIntoDatabase = function(ticket) {
    MongoClient.connect(url, function(err, database) {
        if (err) {
            pushLog('(PhysPro Database) > ' + err);
        }
        else {
            pushLog('(PhysPro Database) > Inserting ticket (' + ticket.ticketNumber + ') into database.');
            
            var ticketCollection = database.db("heroku_j9sx6sss").collection('troubleTickets');

            ticketCollection.insertOne({
                client: ticket.client,
                information: ticket.information,
                ticketNumber: ticket.ticketNumber
            });
        }
    });
}

var insertPatientIntoDatabase = function(patient) {
    MongoClient.connect(url, function(err, database) {
        if (err) {
            pushLog('(PhysPro Database) > ' + err);
        }
        else {
            pushLog('(PhysPro Database) > Inserting Patient profile (' + patient.name + ") into database.");

            var patientCollection = database.db("heroku_j9sx6sss").collection('patients');
            
            patientCollection.insertOne({
                name: patient.name,
                phone: patient.phone,
                address: patient.address,
                alerts: [],
                medications: [],
                interactions: [],
                ailments: []
            });
        }
    })
}

var performPatientSearch = function(query, socket) {
    MongoClient.connect(url, async function(err, database) {
        if (err) {
            pushLog('(PhysPro Database) > ' + err);
        }
        else {
            pushLog('(PhysPro Database) > Executing search query: ' + query);

            var patientCollection = database.db("heroku_j9sx6sss").collection('patients');

            var databaseResults = patientCollection.find({ phone: { $regex: query }}).toArray(function(err, result) {                
                pushLog('(PhysPro Database) > Sending results of search query: ' + query);
                socket.emit('searchResults', result);
            });
        }
    });
}

var getPatient = function(accountNumber, socket) {
    MongoClient.connect(url, function(err, database) {
        if (err) {
            pushLog('(PhysPro Database) > Failed to get information for patient (' + accountNumber + ').');
        }
        else {
            pushLog('(PhysPro Database) > Getting information for patient (' + accountNumber + ').');

            var patientCollection = database.db("heroku_j9sx6sss").collection('patients');

            var databaseResult = patientCollection.findOne({ phone: accountNumber }, function(err, result) {
                pushLog('(PhysPro Database) > Sending account (' + accountNumber + ') to user (' + socket.handshake.address + ').');
                socket.emit('patientInfoSent', {
                    name: result.name,
                    phone: result.phone,
                    address: result.address,
                    alerts: result.alerts,
                    medications: result.medications,
                    interactions: result.interactions,
                    ailments: result.ailments
                });
    
                if (!result) {
                    pushLog('Failed to retrieve record: ' + accountNumber);
                }
            });
        }
    });
}
// End Database

// SocketIO
io.on('connection', function(socket) {
    var connectLog = '(PhysPro Server) > Client [' + socket.handshake.address + '] has connected to server. Awaiting response.';
    pushLog(connectLog);

    socket.on('performSearch', function(query) {
        pushLog('(Client [' + socket.handshake.address + ']) > ' + 'Search query \'' + query.text + '\'.');
        
        const patients = performPatientSearch(query.text, socket);
    });

    socket.on('performCreate', function(query) {
        pushLog('(Client [' + socket.handshake.address + ']) > ' + 'is currently creating a patient profile. \'' + query.text + '\'.')
    });

    socket.on('submitTroubleTicket', function(info) {
        pushLog('(Client [' + socket.handshake.address + ']) > submitted TC information: ' + info.text);
        var ticket = pushTroubleTicket(socket.handshake.address, info.text);

        socket.emit('ticketReceived', ticket);
    });

    socket.on('submitNewPatientForm', function(patient) {
        pushLog('(Client [' + socket.handshake.address + ']) > submitted new Patient: ' + patient.name);

        insertPatientIntoDatabase(patient);
    });

    socket.on('requestTCs', function() {
        for (var i = 0; i < troubleTickets.length; i++) {
            socket.emit('ticketReceived', troubleTickets[i]);
        }
    });

    socket.on('getAccountInfo', function(accountNumber) {
        pushLog('(Client [' + socket.handshake.address + ']) > Retrieving information for ' + accountNumber);
        getPatient(accountNumber, socket);
    });

    socket.on('updatePatient', function(account, mode) {
        MongoClient.connect(url, function(err, database) {
            var dbo = database.db("heroku_j9sx6sss");

            var accountQuery = { phone: account.phone };
            var newValues;

            if (mode === 0) {
                newValues = { $set: { alerts: account.alerts } };
            }
            else if (mode === 1) {
                newValues = { $set: { medications: account.medications } };
            }
            else if (mode === 2) {
                newValues = { $set: { interactions: account.interactions } };
            }
            else {
                newValues = { $set: { ailments: account.ailments } };
            }

            dbo.collection('patients').updateOne(accountQuery, newValues, function(err, result) {
                if (err) { 
                    pushLog('(PhysPro Database) > Error: ' + err); 
                }
                else {
                    pushLog('(PhysPro Database) > User (' + socket.handshake.address + ") has updated account " + account.phone + ".");
                }
            });
        });
    });

    socket.on('disconnect', function() {
        pushLog('(PhysPro Server) > Client [' + socket.handshake.address + '] has disconnected.');
    });
});
// End SocketIO

server.listen(port);