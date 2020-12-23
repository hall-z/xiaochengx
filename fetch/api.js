/**
 * @author leo_zhu(563803119@qq.com)
 */
import config from '../config';
// import store from "../store";
import md5 from "./md5.js";
// import lang from '../config/lang.js';
let ismodal = false;
let loadingCount = 0;
const API = {
    getUrl(){
        // return config.url
        return config.url;
    },
	/**
	 * 带环境变量组合图片地址
	 * @param {Object} index
	 */
    getImgEvnUrl(){
        return config.imgUrl;
    },
	/**
	 * 静态资源图片地址
	 * @param {Object} index
	 */
	getImgUrl(index){
	    return config.imgUrlAndFolder + index;
	},
	/**
	 * 请求封装
	 * @param {Object} rurl 请求path
	 * @param {Object} body 请求参数 
	 * @param {Object} method 请求method
	 * @param {Object} isneedload 是否需要loading
	 */
	request (rurl, body = {}, method = 'GET', isneedload = true) {
		// console.log(getApp().globalData.userInfo)
		let needSux = 1;
		if (body.noPrefix) {
			needSux = 0;
			delete body.noPrefix;
		}
		console.log('---request监控请求计算加密开始---', rurl, new Date().getTime());
		let parmas = this.createParams(rurl, method, body);
		// console.log(parmas)
		// return false;
		let surl = needSux == 0 ? config.ourl + rurl + parmas.resUrl : config.url + rurl + parmas.resUrl;
		console.log('---request监控请求计算加密结束---', surl, new Date().getTime());
		// console.log(getApp().getBaseLanguage('loading'))
		if (isneedload) {
			loadingCount ++
			if(loadingCount === 1) {
				my.showLoading({
					content: getApp().getBaseLanguage('loading'),
					mask: true
				});
			}
		}
		return new Promise((resolve, reject) => {
			let that = this;
			// if (rurl == '/order/B2CPay') {
			// 	console.log('订单支付请求参数', parmas)
			// }
			console.log('request 请求参数 body', parmas);
			// that.failTip(getApp().getBaseLanguage('request_fail'))
			console.log('---request监控网络请求开始---', surl, new Date().getTime());
			my.request({
				url: surl, //仅为示例，并非真实接口地址。
				data: ["POST", "PUT"].indexOf(method) >= 0 ? parmas.parmas : {},
				method: method,
				timeout: 12000,
				headers: {
					"AUTHORIZATION": getApp().globalData.userInfo.token
				},
				// AUTHORIZATION: store.getters.getToken
				success: (res) => {
					// console.log('---request监控请求结束---', rurl, new Date().getTime());
					console.log("==success==", res)
					if (res.data.code != 0) {
						reject(-1);
						that.failTip(res.data.msg)
						return false
					}
					resolve(res.data);
				},
				fail: (err) => {
					// console.log(err)
					console.log('---request请求失败---', surl, err)
					reject(-1);
					if (err.data) {
						that.failTip(err.data.msg);
						return false;
					}
					that.failTip(err.message || getApp().getBaseLanguage('request_fail'))
					// that.failTip(getApp().getBaseLanguage('request_fail'))
					getApp().sendTracking("API_ERROR", Object.assign({url: surl}, err));
				},
				complete: (cRes) => {
					console.log('---request监控网络请求结束---', surl, new Date().getTime());
					console.log('---request请求完成---', surl, cRes)
					// if (rurl == '/order/B2CPay') {
					// 	console.log('订单支付请求完成', cRes)
					// }
					console.log('=====', cRes)
					if (loadingCount > 0) { //防止减成负数
					  loadingCount--;
					  if (loadingCount === 0)  {
						my.hideLoading();
					  }
					}
				}
			});
		})
	},
	/**
	 * 上传封装
	 * @param {Object} rurl 请求path
	 * @param {Object} files 文件流
	 * @param {Object} isneedload 是否需要loading
	 */
	upload (rurl, files, isneedload = false) {
		let that = this;
		if (isneedload) {
			loadingCount ++
			if(loadingCount === 1) {
				my.showLoading({
					content: '加载中',
					mask: true
				});
			}
		}
		return new Promise((resolve, reject) => {
			my.uploadFile({
				url: config.url + '/upload/index',
				header: {
					// AUTHORIZATION: 'Bearer ' + store.getters.getToken
				},
				filePath: files,
				name: 'file',
				formData: {},
				success: function (res) {
					uni.hideLoading();
					if (res.data.code != 0) {
						reject(-1);
						that.failTip(res.data.msg)
						return false
					}
					resolve(res.data);
				},
				fail: function (err) {
					reject(-1);
					that.failTip('上传失败，请重试！')
				}
			});
		})
	},
	getParamsUrl (method, body) {
		let resUrl = ""
		if(["POST", "PUT"].indexOf(method) < 0) {
			for(let key in body) {
				resUrl += "/" + body[key]
			}
			console.log("--resUrl--", resUrl)
		}
		return resUrl
	},
	/**
	 * 生成md5加密key以及参数 
	 * @param {Object} path
	 * @param {Object} method
	 * @param {Object} body
	 */
	createParams(path, method, body) {
		let timestamp = new Date().getTime(),
			requestStr,
			parmas = {},
			resUrl = "";
			requestStr = JSON.stringify(body) + path + method + timestamp,
		parmas['id'] = md5.hex_md5(requestStr);
		parmas['sign'] = "BTWVF7PZWCAEACZZZRST";
		parmas['timestamp'] = timestamp;
		parmas['body'] = body;

		if(["POST", "PUT"].indexOf(method) < 0) {
			for(let key in body) {
				resUrl += "/" + body[key]
			}
			console.log("--resUrl--", resUrl)
		}
		return {parmas, resUrl};
	},
	/**
	 * 错误提示
	 * @param {Object} txt
	 */
	failTip(txt) {
		// my.hideLoading();
		// if (ismodal) {
		// 	return false;
		// }
		// ismodal = true;
		console.log(txt);
		setTimeout(() => {
			my.showToast({
				content: txt,
				duration: 2000
			});
		},200)
		
		// my.alert({
        //   	title: getApp().getBaseLanguage('tips'),
		// 	content: txt,
		// 	buttonText: getApp().getBaseLanguage('submit'),
		// 	success: function (res) {
		// 		ismodal = false;
		// 	}
        // });
	}
}

export default API;