import Carts from '/mixins/carts.js';
const eventBus = require('/utils/eventbus.js').eventBus;
Component({
  mixins: [Carts],
  data: {
    number: 1,
    total: 0,
    mtotal: 0
  },
  props: {
    info: {},
    menuInto: 0,
    onReset: (data) => console.log(data),
  },
  didMount() {
    console.log('didMount', this.props);
    eventBus.on('addDCart', (info) => {
      this.setCartItem(info, 1);
      console.log("---event addDCart bus---", info)
    })
    eventBus.on('delDCart', (info) => {
      this.delCartItem(info);
      console.log("---event delDCart bus---", info)
    })
  },
  didUpdate() {
    console.log('didUpdate', this.props)
    if (this.props.menuInto == 1 && !this.first) {
      // this.number = this.props.info.cart_number
      this.setData({
        number: this.props.info.cart_number
      })
      this.first = true;
    }
    if (!this.ornum) {
				this.ornum = this.props.info.cart_number;
			}
    this.calTotal();
  },
  didUnmount() {
    eventBus.remove('addDCart');
    eventBus.remove('delDCart');
  },
  methods: {
    goBack() {
      my.navigateBack();
    },
    calTotal(info) {
			// this.number = this.info.cart_number;
			// this.total = this.number * parseFloat(this.info.salesPrice);
      this.setData({
        total: this.data.number * parseFloat(this.props.info.salesPrice),
        mtotal: this.data.number * parseFloat(this.props.info.membershipPrice),
      })
		},
		couterChange (e) {
      console.log(e);
			// this.number = e;
			// this.total = e * parseFloat(this.info.salesPrice);
      this.setData({
        number: e,
        total: e * parseFloat(this.props.info.salesPrice),
        mtotal: e * parseFloat(this.props.info.membershipPrice),
      })

		},
		addCarts() {
      let info = JSON.parse(JSON.stringify(this.props.info));
      if (this.props.menuInto == 1 && info.doubleNum.length > 1) {
				for (let i = info.doubleNum.length-1; i > 0; i--) {
					info.id = info.doubleIds[i];
					this.delCartItem(info);
				}
				info.id = info.doubleIds[0];
			} 
      info.cart_number = this.data.number;
      if (info.productType == 3 || info.productType == 2) {
				info.selectItem = info.selectItem ? JSON.stringify(info.selectItem) : [];
			}
      if (!this.setCartItem(info, 1)){
				return false;
			};
      // my.showToast({
      //   type: 'success',
      //   content: getApp().getBaseLanguage('successful_add_cart'),
      //   duration: 2000,
      //   success: () => {
      if (this.props.menuInto == 0 && getApp().globalData.isRecommendAddOn == 0) {
        // this.$emit('reset', info, 1);
        this.props.onReset(info, 1)
      } else if (this.props.menuInto == 1) {
        if (this.ornum > this.number) {
          // this.$emit('reset', info, 2);
          this.props.onReset(info, 2)
        }
        my.navigateBack();
      } else {
        my.navigateBack();
      }
      //   },
      // });
    }
  },
});
