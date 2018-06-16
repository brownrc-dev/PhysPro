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

var activateTCForm = function() {
    $("#tc-modal").modal({ backdrop: "static" });
};

var activateNewPatientForm = function() {
    $("#add-patient-modal").modal({ backdrop: "static" });
};

var activateAlertForm = function() {
    $("#add-patient-info-alert-modal").modal({ backdrop: "static" });
};

var activateMedicationForm = function() {
    $("#add-patient-info-medication-modal").modal({ backdrop: "static" });
};

var activateInteractionForm = function() {
    $("#add-patient-info-interaction-modal").modal({ backdrop: "static" });
};

var activateAilmentForm = function() {
    $("#add-patient-info-condition-modal").modal({ backdrop: "static" });
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

var submitNewAlert = function() {

};

var submitNewMedication = function() {

};

var submitNewInteraction = function() {

};

var submitNewAilment = function() {

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
    homeContainer.hide();
    searchContainer.hide();
    profileContainer.show();

    $('#patient-info-table').html('<tbody></tbody>');
    var table = document.getElementById('patient-info-table');

    var nameTableRow = table.insertRow();
    var labelNameCell = nameTableRow.insertCell(0);
    var nameCell = nameTableRow.insertCell(1);

    var addressTableRow = table.insertRow();
    var labelAddressCell = addressTableRow.insertCell(0);
    var addressCell = addressTableRow.insertCell(1);

    var phoneTableRow = table.insertRow();
    var labelPhoneCell = phoneTableRow.insertCell(0);
    var phoneCell = phoneTableRow.insertCell(1);

    labelNameCell.innerHTML = "Name";
    labelAddressCell.innerHTML = "Address";
    labelPhoneCell.innerHTML = "Phone";

    nameCell.innerHTML = patient.name;
    addressCell.innerHTML = patient.address;
    phoneCell.innerHTML = patient.phone;

    $('#patient-info-header').html('' + patient.name + ' (' + patient.phone + ')');

    $('#patient-info-alerts-table').html('<tbody></tbody>');
    $('#patient-info-medications-table').html('<tbody></tbody>');
    $('#patient-info-recent-interactions-table').html('<tbody></tbody>');
    $('#patient-info-ailments-table').html('<tbody></tbody>');

    var alertsTable = document.getElementById('patient-info-alerts-table');
    var medicationsTable = document.getElementById('patient-info-medications-table');
    var interactionsTable = document.getElementById('patient-info-recent-interactions-table');
    var ailmentsTable = document.getElementById('patient-info-ailments-table');

    for (var i = 0; i < patient.alerts.length; i++) {
        var tableRow = alertsTable.insertRow();
        var alertCell = tableRow.insertCell(0);

        alertCell.innerHTML = patient.alerts[i];
    }

    for (var i = 0; i < patient.medications.length; i++) {
        var tableRow = medicationsTable.insertRow();
        var medicationCell = tableRow.insertCell(0);

        medicationCell.innerHTML = patient.medications[i];
    }

    for (var i = 0; i < patient.interactions.length; i++) {
        var tableRow = interactionsTable.insertRow();
        var interactionCell = tableRow.insertCell(0);

        interactionCell.innerHTML = patient.interactions[i];
    }

    for (var i = 0; i < patient.ailments.length; i++) {
        var tableRow = ailmentsTable.insertRow();
        var ailmentsCell = tableRow.insertCell(0);

        interactionCell.innerHTML = patient.ailments[i];
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
        profileContainer.hide();

        socket.emit('performSearch', {
            text: searchTextBox.val()
        });
    }
});

function patientResultClicked(accountNumber) {
    socket.emit('getAccountInfo', accountNumber);
}

$('[data-toggle="tooltip"]').tooltip();