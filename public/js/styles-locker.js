$(document).ready(function() {
    $('.locker.locker-status-vacant').click(
        function() {
            $(this).toggleClass('selected');
            $(this).find('.icon').toggleClass('white');

            var currLocker = this;
            $('.locker.locker-status-vacant.selected').each(function(index) {
                if (currLocker != this) {
                    $(this).removeClass('selected');
                    $(this).find('.icon').removeClass('white');
                }
            });
        }
    );
});