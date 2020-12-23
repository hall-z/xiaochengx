import Carts from '/mixins/carts.js';
// console.log(Carts)s
const eventBus = require('/utils/eventbus.js').eventBus;
Component({
  mixins: [Carts],
  data: {
    number: 0
  },
  props: {
    info: {},
    onResetCart: (data) => console.log(data),
    onResetItem: (data) => console.log(data),
    onOpenTimeOut: (data) => console.log(data),
  },
  didMount() {
    // console.log('didMount')
    // console.log(this.props.info)
    this.setData({
      number: this.props.info.cart_number
    })
    eventBus.on('addSCart', (info) => {
      this.setCartItem(info, info.atype ? 2 : 1);
      this.props.onResetCart();
      console.log("---event addSCart bus---", info)
    })
    eventBus.on('delSCart', (info) => {
      this.delCartItem(info);
      console.log("---event delSCart bus---", info)
    })
  },
  didUpdate() {
    this.setData({
      number: this.props.info.cart_number
    })
  },
  didUnmount() {
    eventBus.remove('addDCart');
    eventBus.remove('delDCart');
  },
  methods: {
    couterChange (e) {
      let status = 0;
			if (e > this.data.number) {
				status = 1;
			}
      let info = JSON.parse(JSON.stringify(this.props.info));
      this.setData({
        number: e
      })
      if (info.doubleNum.length > 1 && status == 0) {// 减
				if ((info.doubleNum[info.doubleNum.length-1] - 1) == 0) {
					info.id = info.doubleIds[info.doubleIds.length-1];
					this.delCartItem(info);
					info.cart_number = 0;
					// this.$emit('del', info, 2); // 删除
          this.props.onResetItem(info, 2);
          this.props.onResetCart(info);
					return false;
				}
			}
      if (e == 0) {
        this.delCartItem(info);
        info.cart_number = 0;
        this.props.onResetItem(info, 3)
        this.props.onResetCart(info);
        return false;
      }
      // info.cart_number = 1;
      if (info.doubleNum.length > 1 && status == 1) {
				info.cart_number = info.doubleNum[info.doubleNum.length-1]+1;
				info.id = info.doubleIds[info.doubleNum.length-1];
			} else if (info.doubleNum.length > 1 && status == 0) {
				info.cart_number = info.doubleNum[info.doubleNum.length-1] - 1;
				info.id = info.doubleIds[info.doubleIds.length-1];
			} else {
				info.cart_number = this.data.number;
			}
      info.cart_number = 1;
      // info.add_type = 0;
      if (!this.setCartItem(info, this.props.info.cart_number > e ? 0 : 1)) {
        this.setData({
          number: this.props.info.cart_number
        })
        return false;
      }
      
      this.props.onResetCart();
      this.oldNumber = e;
      if (status == 0) {
        info.cart_number = this.data.number;
        this.props.onResetItem(info, 2)
			}
    },
    /**
     * 跳转到详情
     */
    goDetails() {
      my.setStorageSync({
        key: 'pro_info',
        data: this.props.info
      });
      my.navigateTo({
        url: '/pages/productDetails/setMeal/setMeal?st=1'
      });
    }
  },
});
