Component({
  mixins: [],
  data: {},
  props: {
    showType: 1,
    dindex: 0,
    active: [],
    active1: 0,
    info: {},
    onSelect: () => {}
  },
  didMount() {},
  didUpdate() {},
  didUnmount() {},
  methods: {
    selectInfo(e) {
      if (this.props.showType == 2) {
        if (this.props.dindex == this.props.active1) {
          return false;
        }
      }
      
      this.props.onSelect(this.props.dindex)
    }
  },
});
