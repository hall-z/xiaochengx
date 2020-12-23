
var ERR_BAD_BUTTON_INDEX=7100,
    ERR_UNEXPCETED_DATA=7101,
    ERR_OTHER_EXCEPTION=7102,
    ERR_JUMP_URL=7103,
    ERR_JUMP_APP=7104,
    ERR_TAB_URL=7105,
    ERR_REDIRECT_TO=7106,
    ERR_ADD_CARD=7107,
    ERR_GET_RESULT_FAILED=7108,
    ERR_RENDER_PAGE_FAILED=7109,
    ERR_SHARE_FAIL=7110,
    ERR_MODAL_FAIL=7111,
    ERR_BAD_USERINFO=7112,
    ERR_LOAD_IMAGE_FAILED=7113,
    ERR_BUTTON_TAP_FAILED=7114,
    ERR_NAV_TAP_FAILED=7115,
    ERR_OPEN_CARD=7116,
    ERR_RELAUNCH_URL=7117,
    ERR_OPEN_LOCATION=7118,
    ERR_AJAX_RESULT=7119,
    ERR_AJAX_PARAMS=7120,
    ERR_PVID_CHANGED=7121,
    ERR_LOGGING_INFO=7198,
    ERR_NOT_CLASSIFIED=7199;


var url_configured = false,
    update_checked = false,
    login_url    = "/common/{appid}/login_session",
    decrypt_url  = "/common/{appid}/decrypt_info",
    report_url   = "/common/{appid}/report_info",
    submit_url   = "/common/{appid}/submit_formid",
    feedback_url = "/common/{appid}/send_feedback",
    config_url   = "/promotion/{appid}/fetch_config",
    campaign_url = "/promotion/{appid}/get_campaign";


var renewCampaign = function(appId, options, debug, extraParam) {
    var getAccInfo = wx.getAccountInfoSync;
    var appid = (getAccInfo && getAccInfo().miniProgram.appId) || appId;

    var app = this,
        cam = app.jaxCampaign || (app.jaxCampaign = {
            appid, cid:0, freeze:0, userInfo:{}, sysInfo:{}
        });

    if (options && typeof options == "object") {
        if (!cam.options || isOptionsChanged(cam.options, options)) {
            cam.options = options;
        }
    }
    console.log("【活动】App刷新：", cam);

    // 初始化远程URL，仅一次
    if (!url_configured) {
        var fix = (typeof extraParam == "object" && extraParam) || {};
        var remote_base = fix.remote_base || "https://dolphin.jaxcx.com";
        var url_base;
        if (typeof debug == "string") {
            if (debug.indexOf("http") == 0) {
                url_base = debug;
            } else {
                var path = (debug.indexOf("/") == 0 ? debug : "/" + debug);
                url_base = remote_base + path;
            }
        } else {
            var path =  (debug ? "/debug" : "/micro");
            url_base = remote_base + path;
        }
        var subst = function(old, appid) {
            return old.replace("{appid}", appid);
        };
        login_url = url_base + subst(fix.login || login_url, appid);
        decrypt_url = url_base + subst(fix.decrypt || decrypt_url, appid);
        submit_url = url_base + subst(fix.submit || submit_url, appid);
        report_url = url_base + subst(fix.report || report_url, appid);
        config_url = url_base + subst(fix.config || config_url, appid);
        campaign_url = url_base + subst(fix.campaign || campaign_url, appid);
        feedback_url = url_base + subst(fix.feedback || feedback_url, appid);
        url_configured = true;
    }
}


var startCampaign = function(userInfo, extraParam) {
    var that = this,
        app = getApp(),
        cam = app.jaxCampaign;
    if (!cam || typeof cam != "object") return false;
    return true;
}


module.exports = {
    renew: renewCampaign,
    start: startCampaign,
};
