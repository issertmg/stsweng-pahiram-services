$(document).ready(function () {
   /**
   * Initializes the table containing the user infos.
   * @returns <void> - nothing
   */
  $("#peopleTable").DataTable({
    processing: true,
    serverSide: true,
    ajax: {
      url: '/profile/manage/get-people',
      dataSrc: 'data'
    },
    'createdRow': function (row, data, dataIndex) {
      $(row).attr('data-toggle', 'modal');
      $(row).attr('data-target', '#editReservationModal');
      $(row).css('cursor', 'pointer');
    },
    columns: [
      {
        "data": "dpURL",
        "render": function (data, type, row, meta) {
          return `<div class="profile-icon" style="background-image: url('` + data + `');"></div>`;
        }
      },
      { "data": "idNum" },
      { "data": function (data) {
                  return data.lastName +', ' + data.firstName;
                }
      },
      { "data": "email" },
      { "data": "degreeProg" },
      { "data": "college" },
      { "data": "type" },
      { "data": "contactNum" },
      {
        "data": function (data, type, row, meta) {
                  if (data.type === "studentRep") {
                    return `<a class="table-link btn btn-warning mr-4" 
                               data-toggle="modal" data-id="`+ data._id +
                              `" href="#demoteModal">Demote
                             </a>` +
                            `<a class="table-link mr-2" data-toggle="modal" 
                               data-fname="`+ data.firstName +
                               `" data-lname="`+ data.lastName +
                               `" data-idnum="`+ data.idNum +
                               `" data-college="`+ data.college +
                               `" data-degprog="`+ data.degreeProg +
                               `" data-mobile="`+ data.contactNum +
                               `" data-id="`+ data._id +
                               `" href="#editProfileModal"><div class="icon" id="edit"></div>
                             </a>`;
                  }
                  else {
                    return `<a class="table-link btn btn-secondary mr-4" 
                               data-toggle="modal" data-id="`+ data._id +
                              `" href="#promoteModal">Promote
                            </a>` +
                           `<a class="table-link mr-2" data-toggle="modal" 
                                     data-fname="`+ data.firstName +
                              `" data-lname="`+ data.lastName +
                              `" data-idnum="`+ data.idNum +
                              `" data-college="`+ data.college +
                              `" data-degprog="`+ data.degreeProg +
                              `" data-mobile="`+ data.contactNum +
                              `" data-id="`+ data._id +
                              `" href="#editProfileModal"><div class="icon" id="edit"></div>
                            </a>`;
                  }
              },
          "className": "d-flex align-items-center justify-content-end"
      }
    ],
    "order": [[2, "asc"]],
    "responsive": true,
    "dom": "ipt"
  });

  $("#searchBox").on("keyup paste", function () {
    $('#peopleTable').DataTable()
        .search($(this).val())
        .draw();
  });
});

$(document).ajaxStart(function () {
  $('table').css('filter', 'opacity(0.3)');
  $('.page-link').css('pointer-events', 'none');
  $('.page-link').css('filter', 'opacity(0.3)');
});

$(document).ajaxComplete(function () {
  $('table').css('filter', 'opacity(1)');
  $('.page-link').css('pointer-events', 'auto');
  $('.page-link').css('filter', 'opacity(1)');
});

/**
 * Initializes the Edit Profile Modal upon opening.
 * @returns <void> - nothing
 */
$('#editProfileModal').on('show.bs.modal', (event) => {
  hideAllAlert();
  var btn = $(event.relatedTarget);
  var person = {
    id: btn.data('id'),
    firstName: btn.data('fname'),
    lastName: btn.data('lname'),
    idNum: btn.data('idnum'),
    college: btn.data('college'),
    degProg: btn.data('degprog'),
    contactNum: btn.data('mobile')
  }

  $('#editProfileModalLabel').text('Edit Profile: ' + person.firstName + ' ' + person.lastName);
  $('#firstName').val(person.firstName);
  $('#lastName').val(person.lastName);
  $('#idNum').val(person.idNum);
  $('#college').val(person.college);
  $('#college').change();
  $('#degProg').val(person.degProg);
  $('#mobile').val(person.contactNum);
  $('#id').val(person.id);
});

/**
 * Initializes the Promote Modal upon opening.
 * @returns <void> - nothing
 */
$('#promoteModal').on('show.bs.modal', (event) => {
  var btn = $(event.relatedTarget);
  id = btn.data('id');
  $('#promoteUserID').val(id);
});

/**
 * Initializes the Demote Modal upon opening.
 * @returns <void> - nothing
 */
$('#demoteModal').on('show.bs.modal', (event) => {
  var btn = $(event.relatedTarget);
  id = btn.data('id');
  $('#demoteUserID').val(id);
  $('#demoteErrorAlert').hide();
});

/**
 * Validates the Demote User form before submitting.
 * @returns <void> - nothing
 */
$('#demoteUserBtn').click(function() {
  $.get('/profile/get-count-of-studentrep',
      {},
      function(data, status) {
        if (data.count < 2) {
          $('#demoteErrorAlert').show();
        }
        else {
          $('#demoteUserBtn').off("click");
          $('#demoteUserForm').submit();
        }
      });
});

/**
 * Validates the Edit Profile form before submitting.
 * @returns <void> - nothing
 */
$('#approveStatusSubmit').click(function() {
  hideAllAlert();
  if (!isFilledEditModal()) {
    $("#emptyAlert").show();
  }
  else if (!isValidIDNumber()){
    $("#idnumAlert").show();
  }
  else if (!isValidPhoneNumber()) {
    $("#mobileAlert").show();
  }
  else if (!isValidDegreeProgram()) {
    $("#degreeAlert").show();
  }
  else {
    $.get('/profile/check-for-duplicates',
            {userid: $("#id").val(), mobile: $("#mobile").val(), idnumber: $("#idNum").val()},
            function(data, status) {
              if (data.duplicateMobile) {
                $('#dupeMobileAlert').show();
              }
              if (data.duplicateID) {
                $('#dupeIdnumAlert').show();
              }
              if (!data.duplicateMobile && !data.duplicateID){
                $('#approveStatusSubmit').off("click");
                $('#editProfileForm').submit();
              }
            }
    );
  }
});

/**
 * Checks if the id number, college, degree program, and mobile fields in the Edit Profile form are empty.
 * @returns {boolean} - true if id number, college, degree program, and mobile fields are filled; false otherwise
 */
function isFilledEditModal() {
  let idNum = validator.trim($('#idNum').val());
  let college = validator.trim($('#college').val());
  let degProg = validator.trim($('#degProg').val());
  let mobile = validator.trim($('#mobile').val());

  let idNumEmpty = validator.isEmpty(idNum);
  let collegeEmpty = validator.isEmpty(college);
  let degProgEmpty = validator.isEmpty(degProg);
  let mobileEmpty = validator.isEmpty(mobile);

  return !idNumEmpty && !collegeEmpty && !degProgEmpty && !mobileEmpty;
}

/**
 * Checks if the id number field in the Edit Profile form is valid.
 * @returns {boolean} - true if id number is an integer and is 8 at length; false otherwise
 */
function isValidIDNumber() {
  let idNum = validator.trim($('#idNum').val());
  return validator.isInt(idNum) && (idNum.length === 8);
}

/**
 * Checks if the mobile number field in the Edit Profile form is valid.
 * @returns {boolean} - true if mobile number is an integer and is 10 at length; false otherwise
 */
function isValidPhoneNumber() {
  let mobile = validator.trim($('#mobile').val());
  return validator.isInt(mobile) && (mobile.length === 10);
}

/**
 * Checks if the degree program field in the Edit Profile form is valid.
 * @returns {boolean} - true if degree program only contains letters, -(dash), and/or whitespaces; false otherwise
 */
function isValidDegreeProgram() {
  let regex = /[a-z\-\s]*/i;
  let degProg = validator.trim($('#degProg').val());
  return degProg.match(regex)[0] === degProg;
}

/**
 * Hides all alerts in Edit Profile form
 * @returns {void} - nothing
 */
function hideAllAlert() {
  $("#emptyAlert").hide();
  $("#idnumAlert").hide();
  $("#mobileAlert").hide();
  $("#degreeAlert").hide();
  $("#dupeMobileAlert").hide();
  $("#dupeIdnumAlert").hide();
}

/**
 * Limits the length of input in degree program field in Edit Profile form to 15 characters.
 * @returns {void} - nothing
 */
$("#degProg").on("keyup change", function() {
  let inputElement = $(this);
  if (inputElement.val().length > 15) {
    inputElement.val(inputElement.val().slice(0, 15));
  }
});

/**
 * Limits the length of input in mobile number field in Edit Profile form to 10 characters.
 * @returns {void} - nothing
 */
$("#mobile").on("keyup change", function() {
  let inputElement = $(this);
  if (inputElement.val().length > 10) {
    inputElement.val(inputElement.val().slice(0, 10));
  }
});