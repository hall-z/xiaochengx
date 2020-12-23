var $cmn = require("./common.js");
var $mkt = require("./marketing.js");

var glob = {
    appId: "wx000000000000",
    appVer: "0.0.0",
    trial: true,
    trialPrefix: "https://dolphin.jaxcx.com/trial",
    releasePrefix: "https://dolphin.jaxcx.com/micro",
    cdnTrial: "https://dolphin.jaxcx.com",
    cdnRelease: "https://t.jaxcx.com/dolphin",
    flyerBase: "",
    trackBase: "",
    api: {
        loginSession: "/common/{appid}/login_session",
        decryptInfo: "/common/{appid}/decrypt_info",
        reportInfo: "/common/{appid}/report_info",
        submitFormId: "/common/{appid}/submit_formid",
        sendFeedback: "/common/{appid}/send_feedback",
    },
};

var getPrefix = function() {
    return glob.trial ? glob.trialPrefix : glob.releasePrefix;
};

var removeSlash = function(prefix) {
    return prefix.replace(/\/+$/gm,'');
};

var login_url = "";
var decrypt_url = "";
var submit_url = "";
var feedback_url = "";

function getUrl(alias) {
    if (alias.toLowerCase().indexOf("http") == 0) return alias;
    var path = glob.api[alias] || alias;
    var fixed = (path[0] == "/" ? "" : "/") + path;
    return getPrefix() + fixed.replace("{appid}", glob.appId);
};

function setup(conf) {
    if (conf && typeof conf == "object") {
        var getAccInfo = wx.getAccountInfoSync;
        var appId = (getAccInfo && getAccInfo().miniProgram.appId) || conf.appId;
        var api = $cmn.extend(glob.api, conf.api || {});
        $cmn.extend(glob, conf, {appId, api});
        glob.trialPrefix = removeSlash(glob.trialPrefix);
        glob.releasePrefix = removeSlash(glob.releasePrefix);
        glob.cdnTrial = removeSlash(glob.cdnTrial);
        glob.cdnRelease = removeSlash(glob.cdnRelease);
        login_url = getUrl("loginSession");
        decrypt_url = getUrl("decryptInfo");
        submit_url = getUrl("submitFormId");
        feedback_url = getUrl("sendFeedback");
        return glob;
    }
    console.error("错误的配置对象：", conf);
};

module.exports = $cmn.extend({}, $cmn, {
    enableTrack: function(obj) {
        var $track = require("./track_auto.js");
        var extra = (typeof obj == "object" && obj) || {};
        extra.prefix = glob.trackBase || getPrefix();
        $track.config(glob.appId, glob.appVer, extra);
    },
    renewCampaign: function(options) {
        var debug = glob.flyerBase ? (!!glob.trial) : getPrefix();
        $mkt.renew.call(this, glob.appId, options, debug, {
            login: glob.api.loginSession,
            decrypt: glob.api.decryptInfo,
            report: glob.api.reportInfo,
            submit: glob.api.submitFormId,
            feedback: glob.api.sendFeedback,
            remote_base: glob.flyerBase,
        });
    },
    startCampaign: function(userInfo, extraParam) {
        $mkt.start.call(this, userInfo, extraParam);
    },
    getUrl: getUrl,
    setup: setup,
    login: function(renew) {
        return $cmn.login.call(this, glob.appId, login_url, !!renew);
    },
    getUserInfo: function() {
        return $cmn.getUserInfo.call(this, glob.appId, decrypt_url);
    },
    submitFormId: function(event, eventName) {
        return $cmn.submitFormId.call(this, event, eventName, glob.appId, submit_url);
    },
    sendFeedback: function(cardList, eventName) {
        return $cmn.sendFeedback.call(this, cardList, eventName, glob.appId, feedback_url);
    },
    decrypt: function(data) {
        return $cmn.fastRequest.call(this, decrypt_url, data);
    },
    cdnFor: function(path) {
        var cdn = (glob.trial ? glob.cdnTrial : glob.cdnRelease);
        return cdn + ((path && path[0] == "/") ? path : "/" + path);
    },
    isTrial: function() {
        return !!glob.trial;
    },
    makeGet: function(alias, obj, headers) {
        return $cmn.makeRequest.call(this, getUrl(alias), obj, 1, headers);
    },
    makePost: function(alias, obj, headers) {
        return $cmn.makeRequest.call(this, getUrl(alias), obj, 0, headers);
    },
    safeGet: function(alias, obj, headers) {
        return $cmn.safeRequest.call(this, getUrl(alias), obj, 1, headers, glob.appId, login_url);
    },
    safePost: function(alias, obj, headers) {
        return $cmn.safeRequest.call(this, getUrl(alias), obj, 0, headers, glob.appId, login_url);
    },
    makeUpload: function(alias, filePath, name, obj, headers) {
        return $cmn.makeUpload.call(this, getUrl(alias), filePath, name, obj, headers);
    },
    safeUpload: function(alias, filePath, name, obj, headers) {
        return $cmn.safeUpload.call(this, getUrl(alias), filePath, name, obj, headers, glob.appId, login_url);
    },
});

