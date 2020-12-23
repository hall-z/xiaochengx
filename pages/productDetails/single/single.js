const eventBus = require('/utils/eventbus.js').eventBus;
Page({
  mixins: [require('../../../mixins/addon.js')],
  data: {
    menuInto: 0,
    info: {
      productType: 1,
      name: '',
      imageUrl: '',
      salesPrice: 0,
      cart_number: 1
    }
  },
  onLoad() {
    let that = this;
    this.addOnList = getApp().globalData.cartsInfo.addList;
    my.getStorage({
      key: 'pro_info',
      success: function(res) {
        console.log(res.data);
        if (res.data) {
          res.data.cart_number = res.data.cart_number ? res.data.cart_number : 1;
          that.setData({
            info: res.data
          })
        }
      },
      fail: function(res){
        // my.alert({content: res.errorMessage});
      }
    });
  },
  reset(info, type) {
			console.log('---购物车操作加购---', info, type)
			if (type == 1) {
				// this.getIsInadd(info.productCode);
				this.setAddOn(info, 1);
			} else if (type == 2) {
				this.clearRelation(info, 2);
			} else if (type == 3) {
				this.clearRelation(info, 3);
			}
  },
  /**
   * 菜单加加购添加购物车
   */
  onAdd(info) {
    // this.modalTip.setCartItem(info, 1);
    eventBus.emit('addDCart', info)
  },
  onCloseModal() {
      const that = this
      that.setData({
          isShowModal: false,
      })
      my.navigateBack();
  },
});
