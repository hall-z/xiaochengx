const eventBus = require('/utils/eventbus.js').eventBus;
import config from '/config';
Page({
  mixins: [require('../../mixins/public.js'), require('./pay.js')],
  data: {
    isCanPay: true,
    cartInfo: {
      type: 1, // 1 堂食  2 外带
      number: 0,// 购物车商品数量
      total: 0,// 付款总额
      mtotal: 0,// 付款总额
      list: []// 购物车列表
    },
    total: 0,
    showPay: false,
    isPoint: false,
    form: {
      coupons: {id: 0},
      superPro: [],
      scanCoupon: [],
      discountsPoints: 0
    },
    scanCoupons: [],
    userDiscount: {id: 0}, //员工折扣信息, 如果有员工折扣优先员工折扣, 没有就是显示优惠券第一张
    isUseCoupon: 0, //0 暂无可用 1选择其他优惠券 2不使用优惠券
    addList: [],
    coupons: [],
    userCoupon: {},
    maxPoint: {
      points: 0,
      rate: 0.01
    },
    isShowModal: false,
    modalInfo: {
      status: 1,
      imgUrl: config.phoneScanImg,
      msg: ["请出示您的付款码"]
    },
    noShowCoupons: false
  },
  onLoad(query) {
    // 页面加载
    console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
    this.isRefreshCoupons = false
    this.getAddList();
    this.getCoupons();
    // this.getPoints();
    // console.log(this.data)
    // this.getIsAllProduct();
    this.setData({
        'form.scanCoupon': [],
        'scanCoupons': [],
      })
    eventBus.on('bindGetCoupon', (res) => {
      console.log('---bindGetCoupon---', res)
      let flist = this.data.form.scanCoupon,
          list = this.data.scanCoupons,
          info =JSON.parse(JSON.stringify(res));
      flist.push(info);
      list.push(info);
      this.setData({
        'form.scanCoupon': flist,
        'scanCoupons': list,
        userDiscount: {},
        'form.coupons': {},
      })
      this.getPoints();
    })
  },
  onReady: function() {
    // Do something when page ready.
  },
  onShow() {
    this.resetCart();
    console.log("======isRefreshCoupons===", this.isRefreshCoupons)
    if(this.isRefreshCoupons) {
      this.getCoupons();
      this.isRefreshCoupons = false
    }
  },
  goBack() {
    my.navigateBack();
  },
  onCloseModal() {
    this.setData({
      isShowModal: false,
      isCanPay: true
    })
    clearInterval(this.stin);
    my.ix.offKeyEventChange();
    if (this.payPoll == 1) {
      getApp().globalData.fetchApi.get_order_fail({id: this.orderInfo.id});
      this.payPoll = 0;
    }
  },
  goChooseCoupon () {
			console.log("选择优惠券");
			if(this.data.isUseCoupon == 0) {
				my.showToast({
          content: getApp().getBaseLanguage('not_coupon'),
				});
				return
			}
			if(this.data.isUseCoupon) {
         try {
            my.setStorageSync({
              key: 'order_coupon_list',
              data: {
                info: this.couponsList,
              }
            });
            my.navigateTo({
              url: "/pages/couponList/index",
            })
        } catch (e) {
          //TODO handle the exception
        }
			}
  },
  /**
   * 计算价格
   */
  totalPrice() {
    // 订单金额 =（购物车金额+加购金额+运费）- 优惠券优惠 - 积分抵扣，打折优惠券优惠=购物车金额 -（购物车金额x 折扣）
    // console.log(this.cartTotal)

    let t = this.data.userInfo.id ? this.data.cartInfo.mtotal : this.data.cartInfo.total;
    if (this.data.form.superPro.length > 0) {
      for (let i = 0; i < this.data.form.superPro.length; i++) {
        t = t + this.data.form.superPro[i].activityPrice;
      }
    }

    if(this.data.userDiscount.couponValue) {
				// 员工折扣
        t = t - this.data.userDiscount.discountAmount;
				if (t < 0) {
					t = 0;
				}
    }else if (this.data.form.coupons.id) {
      t = t - this.data.form.coupons.discountAmount;
      if (t < 0) {
        t = 0;
      }
    } else if (this.data.form.scanCoupon.length > 0) {
      for(let i=0;i< this.data.form.scanCoupon.length;i++) {
        if (this.data.form.scanCoupon[i].couponType == 1 && this.data.form.scanCoupon[i].discountType == 2) {
            t = t - this.data.form.scanCoupon[i].couponValue;// 0514
        }
      }
    }
    
    // if (this.data.form.superPro.activityPrice) {
    //   t = t + this.data.form.superPro.activityPrice;
    // }
    
    if (this.data.isPoint) {
      let p = this.data.form.discountsPoints * this.data.maxPoint.rate;
      t = t - p;
    }
    if (t <= 0) {
				t = 0;
		}
    if (parseInt(t) != t) {
      t = parseFloat(t.toFixed(2));
    }
    this.setData({
      total: t
    })
    getApp().globalData.cartsInfo.payPrice = t;
  },
  getIsAllProduct() {
    let ids = 0;// 产品券数量
    for (var i = 0; i < this.data.cartInfo.list.length; i++) {
      if (this.data.cartInfo.list[i].discountMyType == 1) {
        ids++
      }
    }
    // 购物车全部是商品券商品 并且  无加购商品
    if (ids == this.data.cartInfo.list.length && this.data.form.superPro.length < 1) {
      if (!this.data.noShowCoupons) {
        this.setData({
          noShowCoupons: true
        })
      }
      
      if (this.data.isUseCoupon != 0) {
        this.setData({
          isUseCoupon: 0
        })
      }
      if (JSON.stringify(this.data.form.coupons) != '{}') {
        this.setData({
          'form.coupons': {}
        })
      }
      if (JSON.stringify(this.data.userDiscount) != '{}') {
        this.setData({
          'userDiscount': {}
        })
      }
      return false;
    } 
    if (this.data.noShowCoupons) {
      this.setData({
        noShowCoupons: false
      })
    }
  },
  resetCart() {
    let slist = this.getTxt(getApp().globalData.cartsInfo.cartCombList);
    this.setData({
      'cartInfo.number': getApp().globalData.cartsInfo.number,
      'cartInfo.total': getApp().globalData.cartsInfo.total,
      'cartInfo.mtotal': getApp().globalData.cartsInfo.mtotal,
      'cartInfo.list': slist,
    })
    this.totalPrice();
  },
  /**
   * 获取可用积分
   */
  async getPoints() {
    let nearStoreRes = await getApp().globalData.fetchApi.get_order_can_use_point({
      vipId: getApp().globalData.userInfo.id,
      orderAmount: this.dCouponPrice,
    }, false)
    if (nearStoreRes.body.points > 0) {
      this.setData({
        maxPoint: nearStoreRes.body
      })
    }
    this.calculationPoints();
  },
  calculationPoints() {
			if (this.data.isPoint) {
        // this.setData({
        //   'form.discountsPoints': this.data.maxPoint.maxCount
        // })
        this.setData({
          'form.discountsPoints': (parseInt(this.data.maxPoint.maxCount / 10)) * 10
        })
			}
      this.totalPrice();
  },
  /**
   * 对接最有方案
   * @param {Object} info 普通优惠券
   * @param {Object} userCoun 员工折扣 
   */
  calculationCoun(info, userCoun) {
			let t = this.cartTotal,
				c_t = 0,
				u_t = 0;
			if (userCoun.discountAmount >= info.discountAmount) { // 员工折扣大于优惠券这块
				return 1
			} else {
				return 2
			}
	},
  /**
   * 获取优惠券
   */
  async getCoupons() {
    if (this.data.noShowCoupons) {
				return false
			};
    let total = getApp().globalData.userInfo.id ? getApp().globalData.cartsInfo.mtotal : getApp().globalData.cartsInfo.total;
    let nearStoreRes = await getApp().globalData.fetchApi.get_can_use_coupon({
      vipId: getApp().globalData.userInfo.id,
      orderAmount: total,
      storeCode: getApp().globalData.storeInfo.storeCode,
      channel: getApp().globalData.storeInfo.channel,
      sellType: 1,
      orderProducts: this.createPro(0)
    }, false)
    let isC = !nearStoreRes.body.userDiscount.couponValue,
        isUseCoupon = 0,
        coupons = [];
    
    if (this.data.form.scanCoupon.length < 1) {
      this.setData({
        coupons: nearStoreRes.body.list,
        userCoupon: nearStoreRes.body.userDiscount
      })
      this.dCouponPrice = total;
      if (nearStoreRes.body.userDiscount.couponValue && nearStoreRes.body.list.length > 0) {
        let d = this.calculationCoun(nearStoreRes.body.list[0], nearStoreRes.body.userDiscount);
        if (d == 1) {
          // this.userDiscount = nearStoreRes.body.userDiscount
          this.setData({
            userDiscount: nearStoreRes.body.userDiscount,
            'form.coupons': {}
          })
          this.dCouponPrice = total - nearStoreRes.body.userDiscount.discountAmount
        } else if (d == 2) {
          // this.form.coupons = nearStoreRes.body.list[0];
          this.setData({
            userDiscount: {},
            'form.coupons': nearStoreRes.body.list[0]
          })
          this.dCouponPrice =total - nearStoreRes.body.list[0].discountAmount
        }
      } else if (nearStoreRes.body.userDiscount.couponValue) {
        // this.userDiscount = nearStoreRes.body.userDiscount
        this.setData({
          userDiscount: nearStoreRes.body.userDiscount,
          'form.coupons': {}
        })
        this.dCouponPrice = total - nearStoreRes.body.userDiscount.discountAmount
      } else if (nearStoreRes.body.list.length > 0) {
        // this.form.coupons = nearStoreRes.body.list[0];
        this.setData({
          'form.coupons': nearStoreRes.body.list[0],
          userDiscount: {}
        })
        this.dCouponPrice = total - nearStoreRes.body.list[0].discountAmount
      }
    } else {
      this.setData({
        coupons: nearStoreRes.body.list
      })
    }
		

    if(nearStoreRes.body.list.length > 0 || nearStoreRes.body.userDiscount.couponValue){
      isUseCoupon = 1 // 有券
    }
    this.setData({
      isUseCoupon: isUseCoupon
    })
    this.couponsList = nearStoreRes.body;
    this.getPoints();
    // this.totalPrice();
  },
  /**
   * 获取加购商品
   */
  async getAddList() {
    let nearStoreRes = await getApp().globalData.fetchApi.get_add_on_list_new({
      orderAmount: getApp().globalData.userInfo.id ? getApp().globalData.cartsInfo.mtotal : getApp().globalData.cartsInfo.total,
      storeCode: getApp().globalData.storeInfo.storeCode,
      channel: getApp().globalData.storeInfo.channel,
      sellType: 1,
      addOnType:1,
      orderProducts: this.createPro(0)
    })
    this.setData({
      addList: nearStoreRes.body
    })
  },
  /**
   * 选择扫码优惠券
   */
  selectScanCoupon(event) {
      let lt = event.target.dataset.item,
          list = JSON.parse(JSON.stringify(this.data.form.scanCoupon));
      //0602--取消50元优惠券选择---
      // let index = list.findIndex((e) => e.couponCode == lt.couponCode);
      // if (index > -1) {
      //   list.splice(index, 1);
      // } else {
      //   list.push(lt)
      // }
      // this.setData({
      //   userDiscount: {},
      //   'form.coupons': {},
      //   'form.scanCoupon': list
      // })
      //0602-----
     
      if(list.length > 0) {
        return false
      }else {
        list.push(lt)
      }

      // if (lt.couponCode == list[0].couponCode) {
      //   return false;
      // }
      // list[0] = lt;
      
      if (list.length > 0) {
        this.setData({
          userDiscount: {},
          'form.coupons': {},
          'form.scanCoupon': list
        })
      } else {
        this.setData({
          'form.scanCoupon': list
        })
      }
      this.getPoints();
  },
  /**
   * 选择优惠券
   * @param {Object} item
   */
  selectCoupon(event) {
    console.log(event)
    let lt = event.target.dataset.item,
        type = event.target.dataset.type,
        olt = {}; // 1 员工折扣 2 普通优惠券
    if (type == 1) {
      console.log(this.data.userDiscount)
      if (this.data.userDiscount.couponValue != undefined) {
        lt = {};
      };
      this.setData({
        userDiscount: lt,
        'form.coupons': olt,
        'form.scanCoupon': []
      })
    } else {
      if (this.data.form.coupons.id == lt.id) {
        lt = {};
      };
      this.setData({
        userDiscount: olt,
        'form.coupons': lt,
        'form.scanCoupon': []
      })
    }
    getApp().globalData.cartsInfo.coupons = lt;
    // this.totalPrice();
    this.getPoints();
  },
  /**
   * 选择超值加购
   * @param {Object} item
   */
  changeSuper(event) {
    let lt = event.target.dataset.item,
      list = JSON.parse(JSON.stringify(this.data.form.superPro));
    let index = this.data.form.superPro.findIndex((e) => e.productCode == lt.productCode);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(lt)
    }
    this.setData({
      'form.superPro': list
    })
    getApp().globalData.cartsInfo.add = lt;
    // this.totalPrice();
    // this.getIsAllProduct();
    this.getCoupons();
  },
  /**
   * 判断 是否 选中呢
   */
  isInarr(id, arr) {
    let index = arr.findIndex((e) => e.id == id);
    if (index > -1) return true;
    return false
  },
  /**
   * 选择超值加购
   * @param {Object} item
   */
  changeBackSuper(item) {
    let lt = item;
    this.setData({
      'form.superPro': lt
    })
    getApp().globalData.cartsInfo.add = lt;
    // this.totalPrice();
    this.getCoupons();
  },
  /**
		 * 选择是否使用积分
		 */
  changePoint() {
    // this.isPoint = !this.isPoint;
    // let point = 0;
    // if (!this.data.isPoint) {
    //   if (this.data.maxPoint.points * this.data.maxPoint.rate > this.data.total) {
    //     point = 0;
    //   } else {
    //     point = this.data.maxPoint.points;
    //   }
    // } else {
    //   point = 0;
    // }
    // this.setData({
    //   isPoint: !this.data.isPoint,
    //   'form.discountsPoints': point
    // })
    // this.totalPrice();
    // console.log(getApp().getBaseLanguage('no_available_coupon'))
    if (this.data.maxPoint.points == 0) {
				my.showToast({
          // type: 'fail',
          content: getApp().getBaseLanguage('no_available_point')
				})
				return false;
			}else if (this.data.maxPoint.points < this.data.maxPoint.minCount) {
				my.showToast({
					content: getApp().getBaseLanguage('need_more_points') + this.data.maxPoint.minCount +getApp().getBaseLanguage('need_more_points1')
				})
				return false;
			}
      let idss = 0;
			if (!this.data.isPoint) {
				idss = (parseInt(this.data.maxPoint.maxCount / 10)) * 10;
			} else {
				idss = 0;
			}
      this.setData({
        isPoint: !this.data.isPoint,
        'form.discountsPoints': idss
      })
      this.totalPrice();
  },
  changeInputPoint(e) {
    console.log(e);
    let v = e.detail.value;
    let type = e.type;
    let point = e.detail.value;
    // if (v > this.data.maxPoint.points) {
    //   point = this.data.maxPoint.points;
    // } else if (v * this.data.maxPoint.rate > this.data.total) {
    //   point = 0;
    // }
    // this.setData({
    //   'form.discountsPoints': point
    // })
    if(v > this.data.maxPoint.maxCount) {
				if(type != 'blur') {
					my.showToast({
						content: getApp().getBaseLanguage('over_user_point')
					})
				}
        if(type == 'blur') {
          point = this.data.maxPoint.maxCount;
        }
			} else if(v < this.data.maxPoint.minCount) {
				if(type != 'blur') {
					my.showToast({
						content: getApp().getBaseLanguage('need_more_points') + this.data.maxPoint.minCount +getApp().getBaseLanguage('need_more_points1')
					})
				}
				// this.$nextTick(() => {
				// 	this.form.discountsPoints = this.maxPoint.minCount;
				// })
				if(type == 'blur') {
          point = this.data.maxPoint.minCount;
				}
			} else if(v % 10 != 0) {
				if(type != 'blur') {
					my.showToast({
						content: getApp().getBaseLanguage('use_point_int')
					})
				}
				if(type == 'blur') {
          point = (parseInt(v / 10)) * 10;
				}
			} 
      console.log(point)
      // console.log(point.toString())
      this.setData({
      'form.discountsPoints': point
    })
      if (type != 'blur') {
        return false;
      }
      console.log(point)
    
    this.totalPrice();
  },
  /**
   * 前往加购页面
   */
  goAdd() {
    try {
      my.setStorageSync({
        key: 'super_pro_info',
        data: {
          form: this.data.form.superPro,
          list: this.data.addList
        }
      });
      my.navigateTo({
        url: '/pages/purchase/index'
      });
    } catch (e) {
      //TODO handle the exception
    }
  },
  /**
   * 弹起选择支付弹窗
   */
  goPay() {
    this.setData({
      showPay: true
    })
  },
  /**
   * 关闭选择支付弹窗
   */
  close() {
    this.setData({
      showPay: false
    })
  },
  /**
   * 选择支付方式
   */
  selectPay(event) {
    let lt = event.target.dataset.type;
    console.log("=======", this.data.isCanPay)
    if(!this.data.isCanPay) {
      console.log("====不可以点击第二次===")
      return false
    }
    getApp().globalData.cartsInfo.payType = lt;
    getApp().globalData.cartsInfo.discountsPoints = this.data.form.discountsPoints;
    getApp().globalData.cartsInfo.maxPoint = this.data.maxPoint;
    this.goCreatOrder();
  },
  goGetCoupon() {
    if(this.data.scanCoupons.length > 0) {
      my.showToast({
        content: getApp().getBaseLanguage('one_coupon')
      });
      return false;
    }
    my.navigateTo({
      url: '/pages/inputCoupon/inputCoupon'
    })
  },
  createCoupon() {

  },
  onReady() {
    // 页面加载完成
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
  //   return ;
  // },
});
