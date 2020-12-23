const eventBus = require('/utils/eventbus.js').eventBus;
Page({
  mixins: [require('../../mixins/productCoupon.js')],
  data: {
    list: [],
    isShowModal: false,
    modalInfo: {
      status: 11,
      imgUrl: "/image/service-icon.png",
      msg: ['123']
    },
    cartInfo: {
      type: 1, // 1 堂食  2 外带
      number: 0,// 购物车商品数量
      total: 0,// 付款总额
      mtotal: 0,// 付款总额
      list: []// 购物车列表
    },
  },
  onLoad() {
    // this.setData({
    //   list: getApp().globalData.cartsInfo.procous
    // })
  },
  onShow() {
    this.resetCart();
    this.setData({
      list: getApp().globalData.cartsInfo.procous
    })
  },
  resetCart(list, type) {
    this.setData({
      'cartInfo.number': getApp().globalData.cartsInfo.number,
      'cartInfo.total': getApp().globalData.cartsInfo.total,
      'cartInfo.mtotal': getApp().globalData.cartsInfo.mtotal,
    })
    console.log(getApp().globalData.cartsInfo);
    if (type == 1) {
      this.createSurplus(this.data.list);
      this.setData({
        list: getApp().globalData.cartsInfo.procous
      })
    }
  },
  onSelect(info) {
    this.sinfo = info;
    this.setData({
      isShowModal: true,
      modalInfo: {
        alist: info.couponTypeInfo.items,
        status: 11,
      },
    })
    
  },
  onCloseModal() {
    const that = this
    that.setData({
      isShowModal: false,
    })
  },
  goBack () {
    my.navigateBack()
  },
  onAdd(index) {
    console.log(index);
    eventBus.emit('addPCart', index);
    this.setData({
      isShowModal: false,
    })
  },
  goCart() {
    my.navigateTo({
      url: '/pages/shoppingCart/shoppingCart'
    });
  },
});
