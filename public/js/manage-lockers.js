$(document).ready(function () {
    let url = new URL(document.location);
    let params = url.searchParams;
    let bldg = params.get("bldg");
    let flr = params.get("flr");

    $("#bldg").val(bldg);
    $("#floor").val(flr);

    $('form').on('submit', function () {
        $('.modal').find('button[type="submit"]').prop('disabled', true);
    })
    limitDatePicker();
});

function isFilled() {
    let lRange = validator.trim($('#lowerRange').val());
    let uRange = validator.trim($('#upperRange').val());
    let bldg = validator.trim($('#panelBldg').val());
    let flr = validator.trim($('#panelFloor').val());

    let lRangeEmpty = validator.isEmpty(lRange);
    let uRangeEmpty = validator.isEmpty(uRange);
    let bldgEmpty = validator.isEmpty(bldg);
    let flrEmpty = validator.isEmpty(flr);

    return !lRangeEmpty && !uRangeEmpty && !bldgEmpty && !flrEmpty;
}

async function isValidRange() {
    let lRange = validator.trim($('#lowerRange').val());
    let uRange = validator.trim($('#upperRange').val());
    let bldg = validator.trim($('#panelBldg').val());
    let flr = validator.trim($('#panelFloor').val());
    let type = validator.trim($('#panelType').val());

    if (validator.isInt(lRange, {min: 1, max: 1000}) && validator.isInt(uRange, {min: 1, max: 1000})) {
        let lower = validator.toInt(lRange);
        let upper = validator.toInt(uRange);

        // Validate overlaps
        let validRange = await $.get(location.pathname + '/get-is-valid-locker-range',
            {bldg: bldg, flr: flr, type: type, lRange: lRange, uRange: uRange});
        if (validRange === "invalid") return false;

        return upper >= lower;
    } else return false;
}

function isValidBldg() {
    let bldg = validator.whitelist($('#panelBldg').val(), 'A-Za-z');
    console.log("Bldg: "+bldg)
    return validator.isLength(bldg, {min: 1, max: 100});
}

function isValidLevel() {
    let flr = validator.trim($('#panelFloor').val());
    console.log('Floor ' + flr + " valid: " + validator.isInt(flr, {min: 1, max: 50}))
    return validator.isInt(flr, {min: 1, max: 50});
}

function isValidPanelType() {
    let type = validator.trim($('#panelType').val());
    return type === 'big' || type === 'small';
}

$('#markUnclearedButton').click(function () {
    let confirm = $('#confirmation').val();
    if (confirm === 'locker') {
        $('#markUnclearedForm').submit();
    } else {
        $('#confirmation').css('border-color', 'red');
    }
});

$('#delPanelButton').click(function () {
    $.get('/manage-lockers/status',
        {panelid: $("#deletePanelId").val()},
        function (data, status) {
            if (data) {
                $('#deletePanelForm').submit();
            } else {
                $('#panelAlert').show();
                $('#deleteHeader').hide();
                $('#delPanelButton').hide();
                $('#delPanelModal').find('.modal-title').text('Deletion Failed');
            }
        });
});

$('#setStatusModal').on('show.bs.modal', function (event) {
    let button = $(event.relatedTarget); // Button that triggered the modal
    let lockernumber = button.data('lockernumber'); // Extract info from data-* attributes
    let panelid = button.data('panelid');
    let lockerid = button.data('lockerid');
    let statusIcon = button.find('.locker-status-icon');
    let classList = button.attr('class').split(' ');
    $(statusIcon).addClass(classList[1]);
    let modal = $(this);

    let lockerStatus = '';
    if (classList[1] === 'locker-status-manage-vacant')
        lockerStatus = 'Vacant'
    else if (classList[1] === 'locker-status-manage-occupied')
        lockerStatus = 'Occupied'
    else if (classList[1] === 'locker-status-manage-broken')
        lockerStatus = 'Broken'
    else if (classList[1] === 'locker-status-manage-uncleared')
        lockerStatus = 'Uncleared'


    modal.find('.modal-title').text('');
    modal.find('.modal-title').append('<div class="icon mr-2 ' + classList[1] + '"></div>');
    modal.find('.modal-title').append(' Locker #' + lockernumber + ': ');
    modal.find('.modal-title').append(lockerStatus);
    modal.find('#statusSelector').val(classList[1].slice(21)).change();

    $("#setStatusPanelId").val(panelid);
    $("#setStatusLockerNumber").val(lockernumber);
    $("#setStatusBuilding").val($("#bldg").val());
    $("#setStatusFloor").val($("#floor").val());
    $('#lessee').text("");

    if (classList[1].slice(21) == 'occupied' || classList[1].slice(21) == 'uncleared') {
        $('#setStatusForm').hide();
        $('#setStatusButton').hide();
        $('#lessee-container').show();
        $('#lessee-container *').show();
        $('#lessee').text('Loading...');

        $.get('/manage-lockers/lessee',
            {lockerid: lockerid},
            function (data) {
                var user = data.idNum + " - " + data.firstName + " " + data.lastName;
                $('#lessee').text("Occupied by:  " + user);
            }
        );
    } else {
        $('#setStatusForm').show();
        $('#setStatusButton').show();
        $('#lessee-container').hide();
        $('#lessee-container *').hide();
    }
});

$('#delPanelModal').on('show.bs.modal', function (event) {
    let button = $(event.relatedTarget); // Button that triggered the modal
    let panelid = button.data('panelid');
    let modal = $(this);

    $("#deletePanelId").val(panelid);
    $("#deletePanelBuilding").val($("#bldg").val());
    $("#deletePanelFloor").val($("#floor").val());

    modal.find('.modal-title').text('Delete Panel');

    $('#panelAlert').hide();
    $('#deleteHeader').show();
    $('#delPanelButton').show();
});

$('#addPanelModal').on('show.bs.modal', function (event) {
    $("#addPanelForm").trigger("reset");
    $('#lowerRange').css('border-color', '');
    $('#upperRange').css('border-color', '');
    $('.alert').hide();
});

$('#setRentalDatesModal').on('show.bs.modal', function (event) {
    $('.alert').hide();
    let startDateData = $(event.relatedTarget).data('startdate');
    let endDateData = $(event.relatedTarget).data('enddate');
    let returnDateData = $(event.relatedTarget).data('returndate');

    let startDate = typeof startDateData === 'undefined' ? new Date() : new Date(startDateData);
    let startDateString = startDate.getFullYear() + '-'
        + ((startDate.getMonth() <= 8) ? '0' : '') + (startDate.getMonth() + 1) + '-'
        + ((startDate.getDate() <= 9) ? '0' : '') + startDate.getDate();

    let endDate = typeof endDateData === 'undefined' ? new Date() : new Date(endDateData);
    let endDateString = endDate.getFullYear() + '-'
        + ((endDate.getMonth() <= 8) ? '0' : '') + (endDate.getMonth() + 1) + '-'
        + ((endDate.getDate() <= 9) ? '0' : '') + endDate.getDate();

    let returnDate = typeof returnDateData === 'undefined' ? new Date() : new Date(returnDateData);
    let returnDateString = returnDate.getFullYear() + '-'
        + ((returnDate.getMonth() <= 8) ? '0' : '') + (returnDate.getMonth() + 1) + '-'
        + ((returnDate.getDate() <= 9) ? '0' : '') + returnDate.getDate();

    $("#startDate").val(startDateString);
    $("#endDate").val(endDateString);
    $("#returnDate").val(returnDateString);

    let startTimeString = startDate.toTimeString();
    startTimeString = startTimeString.split(' ')[0].slice(0, 5);
    let endTimeString = endDate.toTimeString();
    endTimeString = endTimeString.split(' ')[0].slice(0, 5);
    $("#startTime").val(startTimeString);
    $("#endTime").val(endTimeString);
});

$('#addPanelSubmit').click(async function () {
    $('.alert').hide();
    if (isFilled()) {
        if (!isValidBldg())
            $('#bldgAlert').show();
        else if (!isValidLevel())
            $('#floorAlert').show();
        else if (!isValidPanelType())
            $('#panelTypeAlert').show();
        else {
            let validRange = await isValidRange();
            if (!validRange) {
                console.log("range invalid")
                $('#rangeAlert').show();
                $('#lowerRange').css('border-color', 'red');
                $('#upperRange').css('border-color', 'red');
            } else {
                $('#addPanelSubmit').off();
                $('#addPanelForm').submit();
            }
        }
    } else {
        $('#formAlert').show();
        $('#lowerRange').css('border-color', '');
        $('#upperRange').css('border-color', '');
    }
});

$('#markUnclearedModal').on('show.bs.modal', function (event) {
    $("#confirmation").val("");
    $('#confirmation').css('border-color', '');
});

$('select#bldg,select#floor').change(function() {
    $('.form').css({'opacity': '50%', 'pointer-events': 'none'});
});

// Removes a query parameter
function removeParam(key, sourceURL) {
    let rtn = sourceURL.split("?")[0],
        param,
        params_arr = [],
        queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
        params_arr = queryString.split("&");
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        rtn = rtn + "?" + params_arr.join("&");
    }
    return rtn;
}

// Adds or updates a query parameter
function updateQueryStringParameter(key, value) {
    let uri = window.location.href;
    let re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    let separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (key === 'bldg') {
        uri = removeParam('flr', uri);
    }
    if (uri.match(re)) {
        window.location.href = uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
        window.location.href = uri + separator + key + "=" + value;
    }
}

$('#setRentalDatesButton').click(function() {
    $('.alert').hide();
    if (!isFilledRentalDates) {
        $("#emptyRentalDateAlert").show();
    }
    else if (!isValidStartDate())  {
        $("#startDateAlert").show();
    }
    else if (!isValidEndDate()) {
        $("#endDateAlert").show();
    }
    else if (!isValidReturnDate()) {
        $("#returnDateAlert").show();
    }
    else {
        $('#setRentalDatesButton').off("click");
        $('#setRentalDatesForm').submit();
    }
});

function isFilledRentalDates() {
    let startDate = validator.trim($("#startDate").val());
    let endDate =  validator.trim($("#endDate").val());
    let returnDate =  validator.trim($("#returnDate").val());
    let startTime =  validator.trim($("#startTime").val());
    let endTime =  validator.trim($("#endTime").val());

    return !validator.isEmpty(startDate) && !validator.isEmpty(endDate) &&
        !validator.isEmpty(returnDate) && !validator.isEmpty(startTime) && !validator.isEmpty(endTime);
}

function isValidStartDate () {
    let startDate = $("#startDate").val();
    let startDateObject = new Date(startDate);
    let currentDate = new Date();

    let startTimeString = $("#startTime").val();
    let startTimeHour = startTimeString.split(':')[0];
    let startTimeMinute = startTimeString.split(':')[1];
    startDateObject.setHours(startTimeHour, startTimeMinute, 0);


    return startDateObject >= currentDate;
}

function isValidEndDate () {
    let startDate = $("#startDate").val();
    let endDate = $("#endDate").val();
    let startDateObject = new Date(startDate);
    let endDateObject = new Date(endDate);

    let startTimeString = $("#startTime").val();

    let startTimeHour = startTimeString.split(':')[0];
    let startTimeMinute = startTimeString.split(':')[1];
    startDateObject.setHours(startTimeHour, startTimeMinute, 0);
    startDateObject.setMinutes(startDateObject.getMinutes() + 1);

    let endTimeString = $("#endTime").val();
    let endTimeHour = endTimeString.split(':')[0];
    let endTimeMinute = endTimeString.split(':')[1];
    endDateObject.setHours(endTimeHour, endTimeMinute, 0);

    return endDateObject >= startDateObject;
}

function isValidReturnDate() {
    let endDate = $("#endDate").val();
    let returnDate = $("#returnDate").val();
    let endDateObject = new Date(endDate);
    let returnDateObject = new Date(returnDate);

    return returnDateObject > endDateObject;
}

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
    $('#startDate').attr('min', minDate);
    $('#endDate').attr('min', minDate);
    $('#returnDate').attr('min', minDate);
}