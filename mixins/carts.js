export default {
  onInit(){
    // console.log('init');
  }, 
  methods: {
		getPackagesTotal (info, type = 1) {
			let t = 0,
				to = 0,
				list = getApp().globalData.cartsInfo.list;
			for (let i = 0; i < list.length; i++) {
				
				if (type == 1 && list[i].productCode == info.productCode && !list[i].discountMyType) {
					t += list[i].cart_number
				} else if (type == 2 && !list[i].discountMyType){
					if (this.menuInto && this.menuInto == 1) {
						if (list[i].productCode == info.productCode && list[i].selectItem != JSON.stringify(info.oselectItem)) {
							// 计算可选规格非同规格 总数
							t += list[i].cart_number
						} else if (list[i].productCode == info.productCode && list[i].selectItem == JSON.stringify(info.oselectItem)) {
							// 计算可选规格非同规格 总数
							to += list[i].cart_number
						}
					} else {
						if (list[i].productCode == info.productCode && list[i].id != info.id) {
							// 计算可选规格非同规格 总数
							t += list[i].cart_number
						} else if (list[i].productCode == info.productCode && list[i].id != info.id) {
							// 计算可选规格非同规格 总数
							to += list[i].cart_number
						}
					}
					
				}
			}
			return [t, to];
		},
		getTotalNum(info, type = 1) {
			let t = 0,
				to = 0,
				list = getApp().globalData.cartsInfo.list;
			for (let i = 0; i < list.length; i++) {
				if (type == 1 && list[i].productCode == info.productCode && !list[i].discountMyType) {
					t += list[i].cart_number
				} else if (type == 2) {
					if (list[i].productCode == info.productCode && list[i].id != info.id && !list[i].discountMyType) {
						t += list[i].cart_number
					}
				}
			}
			return t;
		},
  	setCartItem (item, type=1) { // 1 加 0 减
			// console.log(item)
			console.log('---添加减少购物车数据---', item, type)
			let info = JSON.parse(JSON.stringify(item)),
				stype = 0;
			
			if (!info.discountMyType && info.productType != 3) {// 非可选套餐
				if (type == 1) {//  叠加
					
					let list = getApp().globalData.cartsInfo.list,
						index = list.findIndex((e) => e.id == info.id),
						num = this.getTotalNum(info);
					// num += list[index].cart_number;
					// if (index > -1) {
						num += info.cart_number;
					// }
					console.log('----叠加--', num, info.maxQty)
					// info.maxQty
					if (num > info.maxQty) {
						my.showToast({
							icon:'none',
							content: getApp().getBaseLanguage('add_cart_over')
						});
						return false
					}
				} else if (info.stype == 2) { // 覆盖
					let num = this.getTotalNum(info, 2);
						num += info.cart_number;
						console.log('----覆盖--', num, info.maxQty)
						if (num > info.maxQty) {
							my.showToast({
								icon:'none',
								content: getApp().getBaseLanguage('add_cart_over')
							});
							return false;
						}
				}
			} else if (!info.discountMyType && info.productType == 3) {// 可选套餐
				if (info.add_type == 1) {// 叠加
					let num = this.getPackagesTotal(info, 1)[0];
					console.log('---计算后数量---',num,info.cart_number)
					num += info.cart_number;
					
					if (num > info.maxQty) {
						my.showToast({
							icon:'none',
							content: getApp().getBaseLanguage('add_cart_over')
						});
						return false
					}
				} else {// 覆盖
					let t=0, to=0;
					[t, to] = this.getPackagesTotal(info, 2);
					console.log('---计算后数量---',t, info.cart_number)
					t += info.cart_number;
					if (t > info.maxQty) {
						my.showToast({
							icon:'none',
							content: getApp().getBaseLanguage('add_cart_over')
						});
						return false
					}
				}
			}
			if (this.props && this.props.menuInto == 1) {
				let selectItem = JSON.parse(info.selectItem)
				let os = JSON.parse(JSON.stringify(selectItem))
				// let os = JSON.parse(JSON.stringify(info.selectItem))
				if (info.selectItem && (info.selectItem != JSON.stringify(info.oselectItem))) { // 已改变 
				// console.log(info);
					let list = getApp().globalData.cartsInfo.list,
							index = list.findIndex((e) => e.id == info.id && e.selectItem == info.selectItem);
					console.log(index);
					if (index < 0) {
						// this.
						info.stype = 10;
					} else {
						info.selectItem = JSON.stringify(info.oselectItem);
						// console.log(info);
						stype = 1;
						this.delCartItem(info);// 删除购物车信息
						this.props.onReset(JSON.parse(JSON.stringify(info)), 3)
						// this.$emit('reset', JSON.parse(JSON.stringify(info)), 3);
						info.selectItem = JSON.stringify(os);
						delete info.oselectItem;
					}
				}
			}
			let list = JSON.parse(JSON.stringify(getApp().globalData.cartsInfo.list)),
				index = list.findIndex((e) => e.id == info.id);
			if (info.stype == 10){
					index = list.findIndex((e) => e.id == info.id && e.selectItem == JSON.stringify(item.oselectItem));
					// delete info.oselectItem;
					delete info.stype;
					if (index > -1) {
						list[index] = info;
					} else {
						list.push(info)
					}
					let ot = JSON.parse(JSON.stringify(info))
					ot.selectItem = JSON.stringify(ot.oselectItem);
					this.props.onReset(ot, 3)
				// this.$emit('reset', JSON.parse(JSON.stringify(info)), 3);
			} else {
				info.nid = info.selectItem ? info.selectItem+'_'+info.id : info.id;
				if (info.productType == 3 && info.discountMyType != 1) {
					index = list.findIndex((e) => e.id == info.id && e.selectItem == info.selectItem);
				}
				if (info.discountMyType != 1) {
					if (index > -1) {
						if (this.props && this.props.menuInto == 1) {
							list[index].cart_number = stype == 1 ? list[index].cart_number + info.cart_number : info.cart_number;
						} else {
							list[index].cart_number = info.stype == 2 ? info.cart_number : (type == 1 || stype == 1) ? list[index].cart_number + info.cart_number : list[index].cart_number - info.cart_number;
						}
						// console.log(list[index].cart_number);
					} else {
						delete info.add_type;
						list.push(info);
					}
				} else if (info.discountMyType == 1) {
					index = list.findIndex((e) => e.discountMyType == 1 && e.cinfo.couponCode == info.cinfo.couponCode);
					if (index > -1) {
						list[index] = info;
					} else {
						list.push(info);
					}
				}
			}
			
			console.log('---添加减少购物车数据---', list)
			getApp().globalData.cartsInfo.list = list;
			getApp().globalData.cartsInfo.cartCombList = this.createMergeDuplicates(list);
			let arr = this.calculationTotal(list);
			getApp().globalData.cartsInfo.number = arr[1];
			getApp().globalData.cartsInfo.total = arr[0];
			getApp().globalData.cartsInfo.mtotal = arr[2];
      // console.log(getApp().globalData.cartsInfo);
			return true;
			this.setLocalSto();
		},
		delCartItem (item) {
			console.log('---删除购物车---', item)
			let list = JSON.parse(JSON.stringify(getApp().globalData.cartsInfo.list)),
				index = list.findIndex((e) => e.id == item.id);
			if (item.productType == 3 && item.discountMyType != 1) {
				index = list.findIndex((e) => e.id == item.id && e.selectItem == item.selectItem);
			}
			list.splice(index, 1);
			console.log('---删除之后购物车数据---', list)
			getApp().globalData.cartsInfo.list = list;
			getApp().globalData.cartsInfo.cartCombList = this.createMergeDuplicates(list);
			[getApp().globalData.cartsInfo.total, getApp().globalData.cartsInfo.number, getApp().globalData.cartsInfo.mtotal] = this.calculationTotal(list);
			this.setLocalSto();
		},
		clearCart () {
				getApp().clearCart();
			 my.clearStorage({
      		key: 'cart_info'
			 })
			// this.setLocalSto();
		},
    calculationTotal (list) {
        let total = 0,
          len = 0,
					memberTotal = 0;
        for (var i = 0; i < list.length; i++) {
					if (list[i].discountMyType == 1) {
						total = total + (parseFloat(list[i].discountMyPrice) * 100);
						memberTotal = memberTotal + (parseFloat(list[i].discountMyPrice) * 100);
					} else if (list[i].discountMyType == 2) {
						total = total + (parseFloat(list[i].activityPrice) * list[i].cart_number * 100);
      			memberTotal = memberTotal + (parseFloat(list[i].activityPrice) * list[i].cart_number * 100);
					} else {
						total = total + (parseFloat(list[i].salesPrice) * list[i].cart_number);
						memberTotal = memberTotal + (parseFloat(list[i].membershipPrice) * list[i].cart_number);
						// noCouTotal = total + (parseFloat(list[i].salesPrice) * list[i].cart_number);
					}
          // total = total + (parseFloat(list[i].salesPrice) * list[i].cart_number);
          len = len + list[i].cart_number;
          // discount = discount + (parseFloat(list[i].origin_price) - parseFloat(list[i].price));
        }
        return [total/100, len, memberTotal/100];
    },
		setLocalSto() {
			return false;
			my.setStorage({
				key: 'cart_info',
				data: getApp().globalData.cartsInfo
			});
		},
		// 合并加入购物车商品 productCode 一样的商品
		createMergeDuplicates (flist) {
			let list = JSON.parse(JSON.stringify(flist)),
				arr = [];
			for (let i = 0; i < list.length; i++) {
				let info = list[i],
					index = this.getIsSame(arr, list[i]);
				// console.log(index)
				if (index > -1) {
					arr[index].cart_number = info.cart_number + arr[index].cart_number;
					arr[index].doubleNum.push(info.cart_number);
					arr[index].doubleIds.push(info.id);
				} else {
					info.doubleNum = [info.cart_number];
					info.doubleIds = [info.id];
					arr.push(info);
				}
			}
			return arr;
			// this.clist = arr;
			// this.$store.commit('setCartCombList', arr);
			// console.log(arr);
		},
		getIsSame (list, info) {
			if (info.discountMyType == 1 || info.discountMyType == 2) { // 商品加购与商品券不合并
				return -1
			}
			if (info.productType == 3) {// 可选多规格 productCode 一样并且 选择的规格一样的
				return list.findIndex((e) => e.productCode == info.productCode && e.selectItem == info.selectItem);
			} else {// 其他商品
				return list.findIndex((e) => e.productCode == info.productCode);
			}
		}
	}
}