import Carts from '/mixins/carts.js';
const eventBus = require('/utils/eventbus.js').eventBus;
import Fly from '/mixins/fly.js';
Component({
  mixins: [Carts, Fly],
  data: {
    couponBtn: '立即使用',
  },
  props: {
		type: 0,
    item: {},
    onResetCart: (data) => console.log(data),
    onSelect: (data) => console.log(data),
		onOpenTimeOut: (data) => console.log(data),
		onDelCancel: (data) => console.log(data)
  },
  didMount() {
		eventBus.on('addPCart', (info) => {
      // this.setCartItem(info, info.atype ? 2 : 1);
      console.log("---event addPCart bus---", info)
			this.aindex = info;
			this.addCart();
    })
	},
  didUpdate() {},
  didUnmount() {},
  methods: {
    clickCopponBtn(e) {
      let info = JSON.parse(JSON.stringify(this.props.item)),
				index = getApp().globalData.cartsInfo.list.findIndex((e) => e.discountMyType == 1 && e.cinfo.couponCode == info.couponCode);
			if (index > -1) {
				let idf = JSON.parse(JSON.stringify(getApp().globalData.cartsInfo.list[index]));
				this.delCartItem(idf);
				this.props.onDelCancel(idf);
				// my.showToast({
				// 	content: getApp().getBaseLanguage('add_cart_over'),
				// });
				return false;
			}
			for (let i = 0; i < info.couponTypeInfo.items.length; i++) {
				if (typeof(info.couponTypeInfo.items[i].images) == 'string') {
					info.couponTypeInfo.items[i].images = JSON.parse(info.couponTypeInfo.items[i].images);
				}
				info.couponTypeInfo.items[i].discountMyPrice = info.couponTypeInfo.items[i].productCouponValue;
			}
			this.selectInfo = info;
			this.aindex = 0;
			if (info.couponTypeInfo.items.length > 1) {
        this.props.onSelect(this.selectInfo);
				this.show = true;
				return false
			}
			if (this.props.type == 0) {
				this.addCart();
			} else {
				this.touchOnGoods(e);
			}
    },
    addCart() {
			this.isFly = 0;
			let info = JSON.parse(JSON.stringify(this.selectInfo));
			delete info.couponTypeInfo.items;
			this.selectInfo.couponTypeInfo.items[this.aindex].oid = this.selectInfo.couponTypeInfo.items[this.aindex].id;
			this.selectInfo.couponTypeInfo.items[this.aindex].id = info.id+'_'+this.selectInfo.couponTypeInfo.items[this.aindex].id;
			let obj = {
				discountMyType: 1,
				...this.selectInfo.couponTypeInfo.items[this.aindex],
				cart_number: 1,
				cinfo: info
			}
      this.setCartItem(obj);
			
			// 多个商品 再次添加替换掉原来的
			// this.$store.commit('setCartItem', obj);
			// uni.showToast({
			// 	title: getApp().getBaseLanguage('successful_add_cart'),
			// 	icon: 'success',
			// 	mask: true
			// })
			// this.createSurplus(this.productCoupons);
			// this.show = false;
			// let list = JSON.parse(JSON.stringify());
			if (this.props.type === 0) {
				my.showToast({
					content: getApp().getBaseLanguage('successful_add_cart'),
				});
			}
      this.props.onResetCart('', 1);
		},
  },
});
