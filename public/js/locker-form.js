$(document).ready(function () {
    let url = new URL(document.location);
    let params = url.searchParams;
    let bldg = params.get("bldg");
    let flr = params.get("flr");

    $("#bldg").val(bldg);
    $("#floor").val(flr);

    $("#submitLockerForm").click(function() {
        var locker = $('#panelAccordion').find('.selected');
        var panelid = locker.data('panelid');
        var lockernumber = locker.data('lockernumber');

        if ($("#checkTerms").prop('checked')) {
            if (locker.length != 0) {
                $('#panelid').val(panelid);
                $('#lockernumber').val(lockernumber);
                $('#lockerForm').submit();
            }
            else {
                alert("Please select a locker you want to rent.");
            }
        }
        else {
            alert("Please check the box if you agree to the terms and conditions.");
        }
    });
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
}

// Adds or updates a query parameter
function updateQueryStringParameter(key, value) {
    var uri = window.location.href;
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (key=='bldg') {
        uri = removeParam('flr', uri);
    }
    if (uri.match(re)) {
        window.location.href = uri.replace(re, '$1' + key + "=" + value + '$2');
    }
    else {
        window.location.href = uri + separator + key + "=" + value;
    }
}