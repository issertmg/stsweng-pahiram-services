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
			{ "data": function (data) {
					if (data.onItemType === "Equipment") {
						return data.item.brand + " " + data.item.name + " (" + data.item.model + ")";
					}
					else{
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
});

/**
 * Initializes the DeleteReservation modal.
 * @returns <void> - nothing
 */
$('#delReservationModal').on('show.bs.modal', (event) => {
	$('#delReservationID').val($('#reservationID').val());
	$('#prevPath').val('manageReservations');
});

/**
 * Initializes the ApproveReservation modal.
 * @returns <void> - nothing
 */
$('#approveReservationModal').on('show.bs.modal', (event) => {

	var btn = $(event.relatedTarget).prev();
	var reservation = {
		id: btn.data('id'),
		title: btn.data('title'),
		userID: btn.data('userid'),
		dateCreated: btn.data('datecreated'),
		status: btn.data('status'),
		description: btn.data('description'),
		remarks: btn.data('remarks'),
		penalty: btn.data('penalty'),
		type: btn.data('type'),
		paymentDate: btn.data('paymentdate')
	}

	var payDate = new Date();
	var payDateString =
		payDate.getFullYear() + '-'
		+ ((payDate.getMonth() <= 8) ? '0' : '') + (payDate.getMonth() + 1) + '-'
		+ ((payDate.getDate() <= 9) ? '0' : '') + payDate.getDate();

	$('#approveReservationTitle').text(reservation.title);
	$('#approveReservationID').val(reservation.id);
	$('#approveReservationType').val(reservation.type);
	$('#approveDateCreated').text(reservation.dateCreated);
	$('#approveDescription').text(reservation.description);
	$('#approveRemarks').val(reservation.remarks);
	$('#approveStatus').val('status-manage-pickup-pay');
	$('#approvePaymentDate').val(payDateString);
	$('#approveIDNum').text(reservation.userID);
	$('#approvePenalty').val(0);

	$('#apUnclearedError').text('Loading...').removeClass('error-label');
	$('#approveUserInfo').text('Loading...');


	$.get('/reservations/manage/get-uncleared',
		{ idnum: reservation.userID },
		function (data) {
			if (jQuery.isEmptyObject(data))
				$('#apUnclearedError').text('User has no uncleared reservations').removeClass('error-label');
			else
				$('#apUnclearedError').text('User has uncleared reservations').addClass('error-label');
		}
	);

	$.get('/reservations/manage/get-user',
		{ idnum: reservation.userID },
		function (data) {
			if (data)
				$('#approveUserInfo').text(data);
		}
	);

	$('#approvePenaltyForm').css('display', 'none');
	$('#approveSelectForm').css('display', 'none');

	if (reservation.type == 'Locker')
		$('#approvePaymentForm').css('display', 'flex');
	else
		$('#approvePaymentForm').css('display', 'none');
});

/**
 * Initializes the DenyReservation modal.
 * @returns <void> - nothing
 */
$('#denyReservationModal').on('show.bs.modal', (event) => {
	var btn = $(event.relatedTarget).prev().prev();
	var reservation = {
		id: btn.data('id'),
		title: btn.data('title'),
		userID: btn.data('userid'),
		dateCreated: btn.data('datecreated'),
		status: btn.data('status'),
		description: btn.data('description'),
		remarks: btn.data('remarks'),
		penalty: btn.data('penalty'),
		type: btn.data('type')
	}

	$('#denyReservationTitle').text(reservation.title);
	$('#denyReservationID').val(reservation.id);
	$('#denyReservationType').val(reservation.type);
	$('#denyDateCreated').text(reservation.dateCreated);
	$('#denyDescription').text(reservation.description);
	$('#denyRemarks').val(reservation.remarks);
	$('#denyStatus').val('status-manage-denied');
	$('#denyIDNum').text(reservation.userID);
	$('#denyPenalty').val(0);

	$('#denyPenaltyForm').css('display', 'none');
	$('#denySelectForm').css('display', 'none');
});

/**
 * Initializes the EditReservation modal.
 * @returns <void> - nothing
 */
$('#editReservationModal').on('show.bs.modal', (event) => {

	console.log(event.relatedTarget.tagName);

	let reservation;
	if (event.relatedTarget.tagName === 'DIV') {
		let btn = $(event.relatedTarget);
		reservation = {
			_id: btn.data('id'),
			title: btn.data('title'),
			userID: btn.data('userid'),
			dateCreated: btn.data('datecreated'),
			status: btn.data('status'),
			description: btn.data('description'),
			remarks: btn.data('remarks'),
			penalty: btn.data('penalty'),
			type: btn.data('type'),
			paymentDate: btn.data('paymentdate')
		}
	} else
		reservation = $('#otherReservationsTable').DataTable().row(event.relatedTarget).data();

	$('#unclearedError').text('Loading...').removeClass('error-label');
	$('#userInfo').text('Loading...');

	$.get('/reservations/manage/get-uncleared',
		{ idnum: reservation.userID },
		function (data) {
			if (jQuery.isEmptyObject(data))
				$('#unclearedError').text('User has no uncleared reservations').removeClass('error-label');
			else
				$('#unclearedError').text('User has uncleared reservations').addClass('error-label');
		}
	);

	$.get('/reservations/manage/get-user',
		{ idnum: reservation.userID },
		function (data) {
			if (data)
				$('#userInfo').text(data);
		}
	);

	var payDate = reservation.paymentDate == '' ? new Date() : new Date(reservation.paymentDate);
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
			break;
		case 'To Pay':
		case 'For Pickup':
			$('[value="status-manage-pickup-pay"]').prop('disabled', false).show();
			$('[value="status-manage-on-rent"]').prop('disabled', false).show();
			$('[value="status-manage-denied"]').prop('disabled', false).show();
			break;
		case 'On Rent':
			$('[value="status-manage-on-rent"]').prop('disabled', false).show();
			$('[value="status-manage-uncleared"]').prop('disabled', false).show();
			$('[value="status-manage-returned"]').prop('disabled', false).show();
			break;
		case 'Uncleared':
			$('[value="status-manage-uncleared"]').prop('disabled', false).show();
			$('[value="status-manage-returned"]').prop('disabled', false).show();
			break;
		case 'Returned':
			$('[value="status-manage-returned"]').prop('disabled', false).show();
			break;
		case 'Denied':
			$('[value="status-manage-denied"]').prop('disabled', false).show();
			break;
	}
	$('.select-selected').show();

	var pickupPayText;
	if (reservation.type == 'Locker')
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

		if (status == 'status-manage-pickup-pay' && reservation.type == 'Locker')
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