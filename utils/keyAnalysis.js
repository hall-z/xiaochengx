const KeyEvent = {
    ACTION_DOWN:0,
    KEYCODE_0:7,
    KEYCODE_1:8,
    KEYCODE_2:9,
    KEYCODE_3:10,
    KEYCODE_4:11,
    KEYCODE_5:12,
    KEYCODE_6:13,
    KEYCODE_7:14,
    KEYCODE_8:15,
    KEYCODE_9:16,
    KEYCODE_A:29,
    KEYCODE_Z:54,
    KEYCODE_COMMA:55,
    KEYCODE_PERIOD:56,
    KEYCODE_SHIFT_LEFT:59,
    KEYCODE_SHIFT_RIGHT:60,
    KEYCODE_ENTER:66,
    KEYCODE_GRAVE:68,
    KEYCODE_MINUS:69,
    KEYCODE_EQUALS:70,
    KEYCODE_LEFT_BRACKET:71,
    KEYCODE_RIGHT_BRACKET:72,
    KEYCODE_BACKSLASH:73,
    KEYCODE_SEMICOLON:74,
    KEYCODE_APOSTROPHE:75,
    KEYCODE_SLASH:76,
    KEYCODE_NUMPAD_SUBTRACT:156,
};
let _mCaps = '',
    _barcode = null;

function checkLetterStatus(event){
    if(event.keyCode === KeyEvent.KEYCODE_SHIFT_RIGHT || event.keyCode === KeyEvent.KEYCODE_SHIFT_LEFT){
        return (event.action === KeyEvent.ACTION_DOWN)
    }
    else {
        return false;
    }
}
function getInputCode(caps, keyCode) {

    function keyValue(caps, keyCode){
    switch (keyCode) {
        case KeyEvent.KEYCODE_0:
            return caps ? ')' : '0';
        case KeyEvent.KEYCODE_1:
            return caps ? '!' : '1';
        case KeyEvent.KEYCODE_2:
            return caps ? '@' : '2';
        case KeyEvent.KEYCODE_3:
            return caps ? '#' : '3';
        case KeyEvent.KEYCODE_4:
            return caps ? '$' : '4';
        case KeyEvent.KEYCODE_5:
            return caps ? '%' : '5';
        case KeyEvent.KEYCODE_6:
            return caps ? '^' : '6';
        case KeyEvent.KEYCODE_7:
            return caps ? '&' : '7';
        case KeyEvent.KEYCODE_8:
            return caps ? '*' : '8';
        case KeyEvent.KEYCODE_9:
            return caps ? '(' : '9';
        case KeyEvent.KEYCODE_GRAVE:
            return caps ? '~' : '`';
        case KeyEvent.KEYCODE_BACKSLASH:
            return caps ? '|' : '\\';
        case KeyEvent.KEYCODE_LEFT_BRACKET:
            return caps ? '{' : '[';
        case KeyEvent.KEYCODE_RIGHT_BRACKET:
            return caps ? '}' : ']';
        case KeyEvent.KEYCODE_SEMICOLON:
            return caps ? ':' : ';';
        case KeyEvent.KEYCODE_APOSTROPHE:
            return caps ? '"' : '\'';
        case KeyEvent.KEYCODE_COMMA:
            return caps ? '<' : ',';
        case KeyEvent.KEYCODE_PERIOD:
            return caps ? '>' : '.';
        case KeyEvent.KEYCODE_SLASH:
            return caps ? '?' : '/';
        case KeyEvent.KEYCODE_NUMPAD_SUBTRACT:
            return '-';
        case KeyEvent.KEYCODE_MINUS:
            return '_';
        case KeyEvent.KEYCODE_EQUALS:
            return '=';
        default:
            return 0;
    }
    }
    if (keyCode >= KeyEvent.KEYCODE_A && keyCode <= KeyEvent.KEYCODE_Z) {
        return String.fromCharCode(((caps ? 'A'.charCodeAt() : 'a'.charCodeAt()) + keyCode - KeyEvent.KEYCODE_A))
    } else {
        return keyValue(caps, keyCode)
    }
}

function getCode(r, cb) {
    let k = r.keyCode;

    // barcode scanner
    if(!_mCaps){
        _mCaps = checkLetterStatus(r)
    }

    if (r.action === KeyEvent.ACTION_DOWN) {
        if (_barcode === null){
            _barcode = '';
        }
        if (k === KeyEvent.KEYCODE_ENTER) {
            console.log('Scan Barcode', _barcode);
            cb({
                status: 1,
                code: _barcode
            }) && typeof (cb.catchErr) == 'function' && cb.catchErr({
                status: 1,
                code: _barcode
            });
            _barcode = '';
            return;
        }
        else {
            let aChar = getInputCode(_mCaps, k);
            if (aChar !== 0) {        
                _barcode += aChar;
                _mCaps  = false; //consume the shift key
            }
        }
    }
}


module.exports = {
  getCode: getCode
}