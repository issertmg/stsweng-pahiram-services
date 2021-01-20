let hasActiveReservation = false;

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
            {
                "data": "title",
                "render": function (data, type, row) {
                    return limitCharLength(data, 20);
                }
            },
            {
                "data": "authors",
                "render": function (data, type, row) {
                    return limitCharLength(data, 20);
                }
            },
            {
                "data": function (data) {
                    return (data.edition === null) ? "N/A" : data.edition
                },
                "render": function (data, type, row) {
                    return limitCharLength(data, 20);
                },
                "orderable": false
            },
            {
                "data": function (data) {
                    const stock = (data.quantity - data.onRent) + ' / ' + data.quantity;
                    if (data.onRent >= data.quantity)
                        return `<span class="error-label">${stock}</span>`;
                    else
                        return stock;
                },
                "orderable": false
            },
        ],
        "responsive": true,
        "dom": "ipt",
        "language": {
            "emptyTable": "No books to display"
        }
    });

    $("#titleSearch").on("keyup paste", function (e) {
        let str = $(this).val();
        $(this).val(str.substring(0, 50));
        if (e.code === "Enter")
            $('#searchBtn').trigger("click");
    });
    $("#authorSearch").on("keyup paste", function (e) {
        let str = $(this).val();
        $(this).val(str.substring(0, 50));
        if (e.code === "Enter")
            $('#searchBtn').trigger("click");
    });
    $("#searchBtn").on("click", function () {
        $('#booksTable').DataTable()
            .column(0)
            .search($('#titleSearch').val())
            .column(1)
            .search($('#authorSearch').val())
            .draw();
    });
});

$('#activeReservationAlert').css('display', 'none');
$.get('/reserve/book/active-reservation',
    function (data) {
        hasActiveReservation = data;
        if (hasActiveReservation)
            $('#activeReservationAlert').css('display', 'block');

    }
);

$('#borrowBookModal').on('show.bs.modal', (event) => {
    // Default values
    $('#bookID').val(null);
    $('#titleLabel').text("Updating...");
    $('#authorLabel').text("Updating...");
    $('#edition').text("Updating...");
    $('#stockLabel').text("Updating...");
    $('#outOfStockAlert').css("display", "none");
    // default: disabled submit button
    $('#borrowBookSubmit').prop("disabled", true);
    $('#borrowBookSubmit').removeClass("btn-primary");
    $('#borrowBookSubmit').addClass("btn-disabled");
    let isRentalSeason = !($('#rentalDatesAlert').length);

    book = $('#booksTable').DataTable().row(event.relatedTarget).data();
    $.get('/reserve/book/get-one',
        { _id: book._id },
        function (data) {
            $('#bookID').val(data._id);
            $('#titleLabel').text(data.title);
            $('#authorLabel').text(data.authors);
            $('#editionLabel').text((data.edition == null) ? "N/A" : data.edition);
            $('#stockLabel').text((data.quantity - data.onRent) + "/" + (data.quantity));

            if (data.onRent >= data.quantity) {         // out of stock
                $('#outOfStockAlert').css("display", "block");
            } else if (!hasActiveReservation && isRentalSeason) {
                // enable place reservation button
                $('#borrowBookSubmit').prop("disabled", false);
                $('#borrowBookSubmit').addClass("btn-primary");
                $('#borrowBookSubmit').removeClass("btn-disabled");
            }
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

function limitCharLength(data, maxLength) {
    return data.length > maxLength ? data.substr(0, maxLength) + '...' : data;
}