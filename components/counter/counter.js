Component({
  mixins: [],
  data: {
    value: 0
  },
  props: {
    targetId: 0,
    number: 1,
    min: 0,
    max: 100,
    showType: 2,
    info: {},
    onChange: (data) => console.log(data),
    onOpenTimeOut: (data) => console.log(data),
  },
  onInit(){},
  didMount() {
    const that = this;
    // that.setData({
    //   value: that.props.number
    // })
  },
  didUpdate() {
    this.setData({
      value: this.props.number
    })
  },
  didUnmount() {},
  methods: {
    reduce () {
      // console.log('reduce');
      if (this.data.value <= this.props.min) return false;
      let n = this.data.value -1;
      this.setData({
        value: n
      })
			// this.value = this.value -1;
      this.props.onChange(n, this.props.info);
    },
    add () {
      // console.log('add')
      if (this.data.value >= this.props.max) return false;
      let n = this.data.value + 1;
			this.setData({
        value: n
      })
      this.props.onChange(n, this.props.info);
    }
  }
});
