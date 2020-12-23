const app = getApp();
export default {
    didMount(){
        // console.log('didMount');
        this.busPos = {};
        // $number * 750 / 1080 + rpx;
        // console.log(38 * app.globalData.sys.windowWidth / 1080);
        let rate = app.globalData.sys.windowWidth / 1080;
        this.busPos['x'] = 38 * rate;//购物车的位置
        this.busPos['y'] = app.globalData.sys.windowHeight - 170 * rate;
        // console.log(this.busPos);
    }, 
    data: {
        isLogin: false,
        hide_good_box: true,
        animation: true,
        bus_x: 0,
        bus_y: 0
    },
    methods: {
        touchOnGoods: function (e) {
            if (this.isFly == 1) return false;
            this.isFly = 1;
            // console.log(e);
            this.finger = {}; var topPoint = {};
            this.finger['x'] = e.detail.clientX;//点击的位置
            this.finger['y'] = e.detail.clientY;

            if (this.finger['y'] < this.busPos['y']) {
            topPoint['y'] = this.finger['y'];
            } else {
            topPoint['y'] = this.busPos['y'];
            }
            topPoint['x'] = Math.abs(this.finger['x'] - this.busPos['x']) / 2;

            if (this.finger['x'] > this.busPos['x']) {
            topPoint['x'] = (this.finger['x'] - this.busPos['x']) / 2 + this.busPos['x'];
            } else {//
            topPoint['x'] = (this.busPos['x'] - this.finger['x']) / 2 + this.finger['x'];
            }

            this.linePos = app.bezier([this.busPos, topPoint, this.finger], 30);
            
            this.startAnimation(e);
        },
        startAnimation: function (e) {
            var index = 0, that = this,
            bezier_points = that.linePos['bezier_points'];
            // console.log(bezier_points)
            this.setData({
                hide_good_box: false,
                bus_x: that.finger['x'],
                bus_y: that.finger['y']
            })
            var len = bezier_points.length;
            index = len;
            this.timer = setInterval(function () {
                index --;
                let i = index;
                // console.log(bezier_points[i])
                that.setData({
                    bus_x: bezier_points[i]['x'],
                    bus_y: bezier_points[i]['y']
                })
                if (i < 1) {
                    clearInterval(that.timer);
                    that.setData({
                        hide_good_box: true
                    })
                    that.addCart(e);
                }
            }, 10);
        },
    }
}