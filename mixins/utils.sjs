
const getIsArr = (id, arr, parmas="productCode") => {
    for(let i = 0;i< arr.length;i++) {
        if (arr[i][parmas] == id) return true;
    }
    return false
};
const getIsArrN = (id, arr) => {
    for(let i = 0;i< arr.length;i++) {
        if (arr[i] == id) return true;
    }
    return false
};
const getYearMonthDay = (v) => {
  if (!v) return '';
	
	return v.substring(0, 10);
}
const getHourM = (v) => {
	if (!v) return '';
	
	return v.substring(0, 5);;
}
const getImg = (item) => {
  let img = item.couponTypeInfo.items[0].images;
    if (typeof(img) == 'string') {
      img = JSON.parse(item.couponTypeInfo.items[0].images);
    }
    return img.sokImageUrl;
}

const getAddImg = (item) => {
  let img = item.productImage;
  if (typeof(img) == 'string') {
    img = JSON.parse(img);
  }
  return img.sokImageUrl;
}

const getProImg = (item) => {
  let img = item.images;
  if (typeof(img) == 'string') {
    img = JSON.parse(img);
  }
  return img.sokImageUrl;
}
const getTargetIndex = (info, pindex, tindex) => {
    if (info.selectItem[pindex].constructor == 'Array') {
      return info.selectItem[pindex][tindex];
    }
    return info.selectItem[pindex];
}

const getCounponNum = (list) => {
    if (list.constructor != 'Array') {
      return ''
    }
    var num = 0;
    for(var i = 0;i<list.length;i++) {
      if (list[i].is_add != 1) {
        num++;
      }
    }
    return num;
}

export default {
  getIsArrN,
  getIsArr,
  getYearMonthDay,
  getHourM,
  getImg,
  getAddImg,
  getProImg,
  getTargetIndex,
  getCounponNum
};