
// let zh = request('./zh.json');
import zh from './zh.js';
import en from './en.js';
import otherZh from './other-zh.js';
import otherEn from './other-en.js';
const lang = {
	zh_CN: {...zh, ...otherZh},
	en_US: {...en, ...otherEn}
}

export default lang;