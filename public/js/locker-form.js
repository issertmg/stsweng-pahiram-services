const $ = require('jquery');

$(document).ready(function () {
    let url = new URL(document.location);
    let params = url.searchParams;
    let bldg = params.get("bldg");
    let flr = params.get("flr");

    $("#bldg").val(bldg);
    $("#floor").val(flr);

    $("#submitLockerForm").click(function() {
        let locker = $('#panelAccordion').find('.selected');
        let panelid = locker.data('panelid');
        let lockernumber = locker.data('lockernumber');

        if ($("#checkTerms").prop('checked')) {
            if (locker.length != 0) {
                $('#panelid').val(panelid);
                $('#lockernumber').val(lockernumber);
                $('#lockerForm').submit();
            } else {
                alert("Please select a locker you want to rent.");
            }
        } else {
            alert("Please check the box if you agree to the terms and conditions.");
        }
    });
});


/**
 * Removes a query string parameter from the URL
 * @param key - the key to be removed
 * @param sourceURL - the original URL
 * @returns {string} - the URL when a specified query string parameter is removed
 */
function removeQueryStringParam(key, sourceURL) {
    let rtn = sourceURL.split("?")[0],
        param,
        params_arr = [],
        queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
        params_arr = queryString.split("&");
        for (let i = params_arr.length - 1; i >= 0; i--) {
            param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        rtn = rtn + "?" + params_arr.join("&");
    }
    return rtn;
}

/**
 * Updates the query string parameters of the URL and returns it
 * @param uri - the  URL
 * @param key - the key to be added/replaced
 * @param value - the value associated with the key
 * @returns {string} - the new URL
 */
function getUpdatedURL(uri, key, value) {
    let re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    let separator = uri.indexOf('?') !== -1 ? "&" : "?";

    if (uri.match(re))
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    else
        return uri + separator + key + "=" + value;
}

/**
 * Updates the query string parameters and redirects to the new URL
 * @param key - the key to add/replace
 * @param value - the value associated with the key
 */
function updateURLQuery(key, value) {
    let uri = window.location.href;

    if (key === 'bldg')
        uri = removeQueryStringParam('flr', uri);

    window.location.href = getUpdatedURL(uri, key, value)
}

exports.removeQueryStringParam = removeQueryStringParam;
exports.getUpdatedURL = getUpdatedURL;