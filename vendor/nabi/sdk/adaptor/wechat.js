
function getAppIdSync() {
    var getAppInfo = wx.getAccountInfoSync;
    return (getAppInfo && getAppInfo().miniProgram.appId);
};

function getSystemInfoSync() {
    var si = wx.getSystemInfoSync();
    return {
        model: si.model,
        brand: si.brand || "",
        battery: si.batteryLevel || -1,
        pixel: si.windowHeight + "x" + si.windowWidth + "x" + si.pixelRatio,
        app: "wechat",
        ver: si.version + "/" + (si.SDKVersion || "?"),
        os: si.platform + "/" + si.system,
        font: si.fontSizeSetting,
        lang: si.language,
        tzone: -(new Date).getTimezoneOffset() / 60,
    };
};

function getSdkVersion() {
    var si = {};
    try {
        si = wx.getSystemInfoSync();
    } catch (ex) {
    }
    return si.SDKVersion || "0.0.0";
};

module.exports = {
    request: wx.request,
    getStorageSync: wx.getStorageSync,
    getStorage: wx.getStorage,
    setStorage: wx.setStorage,
    getSystemInfoSync: getSystemInfoSync,
    getLocation: wx.getLocation,
    getNetworkType: wx.getNetworkType,
    getSetting: wx.getSetting,
    getAppIdSync: getAppIdSync,
    sdkVersion: getSdkVersion(),
    uploadFile: wx.uploadFile,
    login: wx.login,
    checkSession: wx.checkSession,
    getSetting: wx.getSetting,
};
