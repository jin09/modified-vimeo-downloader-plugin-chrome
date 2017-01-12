var currentTab = function () {
    var id = 0;

    var checkForError = function () {
        if (chrome.runtime.lastError) {
            //console.log(chrome.runtime.lastError.message);
        } else {
            // Tab exists
        }
    };

    var showPageIcon = function (tabId) {
        chrome.pageAction.setTitle({tabId: tabId, title: "Download videos"});
        checkForError();
        chrome.pageAction.show(tabId);
        checkForError();
    };


    var init = function (next) {

        var firstTabOnStartup = function (next) {
            // on first start of app
            chrome.tabs.query({highlighted: true}, function (tabs) {
                if (tabs[0]) {
                    currentTab.id = tabs[0].id;
                    app.tabChanged();
                }
                next();
            });
        };

        var whenUserChangesTab = function (next) {
            chrome.tabs.onActivated.addListener(function (info) {
                currentTab.id = info.tabId;
                app.tabChanged();
            });
            next();
        };
        var whenTabReloads = function (next) {
            chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
                if (tab.highlighted) {
                    currentTab.id = tabId;
                    app.tabChanged();
                }
            });
            next();
        };

        async.series([firstTabOnStartup, whenUserChangesTab, whenTabReloads], function () {
            next();
        });
    };


    return {
        id: id,
        init: init,
        showPageIcon: showPageIcon
    }
}();