/**
 * Utils.ts: Sm2Shim utilities
 *
 * Copyright (c) 2016 - 2017, The Little Moe New LLC. All rights reserved.
 *
 * This file is part of the project 'Sm2Shim'.
 * Code licensed under BSD license.
 *
 */
var Sm2ShimUtils;
(function (Sm2ShimUtils) {
    /**
     * Array base utilities.
     * @class Sm2ShimUtils.ArrayUtils
     */
    var ArrayUtils = (function () {
        function ArrayUtils() {
        }
        ArrayUtils.compare = function (property) {
            var result;
            return function (a, b) {
                if (a[property] < b[property]) {
                    result = -1;
                }
                else if (a[property] > b[property]) {
                    result = 1;
                }
                else {
                    result = 0;
                }
                return result;
            };
        };
        ArrayUtils.shuffle = function (f) {
            // Fisher-Yates shuffle algorithm
            var i, j, temp;
            for (i = f.length - 1; i > 0; i--) {
                j = Math.floor(Math.random() * (i + 1));
                temp = f[i];
                f[i] = f[j];
                f[j] = temp;
            }
            return f;
        };
        return ArrayUtils;
    }());
    Sm2ShimUtils.ArrayUtils = ArrayUtils;
    /**
     * CSS base utilities.
     * @class Sm2ShimUtils.CssUtils
     */
    var CssUtils = (function () {
        function CssUtils() {
        }
        CssUtils.addClass = function (o, cStr) {
            return CssUtils.addClassInternal(o, cStr);
        };
        CssUtils.addClassInternal = function (o, cStr) {
            if (!o || !cStr || this.hasClassInternal(o, cStr)) {
                return false; // safety net
            }
            o.className = (o.className ? o.className + ' ' : '') + cStr;
        };
        CssUtils.removeClass = function (o, cStr) {
            return CssUtils.removeClassInternal(o, cStr);
        };
        CssUtils.removeClassInternal = function (o, cStr) {
            if (!o || !cStr || !CssUtils.hasClassInternal(o, cStr)) {
                return false;
            }
            o.className = o.className.replace(new RegExp('( ' + cStr + ')|(' + cStr + ')', 'g'), '');
        };
        CssUtils.swapClass = function (o, cStr1, cStr2) {
            var tmpClass = {
                className: o.className
            };
            CssUtils.removeClassInternal(tmpClass, cStr1);
            CssUtils.addClassInternal(tmpClass, cStr2);
            o.className = tmpClass.className;
        };
        CssUtils.hasClass = function (o, cStr) {
            return CssUtils.hasClassInternal(o, cStr);
        };
        CssUtils.hasClassInternal = function (o, cStr) {
            return (o.className !== undefined ?
                new RegExp('(^|\\s)' + cStr + '(\\s|$)').test(o.className) :
                false);
        };
        CssUtils.toggleClass = function (o, cStr) {
            var found, method;
            found = Sm2ShimUtils.CssUtils.hasClass(o, cStr);
            method = (found ? Sm2ShimUtils.CssUtils.removeClass : Sm2ShimUtils.CssUtils.addClass);
            method(o, cStr);
            // indicate the new state...
            return !found;
        };
        return CssUtils;
    }());
    Sm2ShimUtils.CssUtils = CssUtils;
    /**
     * DOM base utilities.
     * @class Sm2ShimUtils.DomUtils
     */
    var DomUtils = (function () {
        function DomUtils() {
        }
        DomUtils.ancestor = function (nodeName, element, checkCurrent) {
            if (!element || !nodeName) {
                return element;
            }
            nodeName = nodeName.toUpperCase();
            // return if current node matches.
            if (checkCurrent && element && element.nodeName === nodeName) {
                return element;
            }
            while (element && element.nodeName !== nodeName && element.parentNode) {
                element = element.parentNode;
            }
            return (element && element.nodeName === nodeName ? element : null);
        };
        DomUtils.get = function (parentNode, selector) {
            var results = this.getAll.apply(this, arguments);
            if (results && results.length) {
                return results[results.length - 1];
            }
            return results && results.length === 0 ? null : results;
        };
        DomUtils.getAll = function (param1, param2) {
            var _node, _selector, _results;
            if (arguments.length === 1) {
                _node = document.documentElement;
                _selector = param1;
            }
            else {
                _node = param1;
                _selector = param2;
            }
            if (_node && _node.querySelectorAll) {
                _results = _node.querySelectorAll(_selector);
            }
            return _results;
        };
        return DomUtils;
    }());
    Sm2ShimUtils.DomUtils = DomUtils;
    /**
     * Data object of event add operations.
     * @class Sm2ShimUtils.EventAddResult
     */
    var EventAddResult = (function () {
        function EventAddResult() {
        }
        return EventAddResult;
    }());
    Sm2ShimUtils.EventAddResult = EventAddResult;
    /**
     * Event base utilities.
     * @class Sm2ShimUtils.EventUtils
     */
    var EventUtils = (function () {
        function EventUtils() {
        }
        EventUtils.add = function (o, evtName, evtHandler) {
            var eventObject = new EventAddResult();
            eventObject.detach = this.remove(o, evtName, evtHandler);
            if (window.addEventListener) {
                o.addEventListener(evtName, evtHandler, false);
            }
            else {
                // Hack for legacy browsers
                o.attachEvent('on' + evtName, evtHandler);
            }
            return eventObject;
        };
        EventUtils.remove = function (o, evtName, evtHandler) {
            if (window.removeEventListener !== undefined) {
                o.removeEventListener(evtName, evtHandler, false);
            }
            else {
                o.detachEvent('on' + evtName, evtHandler);
            }
        };
        EventUtils.preventDefault = function (e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            else {
                e.returnValue = false;
                e.cancelBubble = true;
            }
            return false;
        };
        return EventUtils;
    }());
    Sm2ShimUtils.EventUtils = EventUtils;
    /**
     * Data class of CSS transform support.
     * @class Sm2ShimUtils.CssTransformSupport
     */
    var CssTransformSupport = (function () {
        function CssTransformSupport() {
        }
        return CssTransformSupport;
    }());
    Sm2ShimUtils.CssTransformSupport = CssTransformSupport;
    /**
     * Data class of CSS rotate support.
     * @class Sm2ShimUtils.CssRotateSupport
     */
    var CssRotateSupport = (function () {
        function CssRotateSupport() {
        }
        return CssRotateSupport;
    }());
    Sm2ShimUtils.CssRotateSupport = CssRotateSupport;
    /**
     * Data class of CSS feature support.
     * @class Sm2ShimUtils.LocalFeatureSupport
     */
    var LocalFeatureSupport = (function () {
        function LocalFeatureSupport() {
        }
        return LocalFeatureSupport;
    }());
    Sm2ShimUtils.LocalFeatureSupport = LocalFeatureSupport;
    /**
     * Feature base utilities.
     * @class Sm2ShimUtils.FeatureUtils
     */
    var FeatureUtils = (function () {
        function FeatureUtils() {
            this.testDiv = document.createElement('div');
            this.localFeatures = {
                transform: {
                    ie: this.has('-ms-transform'),
                    moz: this.has('MozTransform'),
                    opera: this.has('OTransform'),
                    webkit: this.has('webkitTransform'),
                    w3: this.has('transform'),
                    prop: null // the normalized property value
                },
                rotate: {
                    has3D: false,
                    prop: null
                },
                getAnimationFrame: this.getAnimationFrame
            };
            this.localAnimationFrame = (window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                null);
            this.localFeatures.transform.prop = (this.localFeatures.transform.w3 ||
                this.localFeatures.transform.moz ||
                this.localFeatures.transform.webkit ||
                this.localFeatures.transform.ie ||
                this.localFeatures.transform.opera);
            if (this.localFeatures.transform.prop) {
                // try to derive the rotate/3D support.
                this.transform = this.localFeatures.transform.prop;
                this.styles = {
                    css_2d: 'rotate(0deg)',
                    css_3d: 'rotate3d(0,0,0,0deg)'
                };
                if (this.attempt(this.styles.css_3d)) {
                    this.localFeatures.rotate.has3D = true;
                    this.prop = 'rotate3d';
                }
                else if (this.attempt(this.styles.css_2d)) {
                    this.prop = 'rotate';
                }
                this.localFeatures.rotate.prop = this.prop;
            }
            this.testDiv = null;
        }
        FeatureUtils.prototype.has = function (prop) {
            // test for feature support
            var result = this.testDiv.style[prop];
            return (result !== undefined ? prop : null);
        };
        FeatureUtils.prototype.attempt = function (style) {
            try {
                this.testDiv.style[this.transform] = style;
            }
            catch (e) {
                // that *definitely* didn't work.
                return false;
            }
            // if we can read back the style, it should be cool.
            return !!this.testDiv.style[this.transform];
        };
        FeatureUtils.prototype.features = function () {
            return this.localFeatures;
        };
        FeatureUtils.prototype.getAnimationFrame = function () {
            return this.localAnimationFrame ? function () {
                return this.localAnimationFrame.apply(window, arguments);
            } : null;
        };
        return FeatureUtils;
    }());
    Sm2ShimUtils.FeatureUtils = FeatureUtils;
    /**
     * Position base utilities.
     * @class Sm2ShimUtils.PositionUtils
     */
    var PositionUtils = (function () {
        function PositionUtils() {
        }
        PositionUtils.getOffX = function (o) {
            // http://www.xs4all.nl/~ppk/js/findpos.html
            var curleft = 0;
            if (o.offsetParent) {
                while (o.offsetParent) {
                    curleft += o.offsetLeft;
                    o = o.offsetParent;
                }
            }
            else if (o.x) {
                curleft += o.x;
            }
            return curleft;
        };
        PositionUtils.getOffY = function (o) {
            // http://www.xs4all.nl/~ppk/js/findpos.html
            var curtop = 0;
            if (o.offsetParent) {
                while (o.offsetParent) {
                    curtop += o.offsetTop;
                    o = o.offsetParent;
                }
            }
            else if (o.y) {
                curtop += o.y;
            }
            return curtop;
        };
        return PositionUtils;
    }());
    Sm2ShimUtils.PositionUtils = PositionUtils;
    /**
     * Style base utilities.
     * @class Sm2ShimUtils.StyleUtils
     */
    var StyleUtils = (function () {
        function StyleUtils() {
        }
        StyleUtils.get = function (node, styleProp) {
            // http://www.quirksmode.org/dom/getstyles.html
            var value;
            if (node.currentStyle) {
                value = node.currentStyle[styleProp];
            }
            else if (window.getComputedStyle) {
                value = document.defaultView.getComputedStyle(node, null).getPropertyValue(styleProp);
            }
            return value;
        };
        return StyleUtils;
    }());
    Sm2ShimUtils.StyleUtils = StyleUtils;
})(Sm2ShimUtils || (Sm2ShimUtils = {}));
//# sourceMappingURL=Utils.js.map