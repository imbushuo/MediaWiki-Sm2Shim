namespace Sm2ShimUtils
{

    /**
     * Array base utilities.
     * @interface Sm2ShimUtils.IArrayUtils
     */
    export interface IArrayUtils
    {
        compare<T>(property: any) : (a: T[], b: T[]) => number;
        shuffle<T>(f: T[]) : T[];
    }

    /**
     * Array base utilities.
     * @class Sm2ShimUtils.ArrayUtils
     */
    export class ArrayUtils implements IArrayUtils
    {

        compare<T>(property: any)
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

        shuffle<T>(f: T[]) 
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
     * @interface Sm2ShimUtils.ICssUtils
     */
    export interface ICssUtils
    {
        addClass(o: HTMLElement, cStr: string) : void;
        removeClass(o: HTMLElement, cStr: string) : void;
        swapClass(o: HTMLElement, cStr1: string, cStr2: string) : void;
        toggleClass(o: HTMLElement, cStr: string) : void;
        hasClass(o: HTMLElement, cStr: string) : boolean;
    }

    /**
     * CSS base utilities.
     * @class Sm2ShimUtils.CssUtils
     */
    export class CssUtils implements ICssUtils
    {
        addClass(o: HTMLElement, cStr: string)
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

        removeClass(o: HTMLElement, cStr: string)
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

        swapClass(o: HTMLElement, cStr1: string, cStr2: string)
        {
            var tmpClass = {
                className: o.className
            };

            CssUtils.removeClassInternal(tmpClass, cStr1);
            CssUtils.addClassInternal(tmpClass, cStr2);

            o.className = tmpClass.className;
        }

        hasClass(o: HTMLElement, cStr: string)
        {
            return CssUtils.hasClassInternal(o, cStr);
        }

        private static hasClassInternal(o: any, cStr: string) : any
        {
            return (o.className !== undefined ?
                new RegExp('(^|\\s)' + cStr + '(\\s|$)').test(o.className) :
                false);
        }

        toggleClass(o: HTMLElement, cStr: string)
        {
            var found, method;

            found = this.hasClass(o, cStr);

            method = (found ? this.removeClass : this.addClass);

            method(o, cStr);

            // indicate the new state...
            return !found;
        }
    }

    /**
     * DOM base utilities.
     * @interface Sm2ShimUtils.IDomUtils
     */
    export interface IDomUtils
    {
        ancestor(nodeName: string, element: Node, checkCurrent: boolean) : Node;
        get(parentNode: Node, selector: string) : Node;
        getAll(selector: string) : Node[];
        getAll(node: Node, selector: string) : Node[];
    }

    /**
     * DOM base utilities.
     * @class Sm2ShimUtils.DomUtils
     */
    export class DomUtils implements IDomUtils
    {
        ancestor(nodeName: string, element: Node, checkCurrent: boolean): Node {

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
        }

        get(parentNode: Node, selector: string): Node {
            var results = this.getAll.apply(this, arguments);

            if (results && results.length) {
                return results[results.length - 1];
            }

            return results && results.length === 0 ? null : results;
        }

        getAll(selector: string): Node[];
        getAll(node: Node, selector: string): Node[];
        getAll(param1, param2?: string): Node[] {

            var _node,_selector,_results;

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
     * Event base utilities.
     * @interface Sm2ShimUtils.IEventUtils
     */
    export interface IEventUtils
    {
        add(o: HTMLElement, evtName: string, evtHandler: () => void) : EventAddResult;
        remove(o: HTMLElement, evtName: string, evtHandler: () => void) : any;
        // TODO: What's that
        preventDefault(e: any) : boolean;
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
    export class EventUtils implements IEventUtils
    {
        add(o: HTMLElement, evtName: string, evtHandler: () => void): EventAddResult {
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

        remove(o: HTMLElement, evtName: string, evtHandler: () => void): any {
            return (o, evtName, evtHandler) => {
                return (window.removeEventListener !== undefined) ?
                    o.removeEventListener(evtName, evtHandler, false) :
                    (<any>o).detachEvent('on' + evtName, evtHandler);
            };
        }

        preventDefault(e: any): boolean {
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
     * Feature base utilities.
     * @interface Sm2ShimUtils.IFeatureUtils
     */
    export interface IFeatureUtils {
        features() : LocalFeatureSupport;
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
    export class FeatureUtils implements IFeatureUtils
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
     * @interface Sm2ShimUtils.IPositionUtils
     */
    export interface IPositionUtils
    {
        getOffX(o: any) : number;
        getOffY(o: any) : number;
    }

    /**
     * Position base utilities.
     * @class Sm2ShimUtils.PositionUtils
     */
    export class PositionUtils implements IPositionUtils
    {
        getOffX(o: any): number
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

        getOffY(o: any): number
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
     * @interface Sm2ShimUtils.IStyleUtils
     */
    export interface IStyleUtils
    {
        get(node: any, styleProp: string) : string;
    }

    /**
     * Style base utilities.
     * @class Sm2ShimUtils.StyleUtils
     */
    export class StyleUtils implements IStyleUtils
    {
        get(node: any, styleProp: string): string
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