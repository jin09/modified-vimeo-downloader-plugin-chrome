var user = function () {
    var data = null;
    var license = null;

    chrome.identity.onSignInChanged.addListener(function () {
        chrome.storage.local.clear(function () {
            chrome.runtime.reload();
        });
    });

    var getInfo = function (callback) {
        chrome.identity.getProfileUserInfo(function (info) {
            if (callback instanceof Function) {
                callback(info);
            }
        });
    };
    var getLicenseFromApi = function (callback) {
        api.getData('user/license', null, function (err, data) {
            if (err) {
                if (err.message === 'USR_NOT_FOUND') {

                }
                data = _.merge(data, {
                    expired: false
                });
                callback(err, data);
            } else {
                chrome.storage.local.set({'userLicense': data}, function () {
                    try {
                        if (_.isString(data.license.valid.until)) {
                            data.license.valid.until = new Date(data.license.valid.until);
                        }
                        if (_.isString(data.timestamp)) {
                            data.timestamp = new Date(data.timestamp);
                        }
                    } catch (e) {
                        // oh, well
                    }
                    callback(null, data);
                });
            }
        });
    };

    var getLicenseFromCache = function (callback) {
        chrome.storage.local.get("userLicense", function (result) {
            if (result["userLicense"]) {
                var data = result["userLicense"];
                try {
                    if (_.isString(data.license.valid.until)) {
                        data.license.valid.until = new Date(data.license.valid.until);
                    }
                    if (_.isString(data.timestamp)) {
                        data.timestamp = new Date(data.timestamp);
                    }
                } catch (e) {
                    // oh, well
                }
                callback(null, data);
            } else {
                callback(new Error("no data"));
            }
        });
    };

    var getLicense = function (callback) {
        getLicenseFromCache(function (err, data) {
            if (err) {
                getLicenseFromApi(function (err, data) {
                    callback(err, data);
                });
            } else {
                callback(err, data);
            }
        });
    };

    var refreshUserLicense = function (next) {
        if (!user.data) {
            user.license = {expired: false};
            return next();
        }
        getLicenseFromCache(function (err, license) {
            user.license = license;
            var dateComp = new Date();
            dateComp.setDate(dateComp.getDate() - 2);// let user 2 days without license data
            // force user license refresh
            if (!_.isObject(license) || _.isUndefined(license.timestamp) || license.timestamp < dateComp) {
                ga('send', 'event', 'license', 'timeout', 'expired');
                chrome.storage.local.remove("userLicense", function () {
                    getLicenseFromApi(function (err, data) {
                        if (data.serverError) {
                            ga('send', 'event', 'license', 'timeout', 'got_server_err');
                        } else {
                            user.license = data;
                        }
                        next();
                    });
                });
            } else {
                // keep license updated just in case
                getLicenseFromApi(function (err, data) {
                    if (!data.serverError) {
                        user.license = data;
                    } else {
                        ga('send', 'event', 'license', 'still_valid', 'got_server_err');
                    }
                    next();
                });
            }
        });
    };

    var getUserDataFromApi = function (next) {
        getInfo(function (info) {
            api.postData('user/register', info, function (err, userData) {
                if (!err) {
                    user.data = userData;
                    chrome.storage.local.set({'userData': userData}, function () {
                        next();
                    });
                } else {
                    if (err.message) {
                        app.setMotd(err.message);
                    }
                    next();
                }
            });
        });
    };

    var getUserData = function (next) {
        chrome.storage.local.get("userData", function (result) {
            if (result["userData"]) {
                user.data = result["userData"];
                return next();
            } else {
                getUserDataFromApi(next);
            }
        });
    };

    var init = function (next) {
        async.series([getUserData, refreshUserLicense], next);
    };

    return {
        init: init,
        data: data,
        license: license,
        getLicense: getLicense,
        getLicenseFromApi: getLicenseFromApi,
        getUserDataFromApi: getUserDataFromApi,
        getInfo: getInfo
    }
}();