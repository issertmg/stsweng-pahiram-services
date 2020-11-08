$(document).ready(function () {
    $('#phone').keyup(function () {
        var value = validator.trim($('#phone').val());
        var validLength = validator.isLength(value, {min: 10, max: 10});
        var validNumeral = validator.isNumeric(value, {no_symbols: true});

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