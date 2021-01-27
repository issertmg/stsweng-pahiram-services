$(document).ready(function () {
    /**
     * Checks if the name, brand, model, and quantity input fields in the Add Equipment form are empty.
     * @returns {boolean} - true if name, brand, model and quantity are filled; false otherwise
     */
    function isFilledAddModal() {
        let eName = validator.trim($('#add-equipment-name').val());
        let eBrand = validator.trim($('#add-equipment-brand').val());
        let eModel = validator.trim($('#add-equipment-model').val());
        let eQuantity = validator.trim($('#add-equipment-ct').val());

        let eNameEmpty = validator.isEmpty(eName);
        let eBrandEmpty = validator.isEmpty(eBrand);
        let eModelEmpty = validator.isEmpty(eModel);
        let eQuantityEmpty = validator.isEmpty(eQuantity);
        
        return !eNameEmpty && !eBrandEmpty && !eModelEmpty && !eQuantityEmpty;
    }

    /**
     * Checks if the name and brand inputs in the Add Equipment form are valid.
     * @returns {boolean} - true if both name and brand inputs contain at least one letter; false otherwise
     */
    function isValidNameBrandAddField() {
        let eName = validator.trim($('#add-equipment-name').val());
        let eBrand = validator.trim($('#add-equipment-brand').val());

        let isValidName = hasAtLeast1Letter(eName);
        let isValidBrand = hasAtLeast1Letter(eBrand);

        return isValidName && isValidBrand;
    }

    /**
     * Checks if the uploaded image in the Add Equipment form is valid.
     * @returns {boolean} - true if the file is a PNG; false otherwise
     */
    function isValidImageAddField() {
        let eFile = $('#add-equipment-pic').val();
        let ext = eFile.split(".");
        ext = ext[ext.length-1].toLowerCase();

        return ext === "png";
    }

    /**
     * Checks if the uploaded image in the Edit Equipment form is valid.
     * @returns {boolean} - true if the file is a PNG; false otherwise
     */
    function isValidImageEditField() {
        let eFile = $('#edit-equipment-pic').val();
        let ext = eFile.split(".");
        ext = ext[ext.length-1].toLowerCase();

        return ext === "png";
    }

    /**
     * Checks if the name and brand inputs in the Edit Equipment form are valid.
     * @returns {boolean} - true if both name and brand inputs contain at least one letter; false otherwise
     */
    function isValidNameBrandEditField() {
        let eName = validator.trim($('#edit-equipment-name').val());
        let eBrand = validator.trim($('#edit-equipment-brand').val());

        let isValidName = hasAtLeast1Letter(eName);
        let isValidBrand = hasAtLeast1Letter(eBrand);

        return isValidName && isValidBrand;
    }

    /**
     * Checks if the quantity input in the Add Equipment form is valid.
     * @returns {boolean} - true if quantity input is a whole number and is greater than 0 but less than or equal to 1000; false otherwise
     */
    function isValidQuantityAddField() {
        let eQuantity = validator.trim($('#add-equipment-ct').val());
        return validator.isInt(eQuantity) && (eQuantity > 0) && (eQuantity <= 1000);
    }

    /**
     * Checks if the name, brand, model, and quantity input fields in the Edit Equipment form are empty.
     * @returns {boolean} - true if name, brand, model and quantity are filled; false otherwise
     */
    function isFilledEditModal() {
        let eName = validator.trim($('#edit-equipment-name').val());
        let eBrand = validator.trim($('#edit-equipment-brand').val());
        let eModel = validator.trim($('#edit-equipment-model').val());
        let eQuantity = validator.trim($('#edit-equipment-ct').val());

        let eNameEmpty = validator.isEmpty(eName);
        let eBrandEmpty = validator.isEmpty(eBrand);
        let eModelEmpty = validator.isEmpty(eModel);
        let eQuantityEmpty = validator.isEmpty(eQuantity);
      
      return !eNameEmpty && !eBrandEmpty && !eModelEmpty && !eQuantityEmpty;
    }

    /**
     * Checks if the quantity input in the Edit Equipment form is valid.
     * @returns {boolean} - true if quantity input is a whole number and is greater than 0 but less than or equal to 1000; false otherwise
     */
    function isValidQuantityEditField() {
        let eQuantity = validator.trim($('#edit-equipment-ct').val());
        return validator.isInt(eQuantity) && (eQuantity > 0) && (eQuantity <= 1000);
    }

    /**
     * Validates the Add Equipment form before submitting.
     * @returns <void> - nothing
     */
    $('#addEquipmentButton').click(function() {
        hideAllAlert();

        if (!isFilledAddModal())                //checks if all required inputs are filled
            $('#formAlert').show();
        else if (!isValidNameBrandAddField())   //checks if name and brand inputs have at least one letter
            $('#formLetterAlert').show();
        else if (!isValidQuantityAddField())    //checks if the quantity input is valid
            $('#formQuantityAlert').show();
        else {
            $.get('/manage-equipment/check',
                {
                    eName: $('#add-equipment-name').val(),
                    eBrand: $('#add-equipment-brand').val(),
                    eModel: $('#add-equipment-model').val()
                },
                function (data, status) {
                    if (data.count === 0) {
                        $('#addEquipmentButton').off("click");
                        $('#addEquipForm').submit();
                    }
                    else {
                        $('#formDuplicateAlert').show();
                    }
                }
            );
        }
    });

    /**
     * Validates the Edit Equipment form before submitting.
     * @returns <void> - nothing
     */
    $('#editEquipButton').click(function() {
        hideAllAlert();

        if (!isFilledEditModal())                //checks if all required inputs are filled
            $('#formUpdateAlert').show();
        else if (!isValidNameBrandEditField())   //checks if name and brand inputs have at least one letter
            $('#formUpdateLetterAlert').show();
        else if (!isValidQuantityEditField())    //checks if the quantity input is valid
            $('#formUpdateQuantityAlert').show();
        else {
            $.get('/manage-equipment/onrent',
                {
                    equipmentid: $('#editHiddenEquipID').val()
                },
                function(data, status) {
                    let setQuantity = $('#edit-equipment-ct').val();
                    if (setQuantity < data.onRent) {
                        $('#availableAlert').show();
                    }
                    else {
                        $.get('/manage-equipment/check',
                            {
                                eID: $('#editHiddenEquipID').val(),
                                eName: $('#edit-equipment-name').val(),
                                eBrand: $('#edit-equipment-brand').val(),
                                eModel: $('#edit-equipment-model').val()
                            },
                            function (data, status) {
                                if (data.count === 0) {
                                    $('#editEquipButton').off("click");
                                    $('#editEquipForm').trigger("submit");
                                }
                                else {
                                    $('#formUpdateDuplicateAlert').show();
                                }
                            }
                        );


                    }
                }
            );
        }
    });

    /**
     * Validates the Delete Equipment form before submitting.
     * @returns <void> - nothing
     */
    $('#deleteEquipButton').click(function() {
      $.get('/manage-equipment/onrent', 
        {equipmentid: $('#editHiddenEquipID').val()},
        function(data, status) {
        if (data.onRent != 0) {
          $('#onRentAlert').show();
          $('#deleteHeader').hide();
          $('#delEquipmentModal').find('.modal-title').text('Deletion Failed');
          $('#deleteEquipButton').hide();
        }
        else {
            $('#deleteEquipButton').off("click");
            $('#delEquipForm').trigger("submit");
        }
      });
    });

    limitCharactersTo50("#add-equipment-name");
    limitCharactersTo50("#add-equipment-brand");
    limitCharactersTo50("#add-equipment-model");
    limitCharactersTo50("#edit-equipment-name");
    limitCharactersTo50("#edit-equipment-brand");
    limitCharactersTo50("#edit-equipment-model");

    limitMinAndMaxValue("#add-equipment-ct");
    limitMinAndMaxValue("#edit-equipment-ct");

    /**
     * Validates image file input in Add Equipment form.
     * @returns <void> - nothing
     */
    $('#add-equipment-pic').on("change", function() {
        if (!isValidImageAddField()) {
            $('#add-equipment-pic').val("");
            $('#formPicAlert').show();
        }
    });

    /**
     * Validates image file input in Edit Equipment form.
     * @returns <void> - nothing
     */
    $('#edit-equipment-pic').on("change", function() {
        if (!isValidImageEditField()) {
            $('#edit-equipment-pic').val("");
            $('#formUpdatePicAlert').show();
        }
    });
});

/**
 * Shows the Add Equipment Form.
 * @returns <void> - nothing
 */
$('#addEquipmentModal').on('show.bs.modal', function (event) {
    $('#addEquipForm').trigger("reset");
    hideAllAlert();
});

/**
 * Shows the Delete Equipment Form.
 * @returns <void> - nothing
 */
$('#delEquipmentModal').on('show.bs.modal', function (event) {
    let button = $(event.relatedTarget);
    let equipmentID = button.data('equipmentid');
    $('#delHiddenEquipID').val($('#editHiddenEquipID').val());
    $('#deleteHeader').show();
    $(this).find('.modal-title').text('Delete Equipment');
    $('#deleteEquipButton').show();
    hideAllAlert();
});

/**
 * Shows the Edit Equipment Form.
 * @returns <void> - nothing
 */
$('#editEquipmentModal').on('show.bs.modal', function (event) {
    let button = $(event.relatedTarget);
    let equipmentID = button.data('equipmentid');
    $('#editHiddenEquipID').val(equipmentID);

    // extract
    let equipmentName = button.data('equipmentname');
    let equipmentBrand = button.data('equipmentbrand');
    let equipmentModel = button.data('equipmentmodel');
    let equipmentQty = button.data('equipmentquantity');

    // show
    $('#edit-equipment-name').val(equipmentName);
    $('#edit-equipment-brand').val(equipmentBrand);
    $('#edit-equipment-model').val(equipmentModel);
    $('#edit-equipment-ct').val(equipmentQty);
    $('#edit-equipment-pic').val("");

    hideAllAlert();
});

/**
 * Hides all alert elements in all Equipment forms
 * @returns <void> - nothing
 */
function hideAllAlert() {
    //For Add Equipment
    $('#formAlert').hide();
    $('#formLetterAlert').hide();
    $('#formQuantityAlert').hide();
    $('#formPicAlert').hide();
    $('#formDuplicateAlert').hide();

    //For Delete Equipment
    $('#onRentAlert').hide();

    //For Edit Equipment
    $('#formUpdateAlert').hide();
    $('#formUpdateLetterAlert').hide();
    $('#formUpdateQuantityAlert').hide();
    $('#formUpdatePicAlert').hide();
    $('#availableAlert').hide();
    $('#formUpdateDuplicateAlert').hide();
}

/**
 * Adds a keyup and onchange listener to an input element.
 * @param inputElementID - the id of the input field element
 * @returns <void> - nothing
 */
function limitCharactersTo50 (inputElementID) {
    $(inputElementID).on("keyup change", function() {
        let inputElement = $(this);
        if (inputElement.val().length > 50) {
            inputElement.val(inputElement.val().slice(0, 50));
        }
    });
}

/**
 * Adds an oninput listener to an input element.
 * @param inputElementID - the id of the input field element
 * @returns <void> - nothing
 */
function limitMinAndMaxValue (inputElementID) {
    $(inputElementID).on("input", function() {
        let inputElement = $(this);
        if (inputElement.val() <= 0) {
            inputElement.val("");
        }
        else if (inputElement.val() > 1000) {
            inputElement.val("1000");
        }
    });
}

/**
 * Checks if the string parameter has at least 1 letter.
 * @param stringInput - the string input
 * @returns {boolean} - true if has at least 1 letter, false otherwise
 */
function hasAtLeast1Letter (stringInput) {
    return /[a-zA-Z]/.test(stringInput)
}



