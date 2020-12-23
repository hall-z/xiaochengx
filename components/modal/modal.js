Component({
  mixins: [],
  data: {
    noStatus: false,
    active: [],
    active1: 0 
  },
  props: {
    isShowModal: false, //是否显示modal
    isShowBtn: false, //是否默认显示我知道了
    modalInfo: {},// modalInfo.status == 10 加加购
    onCloseModal: () => {},
    onAdd: () => {}
  },
  onInit(){
    console.log('1')
  },
  didMount() {},
  didUpdate() {
    if (this.data.language != getApp().globalData.language) {
      this.setData({
        language: getApp().globalData.language,
      })
    }
    this.setData({
      active: [],
      active1: 0 
    })
  },
  didUnmount() {},
  methods: {
    catchtouchmove() {

    },
    closeModal () {
      // console.log(0)
      if (this.props.modalInfo.status == 10 && this.data.noStatus) { // 加购弹窗并且选择了不再提醒
        getApp().globalData.isRecommendAddOn = 1;
      }
      // this.setData({
      //   active: [],
      //   active1: 0 
      // })
      this.props.onCloseModal()
    },
    changeStatus() {
      // this.setData({
      //   noStatus: !this.data.noStatus
      // })
      //关闭加价购的弹窗，不再提醒
      this.setData({
        noStatus: true
      })
      getApp().globalData.isRecommendAddOn = 1;
      this.props.onCloseModal()
    },
    onSelect(index) {
      if (this.props.modalInfo.status == 10) {
        let ids = this.data.active.findIndex((e) => e == index),
          list = this.data.active;
          if (ids > -1) {
            list.splice(ids, 1);
          } else {
            
            list.push(index)
          }
          this.setData({
            active: list
          })
      } else {
        this.setData({
          active1: index
        })
      }
      
    },
    goCheck(e) {
      console.log(this.data.active)
      if (this.props.modalInfo.status == 10) {// 加购弹窗
        for(let i = 0;i<this.data.active.length; i++) {
            this.addToCart(this.data.active[i]);
        }
        this.closeModal();
      } else if (this.props.modalInfo.status == 11) {// 商品券加购
        this.props.onAdd(this.data.active1);
        this.closeModal();
      }
    },
    addToCart(num) {
      console.log("==addToCart==", this.props.modalInfo)
			let info = JSON.parse(JSON.stringify(this.props.modalInfo.alist[num]));
			info.oid = info.id;
			if (this.props.modalInfo.info.productType == 3) {

        let selectItem = this.props.modalInfo.info.selectItem
        // if(typeof(selectItem)=='string') {
        //   selectItem = JSON.parse(selectItem)
        // }
        info.id = selectItem+'_'+this.props.modalInfo.info.productCode+'_'+info.productSystemId;
        info.myTParentId = selectItem;

			} else {
				info.id = this.props.modalInfo.info.productCode+'_'+info.productSystemId;
				info.myTParentId = this.props.modalInfo.info.productCode;
			}
			info.name = info.productName;
			info.nameEn = info.productNameEn;
			let img = info.productImage;
			if (typeof(img) == 'string') {
				img = JSON.parse(img);
			}
			info.images = img;
			info.discountMyType = 2;
			
			info.cart_number = 1;
			info.add_type = 1;
			console.log('---菜单加购---', info)
			// this.$store.commit('delCartItem', item);
			// this.$store.commit('setCartItem', info);
      this.props.onAdd(info);
			
		}
  },
});
