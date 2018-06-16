var currentPatient;
var currentUser;

var homeContainer = $("#home-container");
var searchContainer = $("#search-container");
var profileContainer = $("#patient-profile-container");

searchContainer.hide();
profileContainer.hide();

document.getElementById("brand").style.cursor = "pointer";
document.getElementById("brand").onclick = function(e) {
    e.preventDefault();

    homeContainer.show();
    searchContainer.hide();
    profileContainer.hide();
};

var submitTC = function() {
    var TCInformationBox = $('#tc-information-box');

    if (TCInformationBox.val().trim() === "") {
        alert('Invalid information entered into TC information field.');
    }
    else {
        socket.emit('submitTroubleTicket', {
            text: TCInformationBox.val().trim()
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

var submitNewAlert = function() {
    var alert = $('#patient-info-alert-box').val().trim();

    if (alert === "") {
        alert('Please insert a valid alert.');
    }
    else {
        alert = '(' + currentUser + '): ' + alert;
        var alertsTable = document.getElementById('patient-info-alerts-table');

        if (currentPatient.alerts.length === 0) {
            alertsTable.innerHTML = '<tbody></tbody>';
        }
        
        var tableRow = alertsTable.insertRow();
        var defaultCell = tableRow.insertCell(0);

        defaultCell.innerHTML = alert;

        currentPatient.alerts.push(alert);
        pushChangesToAccount(currentPatient, 0);
    }
};

var submitNewMedication = function() {
    var medication = $('#patient-info-medication-box').val().trim();

    if (medication === "") {
        alert('Please insert a valid medication.');
    }
    else {
        medication = '(' + currentUser + '): ' + medication;
        var medicationsTable = document.getElementById('patient-info-medications-table');
        
        if (currentPatient.medications.length === 0) {
            medicationsTable.innerHTML = '<tbody></tbody>';
        }
    
        var tableRow = medicationsTable.insertRow();
        var defaultCell = tableRow.insertCell(0);

        defaultCell.innerHTML = medication;

        currentPatient.medications.push(medication);
        pushChangesToAccount(currentPatient, 1);
    }
};

var submitNewInteraction = function() {
    var interaction = $('#patient-info-interaction-box').val().trim();

    if (interaction === "") {
        alert('Please insert a valid interaction.');
    }
    else {
        interaction = '(' + currentUser + '): ' + interaction;
        var interactionsTable = document.getElementById('patient-info-recent-interactions-table');
        
        if (currentPatient.interactions.length === 0) {
            interactionsTable.innerHTML = '<tbody></tbody>';
        }

        var tableRow = interactionsTable.insertRow();
        var defaultCell = tableRow.insertCell(0);

        defaultCell.innerHTML = interaction;

        currentPatient.interactions.push(interaction);
        pushChangesToAccount(currentPatient, 2);
    }    
};

var submitNewAilment = function() {
    var ailment = $('#patient-info-condition-box').val().trim();

    if (ailment === "") {
        alert('Please insert a valid condition.');
    }
    else {
        ailment = '(' + currentUser + '): ' + ailment;
        var ailmentsTable = document.getElementById('patient-info-ailments-table');
        
        if (currentPatient.ailments.length === 0) {
            ailmentsTable.innerHTML = '<tbody></tbody>';
        }

        var tableRow = ailmentsTable.insertRow();
        var defaultCell = tableRow.insertCell(0);

        defaultCell.innerHTML = ailment;

        currentPatient.ailments.push(ailment);
        pushChangesToAccount(currentPatient, 3);
    }
};

var pushChangesToAccount = function(account, mode) {
    socket.emit('updatePatient', account, mode);
};

var socket = io();

socket.on('ipStringReceived', function(ipAddress) {
    currentUser = ipAddress;
});

socket.on('searchResults', function(results) {
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

            phoneCell.innerHTML = '<span class="patient-link" onclick="patientResultClicked(this.innerHTML);">' + results[i].phone + '</span>';
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
        socket.emit('requestIPString');
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

socket.on('patientInfoSent', function(patient) {
    loadPatient(patient);
});

$('#nav-search-input').on('submit', function(e) {
    e.preventDefault();

    var searchTextBox = $('[name=search-input-box]');

    if (searchTextBox.val().trim() === "" || /[a-z]/i.test(searchTextBox.val().trim())) {
        alert('Please enter a valid phone number (or part of a phone number) into the field to the left.');
    }
    else {
        homeContainer.hide();
        searchContainer.show();
        profileContainer.hide();

        socket.emit('performSearch', {
            text: searchTextBox.val().trim()
        });
    }
});

applyNumericInputFilter('search-input-box');
applyNumericInputFilter('patient-phone-box');

function patientResultClicked(accountNumber) {
    socket.emit('getAccountInfo', accountNumber);
}

$('[data-toggle="tooltip"]').tooltip();