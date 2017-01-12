var bg = chrome.extension.getBackgroundPage();
var vimeo = bg.vimeo;
var app = bg.app;
var api = bg.api;
var currentTab = bg.currentTab;
var user = bg.user;
var ga = bg.ga;

var webApp = angular.module('downloadVideos', []);

webApp.controller('MainController', function ($scope, $interval, $sce) {
    $scope.motd = $sce.trustAsHtml(app.motd);
    $scope.videos = [];
    $scope.license = user.license;
    $scope.user = user;
    var tabs = document.querySelector('paper-tabs');

    $scope.selectMe= function($event){
        $event.target.select();
    };

    var translations = {};
    $scope.getMotdMessage = function () {
        return $sce.trustAsHtml($scope.getMessage(app.motd));
    };
    $scope.getMessage = function (text) {
        var replacer = new RegExp('[^a-zA-Z0-9_]', 'g');
        var key = text.replace(replacer, '_');
        var translation = chrome.i18n.getMessage(key);
        if (!translation) {
            translations[key] = {
                message: text,
                description: ""
            };
            //console.log(JSON.stringify(translations));
        }
        return translation || text;
    };


    $scope.refreshUser = function () {
        setTimeout(function(){
            window.location.reload(true);
        },500)
        app.reloadAll();
    };
    $scope.deleteMotd = function () {
        app.setMotd("");
        $scope.motd = $sce.trustAsHtml(app.motd);
    };

    $scope.downloadVideo = function (video) {
        console.log('video',video);
            app.download(video.video.id);
    };

    $scope.showPayment = function () {

        ga('send', 'pageview', 'popup/payments');
        $scope.payment = true;
        $scope.products = [];
        $scope.loadingProducts = true;
        $scope.cantLoadProducts = false;
        api.getData('product/list', {}, function (err, products) {
            $scope.loadingProducts = false;
            if (err) {
                $scope.cantLoadProducts = true;
            } else {
                $scope.products = products;
            }
        });
    };

    $scope.purchaseProduct = function (product) {
        ga('send', 'event', 'purchase', product.sku);
        app.openLink(api.url + 'buy/' + product.sku + '?userId=' + user.data._id);
    };

    $scope.filterThisTab = function () {
        ga('send', 'pageview', 'popup/current-tab');
        $scope.payment = false;
        $scope.videos = vimeo.filterByTab(currentTab.id);
    };

    $scope.openLink = function (url) {
        app.openLink(url);
    };
    $scope.getToken = function () {
        user.getToken();
    };

    $scope.filterAllTabs = function () {
        ga('send', 'pageview', 'popup/all-tabs');
        $scope.payment = false;
        $scope.videos = vimeo.videos;
    };
    $scope.removeVideo = function (video) {
        ga('send', 'event', 'video', 'remove', video.video.id);
        vimeo.removeVideo(video.video.id);
        if (tabs.selected == 'allTabs') {
            $scope.filterAllTabs();
        } else {
            $scope.filterThisTab();
        }
    };
    $scope.playVideo = function (video) {
        ga('send', 'event', 'video', 'play', video.video.id);
        app.playVideo(video.video.id);
    };

    if (!vimeo.filterByTab(currentTab.id).length && vimeo.videos.length) {
        tabs.selected = 'allTabs';
        $scope.filterAllTabs();
    } else {
        tabs.selected = 'currentTab';
        $scope.filterThisTab();
    }

    $interval(function () {
        $scope.videos;
    }, 1000);
});