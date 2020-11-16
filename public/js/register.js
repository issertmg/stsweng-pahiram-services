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
    let value = validator.trim(activeField.val());
    let empty = validator.isEmpty(value);
    if (empty)
        $(errorLabel).text(fieldName + ' cannot be empty.');
    else
        $(errorLabel).text(' ');
    
    isValidID(activeField, function (validID) {
        isValidPhone(activeField, function (validPhone) {
            isValidDegProg(activeField, function(validDegProg) {
                if (allFilled() && validPhone && validID && validDegProg)
                    $('#signUpBtn').prop('disabled', false);
                else
                    $('#signUpBtn').prop('disabled', true);
            })
        })
    });
}

function allFilled() {
    let idNum = validator.trim($('#idnum').val());
    let degProg = validator.trim($('#degProg').val());
    let phone = validator.trim($('#phone').val());

    let idNumEmpty = validator.isEmpty(idNum);
    let degProgEmpty = validator.isEmpty(degProg);
    let phoneEmpty = validator.isEmpty(phone);

    return !idNumEmpty && !degProgEmpty && !phoneEmpty;
}

function isValidPhone(activeField, callback) {
    let phone = validator.trim($('#phone').val());

    let validPhoneFormat = validator.isLength(phone, {min: 10, max: 10})
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
}

function isValidID(activeField, callback) {
    let idNum = validator.trim($('#idnum').val());
    let validID = validator.isLength(idNum, {min: 8, max: 8})
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

function isValidDegProg(activeField, callback) {
    let degProg = validator.trim($('#degProg').val());
    let degProgSanitized = validator.blacklist(degProg, ' ');
    console.log(degProgSanitized);
    let validDegProg = validator.isLength(degProg, {min: 1, max: 15})
        && validator.isAlpha(degProgSanitized);

    if (validDegProg) {
        if (activeField.is($('#degProg')))
            $('#degProgError').text(' ');
        return callback(true);
    } else {
        if (activeField.is($('#degProg')))
            $('#degProgError').text('Invalid degree program.');
        return callback(false);
    }
}