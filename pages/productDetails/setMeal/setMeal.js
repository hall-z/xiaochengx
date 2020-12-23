const eventBus = require('/utils/eventbus.js').eventBus;
Page({
  mixins: [require('../../../mixins/addon.js')],
  data: {
    menuInto: 0,
    info: {
      productType: 1,
      name: '',
      imageUrl: '',
      salesPrice: 0,
      cart_number: 1
    },
    productList: [],
    chooseIndexArr: [
      [0],
      [0,1],
      [0,0],
      [0]
    ], //套餐选中的值
    basePrice: 128, //基础套餐的价格
    totalPrice: 128, //定制的套餐的总价格
    number: 1,
  },
  reset(info, type) {
			console.log('---购物车操作加购---', info, type)
			if (type == 1) {
				// this.getIsInadd(info.productCode);
				this.setAddOn(info, 1);
			} else if (type == 2) {
				this.clearRelation(info, 2);
			} else if (type == 3) {
				this.clearRelation(info, 3);
			}
  },
  /**
   * 菜单加加购添加购物车
   */
  onAdd(info) {
    console.log("==info==", info)
    // this.modalTip.setCartItem(info, 1);
    eventBus.emit('addDCart', info) 
  },
  delCartItem(info) {
    eventBus.emit('delDCart', info) 
  },
  onClickGood (e) {
    let dataset = e.target.dataset
    let key = "chooseIndexArr[" + dataset.pIndex + "][" + dataset.gsIndex + "]";
    this.setData({
      [key]: dataset.gIndex
    })
    this.getTotalPrice();
  },
  initChooseIndex () {
    // 设置选中的index值
    let indexArr = []
    this.data.productList.map((pItem, pIndex) => {
      indexArr.push([])
      pItem.list.map((gsItem, gsIndex) => {
        indexArr[pIndex].push(0)
      })
    })
    console.log("indexArr", indexArr)
    this.setData({
      chooseIndexArr: indexArr
    })
  },
  getTotalPrice () {
    //计算总价格
    let extraTotalPrice = 0;
    let chooseIndexArr = this.data.chooseIndexArr
    this.data.productList.map((pItem, pIndex) => {
      pItem.list.map((gsItem, gsIndex) => {
        extraTotalPrice += gsItem[chooseIndexArr[pIndex][gsIndex]].addPrice
      })
    })

    console.log("extraTotalPrice", )
    this.setData({
      totalPrice: (this.data.basePrice + extraTotalPrice) * this.data.number
    })
  },
  onLoad(options) {
    console.log(options)
    this.addOnList = getApp().globalData.cartsInfo.addList;
    let that = this,
      t = 0;
    my.getStorage({
      key: 'pro_info',
      success: function(res) {
        console.log(res.data);
        if (res.data) {
          // res.data.cart_number = res.data.cart_number ? res.data.cart_number : 1;
          // that.setData({
          //   info: res.data,
          //   productList: res.data.condimentRoundList,
          // })
          let selectItem = [],
          info = JSON.parse(JSON.stringify(res.data));
          console.log(info);
          if (!options.st) {// 菜单进入
            if (res.productType != 1) {
              info.osalesPrice = info.salesPrice;
              info.omembershipPrice = info.membershipPrice;
              for (let i = 0; i < info.condimentRoundList.length; i++) {
                if (info.condimentRoundList[i].condimentItemList && info.condimentRoundList[i].condimentItemList.length > 0) {
                  // info.condimentRoundList[i].condimentItemList[0].selected = true;
                  // let info1 = info.condimentRoundList[i].condimentItemList.find((e) => e.isdefault == 'Y');
                  // if (info1) {
                  //   selectItem.push(info1.productCode)
                  // } else {
                  //    info.condimentRoundList[i].condimentItemList[0].isdefault = 'Y';
                  //    selectItem.push(info.condimentRoundList[i].condimentItemList[0].productCode)
                  // }
                  // 0529 调整进入详情默认选中 开始
                  let index = that.getDefaultIndex(info.condimentRoundList[i].condimentItemList);
                  // info.condimentRoundList[i].condimentItemList.findIndex((e) => e.isdefault == 'Y');
                  // 0529 调整进入详情默认选中 结束
                  if (index > -1) {
                    selectItem.push(that.setInfo(info.condimentRoundList[i].quantity, index));
                  } else {
                    info.condimentRoundList[i].condimentItemList[0].isdefault = 'Y';
                    selectItem.push(that.setInfo(info.condimentRoundList[i].quantity, 0))
                  }
                  // selectItem.push(info.condimentRoundList[i].condimentItemList[0].productCode)
                }
              }
              info.selectItem = selectItem;
              info.cart_number = info.cart_number ? info.cart_number : 1;
              that.createPrice(info, '', 2);// 0731 修复进入计算默认价格
            }
          } else {
            let selectItem = JSON.parse(info.selectItem)
            info.selectItem = selectItem;
            info.oselectItem = JSON.parse(JSON.stringify(info.selectItem));
            // info.oselectItem = JSON.parse(JSON.stringify(info.selectItem));
            info.cart_number = info.cart_number ? info.cart_number : 1;
            t = 1;
          }
          console.log(info.condimentRoundList,info);
          that.setData({
            info: info,
            productList: info.condimentRoundList,
            menuInto: t
          })
        }
      },
      fail: function(res){
        // my.alert({content: res.errorMessage});
      }
    });
  },
  // 0529 调整进入详情获取默认选中方法 开始
  getDefaultIndex(list) {
    let ids = -1;
    for (let i = 0; i < list.length; i++) {
      if (list[i].isdefault == 'Y' && list[i].disabledFlag == 1){
        console.log('---into---',i,list[i]);
        ids = i;
        // break;
      } else if (list[i].disabledFlag == 1) {
        console.log('---into 2---',i,list[i]);
        if (ids > -1) {
          continue;
        }
        list[i].isdefault = 'Y';
        ids = i;
        // break;
      } else if (list[i].disabledFlag == 0) {
        list[i].isdefault = 'N';
      }
    }
    return ids > -1 ? ids : 0;
  },
   // 0529 调整进入详情获取默认选中方法 结束
  setInfo(len, code) {
    if (len == 1) {
      return code;
    }
    let arr = [];
    for(let i = 0; i < len;i++) {
      arr.push(code);
    }
    return arr;
  },
  proItemChange(res) {
    let pindex = res.target.dataset.pindex,
        gindex = res.target.dataset.gindex,
        item = res.target.dataset.item,
        targetIndex = res.target.dataset.tindex,
        info = JSON.parse((JSON.stringify(this.data.info)));
    console.log(res);
    if (info.condimentRoundList[pindex].condimentItemList[gindex].disabledFlag == 0) {
      return false;
    }
    // return false;
    if (info.condimentRoundList[pindex].quantity > 1) {
				info.selectItem[pindex][targetIndex] = gindex;
    } else {
      
      for (let i = 0; i < info.condimentRoundList[pindex].condimentItemList.length; i++) {
        if (i == gindex) {
          info.condimentRoundList[pindex].condimentItemList[i].isdefault = 'Y';
        } else {
          info.condimentRoundList[pindex].condimentItemList[i].isdefault = '';
        }
      }
      info.selectItem[pindex] = gindex;
      // info.selectItem[pindex] = item[gindex].productCode;
    }
      console.log(info)
      
      this.createPrice(info, pindex);
      // console.log(info)
      // this.info = info;
      this.setData({
        ['info.selectItem']: info.selectItem,
        ['info.salesPrice']: info.salesPrice,
        ['info.membershipPrice']: info.membershipPrice,
        ['info.condimentRoundList']: info.condimentRoundList,
        productList: info.condimentRoundList,
      })
  },
  createPrice(info, ids, type = 1) {// 1 滑动选择计算 2 初始进入计算 0731 修复进入计算默认价格
    let p = info.osalesPrice,
        pm = info.omembershipPrice;
    for (let i = 0; i < info.condimentRoundList.length; i++) {
      if (info.condimentRoundList[i].quantity > 1) {
        if (type == 1) {
          for (let k = 0; k < info.selectItem[ids].length; k++) {
            if (info.condimentRoundList[i].condimentItemList[info.selectItem[ids][k]] && info.condimentRoundList[i].condimentItemList[info.selectItem[ids][k]].addonPrice) {
              p += info.condimentRoundList[i].condimentItemList[info.selectItem[ids][k]].addonPrice;
              pm += info.condimentRoundList[i].condimentItemList[info.selectItem[ids][k]].addonPrice;
            }
          }
        } else {
          for (let j = 0; j < info.condimentRoundList[i].condimentItemList.length; j++) {
            if (info.condimentRoundList[i].condimentItemList[j].isdefault == 'Y' && info.condimentRoundList[i].condimentItemList[j].addonPrice) {
              p += info.condimentRoundList[i].condimentItemList[j].addonPrice*info.condimentRoundList[i].quantity;
              pm += info.condimentRoundList[i].condimentItemList[j].addonPrice*info.condimentRoundList[i].quantity;
            }
          }
        }
      } else {
        for (let j = 0; j < info.condimentRoundList[i].condimentItemList.length; j++) {
          if (info.condimentRoundList[i].condimentItemList[j].isdefault == 'Y') {
            let prs = info.condimentRoundList[i].condimentItemList[j].addonPrice != undefined ? info.condimentRoundList[i].condimentItemList[j].addonPrice : 0;
            p += prs;
            pm += prs;
          }
        }
      }
    }
    info.salesPrice = p;
    info.membershipPrice = pm;
  },
  onCloseModal() {
      const that = this
      that.setData({
          isShowModal: false,
      })
      my.navigateBack();
  },
  getIndex(list) {
    console.log(list);
    let ids = 0;
    // if (Array.isArray(this.data.info.selectItem[this.dindex])) {
    //   ids = this.info.selectItem[this.dindex][this.sIndex];
    // } else if (list[i].isdefault == 'Y'){
    //   ids = i;
    // }
  }
  
});
