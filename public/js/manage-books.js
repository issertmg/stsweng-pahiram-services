$(document).ready(function () {
   /**
   * Initializes the table containing the user infos.
   * @returns <void> - nothing
   */
  $("#booksTable").DataTable({
    processing: true,
    serverSide: true,
    ajax: {
      url: '/manage-books/get-books',
      dataSrc: 'data'
    },
    // 'createdRow': function (row, data, dataIndex) {
    //   $(row).attr('data-toggle', 'modal');
    //   $(row).attr('data-target', '#editProfileModal');
    //   $(row).attr('data-id', data._id);
    //   $(row).attr('data-fname', data.firstName);
    //   $(row).attr('data-lname', data.lastName);
    //   $(row).attr('data-idnum', data.idNum);
    //   $(row).attr('data-college', data.college);
    //   $(row).attr('data-degprog', data.degreeProg);
    //   $(row).attr('data-mobile', data.contactNum);
    //   $(row).css('cursor', 'pointer');
    // },
    columns: [
      { "data": "title" },
      { "data": "authors"},
      { "data": function (data) {
          return (data.edition === null) ? "N/A" : data.edition
        }
      },
      { "data": function (data) {
          return (data.quantity - data.onRent) +' / ' + data.quantity;
        }
      },
      {
        "data": function (data, type, row, meta) {
            return `<a class="table-link mr-2" data-toggle="modal" 
                   data-title="`+ data.title +
                `" data-authors="`+ data.authors +
                `" data-edition="`+ data.edition +
                `" data-onrent="`+ data.onRent +
                `" data-quantity="`+ data.quantity +
                `" data-id="`+ data._id +
                `" href="#editBookModal"><div class="icon" id="edit"></div>
                             </a>` +
                `<a class="table-link mr-2" data-toggle="modal" 
                   data-title="`+ data.title +
                `" data-authors="`+ data.authors +
                `" data-edition="`+ data.edition +
                `" data-onrent="`+ data.onRent +
                `" data-quantity="`+ data.quantity +
                `" data-id="`+ data._id +
                `" href="#deleteBookModal"><div class="icon" id="delete"></div>
                             </a>`;
        },
        "className": "d-flex align-items-center justify-content-end"
      }
    ],
    "order": [[0, "asc"]],
    "responsive": true,
    "dom": "ipt",
    columnDefs: [
      {targets: [0,1,2,3,4], bSortable: false}
    ]
  });

  $("#searchBox").on("keyup paste change", function () {
    let str = $(this).val();
    if (str.length > 50) {
      $(this).val(str.slice(0,50))
    }
    $('#booksTable').DataTable()
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
 * Initializes the Delete Book Modal upon opening.
 * @returns <void> - nothing
 */
$('#deleteBookModal').on('show.bs.modal', (event) => {
  $('.alert').hide();

  let btn = $(event.relatedTarget);
  let book = {
    id: btn.data('id'),
    title: btn.data('title'),
    authors: btn.data('authors'),
    edition: btn.data('edition'),
    onRent: btn.data('onrent'),
    quantity: btn.data('quantity')
  }
  $('#deleteBookModalLabel').text('Delete Book: ' );
  $('#delHiddenBookID').val(book.id);
});

/**
 * Initializes the Add Book Modal upon opening.
 * @returns <void> - nothing
 */
$('#addBookModal').on('show.bs.modal', (event) => {
  $('.alert').hide();

  $('#addBookModalLabel').text('Add Book');
});

/**
 * Initializes the Edit Book Modal upon opening.
 * @returns <void> - nothing
 */
$('#editBookModal').on('show.bs.modal', (event) => {
  $('.alert').hide();

  let btn = $(event.relatedTarget);
  let book = {
    id: btn.data('id'),
    title: btn.data('title'),
    authors: btn.data('authors'),
    edition: btn.data('edition'),
    onRent: btn.data('onrent'),
    quantity: btn.data('quantity')
  }

  $('#editTitle').val(book.title);
  $('#editAuthors').val(book.authors);
  $('#editEdition').val(book.edition);
  $('#editQuantity').val(book.quantity);
  $('#editId').val(book.id);
  $('#editBookModalLabel').text('Edit Book');
});

/**
 * Validates the Delete Book form before submitting.
 * @returns <void> - nothing
 */
$('#deleteBookButton').click(function() {
  
});


// SUCCEEDING CODE ARE NOT USED BUT RETAINED FOR REUSING

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
  return validator.isNumeric(idNum, {no_symbols: true}) && validator.isLength(idNum,{min: 8, max: 8});
}

/**
 * Checks if the mobile number field in the Edit Profile form is valid.
 * @returns {boolean} - true if mobile number is an integer and is 10 at length; false otherwise
 */
function isValidPhoneNumber() {
  let mobile = validator.trim($('#mobile').val());
  return validator.isNumeric(mobile, {no_symbols: true}) && validator.isLength(mobile,{min: 10, max: 10});
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

