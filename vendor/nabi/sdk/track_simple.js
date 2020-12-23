// Tracking基础上报模块

var ctx = null,
    uuidName = "_jax_uuid",
    userInfoName = "_jax_userinfo",
    appTrackId = "",
    appVersion = "",
    userGuid = "",
    trackPrefix = "",
    sdkVersion = "5.0.1";


var trackEvent = function(name, param) {
    return sendRequest(trackPrefix + "/event", {
        event: name || "",
        param: param || {}}, 0);
};

var trackUser = function(systemInfo, userInfo) {
    return sendRequest(trackPrefix + "/user", {
        sys: systemInfo,
        user: userInfo || {}}, 1);
};

var trackLink = function(linkInfo) {
    return sendRequest(trackPrefix + "/link", linkInfo, 2);
};

var sendRequest = function(trackUrl, data, maxRetry) {
    var body = JSON.stringify({
        time: Date.now(),
        uuid: getUuid(),
        tid: appTrackId,
        app: appVersion,
        data: data,
        sdk: sdkVersion
    });
    var retryCount = 0, retryWait = 250;
    function trySend() {
        ctx.request({
            url: trackUrl,
            data: body,
            header: {'Content-Type': 'application/json'},
            method: "POST",
            success: function(e) {
            },
            fail: function() {
                if (retryCount < maxRetry) {
                    ++retryCount;
                    retryWait *= 2;
                    setTimeout(trySend, retryWait);
                }
            },
        });
    };
    trySend();
};

var getStorage = function(e) {
    try {
        return ctx.getStorageSync(e) || "";
    } catch(e) {
        return "";
    }
};

var setStorage = function(e, t) {
    ctx.setStorage({
        key: e,
        data: t,
        fail: function(res) {
            console.error('异步设置Storage失败：', res);
        }
    });
};

var newUuid = function() {
    var tick = parseInt(Date.now() / 1000),
        max = 1e+9,
        rand = parseInt((1+Math.random()) * max);
    return tick.toString(16) + rand.toString(16);
};

var getUuid = function() {
    if (userGuid) return userGuid;

    userGuid = getStorage(uuidName);
    if (!userGuid) {
        userGuid = newUuid();
        setStorage(uuidName, userGuid);
    }
    return userGuid;
};

var gUserInfoBySet = null;

function obtainUserInfo(thisApp) {
    return gUserInfoBySet || 
           (thisApp.jaxCampaign && thisApp.jaxCampaign.userInfo) ||
           (thisApp.globalData && thisApp.globalData.userInfo) ||
           getStorage(userInfoName);
};

function getAndSendInfo(thisApp, gps, userInfo) {
    var systemInfo = ctx.getSystemInfoSync();
    userInfo = userInfo || obtainUserInfo(thisApp);

    var sendUserInfo = function() {
        if (typeof userInfo == "object" || !userInfo) {
            return trackUser(systemInfo, userInfo);
        }
        var func = thisApp.getUserInfo || function(cb) {
        	ctx.getUserInfo({
        		success: function(res) { cb(res.userInfo); },
        	    fail: function() { cb({}); }
        	});
        };
        func.call(thisApp, function(info) {
            trackUser(systemInfo, info);
        });
    };

    var getLocations = function() {
        if (!gps) {
            return sendUserInfo();
        }
        ctx.getLocation({
            type: (typeof gps == "string" ? gps : "gcj02"),
            success: function(t) {
                systemInfo.gps = [t.latitude, t.longitude, t.speed || -1];
            },
            complete: sendUserInfo
        });
    };

    var getNetwork = function() {
        ctx.getNetworkType({
            success: function(e) {
                systemInfo.network = e.networkType;
            },
            complete: getLocations
        });
    };

    // getSetting => getNetwork => getLocations => getUserInfo
    if ((!gps || !userInfo) && ctx.getSetting) {
        ctx.getSetting({
            success: function(res) {
                var s = res.authSetting;
                if (s) {
                    gps = (gps || s['scope.userLocation']);
                    userInfo = (userInfo || s["scope.userInfo"]);
                }
            },
            complete: getNetwork
        });
    } else {
        getNetwork();
    }

    return userInfo;
};

function initSdk(appid, appver, extra) {
    var thisApp = this,
        prefix = "https://track.jaxcx.com",
        gps = null,
        appType = "";
    if ("object" == typeof extra && extra) {
        extra.prefix && (prefix = extra.prefix);
        extra.gps && (gps = extra.gps);
        extra.appType && (appType = extra.appType);
        extra.appId && (appTrackId = extra.appId);
    }

    if (appType == "uniapp" || (!appType && "object" == typeof uni && uni && "function" == typeof uni.getSystemInfo)) {
        ctx = require("./adaptor/uniapp.js");
        trackPrefix = prefix + (("object"==typeof wx && wx && "/wxmp") || ("object"==typeof my && my && "/alimp") || "/unimp");
    } else if (appType == "wechat" || (!appType && "object" == typeof wx && wx && "function" == typeof wx.getSystemInfo)) {
        ctx = require("./adaptor/wechat.js");
        trackPrefix = prefix + "/wxmp";
    } else if (appType == "alipay" || (!appType && "object" == typeof my && my && "function" == typeof my.getSystemInfo)) {
        ctx = require("./adaptor/alipay.js");
        trackPrefix = prefix + "/alimp";
    } else if (appType == "iot" || (!appType && "object" == typeof my && my && "function" == typeof my.getSystemInfo)) {
        ctx = require("./adaptor/iot.js");
        trackPrefix = prefix + "/wxmp";
    }
    else {
        console.error("不支持的appType或小程序平台", extra);
        return "";
    }

    appVersion = appver;
    if (!appTrackId) {
        appTrackId = ctx.getAppIdSync() || appid;
    }

    thisApp.jaxTrack = function(name, param) {
        var userInfo = obtainUserInfo(thisApp);
        if (userInfo && typeof userInfo == "object" && typeof param == "object") {
            param = param || {};
            param.ids = [userInfo.openId || userInfo.user_id || "", userInfo.unionId || ""];
        }
        return trackEvent(name, param);
    };
    thisApp.jaxSetLink = function(linkInfo) {
        var link = (typeof linkInfo == "object" && linkInfo) || {};
        var userInfo = obtainUserInfo(thisApp);
        if (userInfo && typeof userInfo == "object") {
            if (!link.openid && userInfo.openId) link.openid = userInfo.openId;
            if (!link.unionid && userInfo.unionId) link.unionid = userInfo.unionId;
            if (!link.user_id && userInfo.user_id) link.user_id = userInfo.user_id;
        }
        return trackLink(link);
    }
    thisApp.jaxSetInfo = function(user_info) {
        if (user_info && typeof user_info == "object" && (user_info.openId || user_info.user_id)) {
            gUserInfoBySet = user_info;
            setStorage(userInfoName, user_info);
        }
        return getAndSendInfo(thisApp, gps, user_info);
    };

    return appTrackId;
}

module.exports = {
    initSdk: initSdk,
    newUuid: newUuid,
    getUuid: getUuid,
    getAppInfo: function() {
        return {appId: appTrackId, appVer: appVersion};
    },
};

