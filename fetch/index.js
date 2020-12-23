import api from './api'

let neoGet = (path) => (params, isneedload = true) => {
    return api.request(path, params, 'GET', isneedload)
}
let neoPost = (path) => (params, isneedload = true) => {
    return api.request(path, params, 'POST', isneedload)
}

let neoNoLoading = (path) => (params) => {
    return api.request(path, params, 'GET', false)
}
let neoNoLoadingPost = (path) => (params) => {
    return api.request(path, params, 'POST', false)
}
let neoDelete = (path) => (params) => {
    return api.request(path, params, 'DELETE', false)
}

const Fetch = {
	// get_url: () => api.getUrl(),
	// get_img: () => api.getImgEvnUrl(),
    //banner
    get_banner_list: neoPost('/banner/queryList'),
    // 菜单
	get_menu_query: neoPost('/menu/query'),
    get_new_menu_query: neoPost('/storeMenuClasses/action/queryList'),
    get_new_menu_query_goods: neoPost('/storeMenuProducts/action/queryList'),
	get_use_pro_coupon: neoPost('/product/useProductCoupon'),
    get_add_on_list_by_menu: neoPost('/addOn/queryListByProduct'),

    // 订单部分
	get_can_use_coupon: neoPost('/order/queryCanUseCoupon'),
	get_add_on_list: neoPost('/activityAddOn/queryList'),
    get_add_on_list_new: neoPost('/addOn/queryList'),
	get_add_order: neoPost('/order/'),
    get_add_order_v2: neoPost('/order/V2'),
    get_order_can_use_point: neoPost('/order/queryCanUsePoints'),
	get_order_adjust_point: neoPost('/logVipPoints/adjustPointsByOrder'),

    get_code_check_in: neoPost('/order/action/checkIn'),
    get_order_polling: neoNoLoading('/order/basicInfo'),
    get_order_fail: neoDelete('/order'),
    

    get_order_details: neoGet('/order'),
    get_store_info: neoNoLoadingPost('/store/queryStoreByCode'),
    get_to_pay: neoPost('/order/B2CPay'),

    // 获取验证码
    get_code: neoPost('/captcha/'),
    check_code: neoPost('/captcha/check'),
    get_store_code: neoPost('/store/device/queryOne'),

    get_code_info: neoPost('/vip/vipInfoByQrcode'),
    get_coupon_info: neoPost('/openapi/coupons/action/query'),
    
}

export default Fetch;