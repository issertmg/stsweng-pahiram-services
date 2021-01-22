$(document).ready(function () {
    $('#phone').keyup(function () {
        let value = validator.trim($('#phone').val());
        let validLength = validator.isLength(value, {min: 10, max: 10});
        let validNumeral = validator.isNumeric(value, {no_symbols: true});

        if (!validLength || !validNumeral)
            $('#phoneError').text('Invalid phone number');
        else {
            $.get('/get-phone', {phone: value, idNum: $('#idNum').val()}, function (data) {
                if (!data) {
                    $('#phoneError').text(' ');
                    $('#submitBtn').prop('disabled', false);
                } else {
                    $('#phoneError').text('Number already taken');
                    $('#submitBtn').prop('disabled', true);
                }
            });
        }
    });
});

$('#editProfileModal').on('show.bs.modal', function (event) {
    let button = $(event.relatedTarget);
    let phone = button.data('phone');
    $('#phone').val(phone);
    $('#phoneError').text(' ');
    $('#submitBtn').prop('disabled', false);
});