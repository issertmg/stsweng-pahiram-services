$(document).ready(function () {
    var borrowDate = new Date();
    var options = { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric'};

    borrowDate = getNextWeekDayDate(borrowDate);
    $("#borrow-date").val(borrowDate.toLocaleDateString("en-US", options));

    /**
     * Validates the input for the equipment form before submitting.
     * @returns <void> - nothing
     */
    $("#submitEquipmentForm").click(function() {
        var equipment = $('button.active');
        var equipmentid = equipment.data('equipmentid');
        var reason = $('#reason').val();

        if ($("#checkTerms").prop('checked')) {
            if (equipment.length == 1 ) {
                $('#equipmentid').val(equipmentid);

                if (reason.trim().length != 0) {
                    $('#equipmentForm').submit();
                }
                else {
                    alert("Please write the reason for borrowing.");
                }
            }
            else if (equipment.length > 1) {
                alert("Please select 1 equipment only!");
            }
            else {
                alert("Please select an equipment you want to rent.");
            }
        }
        else {
            alert("Please check the box if you agree to the terms and conditions.");
        }

    });
});

/**
 * Returns the next weekday date from the given date.
 * @param date - the date object
 * @returns {Date} - the next weekday date
 */
function getNextWeekDayDate(date) {
    let newDate = new Date(date.getTime());
    const day = {"friday": 5, "saturday": 6}

    if (newDate.getDay() == day["friday"]) {
        newDate.setDate(newDate.getDate()+3);
    }
    else if (newDate.getDay() == day["saturday"]) {
        newDate.setDate(newDate.getDate()+2);
    }
    else {
        newDate.setDate(newDate.getDate()+1);
    }

    return newDate;
}

/**
 * Adds keyup and onchange event listener to reason input element to limit input to max 250 characters.
 * @returns <void> - nothing
 */
$("#reason").on("keyup change", function() {
    let inputElement = $(this);
    if (inputElement.val().length > 250) {
        inputElement.val(inputElement.val().slice(0, 250));
    }
});