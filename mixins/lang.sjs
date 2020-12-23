// import lang from '../config/lang.js';
const getSjsLanguage = (params, lang, language = "zh_CN", to_lower = false) => {
    if (!params) return '';
    if (to_lower) {
      return lang[language][params].toLowerCase();
    }
    return lang[language][params]
};
export default {
    getSjsLanguage,
};