$(document).ready(function () {

    function isFilled() {
        var eName = validator.trim($('#equip-name').val());
        var eQuantity = validator.trim($('#equip-ct').val());
        var eImage= $('#equip-pic');

        var eNameEmpty = validator.isEmpty(eName);
        var eQuantityEmpty = validator.isEmpty(eQuantity);
        var eImageEmpty = (eImage.get(0).files.length === 0);
        
        return !eNameEmpty && !eQuantityEmpty && !eImageEmpty;
    }

    function isValidQuantity() {
        var eQuantity = validator.trim($('#equip-ct').val());

        return validator.isInt(eQuantity);
    }

    function isFilledEdit() {
      var eName = validator.trim($('#equipment-name').val());
      var eQuantity = validator.trim($('#equipment-ct').val());

      var eNameEmpty = validator.isEmpty(eName);
      var eQuantityEmpty = validator.isEmpty(eQuantity);
      
      return !eNameEmpty && !eQuantityEmpty;
    }

    function isValidQuantityEdit() {
        var eQuantity = validator.trim($('#equipment-ct').val());

        return validator.isInt(eQuantity);
    }

    $('#addEquipmentButton').click(function() {

        if (isFilled()) {
            if (isValidQuantity()) {
                $('#addEquipForm').submit();
            }
        }
        else {
            $('#formAlert').show();
        }
    });

    $('#editEquipButton').click(function() {

      if (isFilledEdit()) {
        if (isValidQuantityEdit()) {
          $.get('/manage-equipment/onrent', 
            {equipmentid: $('#editHiddenEquipID').val()},
            function(data, status) {
            var setQuantity = $('#equipment-ct').val();
            if (setQuantity < data.onRent) {
              $('#availableAlert').show();
            }
            else $('#editEquipForm').submit();
            });
        }
      }
      else {
        $('#formUpdateAlert').show();
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

});

$('#addEquipmentModal').on('show.bs.modal', function (event) {
    $('#addEquipForm').trigger("reset");
    $('#formAlert').hide();
});

$('#delEquipmentModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    var equipmentID = button.data('equipmentid'); /*TODO:*/
    $('#delHiddenEquipID').val($('#editHiddenEquipID').val());
    $('#onRentAlert').hide();
    $('#deleteHeader').show();
    $(this).find('.modal-title').text('Delete Equipment');
    $('#deleteEquipButton').show();
});

$('#editEquipmentModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    var equipmentID = button.data('equipmentid');
    $('#editHiddenEquipID').val(equipmentID);

    // extract
    var equipmentName = button.data('equipmentname');
    var equipmentQty = button.data('equipmentquantity');

    // show
    $('#equipment-name').val(equipmentName);
    $('#equipment-ct').val(equipmentQty);

    $('#formUpdateAlert').hide();
    $('#availableAlert').hide();
});

