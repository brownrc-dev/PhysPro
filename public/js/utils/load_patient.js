var loadPatient = function(patient) {
    currentPatient = patient;

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

    if (patient.alerts.length === 0) {
        var tableRow = alertsTable.insertRow();
        var defaultCell = tableRow.insertCell(0);

        defaultCell.innerHTML = 'None to display';
    }

    if (patient.medications.length === 0) {
        var tableRow = medicationsTable.insertRow();
        var defaultCell = tableRow.insertCell(0);

        defaultCell.innerHTML = 'None to display';
    }

    if (patient.interactions.length === 0) {
        var tableRow = interactionsTable.insertRow();
        var defaultCell = tableRow.insertCell(0);

        defaultCell.innerHTML = 'None to display';
    }

    if (patient.ailments.length === 0) {
        var tableRow = ailmentsTable.insertRow();
        var defaultCell = tableRow.insertCell(0);

        defaultCell.innerHTML = 'None to display';
    }

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

        ailmentsCell.innerHTML = patient.ailments[i];
    }
};