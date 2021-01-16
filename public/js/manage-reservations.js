/**
 * Initializes the whole page.
 * @returns <void> - nothing
 */
$(document).ready(function () {
	$("#otherReservationsTable").DataTable({
		processing: true,
		serverSide: true,
		ajax: {
			url: '/reservations/manage/get-reservations',
			dataSrc: 'data'
		},
		'createdRow': function (row, data, dataIndex) {
			$(row).attr('data-toggle', 'modal');
			$(row).attr('data-target', '#editReservationModal');
			$(row).css('cursor', 'pointer');
		},
		columns: [
			{ "data": "userID" },
			{
				"data": "dateCreated",
				"render": function (data, type, row) {
					return (new Date(data)).toDateString();
				}
			},
			{ "data": "onItemType" },
			{ 
				"data": function (data) {
					if (data.onItemType === "Equipment") {
						return data.title + ": " + data.item.brand + " (" + data.item.model + ")";
					} else {
						return data.title;
					}
				}
			},
			{ 
				"data": "description",
				"render": function (data, type, row) {
					return data.length > 50 ? data.substr(0, 50) + '...' : data;
				} 
			},
			{ "data": "status" },
			{ "data": "remarks", "visible": false },
			{ "data": "_id", "visible": false },
			{ "data": "penalty", "visible": false },
			{ "data": "lastUpdated", "visible": false },
		],
		"order": [[9, "desc"]],
		"responsive": true,
		"dom": "ipt"

	});

	$("#typeFilter").on("change", function () {
		$('#otherReservationsTable').DataTable()
			.column(2)
			.search($(this).val())
			.draw();
	});

	$("#searchBox").on("keyup paste", function () {
		let str = $(this).val();
		$(this).val(str.substring(0, 15));
		$('#otherReservationsTable').DataTable()
			.search($(this).val())
			.draw();
	});

	limitDatePicker();
});

/**
 * Limits the date picker selection used in setting Locker reservations to "To Pay"
 * @returns <void> - nothing
 */
function limitDatePicker() {
	let dtToday = new Date();

	let month = dtToday.getMonth() + 1;
	let day = dtToday.getDate();
	let year = dtToday.getFullYear();
	if(month < 10)
		month = '0' + month.toString();
	if(day < 10)
		day = '0' + day.toString();

	let minDate = year + '-' + month + '-' + day;
	$('#approvePaymentDate').attr('min', minDate);
	$('#paymentDate').attr('min', minDate);
}

/**
 * Initializes the DeleteReservation modal.
 * @returns <void> - nothing
 */
$('#delReservationModal').on('show.bs.modal', (event) => {
	$('#delReservationID').val($('#reservationID').val());
	$('#prevPath').val('manageReservations');
});

/**
 * Initializes the EditReservation modal.
 * @returns <void> - nothing
 */
$('#editReservationModal').on('show.bs.modal', (event) => {
	let reservation;
	if (event.relatedTarget.tagName === 'DIV') {
		let btn = $(event.relatedTarget);
		reservation = {
			_id: btn.data('id'),
			title: btn.data('title'),
			userID: btn.data('userid'),
			dateCreated: btn.data('datecreated'),
			status: btn.data('status'),
			description: btn.data('title') + ", " + btn.data('description'),
			remarks: btn.data('remarks'),
			penalty: btn.data('penalty'),
			type: btn.data('type'),
			pickupPayDate: btn.data('paymentdate')
		}
	} else
		reservation = $('#otherReservationsTable').DataTable().row(event.relatedTarget).data();

	$('#unclearedError').text('Loading...').removeClass('error-label');
	$('#userInfo').text('Loading...');

	// Check if user has uncleared reservations
	$.get('/reservations/manage/get-uncleared',
		{ idnum: reservation.userID },
		function (data) {
			if (jQuery.isEmptyObject(data))
				$('#unclearedError').text('User has no uncleared reservations').removeClass('error-label');
			else
				$('#unclearedError').text('User has uncleared reservations').addClass('error-label');
		}
	);

	// Get user info
	$.get('/reservations/manage/get-user',
		{ idnum: reservation.userID },
		function (data) {
			if (data)
				$('#userInfo').text(data);
		}
	);

	// Get reservation data
	$('#itemDetailsLabel').text(reservation.type + ' Details')
	$.get('/reservations/manage/get-one-reservation',
		{ id: reservation._id },
		function (data) {
			$('#itemDetails').html('');
			for (const key in data.item) {
				if (key !== '__v' && key !== '_id' && key !== 'imageURL')
					$('#itemDetails').append(`
						<div class="d-flex row">
							<div class="col-2">` + key.charAt(0).toUpperCase() + key.slice(1) + `: </div>
							<div class="col-10">` + data.item[key] + `</div>
						</div>
					`);
			}
		}
	);

	var payDate = (reservation.pickupPayDate === '' || reservation.pickupPayDate === null) ? new Date() : new Date(reservation.pickupPayDate);
	var payDateString = payDate.getFullYear() + '-'
		+ ((payDate.getMonth() <= 8) ? '0' : '') + (payDate.getMonth() + 1) + '-'
		+ ((payDate.getDate() <= 9) ? '0' : '') + payDate.getDate();

	$('#statusModalLabel').text(reservation.title);
	$('#idNum').text(reservation.userID);
	$('#dateCreated').text(reservation.dateCreated);
	$('#description').text(reservation.description);
	$('#editRemarks').val(reservation.remarks);
	$('#penalty').val(reservation.penalty);
	$('#reservationID').val(reservation._id);
	$('#onItemType').val(reservation.type);
	$('#paymentDate').val(payDateString);
	$('#currentStatus').val(reservation.status);

	if ($('#onItemType').val() === '')
		$('#onItemType').val(reservation.onItemType)

	// Hide all select options
	$('[value="status-manage-pending"]').prop('disabled', true).hide();
	$('[value="status-manage-pickup-pay"]').prop('disabled', true).hide();
	$('[value="status-manage-on-rent"]').prop('disabled', true).hide();
	$('[value="status-manage-uncleared"]').prop('disabled', true).hide();
	$('[value="status-manage-denied"]').prop('disabled', true).hide();
	$('[value="status-manage-returned"]').prop('disabled', true).hide();

	// Shows valid select options
	switch (reservation.status) {
		case 'Pending':
			$('[value="status-manage-pending"]').prop('disabled', false).show();
			$('[value="status-manage-pickup-pay"]').prop('disabled', false).show();
			$('[value="status-manage-denied"]').prop('disabled', false).show();
			$('#deleteReservationBtn').hide();
			break;
		case 'To Pay':
		case 'For Pickup':
			$('[value="status-manage-pickup-pay"]').prop('disabled', false).show();
			$('[value="status-manage-on-rent"]').prop('disabled', false).show();
			$('[value="status-manage-denied"]').prop('disabled', false).show();
			$('#deleteReservationBtn').hide();
			break;
		case 'On Rent':
			$('[value="status-manage-on-rent"]').prop('disabled', false).show();
			$('[value="status-manage-uncleared"]').prop('disabled', false).show();
			$('[value="status-manage-returned"]').prop('disabled', false).show();
			$('#deleteReservationBtn').hide();
			break;
		case 'Uncleared':
			$('[value="status-manage-uncleared"]').prop('disabled', false).show();
			$('[value="status-manage-returned"]').prop('disabled', false).show();
			$('#deleteReservationBtn').hide();
			break;
		case 'Returned':
			$('[value="status-manage-returned"]').prop('disabled', false).show();
			$('#deleteReservationBtn').show();
			break;
		case 'Denied':
			$('[value="status-manage-denied"]').prop('disabled', false).show();
			$('#deleteReservationBtn').show();
			break;
	}
	$('.select-selected').show();

	if (reservation.onItemType === 'Locker' || reservation.type === 'Locker')
		$('[value="status-manage-pickup-pay"]').text('To Pay')
	else
		$('[value="status-manage-pickup-pay"]').text('For Pickup')

	$('#remarksForm').css('display', 'none');
	$('#penaltyForm').css('display', 'none');

	switch (reservation.status) {
		case 'Pending':
			$('#status').val('status-manage-pending');
			break;
		case 'To Pay':
		case 'For Pickup':
			$('#status').val('status-manage-pickup-pay');
			break;
		case 'On Rent':
			$('#status').val('status-manage-on-rent');
			break;
		case 'Returned':
			$('#status').val('status-manage-returned');
			break;
		case 'Uncleared':
			$('#status').val('status-manage-uncleared');
			break;
		case 'Denied':
			$('#status').val('status-manage-denied');
			break;
	}

	$('#status').change(function () {
		var status = $(this).val();

		if (status != 'status-manage-pending')
			$('#remarksForm').css('display', 'flex');
		else
			$('#remarksForm').css('display', 'none');

		if (status == 'status-manage-uncleared')
			$('#penaltyForm').css('display', 'flex');
		else
			$('#penaltyForm').css('display', 'none');

		if (status == 'status-manage-pickup-pay' && (reservation.type === 'Locker' ||
			reservation.onItemType === 'Locker'))
			$('#paymentForm').css('display', 'flex');
		else
			$('#paymentForm').css('display', 'none');


	});

	$('#status').change();
	$('#penaltyAlert').hide();
	$('#inspectAlert').hide();
});

$("#editRemarks").on("keyup change", function () {
	let inputElement = $(this);
	if (inputElement.val().length > 250) {
		inputElement.val(inputElement.val().slice(0, 250));
	}
});

$("#approveRemarks").on("keyup change", function () {
	let inputElement = $(this);
	if (inputElement.val().length > 250) {
		inputElement.val(inputElement.val().slice(0, 250));
	}
});

$('#statusSubmit').click(function () {
	hideAllAlert();
	const ePenalty = validator.trim($('#penalty').val());
	const ePenaltyEmpty = validator.isEmpty(ePenalty);

	if (!ePenaltyEmpty && (ePenalty >= 0)) {
		const currStatus = $('#currentStatus').val();
		const nextStatus = $('#status').val();

		if (isValidSetStatus(currStatus, nextStatus.slice(14))) {
			$('#statusSubmit').off("click");
			$('#editForm').submit();
		}
		else {
			$('#inspectAlert').show()
		}
	}
	else {
		$('#penaltyAlert').show()
	}
});

/**
 * Checks if the status to be is valid with respect to the current status.
 * @returns {boolean} - true if valid; false otherwise
 */
function isValidSetStatus(currentStatus, nextStatus) {

	if (currentStatus === 'Pending') {
		if (nextStatus === 'pending' || nextStatus === 'pickup-pay' || nextStatus === 'denied') {
			return true;
		}
	}
	else if (currentStatus === 'To Pay' || currentStatus === 'For Pickup') {
		if (nextStatus === 'pickup-pay' || nextStatus === 'on-rent' || nextStatus === 'denied') {
			return true;
		}
	}
	else if (currentStatus === 'On Rent') {
		if (nextStatus === 'on-rent' || nextStatus === 'uncleared' || nextStatus === 'returned') {
			return true;
		}
	}
	else if (currentStatus === 'Uncleared') {
		if (nextStatus === 'uncleared' || nextStatus === 'returned') {
			return true;
		}
	}
	else if (currentStatus === 'Returned') {
		if (nextStatus === 'returned') {
			return true;
		}
	}
	else if (currentStatus === 'Denied') {
		if (nextStatus === 'denied') {
			return true;
		}
	}
	return false;
}

/**
 * Hides all alert elements.
 * @returns <void> - nothing
 */
function hideAllAlert() {
	$('#penaltyAlert').hide();
	$('#inspectAlert').hide();
}

exports.isValidSetStatus = isValidSetStatus;