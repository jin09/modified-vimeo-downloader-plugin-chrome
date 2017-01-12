var app = function () {
    var motd = "";
    var init = function () {
        ga('create', 'UA-56553110-3', 'auto');
        ga('set', 'checkProtocolTask', function () {
        });
        ga('send', 'pageview', 'background');
        async.series([settings.init, api.init, user.init, gcm.init, currentTab.init, vimeo.init, app.initMotd], function (err) {
            if (err) {
                ga('send', 'event', 'load', 'error');
            } else {
                ga('send', 'event', 'load', 'success');
            }
        });
    };

    var setMotd = function (value) {
        app.motd = value;
        chrome.storage.local.set({motd: value});
    };

    var initMotd = function (next) {
        chrome.storage.local.get("motd", function (result) {
            app.motd = result["motd"] || "";
            next();
        });
    };

    var reloadAll = function () {
        chrome.storage.local.clear(function () {
            chrome.runtime.reload();
        });
    };

    var openLink = function (url) {
        var options = {
            url: url
        };
        chrome.tabs.create(options);
    };

    var tabChanged = function () {
        var hasVideos = vimeo.filterByTab(currentTab.id);
        if (hasVideos.length || app.motd.length) {
            currentTab.showPageIcon(currentTab.id);
        }
    };
    var playVideo = function (videoId) {
        var video = vimeo.filterById(videoId);
        chrome.downloads.show(video.downloadId);
    };

    var download = function (videoId) {
        ga('send', 'event', 'download', 'try', videoId);
        var video = vimeo.filterById(videoId);

        var url = video.downloadURL;
        var extension = video.downloadExtension;


        if (url.length) {
            ga('send', 'event', 'download', 'found_url', videoId);
            var videoTitle = video.video.title.replace(/[^a-z0-9_\-]/gi, ' ');
            videoTitle = videoTitle.replace(/ /g,'_');
            var options = {};
            options.url = url;
            options.filename = videoTitle + extension;
            options.conflictAction = 'prompt';
            console.log(options.filename);
            chrome.downloads.download(options, function _downloadStarted(downloadId) {
                video.downloadId = downloadId;
            });
        } else {
            ga('send', 'event', 'download', 'no_url', videoId);
        }
    };

    var downloadChanged = function (downloadDelta) {
        var video = vimeo.filterByDownloadId(downloadDelta.id);
        if (video) {
            if(downloadDelta.state && downloadDelta.state.current === 'interrupted'){
                app.setMotd("Problems downloading full video? Use a <a target='_blank' href='https://sourceforge.net/projects/sddl/'>download manager</a> with the video URL.");
            }
            video.download = downloadDelta; //.state.current: in_progress,interrupted,complete
        }
    };
    chrome.downloads.onChanged.addListener(downloadChanged);

    return {
        init: init,
        setMotd: setMotd,
        initMotd: initMotd,
        motd: motd,
        openLink: openLink,
        reloadAll: reloadAll,
        tabChanged: tabChanged,
        playVideo: playVideo,
        download: download
    }
}();