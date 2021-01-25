$(document).ready(function () {
    $('#locker-btn').hover(
        function () {
            $(`#human-locker, 
               #human-equipment,
               #human-book,
               #table,
               #laptop,
               #umbrella, 
               #bench,
               #trashcan, 
               #clock,
               #window,
               #wall2,
               #wall1`).addClass('locker-anim');
        }, function () {
            $(`#human-locker, 
               #human-equipment,
               #human-book,
               #table,
               #laptop,
               #umbrella, 
               #bench,
               #trashcan, 
               #clock,
               #window,
               #wall2,
               #wall1`).removeClass('locker-anim');
        }
    );
    $('#equipment-btn').hover(
        function () {
            $(`#human-locker, 
               #human-equipment,
               #human-book,
               #table,
               #laptop,
               #umbrella, 
               #bench,
               #trashcan, 
               #clock,
               #window,
               #wall2,
               #wall1`).addClass('equipment-anim');
        }, function () {
            $(`#human-locker, 
               #human-equipment,
               #human-book,
               #table,
               #laptop,
               #umbrella, 
               #bench,
               #trashcan, 
               #clock,
               #window,
               #wall2,
               #wall1`).removeClass('equipment-anim');
        }
    );

    $('#book-btn').hover(
        function () {
            $(`#human-locker, 
               #human-equipment,
               #human-book,
               #table,
               #laptop,
               #umbrella, 
               #bench,
               #trashcan, 
               #clock,
               #window,
               #wall2,
               #wall1`).addClass('book-anim');
        }, function () {
            $(`#human-locker, 
               #human-equipment,
               #human-book,
               #table,
               #laptop,
               #umbrella, 
               #bench,
               #trashcan, 
               #clock,
               #window,
               #wall2,
               #wall1`).removeClass('book-anim');
        }
    );

    var collapsed = false;
    $('.nav-btn').click(function () {
        if (!collapsed) {
            $('.main').addClass('collapsed');
            collapsed = true;
        } else {
            $('.main').removeClass('collapsed');
            collapsed = false;
        }
    });


    /* 
    *   Custom Select
    */

    // Bind the data of the original select element to the custom select elements
    $('.custom-select').after('<div class="select-selected"></div>');
    $('.select-selected').after('<div class="select-items select-hide"></div>');
    $('select').each(function (index, selectItem) {
        var options = $(selectItem).children();
        $(options).each(function (index, optionItem) {
            if ($(selectItem).val() == $(optionItem).val()) {
                $(selectItem).next().next().append(
                    '<div class="selected" value="'
                    + $(optionItem).attr('value') + '">' + optionItem.text
                    + '</div>'
                );
                $(selectItem).next().text(optionItem.text).attr('value', $(optionItem).attr('value'));
            } else {
                $(selectItem).next().next().append(
                    '<div value="' + $(optionItem).attr('value') + '">'
                    + optionItem.text + '</div>'
                );
            }
        });
    });

    // open dropdown on click
    $('.select-selected').click(function () {
        $(this).next().toggleClass('select-hide');
    });

    // close dropdown after clicking an option
    $(document).mouseup(function (event) {
        var container = $('.select-selected');
        if (!$(container).is(event.target)) {
            $(container).next().addClass('select-hide');
        }
    });

    $('.select-items div').click(function() {
        // change the value of the select element
        $(this).parent().prev().prev().val($(this).attr('value'));
        // trigger the change in the select element
        $(this).parent().prev().prev().change();
    });

    $('select').change(function() {
        var selectVal = $(this).val();
        var options = $(this).next().next().children();
        options.each(function(index, optionItem) {
            if (selectVal == $(optionItem).attr('value')) {
                // update the customized select and dropdown elements
                $(optionItem).addClass('selected').siblings().removeClass('selected');
                $(optionItem).parent().prev().text($(optionItem).text())
            }
        });
    });
});