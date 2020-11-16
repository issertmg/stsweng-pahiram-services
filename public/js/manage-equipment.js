$(document).ready(function () {

    function isFilledAddModal() {
        let eName = validator.trim($('#add-equipment-name').val());
        let eBrand = validator.trim($('#add-equipment-brand').val());
        let eModel = validator.trim($('#add-equipment-model').val());
        let eQuantity = validator.trim($('#add-equipment-ct').val());
        let eImage= $('#add-equipment-pic');

        let eNameEmpty = validator.isEmpty(eName);
        let eBrandEmpty = validator.isEmpty(eBrand);
        let eModelEmpty = validator.isEmpty(eModel);
        let eQuantityEmpty = validator.isEmpty(eQuantity);
        let eImageEmpty = (eImage.get(0).files.length === 0);
        
        return !eNameEmpty && !eBrandEmpty && !eModelEmpty && !eQuantityEmpty && !eImageEmpty;
    }

    function isValidNameBrandAddField() {
        let eName = validator.trim($('#add-equipment-name').val());
        let eBrand = validator.trim($('#add-equipment-brand').val());

        let isValidName = hasAtLeast1Letter(eName);
        let isValidBrand = hasAtLeast1Letter(eBrand);

        return isValidName && isValidBrand;
    }

    function isValidNameBrandEditField() {
        let eName = validator.trim($('#edit-equipment-name').val());
        let eBrand = validator.trim($('#edit-equipment-brand').val());

        let isValidName = hasAtLeast1Letter(eName);
        let isValidBrand = hasAtLeast1Letter(eBrand);

        return isValidName && isValidBrand;
    }

    function isValidQuantityAddField() {
        let eQuantity = validator.trim($('#add-equipment-ct').val());
        return validator.isInt(eQuantity);
    }

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

    function isValidQuantityEditField() {
        let eQuantity = validator.trim($('#edit-equipment-ct').val());
        return validator.isInt(eQuantity);
    }

    $('#addEquipmentButton').click(function() {

        if (isFilledAddModal()) {
            $('#formAlert').hide();
            if (isValidNameBrandAddField()) {
                $('#formLetterAlert').hide();
                if (isValidQuantityAddField()) {
                    $('#addEquipForm').submit();
                }
            }
            else {
                $('#formLetterAlert').show();
            }
        }
        else {
            $('#formAlert').show();
            $('#formLetterAlert').hide();
        }
    });

    $('#editEquipButton').click(function() {

      if (isFilledEditModal()) {
          $('#formUpdateAlert').hide();
          if (isValidNameBrandEditField()) {
              $('#formUpdateLetterAlert').hide();
              if (isValidQuantityEditField()) {
                  $.get('/manage-equipment/onrent',
                      {equipmentid: $('#editHiddenEquipID').val()},
                      function(data, status) {
                          let setQuantity = $('#edit-equipment-ct').val();
                          if (setQuantity < data.onRent) {
                              $('#availableAlert').show();
                          }
                          else $('#editEquipForm').submit();
                      });
              }
          }
          else {
              $('#formUpdateLetterAlert').show();
              $('#availableAlert').hide();
          }
      }
      else {
        $('#formUpdateAlert').show();
        $('#formUpdateLetterAlert').hide();
        $('#availableAlert').hide();
      }
    });

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
          $('#delEquipForm').submit();
        }
      });
    });

    limitCharactersTo50("#add-equipment-name");
    limitCharactersTo50("#add-equipment-brand");
    limitCharactersTo50("#add-equipment-model");
    limitCharactersTo50("#edit-equipment-name");
    limitCharactersTo50("#edit-equipment-brand");
    limitCharactersTo50("#edit-equipment-model");
});

$('#addEquipmentModal').on('show.bs.modal', function (event) {
    $('#addEquipForm').trigger("reset");
    $('#formAlert').hide();
    $('#formLetterAlert').hide();
});

$('#delEquipmentModal').on('show.bs.modal', function (event) {
    let button = $(event.relatedTarget);
    let equipmentID = button.data('equipmentid');
    $('#delHiddenEquipID').val($('#editHiddenEquipID').val());
    $('#onRentAlert').hide();
    $('#deleteHeader').show();
    $(this).find('.modal-title').text('Delete Equipment');
    $('#deleteEquipButton').show();
});

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

    $('#formUpdateAlert').hide();
    $('#formUpdateLetterAlert').hide();
    $('#availableAlert').hide();
});

function limitCharactersTo50 (inputElementID) {
    $(inputElementID).on("keyup change", function() {
        let inputElement = $(this);
        if (inputElement.val().length > 50) {
            inputElement.val(inputElement.val().slice(0, 50));
        }
    });
}

function hasAtLeast1Letter (stringInput) {
    return /[a-zA-Z]/.test(stringInput)
}


