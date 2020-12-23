
function getStorageSync(key) {
    return my.getStorageSync({key: key}).data;
};

function sendRequest(obj) {
    var header = null;
    var tmp = {};
    for (var attr in obj) {
        if (!obj.hasOwnProperty(attr)) continue;
        if (attr == "header" || attr == "headers") {
            header = obj[attr];
        } else {
            tmp[attr] = obj[attr];
        }
    }
    if (my.canIUse("request")) {
        if (header) tmp.headers = header;
        my.request(tmp);
    } else {
        tmp.headers = header || {'content-type': 'application/json'};
        my.httpRequest(tmp);
    }
};

function parseBattery(b) {
    try {
        return (typeof b == "number" ? b : parseInt(b.split("%")[0]));
    } catch (e) {
        return -1;
    }
}

function getSystemInfoSync() {
    var si = my.getSystemInfoSync();
    return {
        model: si.model,
        brand: si.brand || "",
        battery: parseBattery(si.currentBattery),
        pixel: si.windowHeight + "x" + si.windowWidth + "x" + si.pixelRatio,
        app: si.app,
        ver: si.version + "/" + (my.SDKVersion || "?"),
        os: si.platform + "/" + si.system,
        font: si.fontSizeSetting,
        lang: si.language,
        tzone: -(new Date).getTimezoneOffset() / 60,
    };
};

function getAppIdSync() {
    var getAppId = my.getAppIdSync;
    return (getAppId && getAppId().appId);
};

function getSysProp() {
    return my.ix.getSysPropSync({key: 'ro.serialno'}).value;
};


module.exports = {
    request: sendRequest,
    getStorageSync: getStorageSync,
    getStorage: my.getStorage,
    setStorage: my.setStorage,
    getSystemInfoSync: getSystemInfoSync,
    getLocation: my.getLocation,
    getNetworkType: my.getNetworkType,
    getSetting: my.getSetting,
    getAppIdSync: getAppIdSync,
    sdkVersion: my.SDKVersion || "0.0.0",
    uploadFile: my.uploadFile,
    login: my.login,
    checkSession: my.checkSession,
    getSysProp: getSysProp,
};
