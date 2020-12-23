module.exports = {
    data: {
        // addOnList: [],
        tagetAddList: [],
        isShowModal: false,
        modalInfo: {
            status: 10
        },
        tagetAddInfo: {},
    },
    getAddList() {
        // console.log('---加入购物车后信息---', info);
        let that = this;
        getApp().globalData.fetchApi.get_add_on_list_by_menu({
            channel: getApp().globalData.storeInfo.channel,
            storeCode: getApp().globalData.storeInfo.storeCode,
            sellType: 1,
            addOnType: 2
        }).then((res) => {
            that.addOnList = res.body;
            getApp().globalData.cartsInfo.addList = res.body;
        })
    },
    /**
     * 获取商品对应加购数据
     * @param {Object} code
     */
    getIsInadd(item) {
        if (getApp().globalData.isRecommendAddOn == 1) return false;
        let info = '';
        console.log('---addOnList---',this.addOnList)
        for (let i = 0; i < this.addOnList.length; i++) {
            let ids = this.addOnList[i].productCodes.indexOf(item.productCode);
            if (ids > -1) {
                info = this.addOnList[i];
                break;
            }
        }
        console.log('---弹窗info---', info)
        if (!info || info.addOnItems.length < 1) {
            if (this.data.menuInto == 0) {
                my.navigateBack()
            }
            return false
        };
        this.setData({
            isShowModal: true,
            modalInfo: {
                status: 10,
                alist: info.addOnItems,
                info: item
            }
        })
    },
    /**
     * 添加减少操作
     * @param {Object} info 操作的数据
     * @param {Object} status 0 减 1 加
     */
    setAddOn(info, status) {
        console.log('---计算是否需要弹窗---',info, status);
        // this.tagetAddInfo = info;
        if (status == 1) {
            this.getIsInadd(info);
        }
    },
    /**
     * 清除商品关联加购
     * @param {Object} info
     * @param {Object} type 2 减 3 删除
     */
    clearRelation(info, type) {
        if (info.discountMyType) return false;
        let carts = JSON.parse(JSON.stringify(getApp().globalData.cartsInfo.list))// 购物车数据
        // 如果购物车内含有 减少或删除商品的加购数据 3 直接删除该加购数据 2 加购数量是否大于 购物车该商品的数量，如果大于，则减至商品数量
        let index = -1,
            num = 0,
            inds = [],
            cartsNums = info.cart_number;
        for (let i = 0; i < carts.length; i++) {
            let ids = -1;
            if (carts[i].discountMyType != 1) {
                if (info.productType == 3) {
                    ids = carts[i].id.indexOf(info.selectItem+'_'+info.productCode);
                    if (carts[i].productCode == info.productCode && !carts[i].discountMyType && carts[i].selectItem == info.selectItem && carts[i].id != info.id) {
                        cartsNums += carts[i].cart_number
                    }
                } else {
                    ids = carts[i].id.indexOf(info.productCode);
                    if (carts[i].productCode == info.productCode && !carts[i].discountMyType && carts[i].id != info.id) {
                        cartsNums += carts[i].cart_number
                    }
                }
            }
            if (ids > -1 && carts[i].discountMyType == 2) {
                index = i;
                inds.push(i);
                num += carts[i].cart_number;
                // break;
            }
        }
        
        console.log(info, index, num, inds, cartsNums);
        if (index < 0) return false;
        // let item = JSON.parse(JSON.stringify(carts[index]));
        if (type == 3) {
				// this.$store.commit('delCartItem', item);
            for (let i = 0; i < inds.length; i++) {
                let sitem = JSON.parse(JSON.stringify(carts[inds[i]]));
                this.delCartItem(sitem);
                console.log('---删除加购商品---',sitem.cart_number, cartsNums)
            }
            return false
        } else if (type == 2) {
            for (let i = 0; i < inds.length; i++) {
                let sitem = JSON.parse(JSON.stringify(carts[inds[i]]));
                if (cartsNums > 0 && sitem.cart_number > cartsNums) {
                    sitem.cart_number = sitem.cart_number - cartsNums;
                    // this.$store.commit('setCartItem', sitem);
                    this.onAdd(sitem);
                    console.log('---比以加购的数量多，减至与数量一致， 当前加购数量-主商品总数量---', sitem.cart_number, cartsNums)
                } else if (cartsNums <= 0) {
                    // this.$store.commit('delCartItem', sitem);
                    this.delCartItem(sitem);
                    console.log('---删除加购商品---', sitem.cart_number, cartsNums)
                }
            }
            return false;
        }
    },
   
}