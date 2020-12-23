// import { Page } from '/utils/ix'; // 添加这行
import Lang from '/mixins/lang';
let t = null;
Page({
  // mixins: [require('../balance/pay.js')],
  data: {
    bannerList: [],
    config: {
      autoplay: true,
      interval: 5000,
      duration: 500,
      circular: false,
      current: 0
    },
    isShowModal: false,
    modalInfo: {
      status: 2,
      imgUrl: "/image/service-icon.png",
      msg: ['']
    },
    isShowMobileLoginModal: false,
    showSign: true,
    showPoster: false
  },
  onLoad(query) {
    console.log("===this.globalData.cartsInfo==", getApp().globalData.cartsInfo)
    console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
    // this.getBanner()
  },
  onShow() {
    this.setGetStoreInfo();
    getApp().clearCart();
  },
  onHide() {
    my.ix.offKeyEventChange();
  },
  hidePoster() {
    this.setData({
      showPoster: false
    })
  },
  setGetStoreInfo() {
    // return false;
    this.times = setInterval(() => {
      let info = getApp().globalData.storeInfo;
      console.log(info)
      if (info.storeCode) {
        clearInterval(this.times);
        if (info.storeOperation && info.storeOperation.needCheckin == 0) {
          this.setData({
            showSign: false
          })
        } else {
          this.setData({
            showSign: true
          })
        }
      }
    }, 1000)
  },
  /**
   * 获取banner
   */
  async getBanner() {
    const that = this;
    let list = []
    let bannerRes = await getApp().globalData.fetchApi.get_banner_list({
      "params": {
        channel: getApp().globalData.storeInfo.channel,
        position: "index",
      }
    })
    console.log("---首页banner---", bannerRes)
    if (bannerRes.code == "0") {
      this.setData({
        bannerList: bannerRes.body.list
      })
    }
  },
  changeLan() {
    if (this.data.language == 'zh_CN') {
      getApp().globalData.language = 'en_US';
      this.setData({
        language: "en_US"
      })
    } else {
      getApp().globalData.language = 'zh_CN';
      this.setData({
        language: "zh_CN"
      })
    }
  },
  // onKeyPress(r) {
  //     switch (r.keyCode) {
  //       case 131:
  //         r.keyName = '收款';
  //         break;
  //       case 132:
  //         r.keyName = '刷脸';
  //         break;
  //       case 133:
  //         r.keyName = '取消';
  //         break;
  //       case 134:
  //         r.keyName = '设置';
  //         break;
  //     }
  //     console.log('KeyEvent', r);
  // },
  scanLogin() {
    const that = this
    let msg = []
    if(this.data.showSign) {
      msg = [this.getBaseLanguage('sok_show_code'), this.getBaseLanguage('sok_show_code1'), this.getBaseLanguage('sok_show_code2')]
    }else {
      msg = [this.getBaseLanguage('sok_show_code'), this.getBaseLanguage('sok_show_code1')]
    }
    that.setData({
      isShowModal: true,
      modalInfo: {
        status: 1,
        imgUrl: "/image/member-code-icon.png",
        msg: msg
      }
    })

    that.scanIng();
    // 2s后调用扫码功能
    this.sto1 = setTimeout(() => {
      my.ix.offKeyEventChange();
      clearTimeout(this.sto1);
      that.setData({
        isShowModal: true,
        modalInfo: {
          status: 4,
          imgUrl: "/image/error-icon.png",
          msg: [this.getBaseLanguage('sok_identifying_failed'), this.getBaseLanguage('sok_refresh_code')]
        }
      })
      //2s之后关闭弹窗
      setTimeout(() => {
        that.setData({
          isShowModal: false
        })
      }, 2000)
    }, 30000)
  },
  scanIng() {
    let that = this,
      m = '';
    console.log('---开始监听--')
    my.ix.onKeyEventChange((r) => { // 回车
      let k = r.keyCode;
      console.log(k)
      if ((k >= 7 && k <= 16)) {
        m = m + (k - 7).toString()
        console.log(m)
      } else if (k === 66) {
        // 末尾追加 Enter 确认。
        console.log('Scan Barcode', m);
        console.log(m);
        if (this.sto1) {
          clearTimeout(this.sto1);
        }
        my.ix.offKeyEventChange();
        if (m.startsWith("order")) {
          that.queueFetch(m);
        } else {
          that.loginFetch(m);
        }
        return;
      } else {
        m = m + String.fromCharCode(k + 68)
      }
    });
  },
  loginFetch(code) {
    let that = this;
    that.setData({
      isShowModal: true,
      modalInfo: {
        status: 2,
        imgUrl: "/image/loading1.gif",
        msg: [this.getBaseLanguage('sok_identifying')]
      }
    })
    console.log('---开始请求--')
    getApp().globalData.fetchApi.get_code_info({
      qrcode: code
    }).then((res) => {
      getApp().sendTracking('SCAN_CODE_LOGIN', res);
      console.log('---登录成功--', res.body)
      res.body.user_id = res.body.id;// 兼容sdk
      getApp().globalData.userInfo = res.body;
      that.setData({
        isShowModal: true,
        modalInfo: {
          status: 3,
          imgUrl: "/image/success-icon.png",
          msg: [this.getBaseLanguage('sok_identifying_success'), this.getBaseLanguage('sok_identifying_success_tip')]
        }
      })
      let sto = setTimeout(() => {
        clearTimeout(sto);
        my.navigateTo({
          url: '/pages/eatStyle/eatStyle'
        });
        that.setData({
          isShowModal: false
        })
      }, 1500)
    }).catch(e => {
      console.log('---登录失败--')
      that.setData({
        isShowModal: true,
        modalInfo: {
          status: 4,
          imgUrl: "/image/error-icon.png",
          msg: [this.getBaseLanguage('sok_identifying_failed'), this.getBaseLanguage('sok_refresh_code')]
        }
      })
      //2s之后关闭弹窗
      setTimeout(() => {
        that.setData({
          isShowModal: false
        })
      }, 2000)
    })
  },
  queueFetch(scode) {
    let that = this,
      t = new Date().getTime(),
      code = scode.substring(0, scode.length-13),
      st = parseInt(scode.substring(scode.length-13, scode.length));
//     ---当前时间戳--- 1589549175219
// ---签到二维码数据--- ordere77f2a8f78ae2e956c0b1ab6983db1564b677fe1adc8743ecda66dd8a245450f1589552174317
    console.log('---截取时间戳---', st);
    console.log('---当前时间戳---', t);
    console.log('---签到二维码数据---', code);
    if ((t - st) > (5 * 60 * 1000)) {
      that.setData({
        isShowModal: true,
        modalInfo: {
          status: 4,
          imgUrl: "/image/error-icon.png",
          msg: [this.getBaseLanguage('sok_sign_overtime')]
        }
      })
      return false;
    }
    that.setData({
      isShowModal: true,
      modalInfo: {
        status: 2,
        imgUrl: "/image/loading1.gif",
        msg: [this.getBaseLanguage('sok_identifying')]
      }
    })
    console.log('---开始请求--')
    getApp().globalData.fetchApi.get_code_check_in({
      qrcode: code,
      deviceId: getApp().globalData.storeInfo.deviceNo,
      storeCode: getApp().globalData.storeInfo.storeCode
    }).then((res) => {
      getApp().sendTracking('ORDER_SCAN_SIGN', res);
      console.log('---checkin--', res.body)
      that.setData({
        isShowModal: true,
        modalInfo: {
          status: 3,
          imgUrl: "/image/success-icon.png",
          msg: [this.getBaseLanguage('sok_identifying_success'), this.getBaseLanguage('sok_identifying_order_success'), this.getBaseLanguage('sok_identifying_order_success2')]
        }
      })
      let sto = setTimeout(() => {
        clearTimeout(sto);
        that.setData({
          isShowModal: false
        })
        // my.navigateTo({
        //   url: '/pages/index/index'
        // });
      }, 1500)
    }).catch(e => {
      console.log('---checkin 失败--', e)
      that.setData({
        isShowModal: true,
        modalInfo: {
          status: 1,
          imgUrl: "/image/service-icon.png",
          msg: [this.getBaseLanguage('sok_no_tip1'), this.getBaseLanguage('sok_no_tip2')]
        }
      })
    })
  },
  mobileLogin() {
    const that = this;
    // my.navigateTo({
    //   url: '/pages/menu/index'
    // })
    // return false
    that.setData({
      isShowMobileLoginModal: true
    })
  },
  onCloseModal() {
    const that = this
    clearTimeout(that.sto1);
    that.setData({
      isShowModal: false,
      isShowMobileLoginModal: false
    })
  },
  changeSwiper(e) {
    // console.log(e);
    if (e.detail.source == "touch" || e.detail.source == "autoplay") {
      // this.config.current = e.detail.current;
      this.setData({
        'config.current': e.detail.current
      })
    };
  },
  // onShareAppMessage() {
  //   // 返回自定义分享信息
  //   return {
  //     title: 'My App',
  //     desc: 'My App description',
  //     path: 'pages/index/index',
  //   };
  // },
});
