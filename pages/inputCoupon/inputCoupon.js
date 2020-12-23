const eventBus = require('/utils/eventbus.js').eventBus;
// import { Page } from '/utils/ix'; // 添加这行
let getCode = require('/utils/keyAnalysis.js').getCode;
Page({
  data: {
    showPage: 1,
    isShowModal: false,
    modalInfo: {
      status: 1,
      imgUrl: "/image/service-icon.png",
      msg: ['123']
    },
  },
  onLoad() {
    // this.setDialogInfo(2)
    this.openKeyEveent();
    // this.goFetch('A001SCugKc0glN2IsEli');
  },
  onShow(){
    // this.openKeyEveent();
  },
  setDialogInfo(type) {
    this.otype = type;
    if (type == 1) {// 录入成功
      this.setData({
        isShowModal: true,
        modalInfo: {
          status: 1,
          imgUrl: "/image/success-icon.png",
          msg: [getApp().getBaseLanguage('sok_scan_coupon_success')]
        },
      })
      this.sto = setTimeout(() => {
        // my.navigateBack();
        this.onCloseModal();
      }, 2000)
    } else if (type == 2) {// 录入失败
      this.setData({
        isShowModal: true,
        modalInfo: {
          status: 1,
          imgUrl: "/image/error-icon.png",
          msg: [getApp().getBaseLanguage('sok_scan_coupon_fail')]
        },
      })
    } else if (type == 3) {// 正在识别
      this.setData({
        isShowModal: true,
        modalInfo: {
          status: 2,
          imgUrl: "/image/loading1.gif",
          msg: [this.getBaseLanguage('sok_identifying')]
        },
      })
    }
  },
  goFetch(code) {
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
    getApp().globalData.fetchApi.get_coupon_info({
      noPrefix: 1,
      "extId":0,
      "couponCode": code,
      deviceId: getApp().globalData.storeInfo.deviceNo,
      storeCode: getApp().globalData.storeInfo.storeCode,
      channel: getApp().globalData.storeInfo.channel,
    }, false).then((res) => {
      console.log(res);
      getApp().sendTracking('SCAN_COUPON', res);
      eventBus.emit('bindGetCoupon', res.body); 
      that.setDialogInfo(1);
    }).catch(e => {
      that.setDialogInfo(2);
      // eventBus.emit('bindGetCoupon', e); 
      // my.navigateBack();
    })
  },
  feedBack(e) {
    const that = this;
    let code = "";
    my.ix.offKeyEventChange();
    console.log('---识别结果---', e)
    code = e.code.replace("\\000026", "")
    console.log('---处理完的code结果---', code)
    that.goFetch(code);
  },
  openKeyEveent() {
    const that = this;
    my.ix.onKeyEventChange((r) => { // 回车
        getCode(r, that.feedBack.bind(that))
        // let k = r.keyCode;
        //     console.log(k)
        // if ((k >= 7 && k <= 16)){
        //     m = m+(k-7).toString()
        // }else if (k === 66) {
        //     // 末尾追加 Enter 确认。
        //     console.log('Scan Barcode', m);
        //     my.ix.offKeyEventChange();
        //     // that.loginFetch(m);
        //     // that.setData({
        //     //     isShowModal: false,
        //     // })
        //     // my.redirectTo({
        //     //     url: '/pages/pay/index?code='+m+'&id='+that.orderInfo.id+'&sn='+that.orderInfo.orderNo
        //     // });
        //     return;
        // } else{
        //     m = m+ String.fromCharCode(k+68)
        // }
    });
  },
  onUnload() {
    my.ix.offKeyEventChange();
  },
  // onHide() {
  //   my.ix.offKeyEventChange();
  // },
  goInput() {
    // my.navigateTo({
    //   url: '/pages/searchCoupon/searchCoupon'
    // });
    this.setData({
      showPage: 2
    })
    my.ix.offKeyEventChange();
  },
  goBack() {
    if (this.data.showPage == 1) {
      my.navigateBack();
    } else {
      this.setData({
        showPage: 1
      })
      this.openKeyEveent();
    }
  },
  onCloseModal() {
    if (this.otype == 1) {
      if (this.sto) {
        clearTimeout(this.sto);
      }
      // eventBus.emit('bindGetCoupon', {});
      my.navigateBack();
      
    } else {
       this.openKeyEveent();
    }
    this.setData({
      isShowModal: false,
    })
    
  },

});
