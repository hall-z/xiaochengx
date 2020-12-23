// vendor/nabi/_wechat/pages/campaign/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollTop: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.yBackInfo = {top:0, restore:0};
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var $ = require("../../../sdk/marketing.js");
    $.start.call(this, null);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    var that = this;
    if (that.yBackInfo && typeof that.yBackInfo == "object" && that.yBackInfo.restore) {
      that.yBackInfo.restore = 2; // LOCK
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  }

})