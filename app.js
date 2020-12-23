// require("/vendor/nabi/sdk/track_auto.js").config('2021001114647423', '1.0.0', {
//   prefix: 'http://track.sok.plkchina.cn',
//   appType: 'iot'
// });
const config = require('./config/index.js');
const Fetch = require('./fetch/index.js');
const lang = require('./config/lang.js');
require("./mixins/inject.js");
require('./mixins/mixins.js');
let cartInfo = {
  payType: 0, // 支付方式
  type: 1, // 1 堂食  2 外带
  number: 0, // 购物车商品数量
  total: 0, // 付款总额
  mtotal: 0, // 会员价付款总额
  list: [], // 购物车列表
  add: {}, // 加购的商品
  coupons: {}, // 优惠券
  payPrice: 0, // 实付金额
  discountsPoints: 0,
  maxPoint: {
    points: 0,
    rate: 0.01
  },
  procous: [],
  addList: [],
  cartCombList: [],
}
App({
  globalData: {  
    isRecommendAddOn: 0,
    language: 'zh_CN',
    _language: 'zh_CN',
    langs: lang,
    // navLang: Navs,
    fetchApi: Fetch,
    sys: {},
    share: config.share,
    appid: config.appId, //wx0000000000000000
    userInfo: {
      id: '',// dev 5eda197083d54300016b0e7c uat 5eb38aab98c8150001ac1594
      headImg: '',
      userName: '',
      token: ''
    },
    cartsInfo: cartInfo,
    storeInfo: {
      channel: 2,
      storeCode: '999995',// 9990 13402 999991
      deviceNo: "",
    }
  },
  onLaunch(options) {
    let that = this;
    // 第一次打开
    console.info('App onLaunch', options);
    my.ix.getSysProp({
      key: 'ro.serialno',
      success: (r) => {
        console.log('---设备序列号---', r.value);
        // that.jaxAppStat.device_no = r.value;// tracking 添加
        Fetch.get_store_code({
          deviceNo: r.value
          // deviceNo: 'KA39P96400022'
        }).then((res) => {
          console.log('---门店信息get_store_code---', res.body);
          that.globalData.storeInfo = Object.assign(that.globalData.storeInfo, res.body);
          that.getStoreInfo();
        });
      }
    });
    // .js
    my.ix.getSysProp({
      key: 'unisdk.deviceId',
      success: (r) => {
        console.log('---设备 ID---', r.value)
      }
    });
    this.getSys();
    //0517 缓存提示
    let res = my.getStorageSync({ key: 'log_sys' });
    console.log('log_sys', res)
    // this.globalData.cartsInfo = res.data;

  },
  onShow(options) {
    // 从后台被 scheme 重新打开
  },
  clearCart() {
    this.globalData.cartsInfo = Object.assign({}, cartInfo)
    this.globalData.isRecommendAddOn = 0;
    // this.globalData.cartsInfo = cartInfo;
  },
  getSys () {
      try{
        let res = my.getSystemInfoSync();
        console.log(res);
        if (res.windowHeight > 700) {
          res.big = 2;// 超大
        } else if (res.windowHeight < 540) {
          res.big = 1;// 超小
        } else {
          res.big = 0; // 正常
        }
        if (res.model.search('iPhone X') != -1 || res.model.search('iPhone 11') != -1) {　　//XS,XR,XS MAX均可以适配,因为indexOf()会将包含'iPhone X'的字段都查出来
          res.isFullSucreen = true
        }
        this.globalData.sys = res;
        // this.$store.commit('setSystemInfo', res);
      }catch(e){
        console.log(e)
        //TODO handle the exception
      }
  },
  getBaseLanguage (params, to_lower = false){
    if (!params) return '';
    if (to_lower) {
      return this.globalData.langs[this.globalData.language][params].toLowerCase();
    }
    return this.globalData.langs[this.globalData.language][params]
  },
  getStoreInfo() {
    console.log('---获取门店信息开始---');
    let that = this;
    Fetch.get_store_info({
      "params":{
        "storeCode": getApp().globalData.storeInfo.storeCode
      }
    }).then((res) => {
      console.log('---获取到的门店信息get_store_info---', res.body);
      that.globalData.storeInfo = Object.assign(that.globalData.storeInfo, res.body);
      console.log('---整合后门店信息---', that.globalData.storeInfo);
    });
  },
  watch:function(method){
    var obj = this.globalData;
    Object.defineProperty(obj, "language", {
      configurable: true,
      enumerable: true,
      set: function (value) {
        this._language = value;
        // console.log('是否会被执行2')
        console.log('---设置---', this._language)
        method(value);
      },
      get:function(){
        console.log('---使用---', this._language)
      // 可以在这里打印一些东西，然后在其他界面调用getApp().globalData.name的时候，这里就会执行。
        return this._language
      }
    })
  },
    bezier: function (pots, amount) {
      var pot;
      var lines;
      var ret = [];
      var points;
      
      for (var i = 0; i <= amount; i++) {
        points = pots.slice(0);
        // console.log(points)
        lines = [];
        while (pot = points.shift()) {
          if (points.length) {
            lines.push(pointLine([pot, points[0]], i / amount));
          } else if (lines.length > 1) {
            points = lines;
            lines = [];
          } else {
            break;
          }
        }
        ret.push(lines[0]);
      }
      function pointLine(points, rate) {
        var pointA, pointB, pointDistance, xDistance, yDistance, tan, radian, tmpPointDistance;
        var ret = [];
        pointA = points[0];//点击
        pointB = points[1];//中间
        xDistance = pointB.x - pointA.x;
        yDistance = pointB.y - pointA.y;
        pointDistance = Math.pow(Math.pow(xDistance, 2) + Math.pow(yDistance, 2), 1 / 2);
        tan = yDistance / xDistance;
        radian = Math.atan(tan);
        tmpPointDistance = pointDistance * rate;
        ret = {
          x: pointA.x + tmpPointDistance * Math.cos(radian),
          y: pointA.y + tmpPointDistance * Math.sin(radian)
        };
        return ret;
      }
      return {
        'bezier_points': ret
      };
    },
    sendTracking(name, params) {
      console.log(name, params)
      // this.jaxTrack(name, this.contactObj(this.jaxAppStat, params))
    },
    contactObj(oobj, nobj) {
      var obj = JSON.parse(JSON.stringify(oobj));
      for (const key in nobj) {
          if (nobj.hasOwnProperty(key)) {
              obj[key] = nobj[key]
          }
      }
      return obj;
    }
});
