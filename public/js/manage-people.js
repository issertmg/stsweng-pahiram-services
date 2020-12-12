$(document).ready(function () {
  var pagination;
  var pageNum;
  var pageStart;
  var pageEnd;
  var idNum = '';
  const itemsPerPage = 10;

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
          console.log(data);
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
    console.log($(this).val())
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

$('#editProfileModal').on('show.bs.modal', (event) => {

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

$('#promoteModal').on('show.bs.modal', (event) => {
  var btn = $(event.relatedTarget);
  id = btn.data('id');
  $('#promoteUserID').val(id);
});

$('#demoteModal').on('show.bs.modal', (event) => {
  var btn = $(event.relatedTarget);
  id = btn.data('id');
  $('#demoteUserID').val(id);
  $('#demoteErrorAlert').hide();
});

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