var Pinner = function(selector, options) {

    // if device is mobile or tablet. not to initialize plugin!

    if (isMobile.phone || isMobile.tablet) {
        return;
    }

    this.w = window;
    this.doc = document;
    this.body = this.doc.body;
    this.options = options;
    this._fixed = null;
    this._sticky = null;
    this.initialElemOffsetTop = null;
    this.contextElem;
    this.throttleResize;
    this.onScroll;
    
    this.windowW;

    this.elem = this.doc.querySelector(selector);

    if (!this.elem) {
        return;
    }
    
    this.initialElemOffsetTop = getCoords(this.elem).top; // изначальный offset.top у элемента



    var DEFAULTS = {
        context: 'window',
        fixedClass: 'fixed',
        stickyClass: 'sticked',
        asd: 'dsa',
        width: 'parent',
        responsiveWidth: true,
        minWindowWidth: false,
        mobile: false,
        throttleDelay: 500,
        updateOnResize: false
    }

    this.options = extend(DEFAULTS, this.options);

    addListeners.call(this); // инициализируем евенты для плагина (scroll, domcontentloaded, resize)

    if (this.options.context !== 'window') {

        this.contextElem = this.doc.querySelector(this.options.context);

        this.contextInitialOffsetTop = getCoords(this.contextElem).top; // Получаем изначальные координаты у блока-контекста
    } else {
        this.contextElem = null;

    }
}

// extends one object properties to another object.
function extend(objA, objB) {
    for (prop in objA) {
        if (objB.hasOwnProperty(prop)) {
            continue;
        } else {
            objB[prop] = objA[prop];
        }
    }

    return objB;
}


// adds event listeners for plugin
function addListeners() {

    this.throttledResize = throttle(onResize.bind(this), this.options.throttleDelay);
    this.onScroll = onScroll.bind(this);
    this.checkWindowWidth = throttle(checkWindowWidth.bind(this), 300)
    // this.w.addEventListener('DOMContentLoaded', function(){
    //     onScroll.bind(this);

    //     console.log('loaded');
    // });

    this.w.addEventListener('scroll', this.onScroll);

    this.w.addEventListener('resize', this.throttledResize);

    this.w.addEventListener('resize', this.checkWindowWidth);
}

// removes event listeners for plugin

Pinner.prototype.removeListeners = function() {
    console.log(this.elem);
    this.w.removeEventListener('scroll', this.onScroll);

    this.w.removeEventListener('resize', this.throttledResize);

}

// fires on scroll event

function onScroll() {

    var data = getData.call(this);

    if (this.options.context === 'window') { // если контекст окно браузера

        if (data.wScroll >= (Math.round(this.initialElemOffsetTop) - data.elemMarginTop) && !this._fixed) {

            // если кординаты элемента сверху больше нуля - тогда берем их. Иначе делаем top = 0;

            this.elem.style.top = 0 + 'px';
            this.elem.style.position = 'fixed';

            this.elem.classList.add(this.options.fixedClass);


            this._fixed = true;

            this.resizeElem();

            if (this.options.onFixedStart) {
                this.options.onFixedStart(this.elem); // запускаем евент onFixedStart
            }


        } else if (data.wScroll <= (Math.round(this.initialElemOffsetTop) - data.elemMarginTop) && this._fixed) {
            this.elem.style.position = '';
            this.elem.style.top = '';
            this.elem.style.width = '';

            this.elem.classList.remove(this.options.fixedClass);

            this._fixed = null;

        }

    } else if (this.options.context !== 'window') { // Если контекст не окно браузера

        // как только достигаем контекст - фиксируем элемент
        if (data.wScroll >= Math.round(data.contextOffsetTop) && !this._fixed && !this._sticky) {
            console.log('FIXED');

            this.elem.style.top = 0 + 'px';
            this.elem.style.position = 'fixed';

            this.elem.classList.add(this.options.fixedClass);


            this._fixed = true;
            this._sticky = null;

            this.resizeElem();

            if (this.options.onfixedStart) {
                this.options.onFixedStart(this.elem); // запускаем евент onFixedStart
            }

        } else if (data.wScroll <= Math.round(this.contextInitialOffsetTop) && this._fixed) {

            console.log('NORMAL TOP');

            this.clearElemProps();

            this.elem.classList.remove(this.options.fixedClass);

            this._fixed = null;
            this._sticky = null;

        } 

        if (data.wScroll >= (Math.round(data.contextHeight + data.contextOffsetTop) - data.elemHeight - (data.elemMarginBottom + data.elemMarginTop)) && !this._sticky) {
            console.log(data.wScroll);
            this.elem.style.top = data.contextHeight - data.elemHeight - (data.elemMarginBottom + data.elemMarginTop) + 'px';
            this.elem.style.position = 'absolute';

            this.elem.classList.remove(this.options.fixedClass);

            this._sticky = true;
            this._fixed = null;

            console.log('NORMAL BOTTOM');

        } else if ((data.wScroll <= (Math.round(data.contextHeight + data.contextOffsetTop) - data.elemHeight - (data.elemMarginBottom + data.elemMarginTop)) && this._sticky)) {

            this.elem.style.top = 0 + 'px';
            this.elem.style.position = 'fixed';

            this.elem.classList.add(this.options.fixedClass);
            this._sticky = null;
            this._fixed = true;

            console.log('FIXED BOTTOM')
        }
    }

}


// clear all props for element  defined by plugin  
Pinner.prototype.clearElemProps = function() {
    this.elem.style.position = '';
    this.elem.style.top = '';
    this.elem.style.width = '';
}

Pinner.prototype.clearElemClasses = function() {
    this.elem.classList.remove(this.options.fixedClass);
    this.elem.classList.remove(this.options.stickyClass);
}

// resizes elem when it gets fixed
Pinner.prototype.resizeElem = function() {

    var _ = this;

    if (_.options.width === 'parent') { // берем ширину у родителя

        var parent = _.elem.parentNode;

        _.elem.style.width = parent.clientWidth + 'px';

    } else if (typeof _.options.width === 'string') { // 
        _.elem.style.width = _.options.width;
    }

}

// checks window Width. if it equals options.minWidth = destroy plugin

function checkWindowWidth() {
    this.windowW = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    if (this.windowW <= this.options.minWidth && !this._destroyed) {
        this.destroy();

        this._destroyed = true;
    } else if (this.windowW >= this.options.minWidth && this._destroyed) {
        this.reInit();

        this._destroyed = false;
    }
}

// destroy plugin

Pinner.prototype.destroy = function() {
    this.removeListeners();

    this.clearElemProps();
    this.clearElemClasses();
}


Pinner.prototype.reInit = function() {
    this.w.addEventListener('scroll', this.onScroll);
    this.w.addEventListener('resize', this.throttledResize);
}
// fires on resize event

function onResize() {

    // fires when element has option responsive width and element fixed or sticky. Basically it just resizes element using parent's width
    if (this.options.responsiveWidth && (this._fixed || this._sticky)) {
        this.resizeElem();
    }

    // update state of element on resize. 

    if (this.options.updateOnResize) {
        onScroll.call(this);

        console.log('asd');
    }
}

// 

function getData() {
    var style = getComputedStyle(this.elem);

    return {
        wScroll: window.pageYOffset,
        elemOffsetTop: getCoords(this.elem).top,
        elemHeight: this.elem.offsetHeight,
        contextOffsetTop: this.contextElem !== null ? getCoords(this.contextElem).top : null,
        contextHeight: this.contextElem !== null ? this.contextElem.offsetHeight : null,
        elemMarginTop: parseInt(style.marginTop),
        elemMarginBottom: parseInt(style.marginBottom)
    }
}


// gets coords of element

function getCoords(elem) {
    var box = elem.getBoundingClientRect();

    return {
        'top': box.top + window.pageYOffset,
        'left': box.left + window.pageXOffset
    }
}

// throttle utility function which delays function calls. Taken from: https://github.com/jashkenas/underscore/blob/master/underscore.js

function throttle(func, wait, options) {
    var timeout, context, args, result;
    var previous = 0;
    if (!options) options = {};

    var later = function() {
        previous = options.leading === false ? 0 : new Date().getTime();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };

    var throttled = function() {
        var now = new Date().getTime();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };

    throttled.cancel = function() {
        clearTimeout(timeout);
        previous = 0;
        timeout = context = args = null;
    };

    return throttled;
};

function now() {
    return new Date().getTime();
}



/**
 * isMobile.js v0.4.0
 *
 * A simple library to detect Apple phones and tablets,
 * Android phones and tablets, other mobile devices (like blackberry, mini-opera and windows phone),
 * and any kind of seven inch device, via user agent sniffing.
 *
 * @author: Kai Mallea (kmallea@gmail.com)
 *
 * @license: http://creativecommons.org/publicdomain/zero/1.0/
 */
(function(global) {

    var apple_phone = /iPhone/i,
        apple_ipod = /iPod/i,
        apple_tablet = /iPad/i,
        android_phone = /(?=.*\bAndroid\b)(?=.*\bMobile\b)/i, // Match 'Android' AND 'Mobile'
        android_tablet = /Android/i,
        amazon_phone = /(?=.*\bAndroid\b)(?=.*\bSD4930UR\b)/i,
        amazon_tablet = /(?=.*\bAndroid\b)(?=.*\b(?:KFOT|KFTT|KFJWI|KFJWA|KFSOWI|KFTHWI|KFTHWA|KFAPWI|KFAPWA|KFARWI|KFASWI|KFSAWI|KFSAWA)\b)/i,
        windows_phone = /IEMobile/i,
        windows_tablet = /(?=.*\bWindows\b)(?=.*\bARM\b)/i, // Match 'Windows' AND 'ARM'
        other_blackberry = /BlackBerry/i,
        other_blackberry_10 = /BB10/i,
        other_opera = /Opera Mini/i,
        other_chrome = /(CriOS|Chrome)(?=.*\bMobile\b)/i,
        other_firefox = /(?=.*\bFirefox\b)(?=.*\bMobile\b)/i, // Match 'Firefox' AND 'Mobile'
        seven_inch = new RegExp(
            '(?:' + // Non-capturing group

            'Nexus 7' + // Nexus 7

            '|' + // OR

            'BNTV250' + // B&N Nook Tablet 7 inch

            '|' + // OR

            'Kindle Fire' + // Kindle Fire

            '|' + // OR

            'Silk' + // Kindle Fire, Silk Accelerated

            '|' + // OR

            'GT-P1000' + // Galaxy Tab 7 inch

            ')', // End non-capturing group

            'i'); // Case-insensitive matching

    var match = function(regex, userAgent) {
        return regex.test(userAgent);
    };

    var IsMobileClass = function(userAgent) {
        var ua = userAgent || navigator.userAgent;

        // Facebook mobile app's integrated browser adds a bunch of strings that
        // match everything. Strip it out if it exists.
        var tmp = ua.split('[FBAN');
        if (typeof tmp[1] !== 'undefined') {
            ua = tmp[0];
        }

        // Twitter mobile app's integrated browser on iPad adds a "Twitter for
        // iPhone" string. Same probable happens on other tablet platforms.
        // This will confuse detection so strip it out if it exists.
        tmp = ua.split('Twitter');
        if (typeof tmp[1] !== 'undefined') {
            ua = tmp[0];
        }

        this.apple = {
            phone: match(apple_phone, ua),
            ipod: match(apple_ipod, ua),
            tablet: !match(apple_phone, ua) && match(apple_tablet, ua),
            device: match(apple_phone, ua) || match(apple_ipod, ua) || match(apple_tablet, ua)
        };
        this.amazon = {
            phone: match(amazon_phone, ua),
            tablet: !match(amazon_phone, ua) && match(amazon_tablet, ua),
            device: match(amazon_phone, ua) || match(amazon_tablet, ua)
        };
        this.android = {
            phone: match(amazon_phone, ua) || match(android_phone, ua),
            tablet: !match(amazon_phone, ua) && !match(android_phone, ua) && (match(amazon_tablet, ua) || match(android_tablet, ua)),
            device: match(amazon_phone, ua) || match(amazon_tablet, ua) || match(android_phone, ua) || match(android_tablet, ua)
        };
        this.windows = {
            phone: match(windows_phone, ua),
            tablet: match(windows_tablet, ua),
            device: match(windows_phone, ua) || match(windows_tablet, ua)
        };
        this.other = {
            blackberry: match(other_blackberry, ua),
            blackberry10: match(other_blackberry_10, ua),
            opera: match(other_opera, ua),
            firefox: match(other_firefox, ua),
            chrome: match(other_chrome, ua),
            device: match(other_blackberry, ua) || match(other_blackberry_10, ua) || match(other_opera, ua) || match(other_firefox, ua) || match(other_chrome, ua)
        };
        this.seven_inch = match(seven_inch, ua);
        this.any = this.apple.device || this.android.device || this.windows.device || this.other.device || this.seven_inch;

        // excludes 'other' devices and ipods, targeting touchscreen phones
        this.phone = this.apple.phone || this.android.phone || this.windows.phone;

        // excludes 7 inch devices, classifying as phone or tablet is left to the user
        this.tablet = this.apple.tablet || this.android.tablet || this.windows.tablet;

        if (typeof window === 'undefined') {
            return this;
        }
    };

    var instantiate = function() {
        var IM = new IsMobileClass();
        IM.Class = IsMobileClass;
        return IM;
    };

    if (typeof module !== 'undefined' && module.exports && typeof window === 'undefined') {
        //node
        module.exports = IsMobileClass;
    } else if (typeof module !== 'undefined' && module.exports && typeof window !== 'undefined') {
        //browserify
        module.exports = instantiate();
    } else if (typeof define === 'function' && define.amd) {
        //AMD
        define('isMobile', [], global.isMobile = instantiate());
    } else {
        global.isMobile = instantiate();
    }

})(this);
