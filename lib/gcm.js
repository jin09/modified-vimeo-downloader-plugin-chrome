var gcm = function () {
    var projectId = "445822693278";

    var init = function (next) {
        chrome.storage.local.get("registered", function (result) {
            // If already registered, bail out.
            if (result["registered"]) {
                return next();
            }

            chrome.gcm.register([projectId], function (registrationId) {
                if (chrome.runtime.lastError) {
                    return next();
                }
                api.postData('gcm/register', {registrationId: registrationId}, function (err, succeed) {
                    if (!err) {
                        chrome.storage.local.set({registered: true});
                    }
                    next();
                });
            });
        });

        chrome.gcm.onMessage.addListener(function (message) {
            if (message.collapseKey === 'motd') {
                app.setMotd(message.data.message);
            } else if (message.collapseKey === 'refreshLicense') {
                user.getLicenseFromApi(function (err, data) {
                    user.license = data;
                });
            }
            currentTab.showPageIcon(currentTab.id);
        });
    };

    return {
        init: init
    }
}();