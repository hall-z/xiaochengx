Page({
  data: {
    superPro: [],
    addList: [],
  },
  onLoad(query) {
    // 页面加载
    console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
    let that = this;
    my.getStorage({
      key: 'super_pro_info',
      success: function(res) {
        // my.alert({content: '获取成功：' + res});
        console.log(res.data);
        if (res.data) {
          that.setData({
            superPro: res.data.form,
            addList: res.data.list
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
  selectItem (event) {
    let lt = event.target.dataset.item,
      list = JSON.parse(JSON.stringify(this.data.superPro));
    let index = this.data.superPro.findIndex((e) => e.productCode == lt.productCode);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(lt)
    }
    this.setData({
      'superPro': list
    })
  },
  /**
   * 选好了
   */
  goSub() {
    let pages = getCurrentPages();
			if (pages.length > 1) {
				//上一个页面实例对象
				let prePage = pages[pages.length - 2];
				console.log(prePage);
				//关键在这里
        // prePage.__proto_.
        prePage.setData({
          'form.superPro': this.data.superPro
        })
        prePage.isRefreshCoupons = true
        // prePage.changeBackSuper(this.data.superPro);
        // prePage.__proto__.changeBackSuper(this.data.superPro);
			}
      this.goBack();
  },
  goBack() {
    my.navigateBack();
  },
  onReady() {
    // 页面加载完成
  },
  onShow() {
    // 页面显示
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
