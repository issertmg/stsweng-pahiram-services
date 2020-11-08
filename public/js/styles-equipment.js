$(document).ready(function() {
    $('.equipment-types button').hover(
        function() {
            $(this).prev().addClass('active');
        },
        function() {
            if (!$(this).hasClass('active'))
                $(this).prev().removeClass('active');
        }
    );

    $('.equipment-types button').click(
        function() {
            var currBtn = this;
            $('.equipment-types button').each(function(index) {
                if (currBtn != this) {
                    $(this).removeClass('active');
                    $(this).prev().removeClass('active');
                }
            });
        }
    );

    $('.equipment-types button.active').prev().addClass('active');
});