

function parseBattery(b) {
    try {
        return (typeof b == "number" ? b : parseInt(b.split("%")[0]));
    } catch (e) {
        return -1;
    }
}

function getSystemInfoSync() {
    var si = uni.getSystemInfoSync();
    return {
        model: si.model,
        brand: si.brand || "",
        battery: parseBattery(si.batteryLevel || si.currentBattery) || -1,
        pixel: si.windowHeight + "x" + si.windowWidth + "x" + si.pixelRatio,
        app: si.app || si.appName || si.AppPlatform || si.host,
        ver: si.version + "/" + getSdkVersion(si),
        os: si.platform + "/" + si.system,
        font: si.fontSizeSetting,
        lang: si.language,
        tzone: -(new Date).getTimezoneOffset() / 60,
    };
};

function getAppIdSync() {
// #ifdef MP-WEIXIN
    var getAppInfo = wx.getAccountInfoSync;
    return (getAppInfo && getAppInfo().miniProgram.appId);
// #endif
// #ifdef MP-ALIPAY
    var getAppId = my.getAppIdSync;
    return (getAppId && getAppId().appId);
// #endif
// #ifdef MP-BAIDU
    var getEnv = swan.getEnvInfoSync;
    return (getEnv && getEnv().appKey);
// #endif
};

function getSdkVersion(si) {
// #ifdef MP-ALIPAY
    return my.SDKVersion || "?";
// #endif
// #ifndef MP-ALIPAY
    try {
        var tmp = (si || uni.getSystemInfoSync());
        return tmp.SDKVersion || "?";
    } catch (ex) {
        return "0.0.0";
    }
// #endif
};

module.exports = {
    request: uni.request,
    getStorageSync: uni.getStorageSync,
    getStorage: uni.getStorage,
    setStorage: uni.setStorage,
    getSystemInfoSync: getSystemInfoSync,
    getLocation: uni.getLocation,
    getNetworkType: uni.getNetworkType,
    getSetting: uni.getSetting,
    getAppIdSync: getAppIdSync,
    sdkVersion: getSdkVersion(),
};

