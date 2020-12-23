var $u = require("./neo_utils.js");

var ERR_LOGIN_FAILED=7001,
    ERR_GET_SETTING=7002,
    ERR_GET_USER_INFO=7003,
    ERR_LOGIN_SESSION_NOT_RECEIVED=7004,
    ERR_REQUEST_FAILED=7005,
    ERR_REQUEST_SERVER=7006,
    ERR_GET_LOCATION=7007,
    ERR_GET_SYSTEMINFO=7008,
    ERR_READ_SESSION_ID=7009,
    ERR_USER_INFO_NO_AUTH=7010;


var mySessionInfo = null;

function makeRequest(target_url, obj, is_get, extra_header) {
    var that = this;
    return new Promise(function(resolve, reject) {
        var req = is_get ? {
            header: {'Content-Type': 'text/plain'},
            url: $u.mergeUrl(target_url, obj),
            method: "GET",
        } : {
            header: {'Content-Type': 'application/json'},
            url: target_url,
            data: JSON.stringify(obj || {}),
            method: "POST",
        };
        extra_header && $u.extend(req.header, extra_header);

        var sid = (mySessionInfo && mySessionInfo.sessionId);
        if (sid) req.header["X-EACH-SESSION-ID"] = sid;

        wx.request($u.extend(req, {
            success: function(res) {
                var status = res.statusCode || res.status;
                if (status == 200) {
                    resolve.call(that, res.data);
                } else {
                    $u.handleError.call(that, reject, {req, res}, ERR_REQUEST_SERVER, '请求错误(' + status + ')，请重试!');
                }
            },
            fail: function(res) {
                $u.handleError.call(that, reject, {req, res}, ERR_REQUEST_FAILED, '请检查网络连通性');
            }
        }));
    });
};

function fastRequest(target_url, obj, is_get, extra_header) {
    var that = this;
    if (!mySessionInfo) {
        return Promise.reject({method: "fastRequest", msg: "sessionId未准备好"});
    }
    return new Promise(function(resolve, reject) {
        function success_(result) {
            if (result && typeof result == "object") {
                if (typeof result.code == "number" && result.code < 0) {
                    mySessionInfo = null;
                    return reject.call(that, result);
                }
                return resolve.call(that, result);
            }
        };
        makeRequest.call(that, target_url, obj, is_get, extra_header).then(success_).catch(reject);
    });
};

function makeUpload(target_url, filePath, name, obj, extra_header) {
    var that = this;
    return new Promise(function (resolve, reject) {
        var req = {
            url: target_url,
            name : name,
            filePath: filePath,
            header: {},
            formData: JSON.stringify(obj || {}),
        };
        extra_header && $u.extend(req.header, extra_header);

        var sid = (mySessionInfo && mySessionInfo.sessionId);
        if (sid) req.header["X-EACH-SESSION-ID"] = sid;

        wx.uploadFile($u.extend(req, {
            success: function(res) {
                var status = res.statusCode || res.status;
                if (status == 200) {
                    try {
                       resolve.call(that, JSON.parse(res.data));
                    } catch(err){
                       $u.handleError.call(that, reject, {req, res}, ERR_REQUEST_SERVER, '返回类型错误(' + res.data + ')，请重试!');
                    }
                } else {
                    $u.handleError.call(that, reject, {req, res}, ERR_REQUEST_SERVER, '请求错误(' + status + ')，请重试!');
                }
            },
            fail: function (res) {
                $u.handleError.call(that, reject, {req, res}, ERR_REQUEST_FAILED, '请检查您的网络连通性');
            }
      }));
    });
};


function _safePromise(that, doRequest, appid, login_url) {
    return new Promise(function(resolve, reject) {
        function success_(result) {
            if (mySessionInfo) return resolve.call(that, result);
            _safeLogin.call(that, appid, login_url, 1).then(doRequest).then(resolve).catch(reject);
        };
        _safeLogin.call(that, appid, login_url, 0).then(
            function(updated) {
                doRequest().then(updated ? resolve : success_).catch(success_);
            }).catch(reject);
    });
};

function safeRequest(target_url, obj, is_get, extra_header, appid, login_url) {
    var that = this;
    var doRequest = function() {
        return fastRequest.call(that, target_url, obj, is_get, extra_header);
    };
    return _safePromise(that, doRequest, appid, login_url);
};

function safeUpload(target_url, filePath, name, obj, extra_header, appid, login_url) {
    var that = this;
    var doRequest = function() {
        return makeUpload.call(that, target_url, filePath, name, obj, extra_header);
    };
    return _safePromise(that, doRequest, appid, login_url);
};


function login(appid, login_url, renew) {
    var that = this;

    var makeLogin = function() {
        return new Promise(function(resolve_, reject_) {
            wx.login({
                success: function(loginResult) {
                    if (!loginResult.code) {
                        $u.handleError.call(that, reject_, loginResult, ERR_LOGIN_FAILED, '获取code失败，请检查网络状态');
                    } else {
                        resolve_.call(that, loginResult.code);
                    }
                },
                fail: function(loginError) {
                    $u.handleError.call(that, reject_, loginError, ERR_LOGIN_FAILED, '微信登录失败，请检查网络状态');
                },
            });
        });
    };

    var updateSession = function(code) {
        var obj = {appid, code};
        return makeRequest.call(that, login_url, obj, 0);
    };

    return new Promise(function(resolve, reject) {
        var finish_ = function(result) {
            if (result && typeof result == "object" && result.code === 0) {
                var tmp = result.data;
                if (tmp && typeof tmp == "object" && tmp.sessionId) {
                    mySessionInfo = tmp;
                    return resolve.call(that, true); // updated!
                }
                $u.handleError.call(that, reject, result, ERR_READ_SESSION_ID, '无法获取SESSION-ID');
            } else {
                $u.handleError.call(that, reject, result, ERR_LOGIN_SESSION_NOT_RECEIVED, '解析SESSION失败');
            }
        };
        var update_ = function() {
            mySessionInfo = null;
            makeLogin().then(updateSession).then(finish_).catch(reject);
        };
        if (!mySessionInfo || renew) return update_();

        wx.checkSession({
            success: function() {
                return resolve.call(that, false);
            },
            fail: update_,
        });
    });
};


var _checkAuth = function(that, scope_key) {
    return new Promise(function(resolve_, reject_) {
        if (wx.getSetting) {
            wx.getSetting({
                success: function(res) {
                    if (res && res.authSetting && res.authSetting[scope_key]) {
                        resolve_.call(that);
                    } else {
                        $u.handleError.call(that, reject_, res, ERR_USER_INFO_NO_AUTH, '检查authSetting时userInfo未就绪');
                    }
                },
                fail: function(res) {
                    $u.handleError.call(that, reject_, res, ERR_GET_SETTING, '获取授权配置失败！');
                },
            });
        } else {
            resolve_.call(that);
        }
    });
};


var myUserInfo = {};

function getUserInfo(appid, decrypt_url) {
    var that = this;

    var obtainInfo = function() {
        return new Promise(function(resolve_, reject_) {
            wx.getUserInfo({
                withCredentials: true,
                success: function(userResult) {
                    var obj = $u.extend({appid, openType: "getUserInfo"}, userResult);
                    if (!obj.userInfo) {
                        $u.handleError.call(that, reject_, userResult, ERR_GET_USER_INFO, '丢失用户信息userInfo');
                    } else if (!obj.iv) {
                        $u.handleError.call(that, reject_, userResult, ERR_GET_USER_INFO, "getUserInfo无法读取iv");
                    } else {
                        myUserInfo = obj.userInfo;
                        delete obj.userInfo;
                        obj.errMsg && delete obj.errMsg;
                        resolve_.call(that, obj);
                    }
                },
                fail: function(userError) {
                    $u.handleError.call(that, reject_, userError, ERR_GET_USER_INFO, '获取微信用户信息失败，请检查网络状态');
                },
            });
        });
    };

    function doDecrypt(obj) {
        return fastRequest.call(that, decrypt_url, obj, 0);
    };

    var almostReady = function(result) {
        return new Promise(function(resolve_, reject_) {
            if (result && typeof result == "object" && result.code === 0 && result.data && typeof result.data == "object") {
                $u.extend(myUserInfo, result.data);
                if (result.data.sessionId) {
                    mySessionInfo = result.data;
                    delete myUserInfo.sessionId;
                }
                resolve_.call(that, myUserInfo);
            } else {
                $u.handleError.call(that, reject_, result, ERR_LOGIN_SESSION_NOT_RECEIVED, '服务解密信息失败，请稍后重试');
            }
        });
    };

    return _checkAuth(that, 'scope.userInfo').then(obtainInfo).then(doDecrypt).then(almostReady);
};


function getLocation(type) {
    var that = this;
    return new Promise(function(resolve_, reject_) {
        wx.getLocation({
            type: type || "gcj02",
            success: function(t) {
                resolve_.call(that, [t.latitude, t.longitude, t.speed]);
            },
            fail: function(res) {
                $u.handleError.call(that, reject_, res, ERR_GET_LOCATION, '读取GPS失败');
            },
        });
    });
};


function getSystemInfo() {
    var that = this;
    return new Promise(function(resolve_, reject_) {
        wx.getSystemInfo({
            success: function(res) {
                res.errMsg && delete res.errMsg;
                resolve_.call(that, res);
            },
            fail: function(res) {
                $u.handleError.call(that, reject_, res, ERR_GET_SYSTEMINFO, '读取系统信息失败');
            },
        });
    });
};


function checkUpdate(report) {
    if (!wx.getUpdateManager) {
        report && report({stage: 0, result: "no-support"});
        return false;
    }

    const mgr = wx.getUpdateManager();

    mgr.onCheckForUpdate(function(res) {
        var msg = res && res.hasUpdate ? "has-update" : "no-update";
        report && report({stage: 1, result: msg});
    });

    mgr.onUpdateReady(function() {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
            var msg = "canceled";
            if (res && res.confirm) {
                msg = "done";
                mgr.applyUpdate();
            }
            report && report({stage: 2, result: msg});
        }
      })
    });

    mgr.onUpdateFailed(function() {
        report && report({stage: 3, result: "failed"});
    });
};


function submitFormId(event, eventName, appid, submit_url) {
    var that = this,
        ui = mySessionInfo || myUserInfo,
        ev = event.detail,
        param = {
            appid: appid || "",
            formId: ev.formId || "",
            openId: ui.openId || "",
            unionId: ui.unionId || "",
            path: that.__route__ || "",
            event: eventName || (ev.target || event.target).dataset.event || "",
        };

    var query = $u.fixQuery(that.options);
    var url = $u.mergeUrl(submit_url, query);
    return makeRequest.call(that, url, param);
};


function sendFeedback(cardList, eventName, appid, feedback_url) {
    var that = this,
        ui = mySessionInfo || myUserInfo,
        param = {
            appid: appid,
            cardList: cardList,
            unionId: ui.unionId || "",
            openId: ui.openId || "",
            path: that.__route__ || "",
            event: eventName || "",
        };

    var query = $u.fixQuery(that.options);
    var url = $u.mergeUrl(feedback_url, query);
    return makeRequest.call(that, url, param);
};


function _safeLogin() {
    return $u.justOneWork.call(this, login, "loginSession", arguments);
};


module.exports = $u.extend({}, $u, {
    makeRequest: makeRequest,
    fastRequest: fastRequest,
    safeRequest: safeRequest,
    makeUpload: makeUpload,
    safeUpload: safeUpload,
    login: _safeLogin,
    checkAuth: function(scope_key) {
        var key = "checkAuth." + scope_key;
        return $u.justOneWork.call(this, _checkAuth, key, [this, scope_key]);
    },
    getUserInfo: function() {
        return $u.justOneWork.call(this, getUserInfo, "getUserInfo", arguments);
    },
    getLocation: function() {
        return $u.justOneWork.call(this, getLocation, "getLocation", arguments);
    },
    getSystemInfo: function() {
        return $u.justOneWork.call(this, getSystemInfo, "getSystemInfo", arguments);
    },
    getSessionInfo: function() {
        return mySessionInfo;
    },
    submitFormId: submitFormId,
    sendFeedback: sendFeedback,
    checkUpdate: checkUpdate,
});

