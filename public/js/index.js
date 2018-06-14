var homeContainer = $("#home-container");
var searchContainer = $("#search-container");

searchContainer.hide();

var activateTCForm = function() {
    $("#tc-modal").modal({ backdrop: "static" });
};

var activateNewPatientForm = function() {
    $("#add-patient-modal").modal({ backdrop: "static" });
};

var submitTC = function() {
    var TCInformationBox = $('#tc-information-box');

    if (TCInformationBox.val() === "") {
        alert('Invalid information entered into TC information field.');
    }
    else {
        socket.emit('submitTroubleTicket', {
            text: TCInformationBox.val()
        });
    }
};

var submitNewPatient = function() {
    var nameInputBox = $('#patient-name-box');
    var phoneInputBox = $('#patient-phone-box');
    var addressInputBox = $('#patient-address-box');

    if (nameInputBox.val() === ""   || 
        phoneInputBox.val() === ""  ||
        addressInputBox.val() === "") {
        
        alert('Not all form fields are filled out. Please fill out all form fields before submitting.');
    }
    else {
        socket.emit('submitNewPatientForm', {
            name: nameInputBox.val(),
            phone: phoneInputBox.val(),
            address: addressInputBox.val()
        });
    }
};

var socket = io();

socket.on('searchResults', function(results) {

    console.log(JSON.stringify(results));

    if (results === undefined || results.length == 0) {
        alert('No patients have been found with this search criteria.');
    }
    else {
        $('#patient-table').html('<thead><tr><th>Phone</th><th>Name</th><th>Address</th></tr></thead><tbody></tbody>');
        var table = document.getElementById('patient-table');

        for (var i = 0; i < results.length; i++) {
            var tableRow = table.insertRow();
            var phoneCell = tableRow.insertCell(0);
            var nameCell = tableRow.insertCell(1);
            var addressCell = tableRow.insertCell(2);

            phoneCell.innerHTML = results[i].phone;
            nameCell.innerHTML = results[i].name;
            addressCell.innerHTML = results[i].address;
        }
    }
});

socket.on('connect', function(error) {
    if (error) {
        alert(error);
    }
    else {
        socket.emit('requestTCs');
    }
});

socket.on('disconnect', function() {});

socket.on('ticketReceived', function(ticket) {
    var table = document.getElementById('ticket-table');
    var tableRow = table.insertRow();
    var ticketNumberCell = tableRow.insertCell(0);
    var informationCell = tableRow.insertCell(1);
    var reporterCell = tableRow.insertCell(2);

    ticketNumberCell.innerHTML = ticket.ticketNumber;
    informationCell.innerHTML = ticket.information;
    reporterCell.innerHTML = ticket.client;

    tableRow.style.opacity = "0";

    var currentFrame = 0.0;

    var id = setInterval(animate, 10);

    function animate() {
        if (currentFrame == 1.0) {
            clearInterval(id);
        }
        else {
            currentFrame += 0.008;
            tableRow.style.opacity = '' + currentFrame;
        }
    }
});

$('#nav-search-input').on('submit', function(e) {
    e.preventDefault();

    var searchTextBox = $('[name=search-input-box]');

    if (searchTextBox.val() === "") {
        alert('Please enter a value into the field to the left.');
    }
    else {
        homeContainer.hide();
        searchContainer.show();

        socket.emit('performSearch', {
            text: searchTextBox.val()
        });
    }
});

$('[data-toggle="tooltip"]').tooltip();