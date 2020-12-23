// Tracking自动采集模块

var simple = require("./track_simple.js");
var appArgs = [];

function injectMethod(obj, name, neu) {
    if (obj[name]) {
        var old = obj[name];
        obj[name] = function() {
            neu.apply(this, arguments),
            old.apply(this, arguments)
        }
    } else {
        obj[name] = function() {
            neu.apply(this, arguments);
        }
    }
}

function contactObj(oobj, nobj) {
    var obj = JSON.parse(JSON.stringify(oobj));
    for (const key in nobj) {
        if (nobj.hasOwnProperty(key)) {
            obj[key] = nobj[key]
        }
    }
    return obj;
}

var oldApp = App;
App = function(obj) {
    injectMethod(obj, "onLaunch", function(opts) {
        this.jaxAppStat = {sid:simple.newUuid(), seq:0, err:0}; // session_id
        simple.initSdk.apply(this, appArgs);
    });
    injectMethod(obj, "onShow", function(opts) {
        var appStat = this.jaxAppStat;
        appStat.seq += 1;        // sequence_id, increase!
        appStat.st = Date.now(); // start_time
        appStat.cnt = [0,0,0,0]; // refresh_count, bottom_count, share_count, tab_count
        appStat.pv = 0;          // page_views
        appStat.cp = "";         // current_page
        if (opts) {
            opts.scene && (appStat.scene=opts.scene);
            opts.path && (appStat.path=opts.path);
            opts.query && (appStat.kv=opts.query);
            opts.shareTicket && (appStat.share=opts.shareTicket);
            var refer = opts.referrerInfo;
            refer && refer.appId && (appStat.from=refer.appId);
        }
    });
    injectMethod(obj, "onHide", function() {
        var appStat = this.jaxAppStat;
        appStat.tos = Date.now() - appStat.st; // time_of_site
        this.jaxTrack("app", appStat);
        appStat.err = 0;
        this.jaxSetInfo(); // send userInfo now.
    });
    injectMethod(obj, "onError", function(msg) {
        var appStat = this.jaxAppStat;
        if (appStat && this.jaxTrack) {
            appStat.err += 1;
            if (msg.indexOf(simple.preUrl) < 0) {
                this.jaxTrack("error", contactObj(appStat, {msg: msg}));
            }
        }
    });
    injectMethod(obj, "onPageNotFound", function() {
        var appStat = this.jaxAppStat;
        if (appStat && this.jaxTrack) {
            appStat.err += 1;
            this.jaxTrack("error", contactObj(appStat, {msg: "404", args: arguments}));
        }
    });

    oldApp.apply(this, arguments);
};


var onUnloadOrHide = function() {
    var app = getApp(),
        appStat = app.jaxAppStat,
        pageStat = this.jaxPageStat;
    pageStat.top = Date.now() - pageStat.st; // time_of_page
    app.jaxTrack("page", pageStat);
};


var injectMock = function(obj) {
    injectMethod(obj, "onLoad", function(opts) {
        this.jaxPageStat = {kv: opts};
    });

    injectMethod(obj, "onShow", function() {
        var appStat = getApp().jaxAppStat, self = this;
        var tmp = {
            sid: appStat.sid,   // session_id
            seq: appStat.seq,   // sequence_id
            st: Date.now(),     // start_time
            cnt: [0,0,0,0],     // refresh_count, bottom_count, share_count, tab_count
            pu: self.route, // page_url
            ru: appStat.cp,     // referer_url
            kv: ((self.jaxPageStat && self.jaxPageStat.kv) || {}),
            device_no: appStat.device_no || '', // iot device_no
            pid: appStat.pv     // page_id
        };
        self.jaxPageStat = tmp;
        appStat.pv += 1;
        appStat.cp = self.route;
    });

    injectMethod(obj, "onUnload", onUnloadOrHide);
    injectMethod(obj, "onHide", onUnloadOrHide);

    injectMethod(obj, "onPullDownRefresh", function() {
        var appStat = getApp().jaxAppStat,
            pageStat = this.jaxPageStat;
        appStat.cnt[0] += 1;
        pageStat.cnt[0] += 1;
    });
    injectMethod(obj, "onReachBottom", function() {
        var appStat = getApp().jaxAppStat,
            pageStat = this.jaxPageStat;
        appStat.cnt[1] += 1;
        pageStat.cnt[1] += 1;
    });

    var name = "onShareAppMessage",
        oldShare = obj[name];
    if (oldShare && "function" == typeof oldShare) {
        obj[name] = function() {
            var param = oldShare.apply(this, arguments);
            if (!param || "object" != typeof param) param = {};

            var app = getApp(),
                appStat = app.jaxAppStat,
                self = this,
                pageStat = self.jaxPageStat,
                tmpPath = param.path || self.route,
                i = tmpPath.indexOf("jax_source=");
 
            var prefix = (i >= 0 ? tmpPath.substr(0, i) :
                tmpPath + (tmpPath.indexOf("?") >= 0 ? "&" : "?"));

            param.path = prefix + "jax_source=" + appStat.sid + "." + appStat.seq + "." + simple.getUuid();
            appStat.cnt[2] += 1;
            pageStat.cnt[2] += 1;
            app.jaxTrack("share", param);

            return param;
        };
    }

    injectMethod(obj, "onTabItemTap", function(item) {
        var app = getApp(),
            appStat = app.jaxAppStat,
            pageStat = this.jaxPageStat;
        appStat.cnt[3] += 1;
        pageStat.cnt[3] += 1;
        app.jaxTrack("tab", item);
    });
};

var oldPage = Page;
Page = function(obj) {
    injectMock.call(this, obj);
    oldPage.apply(this, arguments);
};


if (typeof Component != "undefined") {
    var oldComponent = Component;
    Component = function(e) {
        try {
            var obj = e.methods || {};
            e.methods = obj;
            injectMock.call(this, obj);
        } catch(ex) {
        } finally {
            oldComponent.apply(this, arguments);
        }
    };
};

module.exports = {
    config: function() { appArgs = arguments; },
};
