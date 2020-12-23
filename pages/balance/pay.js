const eventBus = require('/utils/eventbus.js').eventBus;
import config from '/config';
module.exports = {
    onUnload() {
         eventBus.remove('bindGetCoupon');
        // my.ix.offKeyEventChange();
        this.stin && clearInterval(this.stin);
        if (getApp().globalData.cartsInfo.payType != 3) {
            my.ix.offKeyEventChange();
        }
        if (this.orderInfo && this.orderInfo.id) {
            // getApp().globalData.fetchApi.get_order_fail({id: this.orderInfo.id});
        }
        
    },
    /**
     * 拉起支付
     */
    nowPay () {
        let that = this;
        let ids = 0;
        clearInterval(this.stin)
        this.stin = setInterval(() => {
            if (ids == 30) {
                that.openTimeOut();
            }
            if (ids == 60) {
                clearInterval(this.stin);
                if (getApp().globalData.cartsInfo.payType != 3) {
                    my.ix.offKeyEventChange();
                }
                that.setData({
                    isCanPay: true
                })
                getApp().globalData.fetchApi.get_order_fail({id: that.orderInfo.id});
                getApp().sendTracking('PAY_OVER_TIME', that.orderInfo);
                my.reLaunch({
                  url: '/pages/index/index'
                });
                return false
            }
            ids++;
        },1000)
        if (getApp().globalData.cartsInfo.payType != 3) {
            this.payPoll = 1;
            that.setData({
                isShowModal: true,
                modalInfo:{
                    status: 1,
                    imgUrl: "../../image/payment_icon.png",
                    msg: [getApp().getBaseLanguage('sok_pay_code')]
                }
            })
        }
        // console.log('---开始支付--')
        if (getApp().globalData.cartsInfo.payType == 3) {
            console.log('---刷脸支付--')
            getApp().sendTracking('FACE_PAY', getApp().globalData.cartsInfo);
            my.ix.faceVerify({
                partnerId: "2088721124716843",
                // enableDoubleDisplays:'true',
                option: 'pay',
                // verifyType: 'idCard',
                success: (res) => {
                    console.log('---刷脸支付成功--')
                    console.log({ content: JSON.stringify(res) })
                    clearInterval(that.stin);// 0517调整 到该位置
                    that.setData({
                        isShowModal: false,
                         showPay: false,
                         isCanPay: true
                    })
                    getApp().sendTracking('FACE_PAY_SUCCESS', {...res, ...that.orderInfo});
                    // clearInterval(that.stin); // 0517调整 启始位置
                    my.navigateTo({
                        url: '/pages/pay/index?code='+res.barCode+'&id='+that.orderInfo.id+'&sn='+that.orderInfo.orderNo
                    });
                },
                fail: (res) => {
                    clearInterval(that.stin);
                    getApp().sendTracking('FACE_PAY_FILED', res);
                    that.setData({
                        isCanPay: true,
                        isShowModal: true,
                        modalInfo:{
                        status: 1,
                        imgUrl: "/image/error-icon.png",
                        msg: [getApp().getBaseLanguage('sok_pay_failed')]
                        }
                    })
                    getApp().globalData.fetchApi.get_order_fail({id: that.orderInfo.id});
                    console.log('---扫脸失败---', { content: JSON.stringify(res) }) // 0517 增加log
                }
            })
        } else {
            let m = '';
            console.log('---开始监听--')
            getApp().sendTracking('CODE_PAY', getApp().globalData.cartsInfo);
            my.ix.onKeyEventChange((r) => { // 回车
                clearInterval(that.stin);
                let k = r.keyCode;
                    console.log(k)
                if ((k >= 7 && k <= 16)){
                    m = m+(k-7).toString()
                }else if (k === 66) {
                    // 末尾追加 Enter 确认。
                    console.log('Scan Barcode', m);
                    my.ix.offKeyEventChange();
                    // that.loginFetch(m);
                    that.setData({
                        isCanPay: true,
                        isShowModal: false,
                        showPay: false
                    })
                    getApp().sendTracking('CODE_PAY_SUCCESS', {
                        scanCode: m,
                        ...this.orderInfo
                    });
                    my.navigateTo({
                        url: '/pages/pay/index?code='+m+'&id='+that.orderInfo.id+'&sn='+that.orderInfo.orderNo
                    });
                    return;
                } else{
                    m = m+ String.fromCharCode(k+68)
                }
            });
        }
    },
    getAddOnPrice() {
        let s = 0;
        for (let i = 0; i < this.data.form.superPro.length; i++) {
            s = s + this.data.form.superPro[i].activityPrice
        }
        return s;
    },
    /**
     * 创建订单
     */
    goCreatOrder() {
        // console.log(getApp().globalData.cartsInfo);
        let that = this,
            data = {
                vipId: getApp().globalData.userInfo.id,
                channel: 2,
                deviceId: getApp().globalData.storeInfo.deviceNo,
                sendType: getApp().globalData.cartsInfo.type,
                storeCode: getApp().globalData.storeInfo.storeCode,
                products:  this.createPro(),
                orderAmount: getApp().globalData.cartsInfo.total,
                addonAmount: this.getAddOnPrice(),
                discountCouponPrice: this.totalPrice1(1),
                discountsPoints: getApp().globalData.cartsInfo.discountsPoints,
                discountPointsPrice: getApp().globalData.cartsInfo.discountsPoints > 0 ? getApp().globalData.cartsInfo.discountsPoints*getApp().globalData.cartsInfo.maxPoint.rate : 0,
                deliveryFree: 0,
                payPrice: getApp().globalData.cartsInfo.payPrice,
                remark: ''
            };
        
        that.setData({
            isCanPay: false
        })
        console.log("==创建订单isCanPay==", that.data.isCanPay)
        if(this.data.userDiscount && this.data.userDiscount.couponValue){
            data.discounts = [
            {
                couponName: this.data.userDiscount.couponName,
                couponValue: this.data.userDiscount.couponValue,
                discountAmount: this.data.userDiscount.discountAmount,// 0514
                // discountAmount: this.totalPrice1(1),
                type: 1,
                discountKind: 2
            }
            ]
        }else if(this.data.form.coupons && this.data.form.coupons.id) {
            data.discounts = [
                {
                    couponId: this.data.form.coupons.id,
                    couponName: this.data.form.coupons.couponTypeInfo.couponName,
                    couponValue: this.data.form.coupons.couponTypeInfo.couponValue,
                    discountAmount: this.data.form.coupons.discountAmount,// 0514
                    type: this.data.form.coupons.couponTypeInfo.discountType,
                    discountKind: 1
                }
            ]
        }else if (this.data.form.scanCoupon.length > 0) {
            for(let i=0;i< this.data.form.scanCoupon.length;i++) {
                // if (this.data.form.scanCoupon[i].couponType == 1 && this.data.form.scanCoupon[i].discountType == 2) {
                //     t = t - this.data.form.scanCoupon[i].couponValue;
                // }
                let idt = {
                    couponId: this.data.form.scanCoupon[i].couponId,
                    couponName: this.data.form.scanCoupon[i].couponName,
                    couponValue: this.data.form.scanCoupon[i].couponValue,
                    // discountAmount: this.data.form.scanCoupon[i].discountAmount,// 0514
                    discountAmount: this.totalPrice1(1),
                    type: this.data.form.scanCoupon[i].discountType,
                    discountKind: 1
                }
                if (data.discounts) {
                    data.discounts.push(idt)
                } else {
                    data.discounts = [idt]
                }
            }
        }
        if (this.cous) {
            if (data.discounts) {
                data.discounts = data.discounts.concat(this.cous);
            } else {
                data.discounts = this.cous;
            }
        }
        console.log(data);
        // return false;
        getApp().globalData.fetchApi.get_add_order_v2(data).then((res) => {
            // my.navigateTo({
            //   url: '/pages/pay/index'
            // });
            getApp().sendTracking('ADD_ORDER', res);
            that.orderInfo = res.body;
            if (res.body.payPrice <= 0) {
                // that.jumpAndClear(res.body);
                that.setData({
                    isShowModal: false,
                    showPay: false
                })
                my.navigateTo({
                    url: '/pages/pay/index?id='+that.orderInfo.id+'&sn='+that.orderInfo.orderNo+'&sptype=1'
                });
                return false;
            }
            that.nowPay();
        })
    },
    /**
     * 计算价格
     */
    totalPrice1(type=1) {// 1 打折价格
        // console.log(this.cartTotal)
        let t = this.data.userInfo.id ? this.data.cartInfo.mtotal : this.data.cartInfo.total,
            supt = 0;
        if(this.data.userDiscount && this.data.userDiscount.couponValue) {
            // 员工折扣
            return this.data.userDiscount.discountAmount;
        }else if(this.data.form.coupons && this.data.form.coupons.id) {
            return this.data.form.coupons.discountAmount;
        } else if (this.data.form.scanCoupon.length > 0) {
            /**
             * 叠加订单加购价格
             */
            if (this.data.form.superPro.length > 0) {
                for (let i = 0; i < this.data.form.superPro.length; i++) {
                    t = t + this.data.form.superPro[i].activityPrice;
                }
            }
            let s = 0;
            for(let i=0;i< this.data.form.scanCoupon.length;i++) {
                if (this.data.form.scanCoupon[i].couponType == 1 && this.data.form.scanCoupon[i].discountType == 2) {
                    s += this.data.form.scanCoupon[i].couponValue;// 0514
                }
            }
            if (t < s) {
                s = t;
            }
            return s;
        }
        if (supt <= 0) {
            return 0;
        }
        if (parseInt(supt) != supt) {
            supt = parseFloat(supt.toFixed(2));
        }
        return supt;
    },
    
    /**
     * 生成产品列表
     */
    createPro(type = 1) {
        let list = getApp().globalData.cartsInfo.list,
            arr = [],
            cous = [];
        for(let i = 0;i < list.length;i++) {
            let d = {
                systemId: list[i].discountMyType == 2 ? list[i].productSystemId : list[i].discountMyType == 1 ? list[i].oid : list[i].id,
                // classExtId: list[i].classExtId,
                productCode: list[i].productCode,
                name: list[i].name,
                qty: list[i].cart_number,
                productPrice: list[i].discountMyType == 2 ? list[i].productPrice : list[i].salesPrice/100,
            };
            if (list[i].productType != 1) {
                let a = this.getChildNo(list[i].condimentRoundList, list[i].productType, list[i].selectItem);
                d.groups = a[3];
                d.itemNos = a[0];
                d.itemNames = a[1];
                d.itemNamesEn = a[2];
            }
            if (list[i].discountMyType == 1) {
                d.productAmount = list[i].discountMyPrice;
                d.activitys = [{
                    activityId: list[i].cinfo.activityId,
                    disAmount: list[i].salesPrice/100 - list[i].discountMyPrice, // 数量 *（原价-会员价）
                    activityType: 'coupon'
                }]
                let info = JSON.parse(JSON.stringify(list[i]));
                delete info.cinfo;
                delete info.discountMyType;
                cous.push({
                    discountKind: 1,
                    type: 3,
                    discountAmount: list[i].salesPrice/100 - list[i].discountMyPrice,
                    preferentialId: list[i].cinfo.id,
                    preferentialName: list[i].cinfo.couponTypeInfo.couponName,
                    preferentialNameEn: list[i].cinfo.couponTypeInfo.couponNameEn,
                    discountProducts: [info.productCode]
                })
            }  else if (list[i].discountMyType == 2) {
                d.productAmount = list[i].activityPrice*list[i].cart_number;
                d.activitys = [{
                    activityId: list[i].oid,
                    disAmount: (list[i].productPrice - list[i].activityPrice)*list[i].cart_number,
                    activityType: 'addon'
                }]
            } else {
                d.productAmount = getApp().globalData.userInfo.id ? (list[i].membershipPrice*list[i].cart_number)/100 : (list[i].salesPrice*list[i].cart_number)/100;
                d.activitys = [{
                    activityId: list[i].activityId,
                    disAmount: ((list[i].salesPrice - list[i].membershipPrice)*list[i].cart_number)/100,
                    activityType: 'memberPrice'
                }]
            }
            arr.push(d)
        }
        if (this.data.form.superPro.length > 0) {
            for (let i = 0; i < this.data.form.superPro.length; i++) {
                arr.push({
                    systemId: this.data.form.superPro[i].productSystemId,
                    // classExtId: '',
                    productCode: this.data.form.superPro[i].productCode,
                    qty: 1,
                    name: this.data.form.superPro[i].productName,
                    nameEn: this.data.form.superPro[i].productNameEn,
                    productPrice: this.data.form.superPro[i].productPrice,
                    productAmount: this.data.form.superPro[i].activityPrice,
                    activitys: [{
                        activityId: this.data.form.superPro[i].id,
                        disAmount: (this.data.form.superPro[i].productPrice-this.data.form.superPro[i].activityPrice),
                        activityType: 'addon'
                    }]
                })
            }
            
        }
        console.log('---商品最终组合数据---', arr);
        if (type != 1) {
            this.pproduct = JSON.parse(JSON.stringify(arr));
        }
        this.cous = cous;
        return arr;
    },
    /**
     * 获取子项id与name
     */
    getChildNo(list, productType, pitem) {
        let ids = [],
            txts = [],
            txtsen = [],
            item = [],
            spitem = pitem ? JSON.parse(pitem) : [];;
        for(let i = 0;i < list.length;i++) {
            let sitem = [];
            if (productType == 3) {
                if (spitem[i] && Array.isArray(spitem[i])){
                    let arr = [];
                    for (let k = 0; k < spitem[i].length; k++) {
                        let ids = arr.findIndex((e) => e.productCode == list[i].condimentItemList[spitem[i][k]].productCode);
                        if (ids > -1) {
                            arr[ids].qty = arr[ids].qty+1;
                        } else {
                            let idsf = JSON.parse(JSON.stringify(list[i].condimentItemList[spitem[i][k]]));
                            idsf.qty = 1;
                            arr.push(idsf);
                        }
                    }
                    console.log('---固定数量可选组 已选---', arr);
                    // txt = txt.concat(arr);
                    for (let k= 0; k < arr.length; k++) {
                        ids.push(arr[k].productCode);
                        txts.push(arr[k].name+'x'+arr[k].qty);
                        txtsen.push(arr[k].nameEn+'x'+arr[k].qty);
                    }
                    sitem = arr;
                } else {
                    let ifs = list[i].condimentItemList.find((e) => e.isdefault == 'Y');
                if (ifs) {
                        ids.push(ifs.productCode);
                        txts.push(ifs.name+'x'+list[i].quantity);
                        txtsen.push(ifs.nameEn+'x'+list[i].quantity);
                        sitem.push(ifs);
                    } else {
                        ids.push(list[i].condimentItemList[0].productCode);
                        txts.push(list[i].condimentItemList[0].name+'x'+list[i].quantity);
                        txtsen.push(list[i].condimentItemList[0].nameEn+'x'+list[i].quantity);
                        sitem.push(list[i].condimentItemList[0]);
                    }
                }
                
            } else if (productType == 2) {
                ids.push(list[i].condimentItemList[0].productCode);
                txts.push(list[i].condimentItemList[0].name+'x'+list[i].quantity);
                txtsen.push(list[i].condimentItemList[0].nameEn+'x'+list[i].quantity);
                sitem = [list[i].condimentItemList[0]];
            }
            item.push({
                condimentSystemId: list[i].condimentSystemId,
                hideRound: list[i].hideRound,
                itemCount: list[i].itemCount,
                round: list[i].round,
                quantity: list[i].quantity,
                roundNameCn: list[i].roundNameCn,
                roundNameEn: list[i].roundNameEn,
                condimentItemList: sitem
            })
        }
        return [ids.join(','), txts.join(','), txtsen.join(','), item];
    },
}