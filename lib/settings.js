var settings = function () {
    var data = {};

    var init = function (next) {

        var request = new XMLHttpRequest();
        request.onreadystatechange = function (event) {
            if (request.readyState == 4) {
                data = JSON.parse(request.responseText);
                api.url = data.API_URL;
                next();
            }
        };
        request.open("GET", chrome.extension.getURL('/settings.json'), true);
        request.send();
    };

    return {
        init: init,
        data: data
    }
}();