
Component({
  mixins: [],
  data: {
    errorMobile: "",
    errorCode: "",
    form: {
      mobile: "",
      code: ""
    },
    txt: '',
    isSend: false,
    privacyStatus: true
  },
  props: {
    isShowMobileLoginModal: false, //是否显示modal
    onCloseModal: () => { }
  },
  onInit(){},
  didMount() {},
  didUpdate() {
    if (this.data.language != getApp().globalData.language) {
      this.setData({
        language: getApp().globalData.language,
      })
    }
    
    if (!this.props.isShowMobileLoginModal) {
      this.timer && clearInterval(this.timer);
      this.setData({
        errorMobile: "",
        errorCode: "",
        form: {
          mobile: "",
          code: ""
        },
        txt: '',
        isSend: false,
        privacyStatus: true
      })
    }
    // console.log('didUpdate')
  },
  didUnmount() {
    console.log('didUnmount')
  },
  methods: {
    closeModal() {
      this.props.onCloseModal()
    },
    /**
     * 验证手机号码
     */
    goCheck() {
      let that = this;
      if (!that.data.privacyStatus) {
        my.showToast({
          content: getApp().getBaseLanguage('sok_input_mobile_number'),
        });
        return false;
      }
      if (!(/^1[3456789]\d{9}$/.test(that.data.form.mobile))) {
        // my.alert({
        //   title: getApp().getBaseLanguage('tips'),
        //   content: getApp().getBaseLanguage('sok_input_mobile_number'),
        //   buttonText: getApp().getBaseLanguage('submit'),
        //   success: function (res) {}
        // });
        my.showToast({
          content: getApp().getBaseLanguage('sok_input_mobile_number'),
        });
        return false;
      }
      if (that.data.form.mobile == '') {
        // my.alert({
        //   title: getApp().getBaseLanguage('tips'),
        //   content: getApp().getBaseLanguage('sok_input_code'),
        //   buttonText: getApp().getBaseLanguage('submit'),
        //   success: function (res) {}
        // });
        my.showToast({
          content: getApp().getBaseLanguage('sok_input_code'),
        });
        return false;
      }
      getApp().globalData.fetchApi.check_code({
        phone: this.data.form.mobile,
        captcha: this.data.form.code,
        channel: getApp().globalData.storeInfo.channel,
        type: 1
      }).then((res) => {
        getApp().sendTracking('MOBILE_LOGIN', res);
        res.body.user_id = res.body.id;// 兼容sdk
        getApp().globalData.userInfo = res.body;
        that.setData({
          form: {
            mobile: "",
            code: ""
          },
          txt: getApp().getBaseLanguage('sok_send_code'),
          isSend: false,
        })
        that.timer && clearInterval(that.timer);
        that.closeModal();
        my.navigateTo({
          url: '/pages/eatStyle/eatStyle'
        });

      }).catch(err => {
        // todo 清空已输入的验证码
        console.log("====catch", err)
        // setTimeout(function() {
        //   my.showToast({
        //     content: getApp().getBaseLanguage('input_verification_code'),
        //     duration: 2000
        //   });
        // }, 500)
      })
    },
    //获取验证码
    getCode() {
      let that = this;
      // console.log(this.data.form)
      // return false;
      if (that.data.isSend) { return false; }
      if (!(/^1[3456789]\d{9}$/.test(that.data.form.mobile))) {
        my.alert({
          title: getApp().getBaseLanguage('tips'),
          content: getApp().getBaseLanguage('sok_input_mobile_number'),
          buttonText: getApp().getBaseLanguage('submit'),
          success: function (res) { }
        });
        return false;
      }
      that.setData({
        isSend: true,
        txt:  getApp().getBaseLanguage('sok_sending')
      })
      getApp().globalData.fetchApi.get_code({
        phone: this.data.form.mobile,
        channel: getApp().globalData.storeInfo.channel,
        type: 1
      }).then((res) => {
        let time = 60;
        that.timer = setInterval(
          () => {
            if (time <= 0) {
              that.setData({
                isSend: false,
                txt: getApp().getBaseLanguage('sok_send_code'),
              })
              that.timer && clearInterval(that.timer);
              return false;
            }
            time--;
            that.setData({
              txt: time + 'S'
            })
          },
          1000
        );
      }).catch(() => {
        that.setData({
          isSend: false,
          txt: getApp().getBaseLanguage('sok_send_code'),
        })
      })
    },
    inputChange(e) {
      this.setData({
        ['form[' + e.currentTarget.dataset.name + ']']: e.detail.value
      })
    },
    changeStatus(e) {
      this.setData({
        privacyStatus: !this.data.privacyStatus
      })
    },
    goPrivacy(e) {
      my.navigateTo({
        url: '/pages/privacy/privacy'
      })
    }
  },
});

