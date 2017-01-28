namespace Sm2ShimUtils
{

    /**
     * Array base utilities.
     * @class Sm2ShimUtils.ArrayUtils
     */
    export class ArrayUtils
    {

        static compare<T>(property: any)
        {
            var result;

            return (a: T[], b: T[]) => {

                if (a[property] < b[property]) {
                    result = -1;
                } else if (a[property] > b[property]) {
                    result = 1;
                } else {
                    result = 0;
                }

                return result;
            };
        }

        static shuffle<T>(f: T[])
        {
            // Fisher-Yates shuffle algorithm

            var i, j, temp;

            for (i = f.length - 1; i > 0; i--) {
                j = Math.floor(Math.random() * (i + 1));
                temp = f[i];
                f[i] = f[j];
                f[j] = temp;
            }

            return f;
        }

    }

    /**
     * CSS base utilities.
     * @class Sm2ShimUtils.CssUtils
     */
    export class CssUtils
    {
        static addClass(o: HTMLElement, cStr: string)
        {
            return CssUtils.addClassInternal(o, cStr);
        }

        private static addClassInternal(o: any, cStr: string) : any
        {
            if (!o || !cStr || this.hasClassInternal(o, cStr))
            {
                return false; // safety net
            }
            o.className = (o.className ? o.className + ' ' : '') + cStr;
        }

        static removeClass(o: HTMLElement, cStr: string)
        {
            return CssUtils.removeClassInternal(o, cStr);
        }

        private static removeClassInternal(o: any, cStr: string) : any
        {
            if (!o || !cStr || !CssUtils.hasClassInternal(o, cStr)) {
                return false;
            }
            o.className = o.className.replace(new RegExp('( ' + cStr + ')|(' + cStr + ')', 'g'), '');
        }

        static swapClass(o: HTMLElement, cStr1: string, cStr2: string)
        {
            var tmpClass = {
                className: o.className
            };

            CssUtils.removeClassInternal(tmpClass, cStr1);
            CssUtils.addClassInternal(tmpClass, cStr2);

            o.className = tmpClass.className;
        }

        static hasClass(o: HTMLElement, cStr: string)
        {
            return CssUtils.hasClassInternal(o, cStr);
        }

        private static hasClassInternal(o: any, cStr: string) : any
        {
            return (o.className !== undefined ?
                new RegExp('(^|\\s)' + cStr + '(\\s|$)').test(o.className) :
                false);
        }

        static toggleClass(o: HTMLElement, cStr: string)
        {
            var found, method;

            found = Sm2ShimUtils.CssUtils.hasClass(o, cStr);

            method = (found ? Sm2ShimUtils.CssUtils.removeClass : Sm2ShimUtils.CssUtils.addClass);

            method(o, cStr);

            // indicate the new state...
            return !found;
        }
    }

    /**
     * DOM base utilities.
     * @class Sm2ShimUtils.DomUtils
     */
    export class DomUtils
    {
        static ancestor(nodeName: string, element: HTMLElement, checkCurrent?: boolean): HTMLElement {

            if (!element || !nodeName) {
                return element;
            }

            nodeName = nodeName.toUpperCase();

            // return if current node matches.
            if (checkCurrent && element && element.nodeName === nodeName) {
                return element;
            }

            while (element && element.nodeName !== nodeName && element.parentNode) {
                element = <HTMLElement>element.parentNode;
            }

            return (element && element.nodeName === nodeName ? element : null);
        }

        static get(parentNode: HTMLElement, selector: string): HTMLElement {
            let results = this.getAll.apply(this, arguments);

            if (results && results.length) {
                return results[results.length - 1];
            }

            return results && results.length === 0 ? null : results;
        }

        static getAll(selector: string): HTMLElement[];
        static getAll(node: HTMLElement, selector: string): HTMLElement[];
        static getAll(param1, param2?: string): HTMLElement[] {

            let _node,_selector,_results;

            if (arguments.length === 1) {
                _node = document.documentElement;
                _selector = param1;
            } else {
                _node = param1;
                _selector = param2;
            }

            if (_node && _node.querySelectorAll) {
                _results = _node.querySelectorAll(_selector);
            }

            return _results;
        }

    }

    /**
     * Data object of event add operations.
     * @class Sm2ShimUtils.EventAddResult
     */
    export class EventAddResult
    {
        detach: void;
    }

    /**
     * Event base utilities.
     * @class Sm2ShimUtils.EventUtils
     */
    export class EventUtils
    {
        static add(o: EventTarget, evtName: string, evtHandler: (e?: any) => void) : EventAddResult
        {
            var eventObject = new EventAddResult();
            eventObject.detach = this.remove(o, evtName, evtHandler);

            if (window.addEventListener) {
                o.addEventListener(evtName, evtHandler, false);
            } else {
                // Hack for legacy browsers
                (<any>o).attachEvent('on' + evtName, evtHandler);
            }

            return eventObject;
        }

        static remove(o: EventTarget, evtName: string, evtHandler: (e?: any) => void): any
        {
            if (window.removeEventListener !== undefined)
            {
                o.removeEventListener(evtName, evtHandler, false);
            }
            else
            {
                (<any>o).detachEvent('on' + evtName, evtHandler);
            }
        }

        static preventDefault(e: any): boolean
        {
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
                e.cancelBubble = true;
            }

            return false;
        }

    }

    /**
     * Data class of CSS transform support.
     * @class Sm2ShimUtils.CssTransformSupport
     */
    export class CssTransformSupport {
        ie: string;
        moz: string;
        opera: string;
        webkit: string;
        w3: string;
        prop: string;
    }

    /**
     * Data class of CSS rotate support.
     * @class Sm2ShimUtils.CssRotateSupport
     */
    export class CssRotateSupport {
        has3D: boolean;
        prop: string;
    }

    /**
     * Data class of CSS feature support.
     * @class Sm2ShimUtils.LocalFeatureSupport
     */
    export class LocalFeatureSupport {
        transform: CssTransformSupport;
        rotate: CssRotateSupport;
        getAnimationFrame: any;
    }

    /**
     * Feature base utilities.
     * @class Sm2ShimUtils.FeatureUtils
     */
    export class FeatureUtils
    {

        testDiv: HTMLDivElement;
        localAnimationFrame: any;
        transform: any;
        styles: any;
        prop: string;
        localFeatures: any;

        constructor() {
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
            (<any>window).mozRequestAnimationFrame ||
            (<any>window).oRequestAnimationFrame ||
            (<any>window).msRequestAnimationFrame ||
            null);

            this.localFeatures.transform.prop = (
                this.localFeatures.transform.w3 ||
                this.localFeatures.transform.moz ||
                this.localFeatures.transform.webkit ||
                this.localFeatures.transform.ie ||
                this.localFeatures.transform.opera
            );

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
                } else if (this.attempt(this.styles.css_2d)) {
                    this.prop = 'rotate';
                }

                this.localFeatures.rotate.prop = this.prop;
            }

            this.testDiv = null;
        }

        private has(prop: string): string {

            // test for feature support
            var result = this.testDiv.style[prop];

            return (result !== undefined ? prop : null);

        }

        private attempt(style: string): boolean {
            try {
                this.testDiv.style[this.transform] = style;
            } catch (e) {
                // that *definitely* didn't work.
                return false;
            }
            // if we can read back the style, it should be cool.
            return !!this.testDiv.style[this.transform];
        }

        features(): Sm2ShimUtils.LocalFeatureSupport {
            return <LocalFeatureSupport>this.localFeatures;
        }

        private getAnimationFrame() : any {
            return this.localAnimationFrame ? function() {
                return this.localAnimationFrame.apply(window, arguments);
            } : null;
        }
    }

    /**
     * Position base utilities.
     * @class Sm2ShimUtils.PositionUtils
     */
    export class PositionUtils
    {
        static getOffX(o: any): number
        {

            // http://www.xs4all.nl/~ppk/js/findpos.html
            var curleft = 0;

            if (o.offsetParent)
            {
                while (o.offsetParent)
                {
                    curleft += o.offsetLeft;
                    o = o.offsetParent;
                }

            } else if (o.x)
            {
                curleft += o.x;
            }

            return curleft;
        }

        static getOffY(o: any): number
        {
            // http://www.xs4all.nl/~ppk/js/findpos.html
            var curtop = 0;

            if (o.offsetParent)
            {
                while (o.offsetParent)
                {
                    curtop += o.offsetTop;
                    o = o.offsetParent;
                }

            } else if (o.y)
            {
                curtop += o.y;
            }

            return curtop;
        }

    }

    /**
     * Style base utilities.
     * @class Sm2ShimUtils.StyleUtils
     */
    export class StyleUtils
    {
        static get(node: any, styleProp: string): string
        {

            // http://www.quirksmode.org/dom/getstyles.html
            var value;

            if (node.currentStyle)
            {
                value = node.currentStyle[styleProp];
            } else if (window.getComputedStyle)
            {
                value = document.defaultView.getComputedStyle(node, null).getPropertyValue(styleProp);
            }

            return value;
        }

    }

}