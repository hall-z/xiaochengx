module.exports = {
    getTxt(list) {
        if (!list) return [];
        let slist = JSON.parse(JSON.stringify(list));
        let txt = [];
        for(let i = 0; i < slist.length;i++) {
        let txt = [];
        if (slist[i].productType == 3) {
            let stls = slist[i].selectItem ? JSON.parse(slist[i].selectItem) : []
            for(let k = 0 ;k < slist[i].condimentRoundList.length;k++){
                
                console.log(stls[k])
                // for (var j = 0; j < slist[i].condimentRoundList[k].condimentItemList.length; j++) {
                if (stls[k] && Array.isArray(stls[k])){
                    let arr = [];
                    for (let j = 0; j < stls[k].length; j++) {
                        // console.log(arr, list[i].condimentItemList[sitem[i][k]].productCode);
                        // let ids = -1;
                        // if (getApp().globalData.language == 'zh_CN') {
                        //     ids = arr.findIndex((e) => e.indexOf(slist[i].condimentRoundList[k].condimentItemList[stls[k][j]].name) > -1);
                        // } else {
                        //     ids = arr.findIndex((e) => e.indexOf(slist[i].condimentRoundList[k].condimentItemList[stls[k][j]].nameEn) > -1);
                        // }
                        // // console.log(ids);
                        // if (ids > -1) {
                        //     let its = arr[ids].lastIndexOf('x'),
                        //         n = parseInt(arr[ids].substring(its+1))+1;
                        //     // console.log(its, n, arr[ids].substring(its))
                        //     arr[ids] = arr[ids].substring(0, its+1)+n;
                        // } else {
                        //     if (getApp().globalData.language == 'zh_CN') {
                        //         arr.push(slist[i].condimentRoundList[k].condimentItemList[stls[k][j]].name+'x1');
                        //     } else {
                        //         arr.push(slist[i].condimentRoundList[k].condimentItemList[stls[k][j]].nameEn+'x1');
                        //     }
                        // }
                        let ids = arr.findIndex((e) => e.productCode == slist[i].condimentRoundList[k].condimentItemList[stls[k][j]].productCode);
                        if (ids > -1) {
                            arr[ids].qty = arr[ids].qty+1;
                        } else {
                            let idsf = JSON.parse(JSON.stringify(slist[i].condimentRoundList[k].condimentItemList[stls[k][j]]));
                            idsf.qty = 1;
                            arr.push(idsf);
                        }
                        
                        console.log('---固定数量可选组 已选---', arr);
                        // txt = txt.concat(arr);
                        
                    }
                    let ads = []
                    for (let k= 0; k < arr.length; k++) {
                       
                        if (getApp().globalData.language == 'zh_CN') {
                             ads.push(arr[k].name+'x'+arr[k].qty);
                            // arr.push(slist[i].condimentRoundList[k].condimentItemList[stls[k][j]].name+'x1');
                        } else {
                             ads.push(arr[k].nameEn+'x'+arr[k].qty);
                            // arr.push(slist[i].condimentRoundList[k].condimentItemList[stls[k][j]].nameEn+'x1');
                        }
                    }
                    console.log(ads);
                    txt = txt.concat(ads);
                    // txt.push()
                    // txt = [...txt, ...arr]
                } else {
                        let ifs = slist[i].condimentRoundList[k].condimentItemList.find((e) => e.isdefault == 'Y');
                        if (ifs) {
                            if (getApp().globalData.language == 'zh_CN') {
                                txt.push(ifs.name+'x'+slist[i].condimentRoundList[k].quantity);
                            } else {
                                txt.push(ifs.nameEn+'x'+slist[i].condimentRoundList[k].quantity);
                            }
                        } else {
                            if (getApp().globalData.language == 'zh_CN') {
                                txt.push(slist[i].condimentRoundList[k].condimentItemList[0].name+'x'+slist[i].condimentRoundList[k].quantity);
                            } else {
                                txt.push(slist[i].condimentRoundList[k].condimentItemList[0].nameEn+'x'+slist[i].condimentRoundList[k].quantity);
                            }
                        }
                    // }
                }
            }
        } else if (slist[i].productType == 2) {
            for(let k = 0 ;k < slist[i].condimentRoundList.length;k++){
                if (slist[i].condimentRoundList[k].condimentItemList && slist[i].condimentRoundList[k].condimentItemList.length > 0) {
                if (getApp().globalData.language == 'zh_CN') {
                    txt.push(slist[i].condimentRoundList[k].condimentItemList[0].name+'x'+slist[i].condimentRoundList[k].quantity);
                } else {
                    txt.push(slist[i].condimentRoundList[k].condimentItemList[0].nameEn+'x'+slist[i].condimentRoundList[k].quantity);
                }
                }
            }
        }
        slist[i].desSub = txt.join('+');
        }
        return slist;
    },
}
