Page({
  data: {
    couponList: [],
		userDiscount: {}
  },
  onLoad(options) {
    // this.getCoupons();
    let that = this;
    my.getStorage({
      key: 'order_coupon_list',
      success: function(res) {
        // my.alert({content: '获取成功：' + res});
        console.log(res.data);
        if (res.data) {
          that.setData({
            couponList: res.data.info.list,
            userDiscount: res.data.info.userDiscount
          })
        }
      },
      fail: function(res){
        // my.alert({content: res.errorMessage});
        my.showToast({
          content: getApp().getBaseLanguage('request_fail'),
          success: () => {
            my.navigateBack();
          }
        });
      }
    });
  },
  async getCoupons () {
    let res = await getApp().globalData.fetchApi.get_can_use_coupon({
      vipId: getApp().globalData.userInfo.id,
      orderAmount: getApp().globalData.cartsInfo.total,
      storeCode: getApp().globalData.storeInfo.storeCode,
      channel: getApp().globalData.storeInfo.channel
    })
    
    console.log(res)
    this.setData({
      couponList: res.body.list,
      userDiscount: res.body.userDiscount
    })
  },
  clickCoppon (e) {
    // console.log(e);
    // return false;
    let type = e.target.dataset.type,
        index = e.target.dataset.index;
			// 1 普通优惠券 2不使用优惠券 3使用员工优惠券
			// console.log(type)
			let curCoupon = {id: 0}
			let curUserCoupon = {id: 0}
			if(type == 1) {
				//使用优惠券
				curCoupon = this.data.couponList[index]
			}else if(type == 3) {
				//使用员工优惠券
				curUserCoupon = this.data.userDiscount
			}
			
			//设置订单确认页页面信息
			let pages = getCurrentPages();
			if(pages.length > 1) {
				let prevPage = pages[ pages.length - 2 ];
				console.log(prevPage)
        prevPage.setData({
          'form.coupons': curCoupon,
          userDiscount: curUserCoupon,
          isUseCoupon: type == 2 ? 2 : 1
        })
        prevPage.totalPrice();
			}
			my.navigateBack({
			    delta: 1 
			})
			
		},
    clickCou(e) {
      console.log(e);
      let curCoupon = {id: 0}
      //使用优惠券
      curCoupon = e;
      let pages = getCurrentPages();
			if(pages.length > 1) {
				let prevPage = pages[ pages.length - 2 ];
				console.log(prevPage)
        prevPage.setData({
          'form.coupons': curCoupon,
          userDiscount: {id: 0},
          isUseCoupon: 1
        })
        prevPage.totalPrice();
			}
			my.navigateBack({
			    delta: 1 
			})
    }
});
