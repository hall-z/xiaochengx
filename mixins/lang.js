export default {
    data: {
        langs: getApp().globalData.langs,
        language: getApp().globalData.language,
    },
    getBaseLanguage (params, to_lower = false){
        return getApp().getBaseLanguage(params, to_lower);
    },
}