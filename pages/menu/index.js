// import Lang from '/mixins/lang';
const eventBus = require('/utils/eventbus.js').eventBus;
let st = null;
Page({
  mixins: [require('../../mixins/addon.js'), require('../../mixins/productCoupon.js')],
  data: {
    bannerList: [],
    config: {
      autoplay: true,
      interval: 3000,
      duration: 500,
      circular: true,
      current: 0
    },
    toView: null,
    isFixed: false,
    isFixed1: false,
    sys: {},
    fixedTop: 0,
    leftList: [],
    menuList: [],
    contentList: [],
    clickActive: 0,
    cartNum: 0,
    cartInfo: {
      number: 0,
      total: 0,
      mtotal: 0,
      list: []
    },
    leftScrollTop: 0,
    isShowModal: false,
    modalInfo: {
      status: 11,
      imgUrl: "/image/service-icon.png",
      msg: ['123']
    },
  },
  onLoad(query) {
    st = this;
    // 页面加载
    console.log(getApp().globalData.cartsInfo);
    // console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
    // getApp().clearCart();
    this.getBanner();
    this.getProductCoupon(1);
    // this.getMenuList();

    this.getAddList();
    this.resetCart();
    // console.log(this.ref);
    // console.log(Math.ceil(4/3));
  },
  onShow() {
    // 页面显示
    // if (my.canIUse('ix.configUI')) {
    //   my.ix.configUI({ type: 'titleBar', default: false })
    //   my.ix.configUI({ type: 'navBar', show: false })
    // }
    console.log('into cart')
    this.resetCart();
  },
  goToIndex () {
    getApp().clearCart();
    console.log("===goToIndex==.cartsInfo==", getApp().globalData.cartsInfo)
    my.redirectTo({
      url: '/pages/index/index'
    })
  },
  /**
   * 菜单加加购添加购物车
   */
  onAdd(info) {
    // this.modalTip.setCartItem(info, 1);
    eventBus.emit('addCart', info)         
    st.resetCart();
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
  onDelCancel(info) {
    if (info && info.discountMyType === 1) {
      this.recoveryProductCoupons(info);
      this.setData({
        'menuList[0].productList': getApp().globalData.cartsInfo.procous,
        'cartInfo.number': getApp().globalData.cartsInfo.number,
        'cartInfo.total': getApp().globalData.cartsInfo.total,
        'cartInfo.mtotal': getApp().globalData.cartsInfo.mtotal,
      })
    }
  },
  resetCart1(list, type) {
    this.setData({
      'cartInfo.number': getApp().globalData.cartsInfo.number,
      'cartInfo.total': getApp().globalData.cartsInfo.total,
      'cartInfo.mtotal': getApp().globalData.cartsInfo.mtotal,
    })
    // console.log(getApp().globalData.cartsInfo);
    if (type == 1) {
      this.createSurplus(this.data.productCoupons);
      this.setData({
        'menuList[0].productList': getApp().globalData.cartsInfo.procous
      })
    }
  },
  resetCart(info, type) {
    console.log(getApp().globalData.cartsInfo)
    st.setData({
      'cartInfo.number': getApp().globalData.cartsInfo.number,
      'cartInfo.total': getApp().globalData.cartsInfo.total,
      'cartInfo.mtotal': getApp().globalData.cartsInfo.mtotal,
      'cartInfo.list': getApp().globalData.cartsInfo.list,
      productCoupons: getApp().globalData.cartsInfo.procous,
    })
    if (st.data.menuList[0] && st.data.menuList[0].id === 'coupon') {
      st.setData({
        'menuList[0].productList': getApp().globalData.cartsInfo.procous
      })
    }
    if (info) {
      st.setAddOn(info, 1);
    }
  },
  goProCoupon() {
    my.navigateTo({
      url: '/pages/productCoupon/productCoupon'
    })
  },
  async getBanner() {
    let bannerRes = await getApp().globalData.fetchApi.get_banner_list({
      "params": {
        channel: getApp().globalData.storeInfo.channel,
        position: "orderMenu",
      }
    })
    console.log("---首页banner---", bannerRes);
    this.setData({
      bannerList: bannerRes.body.list
    })
  },
  /**
   * 获取菜单数据
   */
  async getMenuList() {
    // console.log(this.store_info);
    console.log('---页面请求菜单接口开始---', new Date().getTime());
    let nearStoreRes = await getApp().globalData.fetchApi.get_new_menu_query({
      // todo channel 调整为1
      params: {
        sellType: 1,
        channel: getApp().globalData.storeInfo.channel,
        storeCode: getApp().globalData.storeInfo.storeCode,
        vipId: getApp().globalData.userInfo.id,
        disabledFlag: "Y"
      }
    })
    console.log('---页面请求菜单接口结束---', new Date().getTime());
    // this.list = nearStoreRes.body.list;
    this.createList(nearStoreRes.body);
  },
  /**
   * 生成左右数组
   * @param {Object} list
   */
  createList(list) {
    // if (this.li);
    if (!list) return false;
    let left = [],
        right = [],
        pos = [];
    const rate = getApp().globalData.sys.windowWidth / 1080;
    if (this.data.productCoupons.length > 0) {
      list.unshift({
        productList: this.data.productCoupons,
        id: 'coupon'
      })
    }
    for (var i = 0, val; val = list[i++];) {
        for (var j = 0, sval; sval = val.productList[j++];) {
          sval.classExtId = val.classExtId;
				  sval.images = sval.images ? JSON.parse(sval.images) : '';
        }
        let oneHeight = parseInt(515 * rate);
				let top = i == 1 ? 0 : pos[i-2].top + Math.ceil(list[i-2].productList.length/3)*oneHeight;
				pos.push({
					top: parseInt(top),
				})

    }
    // console.log(top)
    this.scorllPos = pos;
    this.setData({
      menuList: list
    })
    console.log('---页面处理菜单数据整合结束---', new Date().getTime());
    // this.getPos(left);
  },
  /**
   * 切换左侧类别
   * @param {Object} index
   */
  changeCategory(event) {
    console.log(event);
    if (event.target.dataset.index == this.data.clickActive) {
      return false;
    }
    // this.clickActive = index;
    let target = 'target_' + event.target.dataset.toView;
    // console.log(target);
    this.clickScorll = 1; 
    this.setData({
      clickActive: event.target.dataset.index,
      toView: target
    })
  },
  rightChange() {
			this.clickScorll = 0;
  },
  /**
   * 滚动右边 切换左侧菜单
   */
  setLeftHandle(top) {
    let list = this.scorllPos ? JSON.parse(JSON.stringify(this.scorllPos)) : [];
    // console.log('---use list pos---', list);
    for (let i = list.length - 1; i >= 0; i--) {
      // console.log(list[i])
      if (top > list[i].top) {
        if (this.data.clickActive != i) {
          // this.clickActive = i;
          this.setData({
            clickActive: i
          })
          this.setLeftScorllTop();
        } 
        // else if (i == (list.length-1)) {
        //   console.log(0)
        //     this.setData({
        //       clickActive: 0,
        //       leftScrollTop: 0
        //     })
				// 		this.leftScorllTop = 0;
				// 	}
        return false;
      }
    }
  },
  /**
   * 监听滚动条
   * @param {Object} event
   */
  onProductsScroll(event) {
    // console.log('---滚动---', event)
    // this.openTimeOut();
    // this.scroll_top = event.detail.scrollTop;
    if (this.data.toView) {
      this.setData({
        toView: null
      })
    }
    const top = event.detail.scrollTop + 5;
    let status = this.data.isFixed;
    if (top >= 100 && !this.data.isFixed) {
      // this.isFixed = true;
      status = true;

    } else if (top < 100 && this.data.isFixed) {
      // this.isFixed = false;
      status = false;
    }
    // console.log(top)
    if (this.data.isFixed != status) {
      this.setData({
        isFixed: status
      })
      if (status) {
					// this.isFixed1 = true;
          this.setData({
            isFixed1: true
          })
				} else {
					let sto = setTimeout(() => {
            this.setData({
              isFixed1: false
            })
						clearTimeout(sto)
					}, 200)
				}
    }
    if (this.clickScorll == 1) {
      return false
    };
    // console.log(event);
    if (event.detail.scrollHeight - (event.detail.scrollTop + getApp().globalData.sys.windowHeight) < 100) {
      if (this.data.clickActive == (this.data.menuList.length-1)) {
				return false;
			}
      this.setData({
        clickActive: (this.data.menuList.length-1)
      })
      return false;
    } else if (event.detail.scrollTop < 100){
      
      this.leftScorllTop = 0;
       if (this.data.clickActive == 0) {
				this.setData({
          leftScrollTop: 0
        })
			} else {
        this.setData({
          clickActive: 0,
          leftScrollTop: 0
        })
      }
      // this.setData({
      //   clickActive: 0
      // })
      return false;
    }
    this.setLeftHandle(top)
  },
  // scrolltolower(e) {
	// 		console.log('---到底部了--', e)
	// 		if (this.data.clickActive == (this.data.leftList.length-1)) {
	// 			return false;
	// 		}
  //     this.setData({
  //       clickActive: (this.data.leftList.length-1)
  //     })
	// 		this.setLeftScorllTop();
	// 	},
  /**
   * 获取每个锚点的位置
   * @param {Object} list
   */
  async getPos(list) {
    let that = this;
    if (this.scorllPos && this.scorllPos.length > 0) return false;
    that.getEleRect(list);
  },
  /**
   * 生成锚点数组
   * @param {Object} list
   */
  async getEleRect(list) {
    let arr = [];
    for (var i = 0; i < list.length; i++) {
      arr.push({
        first: await this.getRect(list[i].productFirstId)
      })
    }
    console.log('---list pos---', arr);
    this.scorllPos = arr;
    // console.log('---处理菜单数据整合结束---', Date.parse(new Date()));
  },
  /**
   * 获取某个元素的位置信息
   * @param {Object} id
   */
  getRect(id) {
    let that = this;
    return new Promise((resolve, reject) => {
      my.createSelectorQuery().select('#target_' + id).boundingClientRect().exec((ret) => {
        // console.log(ret);
        resolve(ret[0])
      })
    })
  },
  onCloseModal() {
      const that = this
      that.setData({
          isShowModal: false,
      })
  },
  /**
   * 监听banner切换,解决卡顿
   * @param {Object} e
   */
  changeSwiper(e) {
    // console.log(e);
    if (e.detail.source == "touch" || e.detail.source == "autoplay") {
      // this.config.current = e.detail.current;
      this.setData({
        'config.current': e.detail.current
      })
    };
  },
  onGoRouter(event) {
    let item = event.target.dataset.index;
    switch (item.jumpType) {
      case "h5":
        my.navigateTo({
          url: "/pages/webview/index?url=" + item.jumpUrl
        })
        break;
      case "page":
        my.navigateTo({
          url: item.jumpUrl
        })
        break;
      default:
        break;
    }
  },
  onReady() {
    // 页面加载完成
    let that = this;
    // my.createSelectorQuery().select('#all-tops').boundingClientRect().exec((ret) => {
    //   // console.log(ret);
    //   console.log("得到布局位置信息" + JSON.stringify(ret));

    //   that.setData({
    //     fixedTop: ret[0].height
    //   })
    // })
  },
  onProductsScrollLeft(event) {
    // console.log('---左侧滚动条---', event);
    this.leftScorllTop = event.detail.scrollTop;// 滚动条位置
  },
  setLeftScorllTop() {
    let rate = getApp().globalData.sys.windowWidth / 1080,
      oneHeight = parseInt(230 * rate),// 单个高度
      targetTop = oneHeight*(this.data.clickActive),// 当前左侧选中的距离顶部高度
      allTop = oneHeight*(this.data.menuList.length),// 总高度
      differHeight = 0,// 相差高度
      viewHeight = getApp().globalData.sys.windowHeight; // 可是高度
    if (this.data.cartInfo.number > 0) {
      let t = getApp().globalData.isFullSucreen ?  parseInt(268 * rate) : parseInt(221 * rate);
      viewHeight = viewHeight - t;
    }
    if (allTop > viewHeight) {
      this.setData({
        leftScrollTop: targetTop-oneHeight/2
      })
      this.leftScorllTop = targetTop-oneHeight/2;
    }
  },
onHide() {
  // 页面隐藏
  },
  // onUnload() {
  //   // 页面被关闭
  // },
  onTitleClick() {
    // 标题被点击
  },
  onPullDownRefresh() {
    // 页面被下拉
  },
  onReachBottom() {
    // 页面被拉到底部
  },
  // onShareAppMessage() {
  //   // 返回自定义分享信息
  //   return {
  //     title: 'My App',
  //     desc: 'My App description',
  //     path: 'pages/index/index',
  //   };
  // },
});
