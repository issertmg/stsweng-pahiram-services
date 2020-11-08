$(document).ready(function () {
    $('#idnum').keyup(function () {
        validateField($('#idnum'), 'ID Number', $('#idNumError'));
    });

    $('#degProg').keyup(function () {
        validateField($('#degProg'), 'Degree Program', $('#degProgError'));
    });

    $('#phone').keyup(function () {
        validateField($('#phone'), 'Phone', $('#phoneError'));
    });

    $('form').on('submit', function () {
        $(this).find('input[type="submit"]').prop('disabled',true);
    })
});

function validateField(activeField, fieldName, errorLabel) {
    var value = validator.trim(activeField.val());
    var empty = validator.isEmpty(value);
    if (empty)
        $(errorLabel).text(fieldName + ' cannot be empty.');
    else
        $(errorLabel).text(' ');
    
    isValidID(activeField, function (validID) {
        isValidPhone(activeField, function (validPhone) {
            if (allFilled() && validPhone && validID)
                $('#signUpBtn').prop('disabled', false);
            else
                $('#signUpBtn').prop('disabled', true);
        })
    });
}

function allFilled() {
    var idNum = validator.trim($('#idnum').val());
    var degProg = validator.trim($('#degProg').val());
    var phone = validator.trim($('#phone').val());

    var idNumEmpty = validator.isEmpty(idNum);
    var degProgEmpty = validator.isEmpty(degProg);
    var phoneEmpty = validator.isEmpty(phone);

    return !idNumEmpty && !degProgEmpty && !phoneEmpty;
}

function isValidPhone(activeField, callback) {
    var phone = validator.trim($('#phone').val());

    var validPhoneFormat = validator.isLength(phone, {min: 10, max: 10})
        && validator.isNumeric(phone, {no_symbols: true});

    if (validPhoneFormat) {
        $.get('/get-phone', {phone: phone}, function (data) {
            if (!data) {
                if (activeField.is($('#phone')))
                    $('#phone').text(' ');
                return callback(true);
            } else {
                if (activeField.is($('#phone')))
                    $('#phoneError').text('Phone already registered.');
                return callback(false);
            }
        })
    } else {
        if (activeField.is($('#phone')))
            $('#phoneError').text('Invalid phone number');
        return callback(false);
    }

    // if (validPhone && activeField.is($('#phone')))
    //     $('#phoneError').text(' ');
    // else if (activeField.is($('#phone')))
    //     $('#phoneError').text('Invalid phone number');

    // return validPhone;
}

function isValidID(activeField, callback) {
    var idNum = validator.trim($('#idnum').val());
    var validID = validator.isLength(idNum, {min: 8, max: 8})
        && validator.isNumeric(idNum, {no_symbols: true});
    
    if (validID) {
        $.get('/get-id', {idNum: idNum}, function (data, status) {
            if (!data) {
                if (activeField.is($('#idnum')))
                    $('#idNumError').text(' ');
                return callback(true);
            } else {
                if (activeField.is($('#idnum')))
                    $('#idNumError').text('ID number already registered.');
                return callback(false);
            }
        });
    } else {
        if (activeField.is($('#idnum')))
            $('#idNumError').text('ID Number should contain 8 digits.');
        return callback(false);
    }
}