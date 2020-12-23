module.exports = {
    data: {
        productCoupons: [],
    },
    getProductCoupon(type) {
        getApp().globalData.fetchApi.get_use_pro_coupon({
            channel: getApp().globalData.storeInfo.channel,
            storeCode: getApp().globalData.storeInfo.storeCode,
            sellType: 1,
            vipId: getApp().globalData.userInfo.id
        }).then((res) => {
            // that.setData({
            //     productCoupons: res.body.list
            // })
            if (!res.body) {
                if (type == 1) {
                    this.getMenuList();
                }
                
                return false;
            }
            let list = res.body;
            this.setPDatas(list);
            if (type == 1) {
                    this.getMenuList();
                }
            // this.createSurplus(list);
        }).catch((e) => {
            if (type == 1) {
                this.getMenuList();
            }
        })  
    },
    /**
     * 删减已添加购物车商品券
     * @param {Object} list
     */
    createSurplus(list) {
        console.log(list);
        let plist = JSON.parse(JSON.stringify(list)),
            carts = JSON.parse(JSON.stringify(getApp().globalData.cartsInfo.list)),
            targets = plist;
        if (carts.length > 0) {
            // 购物车中有数据 
            // 先找 购物车中是否有商品券中是否有 
            // 有 先判断 是那张券 
            // 如果 券只有一个商品 那么整个商品券移除
            // 如果 券有多个商品 跳过
            for (let i = 0; i < carts.length; i++) {
                if (carts[i].discountMyType == 1) {
                    let index = plist.findIndex((e) => e.couponCode == carts[i].cinfo.couponCode);
                    if (index < 0) {
                        continue;
                    }
                    if (plist[index].couponTypeInfo.items.length == 1) {
                        // plist.splice(index, 1);
                        plist[index].is_add = 1;
                    }
                };
            }
        }
        this.setPDatas(plist);
    },
    setPDatas(plist) {
        this.setData({
            productCoupons: plist
        })
        getApp().globalData.cartsInfo.procous = plist;
        console.log(getApp().globalData.cartsInfo)
    },
    /**
     * 删除购物车单个恢复商品券
     */
    recoveryProductCoupons(item) {
        let info = JSON.parse(JSON.stringify(item)),
            list = JSON.parse(JSON.stringify(getApp().globalData.cartsInfo.procous)),
            index = list.findIndex((e) => e.couponCode == info.cinfo.couponCode);
        if (index === -1) {
            return false;
        }
        list[index].is_add = 0;
        // delete info.discountMyType;
        // let idf = JSON.parse(JSON.stringify(info.cinfo));
        // delete info.cinfo;
        // idf.couponTypeInfo.items = [info];
        // console.log('---恢复商品券组合数据---', idf);
        // list.push(idf);
        // this.$store.commit('setProductCoupons', list);
        this.setPDatas(list)
    },
    /**
     * 删除购物车多个恢复商品券
     */
    recoveryAllProductCoupons (cartList) {
        let list = JSON.parse(JSON.stringify(getApp().globalData.cartsInfo.procous));
        for (let i = 0; i < cartList.length; i++) {
            if (cartList[i].discountMyType == 1) {
                let info = JSON.parse(JSON.stringify(cartList[i]));
                let index = list.findIndex((e) => e.couponCode == info.cinfo.couponCode);
                if (index === -1) {// 如果存在 说明是多个商品
                    continue;
                }
                list[index].is_add = 0;
                // delete info.discountMyType;
                // let idf = JSON.parse(JSON.stringify(info.cinfo));
                // delete info.cinfo;
                // idf.couponTypeInfo.items = [info];
                // console.log('---恢复商品券组合数据---', idf);
                // list.push(idf);
            }
        }
        // this.$store.commit('setProductCoupons', list);
        this.setPDatas(list)
    }
}