Component({
  mixins: [],
  data: {
    couponInfo: {}
  },
  props: {
    coupon: {},
    isToDetails: true,
		couponDisabled: false,
		couponBtn: getApp().getBaseLanguage('claim_now'),
    onCloseModal: () => {}
  },
  didMount() {
    this.setData({
      couponInfo: this.props.coupon.couponTypeInfo
    })
  },
  didUpdate() {},
  didUnmount() {},
  methods: {
    clickCopponBtn() {
      this.props.onCloseModal(this.props.coupon);
    }
  },
});
