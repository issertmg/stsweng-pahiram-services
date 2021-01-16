$(document).ready(function () {
    $("#booksTable").DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '/reserve/book/get',
            dataSrc: 'data'
        },
        'createdRow': function (row, data, dataIndex) {
			$(row).attr('data-toggle', 'modal');
			$(row).attr('data-target', '#borrowBookModal');
			$(row).css('cursor', 'pointer');
		},
        columns: [
            { "data": "title" },
            { "data": "authors" },
            {
                "data": function (data) {
                    return (data.edition === null) ? "N/A" : data.edition
                }
            },
            {
                "data": function (data) {
                    return (data.quantity - data.onRent) + ' / ' + data.quantity;
                }
            },
        ],
        "responsive": true,
		"dom": "ipt"
    });

    $("#titleSearch").on("keyup paste", function(e) {
        let str = $(this).val();
        $(this).val(str.substring(0, 50));
        if (e.code === "Enter")
            $('#searchBtn').trigger("click");
    });
    $("#authorSearch").on("keyup paste", function(e) {
        let str = $(this).val();
        $(this).val(str.substring(0, 50));
        if (e.code === "Enter")
            $('#searchBtn').trigger("click");
    });
    $("#searchBtn").on("click", function() {
        $('#booksTable').DataTable()
            .column(0)
            .search($('#titleSearch').val())
            .column(1)
			.search($('#authorSearch').val())
			.draw();
    })
});

$('#borrowBookModal').on('show.bs.modal', (event) => {
    // Default values
    $('#bookID').val(null);
    $('#titleLabel').text("Updating...");
    $('#authorLabel').text("Updating...");
    $('#edition').text("Updating...");
    $('#stockLabel').text("Updating...");
    
    book = $('#booksTable').DataTable().row(event.relatedTarget).data();
    $.get('/reserve/book/get-one',
		{ _id: book._id },
		function (data) {
            $('#bookID').val(data._id);
            $('#titleLabel').text(data.title);
            $('#authorLabel').text(data.authors);
            $('#editionLabel').text((data.edition == null) ? "N/A" : data.edition);
            $('#stockLabel').text((data.quantity - data.onRent) + "/" + (data.quantity));
		}
	);
});

$(document).ajaxStart(function () {
    $('table').css('filter', 'opacity(0.3)');
    $('.page-link').css('pointer-events', 'none');
    $('.page-link').css('filter', 'opacity(0.3)');
  });
  
  $(document).ajaxComplete(function () {
    $('table').css('filter', 'opacity(1)');
    $('.page-link').css('pointer-events', 'auto');
    $('.page-link').css('filter', 'opacity(1)');
  });