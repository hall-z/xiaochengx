/**
 * @author leo_zhu(563803119@qq.com)
 * @file config 配置可变参数，如域名等
 */

let trial = true;// 是否测试环境
let url = 'https://uat.api.plkchina.cn',
	imgUrl = 'https://uat.api.plkchina.cn',// 静态资源存储路径
	cdnImgUrl = "http://cdn.plkchina.cn/resource/sok";

const config = {
	trial: trial,
    ourl: url,
    url: url+'/miniProgram',
	imgUrl: imgUrl,
	appId: "2021001114647423",
	imgUrlAndFolder: imgUrl+'/upload/img', // 静态资源图片地址
	paySucessImg: cdnImgUrl + "/success.gif",
	phoneScanImg: cdnImgUrl + "/phone-scan.gif",
	styleBg: cdnImgUrl + "/style-bg.png"
};

export default config;