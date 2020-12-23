let storeInfo = {};
import config from '/config';
Page({
  data: {
    pay_status: 1, // 1 支付中 支付中在等待返回结果 2 支付成功 3 出了取餐码
    info: {
      mealNo: '',
      orderStauts: 0,
      orderNoorderNo: '',
      ordePrice: 0,
      payPrice: 0
    },
    isShowModal: false,
    modalInfo: {
      status: 1,
      imgUrl: config.phoneScanImg,
      msg: ["请出示您的付款码"]
    },
  },
  onUnload() {
    if (this.sto) {
      clearInterval(this.sto);
    }
    if (this.sto1) {
      clearTimeout(this.sto1);
    }
  },
  onLoad(query) {
    this.setData({
      paySucessImg: config.paySucessImg
    })
    this.obj = query;
    // this.obj = {
    //   id: '5ebcab687195c200016dd4dd'
    // };
    // this.getOrderDetails(2);
    // return;
    // this.setData({
    //     isShowModal: true,
    //     modalInfo:{
    //       status: 5,
    //       imgUrl: "/image/service-icon.png",
    //       msg: [getApp().getBaseLanguage('sok_no_tip1'), getApp().getBaseLanguage('sok_no_tip2')]
    //     }
    //   })
    // this.dtime = 0;
    // this.get_order_polling(2);
    if (query.sptype == 1) {// 0元支付 直接获取详情
      // sptype
      this.setData({
        pay_status: 2
      })
      this.getOrderDetails(2);
      return false;
    }
    this.sendPayCode();// 调用支付接口 
    // this.obj.sn = '5e4d03d71041e10001828da2';
    // this.adjust_point();
    this.storeInfo = getApp().globalData.storeInfo;
    console.log('---支付后门店信息---', this.storeInfo)
    // 页面加载
    console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
    return false;
  },
  /**
   * 将付款码传给后台
   */
  async sendPayCode() {
    let that = this,
      data = {
        id: this.obj.id,
        orderNo: this.obj.sn,
        payDynamicId: this.obj.code,
        buyerId: getApp().globalData.userInfo.id,
        deviceId: getApp().globalData.storeInfo.deviceNo,
        ftoken: ''
      };
    // 0529 添加支付刷脸参数 开始
    if (getApp().globalData.cartsInfo.payType == 3) {
      data.payway = 2;
    }
    // 0529 添加支付刷脸参数 结束
    getApp().globalData.fetchApi.get_to_pay(data).then((res) => {
      getApp().sendTracking('PAY_API_SUCCESS', res);
      if (res.body.payInfo.status == 'IN_PROG') {
        that.getOrderDetails(1);
        that.dtime = 0;
        that.get_order_polling(2);
        return false
      }
      that.setData({
        pay_status: 2
      })
      that.getOrderDetails(2);
    }).catch((e) => {
      getApp().sendTracking('PAY_API_FILED', e);
      getApp().globalData.fetchApi.get_order_fail({ id: this.obj.id });
      my.navigateBack();
    });
  },
  /**
   * 获取订单详情
   */
  async getOrderDetails(type) {
    let that = this;
    console.log("---调用详情接口，同时调用页面倒计时，防止提前执行退出当前页面 ---")
    that.openTimeOut()
    let res = await getApp().globalData.fetchApi.get_order_details({
      orderNo: this.obj.id
    })
    console.log("---点餐订单详情---", res)
    if (res.code == "0") {
      // this.orderDetailsInfo = res.body;
      if (res.body.orderStatus == 0) {
        if (type == 2) {
          that.dtime = 0;
          that.get_order_polling(1);
        }

        that.setData({
          // pay_status: 3,
          info: res.body
        })
      } else {

        that.setData({
          pay_status: 3,
          info: res.body
        })
        console.log('---直接开始组合打印数据---')
        that.printer();
      }
    }
  },
  get_order_polling(type = 1) {
    let that = this;
    if (type == 2) {
      getApp().sendTracking('OPEN_PAY_POLLING', {
        ptime: this.dtime,
        ...this.obj
      });
    } else {
      getApp().sendTracking('OPEN_STATUS_POLLING', {
        ptime: this.dtime,
        ...this.obj
      });
    }
    getApp().globalData.fetchApi.get_order_details({ //get_order_polling(id: this.obj.id)
      orderNo: this.obj.id
    }).then((res) => {
      if (type == 2 && res.body.payStatus == 1) {// 轮询支付信息，支付成功之后，
        // that.sendPayCode();
        that.setData({
          pay_status: 2
        })
        if (that.sto) {
          clearInterval(that.sto);
        }
        if (res.body.orderStatus == 0) {
          getApp().sendTracking('OPEN_STATUS__POLLING_SUCCESS', that.data.info);
          console.log('---支付轮询结束 还未接单---')
          that.dtime = 0;
          that.get_order_polling(1);
        } else {
          that.setData({
            pay_status: 3,
            'info.orderStatus': res.body.orderStatus,
            'info.mealNo': res.body.mealNo,
          })
          getApp().sendTracking('OPEN_STATUS__POLLING_SUCCESS', that.data.info);
          console.log('---支付轮询结束 并且有取餐码开始获取详情---')
          that.getOrderDetails(1);
          // that.printer();
        }
        return false;
      } else if ((type == 1 && res.body.orderStatus == 0) || (type == 2 && res.body.payStatus == 0)) {
        if (!that.sto) {
          let ttime = type == 1 ? 25 : 24;
          that.sto = setInterval(() => {// 轮询查询订单数据
            console.log('---订单接口轮询，当前计时，轮询类型（1 订单，2 支付）---', that.dtime, type);
            if (that.dtime == ttime) {// 
              clearInterval(that.sto);
              if (type == 2) {// 获取支付信息轮询
                getApp().sendTracking('OPEN_PAY_POLLING_FILED', that.data.info);
                that.openTimeOut()
                that.payPoll = 1;
                that.setData({
                  isShowModal: true,
                  modalInfo: {
                    status: 1,
                    imgUrl: "/image/error-icon.png",
                    msg: [getApp().getBaseLanguage('sok_pay_failed')]
                  }
                })
                that.sto1 = setTimeout(() => {
                  clearTimeout(that.sto1)
                  that.payPoll = 0;
                  getApp().globalData.fetchApi.get_order_fail({ id: that.obj.id });
                  
                  my.navigateBack();
                }, 2000)
              } else {// 获取订单信息轮询
                getApp().sendTracking('OPEN_STATUS__POLLING_FILED', that.data.info);
                that.setData({
                  pay_status: 3,
                  isShowModal: true,
                  modalInfo: {
                    status: 1,
                    imgUrl: "/image/service-icon.png",
                    msg: [getApp().getBaseLanguage('sok_no_tip1'), getApp().getBaseLanguage('sok_no_tip2')]
                  }
                })
                // that.setData({
                //   info: res.body
                // })
                console.log('---没有取餐码，开始组合打印数据---');
                that.printer();
              }
              return false;
            }
            that.get_order_polling(type);
            that.dtime += 1;
            if (that.dtime == 10) {
              console.log('---重启页面倒计时，防止提前离开页---', that.dtime, type);
              that.openTimeOut()
            }
          }, 3000)
        }
      } else {
        
        if (that.sto) {
          clearInterval(that.sto);
        }
        that.setData({
          pay_status: 3,
          'info.orderStatus': res.body.orderStatus,
          'info.mealNo': res.body.mealNo,
        })
        getApp().sendTracking('OPEN_STATUS__POLLING_SUCCESS', that.data.info);
        // console.log('---轮询结束开始组合打印数据---')
        console.log('---订单轮询结束 并且有取餐码开始获取详情---')
        that.getOrderDetails(1);
        // that.printer();
      }
    })
  },
  // 
  // get_order_adjust_point
  adjust_point() {
    let that = this;
    if (getApp().globalData.cartsInfo.discountsPoints > 0) {
      getApp().globalData.fetchApi.get_order_adjust_point({
        vipId: getApp().globalData.userInfo.id,
        changePoints: getApp().globalData.cartsInfo.discountsPoints,
        orderPrice: getApp().globalData.cartsInfo.payPrice,
        orderNo: this.obj.sn
      }).then((res) => {
        that.clearGlobal();
      })
      return false;
    }
    that.clearGlobal();
  },
  /**
   * 打印
   */
  printOrder() {
    this.printer();
  },

  printer_title() {
    try{
      return [
        { 'cmd': 'addSelectPrintModes', 'args': ['FONTA', 'ON', 'ON', 'ON', 'ON'] },
        { 'cmd': 'addSelectJustification', 'args': ['CENTER'] },
        { 'cmd': 'addSetCharcterSize', 'args': ['MUL_2', 'MUL_2'] },
        { 'cmd': 'addText', 'args': ['POPEYES欢迎您！\n'] },
        { 'cmd': 'addSetCharcterSize', 'args': ['MUL_1', 'MUL_1'] },
        { 'cmd': 'addPrintAndLineFeed', 'args': [] },
      ]
    }catch(e){
        //TODO handle the exception
        getApp().sendTracking('CREATE_PRINTER_FAIL', Object.assign(...this.data.info, {
          qerror: e,
          qcode: '组合小票头部数据失败'
        }));
      }

  },
  printer_store(store_title_sub, store_addr, store_num) {
    try{
      return [
        { 'cmd': 'addSelectPrintModes', 'args': ['FONTA', 'OFF', 'OFF', 'OFF', 'OFF'] },
        { 'cmd': 'addSelectJustification', 'args': ['CENTER'] },
        { 'cmd': 'addText', 'args': [store_title_sub || ''] },
        // { 'cmd': 'addText', 'args': ['漕河泾20640'] },
        { 'cmd': 'addPrintAndFeedLines', 'args': ['1'] },
        { 'cmd': 'addText', 'args': [store_addr || ''] },
        // { 'cmd': 'addText', 'args': ['上海市徐汇区虹梅路1535号星联科研大厦5号楼\n'] },
        { 'cmd': 'addPrintAndFeedLines', 'args': ['1'] },
        { 'cmd': 'addText', 'args': ['餐厅电话:'] },
        //  { 'cmd': 'addText', 'args': ['门店电话:021-60365232'] },
        { 'cmd': 'addText', 'args': [store_num || ''] },
        { 'cmd': 'addPrintAndFeedLines', 'args': ['1'] },
        { 'cmd': 'addText', 'args': ['----------------------------------------------\n'] },
      ]
    }catch(e){
        //TODO handle the exception
        getApp().sendTracking('CREATE_PRINTER_FAIL', Object.assign(...this.data.info, {
          qerror: e,
          qcode: '组合小票门店数据失败'
        }));
      }
  },

  printer_order(etype) {
    try{
      let mealNo = this.data.info.mealNo ? this.data.info.mealNo : '-';
      return [
        { 'cmd': 'addSelectPrintModes', 'args': ['FONTA', 'ON', 'ON', 'ON', 'OFF'] },
        { 'cmd': 'addSetCharcterSize', 'args': ['MUL_2', 'MUL_2'] },
        { 'cmd': 'addText', 'args': ['请打开【POPEYES点餐】小程序->我的订单->查看详情，关注取餐状态！'] },
        { 'cmd': 'addSetCharcterSize', 'args': ['MUL_1', 'MUL_1'] },
        { 'cmd': 'addPrintAndFeedLines', 'args': ['1'] },
        { 'cmd': 'addSelectPrintModes', 'args': ['FONTA', 'OFF', 'OFF', 'OFF', 'OFF'] },
        { 'cmd': 'addText', 'args': ['----------------------------------------------\n'] },
        { 'cmd': 'addSelectJustification', 'args': ['LEFT'] },
        { 'cmd': 'addText', 'args': ['取餐号'] },
        { 'cmd': 'addSelectPrintModes', 'args': ['FONTA', 'ON', 'ON', 'ON', 'ON'] },
        { 'cmd': 'addPrintAndFeedLines', 'args': ['1'] },
        { 'cmd': 'addText', 'args': [mealNo || ''] },
        { 'cmd': 'addPrintAndFeedLines', 'args': ['1'] },
        { 'cmd': 'addSelectPrintModes', 'args': ['FONTA', 'OFF', 'OFF', 'OFF', 'OFF'] },
        { 'cmd': 'addText', 'args': ['订单号:'] },
        { 'cmd': 'addText', 'args': [this.data.info.orderNo || ''] },
        { 'cmd': 'addPrintAndLineFeed', 'args': [] },
        { 'cmd': 'addText', 'args': ['订单渠道:'] },
        { 'cmd': 'addText', 'args': ['大屏点餐机'] },
        { 'cmd': 'addPrintAndLineFeed', 'args': [] },
        { 'cmd': 'addText', 'args': ['交易时间:'] },
        { 'cmd': 'addText', 'args': [this.data.info.orderTime || ''] },
        { 'cmd': 'addPrintAndLineFeed', 'args': [] },
        { 'cmd': 'addText', 'args': ['食用方式:'] },
        { 'cmd': 'addText', 'args': [etype || ''] },//1 堂食  2 外带
        { 'cmd': 'addPrintAndFeedLines', 'args': ['1'] },
        { 'cmd': 'addText', 'args': ['----------------------------------------------\n'] },
      ]
    }catch(e){
        //TODO handle the exception
        getApp().sendTracking('CREATE_PRINTER_FAIL', Object.assign(...this.data.info, {
          qerror: e,
          qcode: '组合小票订单数据失败'
        }));
      }
  },
  print_order_list(list) {
    try{
      return [
        { 'cmd': 'addText', 'args': ['商品'] },
        { 'cmd': 'addSetAbsolutePrintPosition', 'args': [340] },
        { 'cmd': 'addText', 'args': ['数量'] },
        { 'cmd': 'addSetAbsolutePrintPosition', 'args': [420] },
        { 'cmd': 'addText', 'args': ['金额'] },
        { 'cmd': 'addSetAbsolutePrintPosition', 'args': [490] },
        { 'cmd': 'addText', 'args': ['会员额'] },
        { 'cmd': 'addPrintAndLineFeed', 'args': [] },
        { 'cmd': 'addText', 'args': ['----------------------------------------------\n'] },
        ...list,
        { 'cmd': 'addText', 'args': ['----------------------------------------------\n'] },
      ]
    }catch(e){
        //TODO handle the exception
        getApp().sendTracking('CREATE_PRINTER_FAIL', Object.assign(...this.data.info, {
          qerror: e,
          qcode: '组合小票商品数据失败'
        }));
      }
  },
  getGList() {
    try {
      let arr = [];
      for (let i = 0; i < this.data.info.products.length; i++) {
        // let name = this.data.info.products[i].name.substring(0, 11);
        let name = this.data.info.products[i].name;
        let addon = this.data.info.products[i].activitys ? this.data.info.products[i].activitys : []
        if (addon.length > 0) {
          for (let k = 0; k < addon.length; k++) {
            if (addon[k].activityType == "addon") {
              name = this.data.info.products[i].name + ' (加)'
              break;
            }
          }
        }
        let a = [
          { 'cmd': 'addText', 'args': [name || ''] },
          { 'cmd': 'addSetAbsolutePrintPosition', 'args': [365] },
          { 'cmd': 'addText', 'args': [this.data.info.products[i].qty || ''] },
          { 'cmd': 'addSetAbsolutePrintPosition', 'args': [425] },
          { 'cmd': 'addText', 'args': [this.data.info.products[i].saleAmount && this.data.info.products[i].saleAmount.toFixed(2) || ''] },
          { 'cmd': 'addSetAbsolutePrintPosition', 'args': [500] },
          { 'cmd': 'addText', 'args': [this.data.info.products[i].productAmount && this.data.info.products[i].productAmount.toFixed(2) || ''] },
          { 'cmd': 'addPrintAndLineFeed', 'args': [] },
        ]
        arr = arr.concat(a);
        if (this.data.info.products[i].itemNames != undefined && this.data.info.products[i].itemNames != null) {
          for (let j = 0; j < this.data.info.products[i].itemNames.split(",").length; j++) {
            let pItem = this.data.info.products[i].itemNames.split(",")[j]
            let g = [
              { 'cmd': 'addText', 'args': ['  ' + pItem.split("x")[1] + '  ' + pItem.split("x")[0]] },
              { 'cmd': 'addPrintAndLineFeed', 'args': [] },
            ]
            arr = arr.concat(g);
          }
        }

      }
      return arr;
     }catch(e){
        //TODO handle the exception
        getApp().sendTracking('CREATE_PRINTER_FAIL', Object.assign(...this.data.info, {
          qerror: e,
          qcode: '组合商品数据失败'
        }));
      }
  },

  print_pay_info(pay_type) {
    try{
      let arr = [];
      let productTotalPrice = this.data.info.productTotalPrice ? this.data.info.productTotalPrice.toFixed(2) : ''
      let a = [
        { 'cmd': 'addText', 'args': ['合计金额'] },
        { 'cmd': 'addSetAbsolutePrintPosition', 'args': [425] },
        { 'cmd': 'addText', 'args': [productTotalPrice] },
        { 'cmd': 'addPrintAndLineFeed', 'args': [] },
      ]
      arr = arr.concat(a)
      let b = [
        { 'cmd': 'addText', 'args': ['优惠/扣减'] },
        { 'cmd': 'addPrintAndLineFeed', 'args': [] },
      ]
      arr = arr.concat(b)
      if (this.data.info.discounts && this.data.info.discounts.length > 0) {
        for (let i = 0; i < this.data.info.discounts.length; i++) {
          let name = ''
          if (this.data.info.discounts[i].discountKind == 2) {
            name = '员工折扣'
          } else if (this.data.info.discounts[i].discountKind == 6) {
            name = "会员价优惠"
          } else if (this.data.info.discounts[i].discountKind == 7) {
            name = "加价购"
          } else if (this.data.info.discounts[i].discountKind == 8) {
            name = "商品促销"
          } else {
            name = this.data.info.discounts[i].couponName ? this.data.info.discounts[i].couponName : this.data.info.discounts[i].preferentialName
          }
          let discounts_tmp = this.data.info.discounts[i].discountAmount ? this.data.info.discounts[i].discountAmount.toFixed(2) : ''
          let g = [
            { 'cmd': 'addSetAbsolutePrintPosition', 'args': [50] },
            { 'cmd': 'addText', 'args': [name || ''] },
            { 'cmd': 'addSetAbsolutePrintPosition', 'args': [425] },
            { 'cmd': 'addText', 'args': ["-" + discounts_tmp] },
            { 'cmd': 'addPrintAndLineFeed', 'args': [] },
          ]
          arr = arr.concat(g)
        }
      }
      if (this.data.info.discountsPoints > 0) {
        let points_tmp = this.data.info.discountPointsPrice ? this.data.info.discountPointsPrice.toFixed(2) : ""
        let points = [
          { 'cmd': 'addSetAbsolutePrintPosition', 'args': [50] },
          { 'cmd': 'addText', 'args': ['积分抵扣'] },
          { 'cmd': 'addSetAbsolutePrintPosition', 'args': [425] },
          { 'cmd': 'addText', 'args': ["-" + points_tmp] },
          { 'cmd': 'addPrintAndLineFeed', 'args': [] },
        ]
        arr = arr.concat(points)
      }
      let payPrice_tmp = 0
      if (this.data.info.payPrice == 0 || this.data.info.payPrice) {
        payPrice_tmp = this.data.info.payPrice.toFixed(2)

      } else {
        payPrice_tmp = ''
      }
      let pay = [
        { 'cmd': 'addText', 'args': ['----------------------------------------------'] },
        { 'cmd': 'addPrintAndLineFeed', 'args': [] },
        { 'cmd': 'addText', 'args': ['支付金额'] },
        { 'cmd': 'addSetAbsolutePrintPosition', 'args': [500] },
        { 'cmd': 'addText', 'args': [payPrice_tmp] },
        { 'cmd': 'addPrintAndLineFeed', 'args': [] },
        { 'cmd': 'addText', 'args': ['支付方式'] },
        { 'cmd': 'addSetAbsolutePrintPosition', 'args': [450] },
        { 'cmd': 'addText', 'args': [pay_type || ''] },
        { 'cmd': 'addPrintAndLineFeed', 'args': [] },
        { 'cmd': 'addText', 'args': ['----------------------------------------------'] },
        { 'cmd': 'addPrintAndLineFeed', 'args': [] },
        { 'cmd': 'addSelectJustification', 'args': ['LEFT'] },
        { 'cmd': 'addSelectPrintModes', 'args': ['FONTA', 'OFF', 'OFF', 'OFF', 'OFF'] },
        { 'cmd': 'addText', 'args': ['支付交易号:'] },
        { 'cmd': 'addText', 'args': [this.data.info.transactionId ? this.data.info.transactionId : '无'] },
        { 'cmd': 'addPrintAndLineFeed', 'args': [] },
        { 'cmd': 'addText', 'args': ['商户交易号:'] },
        { 'cmd': 'addText', 'args': [this.data.info.transactionExtId ? this.data.info.transactionExtId : '无'] },
        { 'cmd': 'addPrintAndLineFeed', 'args': [] },
        { 'cmd': 'addText', 'args': ['会员卡号:'] },
        { 'cmd': 'addText', 'args': [this.data.info.vipPhone ? this.data.info.vipPhone : ''] },
        { 'cmd': 'addPrintAndFeedLines', 'args': ['2'] },
      ]
      arr = arr.concat(pay)
      return arr;
    }catch(e){
        //TODO handle the exception
        getApp().sendTracking('CREATE_PRINTER_FAIL', Object.assign(...this.data.info, {
          qerror: e,
          qcode: '组合小票交易数据失败'
        }));
      }
  },
  // getSup() {
  //   // console.log(this.data.info.orderPrice, this.data.info.payPrice)
  //   let supt = this.data.info.orderAmount - this.data.info.payPrice;
  //   if (parseInt(supt) != supt) {
  //     supt = parseFloat(supt.toFixed(2));
  //   }
  //   return supt;
  // },
  getPayType() {
    try{
      let type = getApp().globalData.cartsInfo.payType;
      let apiType = this.data.info.payType;
      if (type == 2) {
        if (apiType == 3) {
          return '微信支付';
        } else if (apiType == 1 || apiType == 2) {
          return '支付宝支付';
        } else {
          return '无找零';
        }

      } else if (type == 3) {
        return '支付宝刷脸';
      }
    }catch(e){
        //TODO handle the exception
        getApp().sendTracking('CREATE_PRINTER_FAIL', Object.assign(...this.data.info, {
          qerror: e,
          qcode: '组合支付方式数据失败'
        }));
      }

  },
  print_qrcode(qrcode_data) {
    try{
      return [
        { 'cmd': 'addSelectJustification', 'args': ['LEFT'] },
        { 'cmd': 'addSetCharcterSize', 'args': ['MUL_1', 'MUL_1'] },
        { 'cmd': 'addText', 'args': ['如需当日的电子发票，请务必在消费当天申请，此二维码30天有效。收银小票是您获取电子发票的唯一凭证，请妥善保管。\n'] },
        { 'cmd': 'addPrintAndFeedLines', 'args': ['1'] },
        { 'cmd': 'addSelectJustification', 'args': ['CENTER'] },
        { 'cmd': 'addSetCharcterSize', 'args': ['MUL_1', 'MUL_1'] },
        { 'cmd': 'addText', 'args': ['如需发票，请扫一扫下方二维码'] },
        { 'cmd': 'addPrintAndFeedLines', 'args': ['1'] },
        { 'cmd': 'addSelectErrorCorrectionLevelForQRCode', 'args': ['49'] },
        { 'cmd': 'addSelectSizeOfModuleForQRCode', 'args': ['5'] },
        { 'cmd': 'addStoreQRCodeData', 'args': [qrcode_data] },
        { 'cmd': 'addPrintQRCode', 'args': [] },
        { 'cmd': 'addPrintAndFeedLines', 'args': ['1'] },
      ]
    }catch(e){
        //TODO handle the exception
        getApp().sendTracking('CREATE_PRINTER_FAIL', Object.assign(...this.data.info, {
          qerror: e,
          qcode: '组合小票发票数据失败'
        }));
      }
  },
  print_survey(survey_url) {
    try{
      return [
        { 'cmd': 'addSelectJustification', 'args': ['CENTER'] },
        { 'cmd': 'addSetCharcterSize', 'args': ['MUL_1', 'MUL_1'] },
        { 'cmd': 'addText', 'args': ['邀请您参加用餐评价，立获冰淇淋兑换券一张！（仅限首次评价）'] },
        { 'cmd': 'addPrintAndFeedLines', 'args': ['1'] },
        { 'cmd': 'addSelectErrorCorrectionLevelForQRCode', 'args': ['49'] },
        { 'cmd': 'addSelectSizeOfModuleForQRCode', 'args': ['5'] },
        { 'cmd': 'addStoreQRCodeData', 'args': [survey_url] },
        { 'cmd': 'addPrintQRCode', 'args': [] },
        { 'cmd': 'addPrintAndFeedLines', 'args': ['1'] },
      ]
    }catch(e){
        //TODO handle the exception
        getApp().sendTracking('CREATE_PRINTER_FAIL', Object.assign(...this.data.info, {
          qerror: e,
          qcode: '组合小票邀请数据失败'
        }));
      }
  },
  print_end() {
    return [
      { 'cmd': 'addSetCharcterSize', 'args': ['MUL_1', 'MUL_1'] },
      { 'cmd': 'addText', 'args': ['欢迎您再次光临！'] },
      { 'cmd': 'addPrintAndFeedLines', 'args': ['2'] }]
  },


  printer() {
    // console.log(0)
    getApp().sendTracking('ORDER_PRINT', this.data.info);
    let that = this;
    //查询连接的打印机
    my.ix.queryPrinter({
      success: (r) => {
        try{
        // my.showToast('success : ' + JSON.stringify(r));
          let etype = getApp().globalData.cartsInfo.type == 1 ? '堂食' : '外带';
          let list = this.getGList();
          let pay_type = this.getPayType();
          console.log("`````````pay_type``````", pay_type)
          //向打印机传指令
          let all_cmd = []
          let title_cmd = this.printer_title()
          let store_cmd = this.printer_store(getApp().globalData.storeInfo.storeName, getApp().globalData.storeInfo.address, getApp().globalData.storeInfo.telephone ? getApp().globalData.storeInfo.telephone : '')
          let order_cmd = this.printer_order(etype)
          let order_list_cmd = this.print_order_list(list)
          let pay_info_cmd = this.print_pay_info(pay_type);
          let qr_code_cmd = []
          let qr_code_url = that.data.info.invoiceQrcode != undefined && that.data.info.invoiceQrcode != null && that.data.info.invoiceQrcode != '' ? that.data.info.invoiceQrcode.url : ''
          if (qr_code_url != '') {
            qr_code_cmd = this.print_qrcode(qr_code_url);
          }
          let survey_url = that.data.info.questionnaire != undefined && that.data.info.questionnaire != null && that.data.info.questionnaire != '' ? that.data.info.questionnaire.url : '';
          let survey_cmd = []
          if (survey_url != '' && survey_url != undefined) {
            survey_cmd = this.print_survey(survey_url)
          }
          let end_cmd = this.print_end()
          all_cmd = all_cmd.concat(title_cmd).concat(store_cmd).concat(order_cmd).concat(order_list_cmd).concat(pay_info_cmd).concat(qr_code_cmd).concat(survey_cmd).concat(end_cmd)
          console.log(all_cmd)
          my.ix.printer({
            cmds: all_cmd,
            success: (sr) => {
              console.log("success");
              getApp().sendTracking('PRINTER_SUCCESS', Object.assign(...that.data.info, {
                qerror: sr
              }));
            },
            fail: (err) => {
              console.log("fail, errorCode:" + err.error);
              getApp().sendTracking('PRINTER_FAIL', Object.assign(...that.data.info, {
                qerror: err
              }));
            }
          });
        }catch(e){
          //TODO handle the exception
          getApp().sendTracking('CREATE_PRINTER_FAIL', Object.assign(...that.data.info, {
            qerror: e,
            qcode: '组合小票完整数据失败'
          }));
        }
      },
      fail: (er) => {
        getApp().sendTracking('QUERY_PRINT_FAIL', Object.assign(...that.data.info, {
          qerror: er
        }));
        my.showToast('fail : ' + JSON.stringify(er))
      },
      complete: () => {
        
      }
    })
  },
  /**
   * 支付完成后清除选择的的所有信息
   */
  clearGlobal() {
    getApp().clearCart();
  },
  goIndex() {
    if (this.payPoll == 1) {
      if (this.sto1) {
        clearTimeout(this.sto1);
      }
      this.payPoll = 0;
      getApp().globalData.fetchApi.get_order_fail({ id: this.obj.id });
      my.navigateBack();

      return false;
    }

    if(this.data.pay_status != 3) {
      return false;
    }

    // if (this.data.pay_status == 3) {
    if (this.sto) {
      clearInterval(this.sto);
    }
    if (this.sto1) {
      clearTimeout(this.sto1);
    }
    getApp().globalData.userInfo = {
      id: '',
      headImg: '',
      userName: ''
    }
    my.reLaunch({
      url: '/pages/index/index'
    });
    // }
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
