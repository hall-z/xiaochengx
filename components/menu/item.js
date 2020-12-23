import Fly from '/mixins/fly.js';
import Carts from '/mixins/carts.js';
const eventBus = require('/utils/eventbus.js').eventBus;
Component({
  mixins: [Carts, Fly],
  data: {
    observer_status: false,
    // language: getApp().globalData.language
  },
  props: {
    info: {},
    onResetCart: (data) => console.log(data),
    openTimeOut: (data) => console.log(data),
  },
  onInit(){},
  didMount() {
    // this.observer = my.createIntersectionObserver().in(this).relativeToViewport({bottom: 100});
    // // console.log(this.observer)
		// this.observer.observe('.component-observer', (res) => {
    //   console.log(res)
    //   this.setData({
    //     observer_status: false
    //   })
    //   // this.observer_status = false;
    //   this.observer.disconnect()
    //   this.observer = null
		// })
    eventBus.on('addCart', (info) => {
      this.setCartItem(info, 1);
      console.log("---event bus---", info)
    })
  },
  didUpdate() {},
  didUnmount() {},
  methods: {
    /**
     * 前往详情页
     */
    goInfo() {
      //<!-- 0529 添加已售罄进入详情限制 开始 -->
      if (this.props.info.disabledFlag == 0) {
        return false;
      }
      //<!-- 0529 添加已售罄进入详情限制 结束 -->
      my.setStorageSync({
        key: 'pro_info',
        data: this.props.info
      });
      let url = '/pages/productDetails/single/single';
      if (this.props.info.productType == 2 || this.props.info.productType == 3) {
        url = '/pages/productDetails/setMeal/setMeal';
      }
      // this.props.openTimeOut();
      my.navigateTo({
        url: url
      });
    },
    /**
     * 添加购物车
     */
    addCart() {
      // this.addCarts();
      // this.props.openTimeOut();
      let info = JSON.parse(JSON.stringify(this.props.info));
      info.cart_number = 1;
      if (!this.setCartItem(info, 1)) {
        this.isFly = 0;
        return false;
      }
      this.props.onResetCart(this.props.info);
      this.isFly = 0;
    }
  },
});
