$(document).ready(function () {
    var url = new URL(document.location);
    var params = url.searchParams;
    var bldg = params.get("bldg");
    var flr = params.get("flr");

    $("#bldg").val(bldg);
    $("#floor").val(flr);

    $('form').on('submit', function () {
        $('.modal').find('button[type="submit"]').prop('disabled',true);
    })
  });

  function isFilled() {
    var lRange = validator.trim($('#lowerRange').val());
    var uRange = validator.trim($('#upperRange').val());
    var bldg = validator.trim($('#panelBldg').val());
    var flr = validator.trim($('#panelFloor').val());

    var lRangeEmpty = validator.isEmpty(lRange);
    var uRangeEmpty = validator.isEmpty(uRange);
    var bldgEmpty = validator.isEmpty(bldg);
    var flrEmpty = validator.isEmpty(flr);

    return !lRangeEmpty && !uRangeEmpty && !bldgEmpty && !flrEmpty;
  }

  function isValidRange() {
    var lRange = validator.trim($('#lowerRange').val());
    var uRange = validator.trim($('#upperRange').val());

    if (validator.isInt(lRange) && validator.isInt(uRange)) {
      var lower = validator.toInt(lRange);
      var upper = validator.toInt(uRange);

      return upper >= lower;
    }
    else return false;
  }

  $('#markUnclearedButton').click(function(){
    var confirm = $('#confirmation').val();
    if (confirm == 'locker') {
      $('#markUnclearedForm').submit();
    }
    else {
      $('#confirmation').css('border-color', 'red');
    }
  });

  $('#delPanelButton').click(function(){
    $.get('/manage-lockers/status', 
      {panelid: $("#deletePanelId").val()},
      function(data, status) {
      if (data) {
        $('#deletePanelForm').submit();
      }
      else {
        $('#panelAlert').show();
        $('#deleteHeader').hide();
        $('#delPanelButton').hide();
        $('#delPanelModal').find('.modal-title').text('Deletion Failed');
      }
    });
  });

  $('#setStatusModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var lockernumber = button.data('lockernumber'); // Extract info from data-* attributes
    var panelid = button.data('panelid');
    var lockerid = button.data('lockerid');
    var statusIcon = button.find('.locker-status-icon');
    var classList = button.attr('class').split(' ');
    $(statusIcon).addClass(classList[1]);
    var modal = $(this);

    var lockerStatus = '';
    if (classList[1] == 'locker-status-manage-vacant')
      lockerStatus = 'Vacant'
    else if (classList[1] == 'locker-status-manage-occupied')
      lockerStatus = 'Occupied'
    else if (classList[1] == 'locker-status-manage-broken')
      lockerStatus = 'Broken'
    else if (classList[1] == 'locker-status-manage-uncleared')
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
        function(data) {
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
    var button = $(event.relatedTarget); // Button that triggered the modal
    var panelid = button.data('panelid');
    var modal = $(this);

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
    $('#rangeAlert').hide();
    $('#formAlert').hide();
  });

  $('#addPanelSubmit').click(function(){
    if (isFilled()) {
      if (isValidRange()) {
        $('#addPanelForm').submit();
      }
      else {
        $('#formAlert').hide();
        $('#rangeAlert').show();
        $('#lowerRange').css('border-color', 'red');
        $('#upperRange').css('border-color', 'red');
      }
    }
    else {
      $('#formAlert').show();
      $('#rangeAlert').hide();
      $('#lowerRange').css('border-color', '');
      $('#upperRange').css('border-color', '');
    }    
  });

  $('#markUnclearedModal').on('show.bs.modal', function (event) {
    $("#confirmation").val("");
    $('#confirmation').css('border-color', '');
  });

  // Removes a query parameter
  function removeParam(key, sourceURL) {
    var rtn = sourceURL.split("?")[0],
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
  };

  // Adds or updates a query parameter
  function updateQueryStringParameter(key, value) {
    var uri = window.location.href;
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (key == 'bldg') {
      uri = removeParam('flr', uri);
    }
    if (uri.match(re)) {
      window.location.href = uri.replace(re, '$1' + key + "=" + value + '$2');
    }
    else {
      window.location.href = uri + separator + key + "=" + value;
    }
  };