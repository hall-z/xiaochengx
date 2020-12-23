import config from '/config';
Page({
  data: {
    isShowModal: false,
    styleBg: config.styleBg,
    modalInfo: {
      status: 4,
      imgUrl: "/image/error-icon.png",
      msg: []
    }
  },
  onLoad() { 
    console.log("--门店信息--", getApp().globalData.storeInfo)
  },
  onShow() {
    if (my.canIUse('ix.configUI')) {
      my.ix.configUI({ type: 'titleBar', default: false })
      my.ix.configUI({ type: 'navBar', show: false })
    }
  },
  onCloseModal() {
    const that = this
    that.setData({
      isShowModal: false
    })
    my.redirectTo({
      url: '/pages/index/index'
    })
  },
  selectStyle(e) {
    // console.log(e);
    const that = this;
    let storeInfo = getApp().globalData.storeInfo
    if(!storeInfo.storeStatus || !storeInfo.storeOperation.sokReceivingStatus) {
      console.log("休息中")
      that.setData({
        isShowModal: true,
        modalInfo: {
          status: 4,
          imgUrl: "/image/error-icon.png",
          msg: [that.getBaseLanguage('rest')]
        }
      })
      return
    }
    
    getApp().globalData.cartsInfo.type = e.target.dataset.index;
    
    // getApp().globalData.cartsInfo = {
    //   type: e.target.dataset.index,
    //   number: 0,// 购物车商品数量
    //   total: 0,// 付款总额
    //   list: []// 购物车列表
    // }
    my.redirectTo({
      url: '/pages/menu/index'
    });
  }
});
