const injectMethod = function (obj, name, neu) {
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
var injectMock = function(obj) {
    injectMethod(obj, "onLoad", function(opts) {
        // this.jaxPageStat = {kv: opts};
        // console.log(opts);
        this.setData({
            language: getApp().globalData.language,
            userInfo: getApp().globalData.userInfo
        })
        // this.timeOutObj = 
        // getApp().watch(this.watchBack);
    });
    injectMethod(obj, "onShow", function(opts) {
        pt = this;
        if (my.canIUse('ix.configUI')) {
            my.ix.configUI({ type: 'titleBar', default: false })
            my.ix.configUI({ type: 'navBar', show: false })
        }
        console.log(this.__proto__.route)
        if (this.__proto__.route != 'pages/index/index') {
            this.openTimeOut();
        }
    });
    injectMethod(obj, "onHide", function(opts) {
        if (this.timeOutObj) {
            console.log('---离开页面关闭倒计时---')
            clearTimeout(this.timeOutObj);
            this.timeOutObj = null;
        }
        console.log('---页面隐藏时触发---');
    });
    injectMethod(obj, "onUnload", function(opts) {
        if (this.timeOutObj) {
            console.log('---离开页面关闭倒计时---')
            clearTimeout(this.timeOutObj);
            this.timeOutObj = null;
        }
        console.log('---页面卸载时触发---');
    });

    injectMethod(obj, "onPageScroll", function(opts) {
        console.log('---页面滚动时触发---');
        if (this.__proto__.route != 'pages/index/index') {
            this.openTimeOut();
        }
    });
}



var oldPage = Page,
    pt = null;
Page = function(obj) {
    obj.data.langs = getApp().globalData.langs;
    obj.data.userInfo = {};
    // obj.data.language = getApp().globalData.language;
    obj.getBaseLanguage = function (params, to_lower = false){
        return getApp().getBaseLanguage(params, to_lower);
    }
    obj.watchBack = (name) => {
        console.log(pt);
        if (pt) {
            pt.setData({
                language: name
            })
        }
    }
    obj.timeOutToIndex = () => {
        console.log('---页面倒计时跳转---')
        // console.log(pt)
       if (pt.timeOutObj) {
            clearTimeout(pt.timeOutObj);
        }
        getApp().globalData.userInfo = {
            id: '',
            headImg: '',
            userName: ''
        }
        getApp().globalData.isRecommendAddOn = 0;
        my.reLaunch({
            url: '/pages/index/index'
        });
    }
    obj.openTimeOut = () => {
        if (pt) {
            if (pt.timeOutObj) {
                console.log('---重新开启页面倒计时---')
                clearTimeout(pt.timeOutObj);
                pt.timeOutObj = null;
            } else {
                console.log('---开启页面倒计时---')
            }
            pt.timeOutObj = setTimeout(() => {
                pt.timeOutToIndex();
                clearTimeout(pt.timeOutObj);
            }, 120000)
        }
    }
    injectMock.call(this, obj);
    oldPage.apply(this, arguments);
};
var injectMockCom = function(obj) {
    injectMethod(obj, "didMount", function(opts) {
        ct = this;
        // console.log('---com into--', this.data.language)
        this.setData({
            language: getApp().globalData.language,
            userInfo: getApp().globalData.userInfo
        })
        // console.log('---123--', getApp().globalData.language)
        // console.log('---com set after--', this.data.language)
        getApp().watch(this.watchBack);
    });
}
// console.log(Component)
if (typeof Component != "undefined") {
    var oldComponent = Component,
        ct = null;
    Component = function(e) {
        try {
            e.data.langs = getApp().globalData.langs;
            e.data.language = getApp().globalData.language;
            e.props.slanguage = getApp().globalData.language;
            // console.log(e.data.language)
            e.data.userInfo = {};
            var obj = e.methods || {};
            obj.getBaseLanguage = function (params, to_lower = false){
                return getApp().getBaseLanguage(params, to_lower);
            }
            obj.watchBack = (name) => {
                console.log('com', name)
                console.log(e);
                if (ct) {
                    ct.setData({
                        language: name
                    })
                }
            }
            e.methods = obj;
            // console.log(e);
            injectMockCom.call(this, e);
        } catch(ex) {
        } finally {
            oldComponent.apply(this, arguments);
        }
    };
};
// module.exports = {
//     config: function(appArgs) {},
// };