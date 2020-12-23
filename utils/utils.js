/**
 * @author leo_zhu(563803119@qq.com)
 * @file 统一公用方法
 */

const Utils = {
	/**
     * 时间格式化
     * @param {s} time 时间
     * @param {*} parmas 年月日中间分割 默认： ’-‘
     * @param {*} isTimeStamp 传入的time是否为时间戳
     * @param {*} isAll 是否要完整的带 年月日时分
     */
    TransferNowDataFormat (isnow = false, time, parmas = '-', isAll = true, isTimeStamp = false) {
        let date = new Date();
		if (isnow) {
			date = new Date();
		} else if (isTimeStamp) {
			date = new Date(time) // 后一天
		} else {
			date = new Date(time.replace(new RegExp(/-/gm), '/'))
		}
        let month = date.getMonth() + 1;
        let strDate = date.getDate();
        let hour = date.getHours();
        let min = date.getMinutes();
        let second = date.getSeconds();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        if (hour >= 0 && hour <= 9) {
            hour = "0" + hour;
        }
        if (min >= 0 && min <= 9) {
            min = "0" + min;
        }
        if (second >= 0 && second <= 9) {
            second = "0" + second;
        }
        const arr = [];
        let currentdate = '';
        currentdate = date.getFullYear() + parmas + month + parmas + strDate;
        arr.push(currentdate);
        const currenttime = hour + ':' + min;
        if (isAll) {
            return currentdate + ' ' + currenttime;
        }
        arr.push(currenttime);
        arr.push(strDate);
        return arr;
    },
	getTimeInfo(time, parmas = '-'){
		let arr = time.split(parmas);
		let monthday = arr[1]+'月'+arr[2]+'日';
		let nowdate = new Date('' + arr[0] + '/' + arr[1] + '/'+arr[2])
		let weekday = nowdate.getDay();
		let week = this.numChangeWeek(weekday)
		return {monthday, week}
	},
	numChangeWeek (num) {
		let txt = '';
		switch (num){
			case 0:
				txt = '周日';
				break;
			case 1:
				txt = '周一';
				break;
			case 2:
				txt = '周二';
				break;
			case 3:
				txt = '周三';
				break;
			case 4:
				txt = '周四';
				break;
			case 5:
				txt = '周五';
				break;
			case 6:
				txt = '周六';
				break;
			default:
				break;
		}
		return txt;
	},
	getNextDay (daytime) {
		let time = Date.parse(new Date(daytime.replace(new RegExp(/-/gm), '/')))
		// let notime = new Date(time + 24 * 60 * 60 * 1000) // 后一天
		// isnow = false, time, parmas = '-', isAll = true, isTimeStamp = false
		let notime  = this.TransferNowDataFormat(false, time + 24 * 60 * 60 * 1000, '-', false, true)[0];
		return notime;
	},
	getNumDays(start, end){
		let stem = new Date(start.replace(new RegExp(/-/gm), '/')) / 1000,
			etem = new Date(end.replace(new RegExp(/-/gm), '/')) / 1000;
		return parseInt((etem - stem) / (24 * 60 * 60));
		
	},
	getNowTimesTxt(date) {
		let d = date ? new Date(date.replace(new RegExp(/-/gm), '/')) : new Date();
		let hour = d.getHours(); //当前系统时间的小时值
		let timeValue = "" +((hour >= 12) ? (hour >= 18) ? "晚上" : "下午" : "上午" ); //当前时间属于上午、晚上还是下午
		return timeValue;
	},
	getNowFormatDate() {
		let date = new Date();
		let year = date.getFullYear();
		let month = date.getMonth() + 1;
		let strDate = date.getDate();
		if (month >= 1 && month <= 9) {
			month = "0" + month;
		}
		if (strDate >= 0 && strDate <= 9) {
			strDate = "0" + strDate;
		}
		let currentdate = year + '年' + month + '月' + strDate + '日';
		return currentdate;
	},
	getNowFormatTime() {
		let date = new Date();
		let hour = date.getHours();
		let min = date.getMinutes();
		if (hour >= 1 && hour <= 9) {
			hour = "0" + hour;
		}
		if (min >= 1 && min <= 9) {
			min = "0" + min;
		}
		let currentdate = hour + '时' + min + '分';
		return currentdate;
	},
	/**
	 * 路由跳转
	 * @param {Object} 参数
	 */
	onGoRouter(item) {
		console.log(item);
		switch (item.jumpType){
			case "h5":
				uni.navigateTo({
					url: "/pages/webview/index?url="+item.jumpUrl
				})
				break;
			case "page":
				uni.navigateTo({
					url: item.jumpUrl
				})
				break;
			default:
				break;
		}
	},
	checkIsInarr(arr, value, parmas = 'id') {
		let index = arr.findIndex((e) => e[parmas] == value);
		return index;
	},
	isPhone(phone){
		return /^1(3\d|4\d|5\d|6\d|7\d|8\d|9\d)\d{8}$/g.test(phone);
	}
}

export default Utils;