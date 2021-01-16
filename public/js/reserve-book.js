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
		"dom": "ipt"
    });

    $("#titleSearch").on("keyup paste change", function() {
        let str = $(this).val();
        $(this).val(str.substring(0, 50));
        $('#booksTable').DataTable()
            .column(0)
			.search($(this).val())
			.draw();
    });
    $("#authorSearch").on("keyup paste change", function() {
        let str = $(this).val();
        $(this).val(str.substring(0, 50));
        $('#booksTable').DataTable()
            .column(1)
			.search($(this).val())
			.draw();
    });
    $("#clearSearches").on("click", function() {
        $("#titleSearch").val("");
        $("#authorSearch").val("");
        $("#titleSearch").trigger("change");
        $("#authorSearch").trigger("change");
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