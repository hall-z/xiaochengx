// vendor/nabi/_wechat/pages/campaign/jump.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    appid: null,
    path: null,
    jumpFailed: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.appid && options.path) {
      this.setData({
        appid: options.appid,
        path: decodeURIComponent(options.path)
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const that = this;
    if (that.data.appid && that.data.path) {
      wx.navigateToMiniProgram({
        appId: that.data.appid,
        path: that.data.path,
        envVersion: 'trial',
        fail: function (error) {
          if (error.errMsg.indexOf('by user TAP gesture') > 0) {
            // 跳转失败
            that.setData({jumpFailed: 1});
          } else {
            // 用户点击取消
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      appid: null,
      path: null,
      jumpFailed: 0
    });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  onCancel: function () {
    this.setData({
      appid: null,
      path: null,
      jumpFailed: 0
    });
    wx.navigateBack();
  }


})