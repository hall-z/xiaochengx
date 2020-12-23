const eventBus = require('/utils/eventbus.js').eventBus;
let st = null;
Page({
  mixins: [require('../../mixins/public.js'),require('../../mixins/productCoupon.js'), require('../../mixins/addon.js')],
  data: {
    cartInfo: {
      type: 1, // 1 堂食  2 外带
      number: 0,// 购物车商品数量
      total: 0,// 付款总额
      mtotal: 0,// 付款总额
      list: []// 购物车列表
    },
    isShowModal: false,
    modalInfo: {
      status: 1,
      imgUrl: '/image/error-icon.png',
      msg: [getApp().getBaseLanguage('sok_order_limit1'), getApp().getBaseLanguage('sok_order_limit2'),  getApp().getBaseLanguage('sok_order_limit3')]
    }
  },
  onLoad() {
    st = this;
    this.setData({
      modalInfo: {
        status: 1,
        imgUrl: '/image/error-icon.png',
        msg: [getApp().getBaseLanguage('sok_order_limit1'), getApp().getBaseLanguage('sok_order_limit2'),  getApp().getBaseLanguage('sok_order_limit3')]
      },
    })
  },
  onShow() {
    this.productCoupons = getApp().globalData.cartsInfo.procous;
    this.resetCart();
  },
  /**
   * 菜单加加购添加购物车
   */
  onAdd(info) {
    // this.modalTip.setCartItem(info, 1);
    info.atype = 2;
    eventBus.emit('addSCart', info) 
  },
  delCartItem(info) {
    eventBus.emit('delSCart', info) 
  },
  resetItem(info, type) {
    console.log('---购物车减少处理--', info)
    if (type == 2 || type == 3) {// 需要删除关联加购
      st.clearRelation(info, type);
    }
  },
  resetCart(info) {
    if (info && info.discountMyType == 1) {
      console.log(info)
      st.recoveryProductCoupons(info);
    }
     console.log(getApp().globalData.cartsInfo)
    //  let slist = getApp().globalData.cartsInfo.cartCombList;
    let sd = JSON.parse(JSON.stringify(getApp().globalData.cartsInfo.cartCombList));
    let slist = st.getTxt(sd);
    // console.log(1, st);
    st.setData({
      'cartInfo.number': getApp().globalData.cartsInfo.number,
      'cartInfo.total': getApp().globalData.cartsInfo.total,
      'cartInfo.mtotal': getApp().globalData.cartsInfo.mtotal,
      'cartInfo.list': slist,
    })
  //  console.log(2)
    if (getApp().globalData.cartsInfo.list.length < 1) {
      my.navigateBack();
    }
  },
  goBack () {
    my.navigateBack()
  },
  clearCart () {
    let list = getApp().globalData.cartsInfo.list;
    getApp().globalData.cartsInfo = Object.assign(getApp().globalData.cartsInfo, {
      number: 0,// 购物车商品数量
      total: 0,// 付款总额
      mtotal: 0,// 付款总额
      list: []// 购物车列表
    })
    console.log(getApp().globalData.cartsInfo)
    // my.setStorage({
    //   key: 'cart_info',
    //   data: getApp().globalData.cartsInfo
    // });
    console.log(list);
    this.recoveryAllProductCoupons(list);
    this.resetCart();
    
    // my.navigateBack();
  },
  goBalance() {
    let totalPrice = 0
    if(this.data.userInfo && this.data.userInfo.id) {
      totalPrice = this.data.cartInfo.mtotal
    }else {
      totalPrice = this.data.cartInfo.total
    }
    console.log("===totalPrice===", totalPrice)
    if(totalPrice > 500) {
      this.setData({
        isShowModal: true
      })
      return false
    }
    my.navigateTo({
      url: '/pages/balance/index'
    });
  },
  onCloseModal () {
    this.setData({
      isShowModal: false
    })
  }
});
