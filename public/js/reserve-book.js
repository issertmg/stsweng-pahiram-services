$(document).ready(function () {
    $("#booksTable").DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '/reserve/book/get',
            dataSrc: 'data'
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
});