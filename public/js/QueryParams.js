
// given a variable it will return the value
// ie. 'name' will return 'Marco'
function getQueryVariable(variable) {
    // get the param from window.location.search
    // remove the ?
    var query = window.location.search.substring(1);
    // split it at the &
    // this will create
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        // literate over the array of name=Marco
        var pair = vars[i].split('=');
        // split at =
        // http://www.w3schools.com/jsref/jsref_decodeuricomponent.asp
        if (decodeURIComponent(pair[0]) == variable) {
            // decodeURIComponent removes % etc..
            // replace(/\+/g, ' ') replace + with space
            return decodeURIComponent(pair[1].replace(/\+/g, ' '));
        }
    }
    return undefined;
}
