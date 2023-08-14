window.onload = function() {
    var table = $('#activitiesTable').DataTable({
        dom: 'Bfrtip',
        buttons: [
            'pdf'
        ],
        paging: true,
        pageLength: 5, // Set the number of results per page
        columnDefs: [
            { targets: "_all", sortable: true }
        ]
    });

    // Draw the DataTables table
    table.draw();
};