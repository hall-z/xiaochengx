// 一些平台无关的JS常用函数（支持小程序）
// Collected by Robo, Oct. 2019

//=================================================
// PART-1 频繁使用的函数
//=================================================

// 将多个对象合并到target中：多个对象来自“变参数”
function extend(target) {
    var sources = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < sources.length; i += 1) {
        var source = sources[i];
        if (source && typeof source == "object") {
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    target[key] = source[key];
                }
            }
        }
    }
    return target;
};

// 对象方法注入
function inject(obj, name, neu) {
    if (obj[name]) {
        var old = obj[name];
        obj[name] = function() {
            neu.apply(this, arguments),
            old.apply(this, arguments)
        }
    } else {
        obj[name] = function() {
            neu.apply(this, arguments);
        }
    }
};

// 将多个对象的kv合并到url中：多个对象来自变参数
function mergeUrl(url) {
    var sources = Array.prototype.slice.call(arguments, 1);
    var pairs = [];
    for (var i = 0; i < sources.length; i += 1) {
        var obj = sources[i];
        if (!obj || typeof obj != "object") continue;
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                var param = obj[key];
                switch (typeof param) {
                    case "string":
                        param = encodeURIComponent(param);
                    case "number":
                    case "boolean":
                        pairs.push(encodeURIComponent(key) + "=" + param)
                        break;
                }
            }
        }
    }
    if (pairs.length == 0) return url;
    return url + (url.indexOf("?") < 0 ? "?" : "&") + pairs.join("&");
};


// 小程序的页面事件options参数，并不是合法的query，需要decodeURIComponent
function fixQuery(obj) {
    var fixed = {};
    if (obj && typeof obj == "object") {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                fixed[decodeURIComponent(key)] = decodeURIComponent(obj[key]);
            }
        }
    }
    return fixed;
};

// 按照"."来比较版本
function compareVersion(v1, v2) {
    v1 = v1.split('.');
    v2 = v2.split('.');
    var len = Math.max(v1.length, v2.length);

    while (v1.length < len) {
        v1.push('0');
    }
    while (v2.length < len) {
        v2.push('0');
    }

    for (var i = 0; i < len; i++) {
        var num1 = parseInt(v1[i]);
        var num2 = parseInt(v2[i]);

        if (num1 > num2) {
            return +1;
        } else if (num1 < num2) {
            return -1;
        }
    }

    return 0;
};

// 采用“时间+随机数”生成16字节的唯一ID
function guidMake() {
    return Date.now().toString(16) + parseInt((1 + Math.random()) * 1e+9).toString(16);
};


function formatDatetime(date, sep) {
    function formatNumber(n) {
        n = n.toString();
        return n[1] ? n : '0' + n;
    }
    var year = date.getFullYear().toString(),
        month = formatNumber(date.getMonth() + 1),
        day = formatNumber(date.getDate()),
        hour = formatNumber(date.getHours()),
        minute = formatNumber(date.getMinutes()),
        second = formatNumber(date.getSeconds()),
        s = sep || "-";
    return year + s + month + s + day + " " + hour + ":" + minute + ":" + second;
};

function formatUnixStamp(seconds, sep) {
    var date = new Date();
    date.setTime(seconds*1000);
    return formatDatetime(date, sep);
};


// 利用promise实现的“并发调用仅仅漏出一个”
var _workings = {}; // a pool for working threads

function justOneWork(func, key, args) {
    var that = this;
    return _workings[key] || (_workings[key] = new Promise(function(resolve_, reject_) {
        var resolve = function() {
            _workings[key] = null;
            resolve_.apply(that, arguments);
        };
        var reject = function() {
            _workings[key] = null;
            reject_.apply(that, arguments);
        };
        func.apply(that, args).then(resolve).catch(reject);
    }));
};


// justOneWork的cache版本
var _cachings = {};

function getWithCache(seconds, func, key, args) {
    var that = this,
        now = (Date.now() / 1000),
        results = _cachings[key];
    if (results && now < results[0] + seconds) {
        return results[1];
    }
    var got = justOneWork.call(that, func, key, args);
    _cachings[key] = (now, got);
    return got;
};


// 封装的错误类：typeid，message，detail
var ErrorClass = (function() {
    function FlyerError(typeid, message, detail) {
        Error.call(this, message);
        this.typeid = typeid;
        this.message = message;
        this.detail = detail || {};
    }
    FlyerError.prototype = new Error();
    FlyerError.prototype.constructor = FlyerError;
    return FlyerError;
})();

function handleError(reject_, detail, typeid, msg) {
    var error = new ErrorClass(typeid, msg, detail);
    return reject_.call(this, error);
};


//=================================================
// PART-2 引入部分函数：just
// https://github.com/angus-c/just
//=================================================
/*
  var obj = {a: 3, b: 5, c: 9};
  omit(obj, ['a', 'c']); // {b: 5}
  omit(obj, a, c); // {b: 5}
  omit(obj, ['a', 'b', 'd']); // {c: 9}
  omit(obj, ['a', 'a']); // {b: 5, c: 9}
*/
function omit(obj, removes) {
    var result = {};
    if (typeof removes === 'string') {
        removes = [].slice.call(arguments, 1);
    }
    for (var prop in obj) {
        if (!obj.hasOwnProperty || obj.hasOwnProperty(prop)) {
            if (removes.indexOf(prop) === -1) {
                result[prop] = obj[prop];
            }
        }
    }
    return result;
}

/*
  // returns a new object with the predicate applied to each value
  // like just-map-value, but (key, value) are passed to the predicate
  map({a: 3, b: 5, c: 9}, (key, value) => value + 1); // {a: 4, b: 6, c: 10}
  map({a: 3, b: 5, c: 9}, (key, value) => key); // {a: 'a', b: 'b', c: 'c'}
  map({a: 3, b: 5, c: 9}, (key, value) => key + value); // {a: 'a3', b: 'b5', c: 'c9'}
*/
function map(obj, predicate) {
    var result = {};
    var keys = Object.keys(obj);
    var len = keys.length;
    for (var i = 0; i < len; i++) {
        var key = keys[i];
        result[key] = predicate(key, obj[key]);
    }
    return result;
}

/*
  var obj = {a: 3, b: 5, c: 9};
  filter(obj, function(key, value) {
    return value < 6;
  }); // {a: 3, b: 5}

  var obj = {a1: 3, b1: 5, a2: 9};
  filter(obj, function(key, value) {
    return key[0] == 'a';
  }); // {a1: 3, a2: 9}

  var obj = {a: 3, b: 5, c: null};
  filter(obj, function(key, value) {
    return value;
  }); // {a: 3, b: 5}
*/
function filter(obj, predicate) {
    var result = {};
    var keys = Object.keys(obj);
    var len = keys.length;
    for (var i = 0; i < len; i++) {
        var key = keys[i];
        if (predicate(key, obj[key])) {
            result[key] = obj[key];
        }
    }
    return result;
}


//=================================================
// PART-3 引入部分函数：outils
// https://github.com/proYang/outils/
//=================================================

// 深拷贝，支持常见类型
function deepClone(values) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == values || "object" != typeof values) return values;

    // Handle Date
    if (values instanceof Date) {
        copy = new Date();
        copy.setTime(values.getTime());
        return copy;
    }

    // Handle Array
    if (values instanceof Array) {
        copy = [];
        for (var i = 0, len = values.length; i < len; i++) {
            copy[i] = deepClone(values[i]);
        }
        return copy;
    }

    // Handle Object
    if (values instanceof Object) {
        copy = {};
        for (var attr in values) {
            if (values.hasOwnProperty(attr)) copy[attr] = deepClone(values[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy values! Its type isn't supported.");
}

// 判断`obj`是否为空
function isEmptyObject(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj))
        return false
    return !Object.keys(obj).length
}

// 生成指定范围[min, max]的随机数
function randomNum(min, max) {
    return Math.floor(Math.random() * (max-min+1) )+ min;
}

// 判断是否为邮箱地址
function isEmail(str) {
    return /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(str);
}

// 判断是否为手机号（可携带大陆区位码）
function isMobile(str) {
    return /^(\+?0?86\-?)?1[3456789]\d{9}$/.test(str)
}

// 判断是否为身份证号
function isIdCard(str) {
    return /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/.test(str)
}

// 判断是否为URL地址
function isUrl(str) {
    return /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i.test(str);
}

// 判断浏览器是否支持webP格式图片
function isSupportWebP() {
    return !![].map && document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') == 0;
}

// 获取操作系统类型
function getOS() {
    var userAgent = 'userAgent' in navigator && navigator.userAgent.toLowerCase() || '';
    var vendor = 'vendor' in navigator && navigator.vendor.toLowerCase() || '';
    var appVersion = 'appVersion' in navigator && navigator.appVersion.toLowerCase() || '';

    if (/iphone/i.test(userAgent) || /ipad/i.test(userAgent) || /ipod/i.test(userAgent)) return 'ios'
    if (/android/i.test(userAgent)) return 'android'
    if (/win/i.test(appVersion) && /phone/i.test(userAgent)) return 'windowsPhone'
    if (/mac/i.test(appVersion)) return 'MacOSX'
    if (/win/i.test(appVersion)) return 'windows'
    if (/linux/i.test(appVersion)) return 'linux'
}

// 获取浏览器类型和版本
function getExplore() {
    var sys = {},
        ua = navigator.userAgent.toLowerCase(),
        s;
    (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? sys.ie = s[1]:
        (s = ua.match(/msie ([\d\.]+)/)) ? sys.ie = s[1] :
        (s = ua.match(/edge\/([\d\.]+)/)) ? sys.edge = s[1] :
        (s = ua.match(/firefox\/([\d\.]+)/)) ? sys.firefox = s[1] :
        (s = ua.match(/(?:opera|opr).([\d\.]+)/)) ? sys.opera = s[1] :
        (s = ua.match(/chrome\/([\d\.]+)/)) ? sys.chrome = s[1] :
        (s = ua.match(/version\/([\d\.]+).*safari/)) ? sys.safari = s[1] : 0;
    // 根据关系进行判断
    if (sys.ie) return ('IE: ' + sys.ie)
    if (sys.edge) return ('EDGE: ' + sys.edge)
    if (sys.firefox) return ('Firefox: ' + sys.firefox)
    if (sys.chrome) return ('Chrome: ' + sys.chrome)
    if (sys.opera) return ('Opera: ' + sys.opera)
    if (sys.safari) return ('Safari: ' + sys.safari)
}


module.exports = {
    extend,
    inject,
    mergeUrl,
    fixQuery,
    compareVersion,
    justOneWork,
    getWithCache,
    guidMake,
    formatDatetime,
    formatUnixStamp,
    ErrorClass,
    handleError,
    omit,
    map,
    filter,
    deepClone,
    isEmptyObject,
    randomNum,
    isEmail,
    isMobile,
    isIdCard,
    isUrl,
    isSupportWebP,
    getOS,
    getExplore,
};

