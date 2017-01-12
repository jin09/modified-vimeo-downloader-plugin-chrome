var editorExtensionId = document.currentScript.getAttribute("target");

var sentConfig = null;
var sendConfigToExtension = function (fullConfig) {
    var config = {};
    config.video = fullConfig.video;
    config.request = fullConfig.request;

    if (JSON.stringify(sentConfig) !== JSON.stringify(config)) {
        sentConfig = config;
        chrome.runtime.sendMessage(editorExtensionId, config, function (response) {
        });
    }
};
function jsonEx(str) {
    var starts = [];
    var ends = [];
    var jsons = [];
    var i, j;
    var lastIndex = -1;

    var len = str.length;
    for (i = 0; i < len; i++) {
        if (str[i] === "{") starts.push(i);
        if (str[i] === "}") ends.push(i);
    }

    for (i = 0; i < starts.length; i++) {
        var startIndex = starts[i];
        if (startIndex < lastIndex) {
            continue;
        }

        for (j = ends.length - 1; j >= 0; j--) {
            var endIndex = ends[j];
            var test = str.substring(startIndex, endIndex + 1);
            try {
                var json = JSON.parse(test);
                jsons.push(json);
                lastIndex = endIndex;
            } catch (e) {
            }
        }
    }

    return jsons;
}
// Try to parse config from page
var checkForScripts = function () {
    var scripts = document.getElementsByTagName('script');
    for (var i in scripts) {
        var script = scripts[i];
        if (typeof script.innerHTML != 'undefined') {
            var jsons = jsonEx(script.innerHTML);
            for (var j in jsons) {
                var jsonConfig = jsons[j];
                if (typeof jsonConfig.video !== 'undefined') {
                    sendConfigToExtension(jsonConfig);
                }
            }
        }
    }
};

var checkForVimeoClips = function () {
    try {
        if (vimeo && vimeo.clips) {
            for (let id in vimeo.clips) {
                if (vimeo.clips.hasOwnProperty(id)) {
                    sendConfigToExtension(vimeo.clips[id]);
                }
            }
        }
    } catch (e) {

    }
    setTimeout(function () {
        checkForVimeoClips();
    }, 1000);
}

var checkForPlayManagers = function () {
// is any player manager there?
    if (typeof PlayerManager !== 'undefined') {
        var players = document.getElementsByClassName('player');
        for (var i = 0; i < players.length; i++) {
            try {
                var player = PlayerManager.getPlayer(players[i]);
                if (player.config) {
                    sendConfigToExtension(player.config);
                } else {
                    player.ready(function () {
                        sendConfigToExtension(this.config);
                    });
                }
            } catch (e) {
                // :(
            }
        }
        setTimeout(function () {
            checkForPlayManagers();
        }, 1000);
    }
};


checkForScripts();

checkForPlayManagers();

checkForVimeoClips();
