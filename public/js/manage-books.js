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
  $('#deleteBookModalLabel').text('Delete Book' );
  $('#delHiddenBookID').val(book.id);

  $('#deleteHeader').show();
  $('#deleteBookButton').show();
  $('.alert').hide();
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
  $.get('/manage-books/onrent',
      {bookid: $('#delHiddenBookID').val()},
      function(data, status) {
    console.log(data)
        if (data.onRent != 0) {
          $('#onRentAlert').show();
          $('#deleteHeader').hide();
          $('#deleteBookModal').find('.modal-title').text('Deletion Failed');
          $('#deleteBookButton').hide(); //TODO
        }
        else {
          $('#deleteEquipButton').off("click");
          $('#deleteBookForm').submit();
        }
      });
});

/**
 * Checks if the book title, authors, and quantity fields in the Add Book form are empty.
 * @returns {boolean} - true if the book title, authors, and quantity fields are filled; false otherwise
 */
function isFilledTitleAuthorsQuantity(titleString, authorsString, quantityString) {
  let titleEmpty = validator.isEmpty(titleString);
  let authorsEmpty = validator.isEmpty(authorsString);
  let quantityEmpty = validator.isEmpty(quantityString);

  return !titleEmpty && !authorsEmpty && !quantityEmpty;
}

/**
 * Checks if the string parameter has at least 1 letter.
 * @param stringInput - the string input
 * @returns {boolean} - true if has at least 1 letter, false otherwise
 */
function hasAtLeast1Letter (stringInput) {
  return /[a-zA-Z]/.test(stringInput)
}

/**
 * Checks if the book title input is valid.
 * @returns {boolean} - true if book title has at least 1 letter and is at most 50 characters; false otherwise
 */
function isValidBookTitle(stringInput) {
  return validator.isLength(stringInput, { max: 50}) && hasAtLeast1Letter(stringInput);
}

/**
 * Checks if the book authors input is valid.
 * @returns {boolean} - true if book authors has at least 1 letter and is at most 50 characters; false otherwise
 */
function isValidBookAuthors(stringInput) {
  return validator.isLength(stringInput, { max: 50}) && hasAtLeast1Letter(stringInput);
}

/**
 * Checks if the book edition input is valid.
 * @returns {boolean} - true if book authors has at least 1 letter and is at most 50 characters; false otherwise
 */
function isValidBookEdition(stringInput) {
  if (validator.isEmpty(stringInput))
    return true
  else
    return validator.isLength(stringInput, { max: 50});
}

/**
 * Checks if the book quantity input is valid.
 * @returns {boolean} - true if book authors has at least 1 letter and is at most 50 characters; false otherwise
 */
function isValidBookQuantity(quantity) {
  return validator.isInt(quantity) && (quantity > 0) && (quantity <= 1000);
}

$("#addTitle").on("keyup change", function() {
  let inputElement = $(this);
  if (inputElement.val().length > 50) {
    inputElement.val(inputElement.val().slice(0, 50));
  }
});
$("#addAuthors").on("keyup change", function() {
  let inputElement = $(this);
  if (inputElement.val().length > 50) {
    inputElement.val(inputElement.val().slice(0, 50));
  }
});
$("#addEdition").on("keyup change", function() {
  let inputElement = $(this);
  if (inputElement.val().length > 50) {
    inputElement.val(inputElement.val().slice(0, 50));
  }
});

$("#addQuantity").on("input", function() {
  let inputElement = $(this);
  if (inputElement.val() <= 0) {
    inputElement.val("");
  }
  else if (inputElement.val() > 1000) {
    inputElement.val("1000");
  }
});

$("#addBookSubmitButton").click(function() {
  $(".alert").hide()
  let title = validator.trim($("#addTitle").val());
  let authors = validator.trim($("#addAuthors").val());
  let edition = validator.trim($("#addEdition").val());
  let quantity = validator.trim($("#addQuantity").val());

  if (!isFilledTitleAuthorsQuantity(title, authors, quantity)) {
    $("#addBlankAlert").show();
  }
  else if (!isValidBookTitle(title)){
    $("#addTitleAlert").show();
  }
  else if (!isValidBookAuthors(authors)) {
    $("#addAuthorsAlert").show();
  }
  else if (!isValidBookEdition(edition)) {
    $("#addEditionAlert").show();
  }
  else if (!isValidBookQuantity(quantity)) {
    $("#addQuantityAlert").show();
  }
  else {
    $.get('/manage-books/check',
        {
          title: title,
          authors: authors,
          edition: edition
        },
        function (data, status) {
          if (data.count === 0) {
            $('#addBookSubmitButton').off("click");
            $('#addBookForm').submit();
          }
          else {
            $('#addBookDuplicateAlert').show();
          }
        }
    );
  }
});

$('#setRentalDatesModal').on('show.bs.modal', function (event) {
  $('.alert').hide();
  let startDateData = $(event.relatedTarget).data('startdate');
  let endDateData = $(event.relatedTarget).data('enddate');
  let returnDateData = $(event.relatedTarget).data('returndate');

  let startDate = typeof startDateData === 'undefined' ? new Date() : new Date(startDateData);
  let startDateString = startDate.getFullYear() + '-'
      + ((startDate.getMonth() <= 8) ? '0' : '') + (startDate.getMonth() + 1) + '-'
      + ((startDate.getDate() <= 9) ? '0' : '') + startDate.getDate();

  let endDate = typeof endDateData === 'undefined' ? new Date() : new Date(endDateData);
  let endDateString = endDate.getFullYear() + '-'
      + ((endDate.getMonth() <= 8) ? '0' : '') + (endDate.getMonth() + 1) + '-'
      + ((endDate.getDate() <= 9) ? '0' : '') + endDate.getDate();

  let returnDate = typeof returnDateData === 'undefined' ? new Date() : new Date(returnDateData);
  let returnDateString = returnDate.getFullYear() + '-'
      + ((returnDate.getMonth() <= 8) ? '0' : '') + (returnDate.getMonth() + 1) + '-'
      + ((returnDate.getDate() <= 9) ? '0' : '') + returnDate.getDate();

  $("#startDate").val(startDateString);
  $("#endDate").val(endDateString);
  $("#returnDate").val(returnDateString);

  let startTimeString = startDate.toTimeString();
  startTimeString = startTimeString.split(' ')[0].slice(0, 5);
  let endTimeString = endDate.toTimeString();
  endTimeString = endTimeString.split(' ')[0].slice(0, 5);
  $("#startTime").val(startTimeString);
  $("#endTime").val(endTimeString);
});

$('#setRentalDatesButton').click(function() {
  $('.alert').hide();
  if (!isFilledRentalDates) {
    $("#emptyRentalDateAlert").show();
  }
  else if (!isValidStartDate())  {
    $("#startDateAlert").show();
  }
  else if (!isValidEndDate()) {
    $("#endDateAlert").show();
  }
  else if (!isValidReturnDate()) {
    $("#returnDateAlert").show();
  }
  else {
    $('#setRentalDatesButton').off("click");
    $('#setRentalDatesForm').submit();
  }
});

function isFilledRentalDates() {
  let startDate = validator.trim($("#startDate").val());
  let endDate =  validator.trim($("#endDate").val());
  let returnDate =  validator.trim($("#returnDate").val());
  let startTime =  validator.trim($("#startTime").val());
  let endTime =  validator.trim($("#endTime").val());

  return !validator.isEmpty(startDate) && !validator.isEmpty(endDate) &&
      !validator.isEmpty(returnDate) && !validator.isEmpty(startTime) && !validator.isEmpty(endTime);
}

function isValidStartDate () {
  let startDate = $("#startDate").val();
  let startDateObject = new Date(startDate);
  let currentDate = new Date();

  let startTimeString = $("#startTime").val();
  let startTimeHour = startTimeString.split(':')[0];
  let startTimeMinute = startTimeString.split(':')[1];
  startDateObject.setHours(startTimeHour, startTimeMinute, 0);


  return startDateObject >= currentDate;
}

function isValidEndDate () {
  let startDate = $("#startDate").val();
  let endDate = $("#endDate").val();
  let startDateObject = new Date(startDate);
  let endDateObject = new Date(endDate);

  let startTimeString = $("#startTime").val();

  let startTimeHour = startTimeString.split(':')[0];
  let startTimeMinute = startTimeString.split(':')[1];
  startDateObject.setHours(startTimeHour, startTimeMinute, 0);
  startDateObject.setMinutes(startDateObject.getMinutes() + 1);

  let endTimeString = $("#endTime").val();
  let endTimeHour = endTimeString.split(':')[0];
  let endTimeMinute = endTimeString.split(':')[1];
  endDateObject.setHours(endTimeHour, endTimeMinute, 0);

  return endDateObject >= startDateObject;
}

function isValidReturnDate() {
  let endDate = $("#endDate").val();
  let returnDate = $("#returnDate").val();
  let endDateObject = new Date(endDate);
  let returnDateObject = new Date(returnDate);

  return returnDateObject > endDateObject;
}

function limitDatePicker() {
  let dtToday = new Date();

  let month = dtToday.getMonth() + 1;
  let day = dtToday.getDate();
  let year = dtToday.getFullYear();
  if(month < 10)
    month = '0' + month.toString();
  if(day < 10)
    day = '0' + day.toString();

  let minDate = year + '-' + month + '-' + day;
  $('#startDate').attr('min', minDate);
  $('#endDate').attr('min', minDate);
  $('#returnDate').attr('min', minDate);
}