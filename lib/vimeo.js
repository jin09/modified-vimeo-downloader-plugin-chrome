var vimeo = function () {
    var videos = [];
    var processConfig = function (config, info) {
        config.tabId = info.tab.id;

        currentTab.showPageIcon(info.tab.id);
        if (typeof filterById(config.video.id) === 'undefined') {
            var urls = {
                fullhd: null,
                hd: null,
                sd: null,
                mobile: null,
                flv_hd: null,
                flv_sd: null,
                flv_mobile: null
            };
            var tryOrder = ["fullhd", "hd", "sd", "mobile", "flv_hd", "flv_sd", "flv_mobile"];

            var video = config;
            if (video.request.files.progressive !== undefined && video.request.files.progressive.length) {
                for (var i in video.request.files.progressive) {
                    try {
                        var f = video.request.files.progressive[i];
                        /*if (f.quality === "1080p") {
                            urls.fullhd = f.url;
                        }
                        else if (f.quality === "720p") {
                            urls.hd = f.url;
                        }
                        else if (f.quality === "480p") {
                            urls.sd = f.url;
                        }
                        else*/ if (f.quality === "360p") {
                            urls.mobile = f.url;
                        }
                        else if (f.quality === "240p") {
                            urls.flv_hd = f.url;
                        }
                        else if (f.quality === "144p") {
                            urls.flv_sd = f.url;
                        }
                    } catch (e) {
                    }
                }
            } else {
                try {
                    urls.hd = video.request.files.h264.hd.url;
                } catch (e) {
                }
                try {
                    urls.sd = video.request.files.h264.sd.url;
                } catch (e) {
                }
                try {
                    urls.mobile = video.request.files.h264.mobile.url;
                } catch (e) {
                }
                try {
                    urls.flv_hd = video.request.files.vp6.hd.url;
                } catch (e) {
                }
                try {
                    urls.flv_sd = video.request.files.vp6.sd.url;
                } catch (e) {
                }
                try {
                    urls.flv_mobile = video.request.files.vp6.mobile.url;
                } catch (e) {
                }
            }

            var url = "";
            var extension = ".mp4";
            _.forEach(tryOrder, function (quality) {
                if (_.isString(urls[quality]) && urls[quality].length) {
                    url = urls[quality];
                    var isFLV = new RegExp('flv');
                    if (isFLV.test(quality)) {
                        extension = ".flv";
                    }
                    ga('send', 'event', 'download', 'quality', quality);
                    return false;
                }
            });

            config.downloadURL = url;
            config.downloadExtension = extension;

            vimeo.videos.push(config);
        }
    };

    var init = function (next) {
        chrome.runtime.onMessageExternal.addListener(processConfig);
        next();
    };

    var filterById = function (videoId) {
        return _.find(vimeo.videos, {
            video: {
                id: videoId
            }
        });
    };

    var rejectById = function (videoId) {
        return _.reject(vimeo.videos, {
            video: {
                id: videoId
            }
        });
    };
    var removeVideo = function (videoId) {
        vimeo.videos = _.reject(vimeo.videos, {
            video: {
                id: videoId
            }
        });
    };

    var filterByTab = function (tabId) {
        return _.filter(vimeo.videos, {
            tabId: tabId
        });
    };
    var filterByDownloadId = function (downloadId) {
        return _.find(vimeo.videos, {
            downloadId: downloadId
        });
    };

    return {
        init: init,
        videos: videos,
        filterByTab: filterByTab,
        filterById: filterById,
        filterByDownloadId: filterByDownloadId,
        removeVideo: removeVideo
    }
}();