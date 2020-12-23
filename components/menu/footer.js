Component({
  mixins: [],
  data: {
    isShowModal: false,
    modalInfo: {
      status: 1,
      imgUrl: '/image/error-icon.png',
      msg: [getApp().getBaseLanguage('sok_order_limit1'), getApp().getBaseLanguage('sok_order_limit2'), getApp().getBaseLanguage('sok_order_limit3')]
    },
  },
  props: {
    info: {},
    openTimeOut: (data) => console.log(data),
  },
  onInit(){},
  didMount() {
    this.setData({
      modalInfo: {
        status: 1,
        imgUrl: '/image/error-icon.png',
        msg: [getApp().getBaseLanguage('sok_order_limit1'), getApp().getBaseLanguage('sok_order_limit2'), getApp().getBaseLanguage('sok_order_limit3')]
      },
    })
  },
  didUpdate() {},
  didUnmount() {},
  methods: {
    onCloseModal () {
      this.setData({
        isShowModal: false
      })
    },
    goCart() {
      my.navigateTo({
        url: '/pages/shoppingCart/shoppingCart'
      });
    },
    goBalance() {
      let totalPrice = 0
      if(this.data.userInfo && this.data.userInfo.id) {
         totalPrice = this.props.info.mtotal
      }else {
        totalPrice = this.props.info.total
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
    }
  },
});
