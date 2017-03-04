/**
 * @license
 *
 * SynchronizedLyricsHandler.ts: Knockout binding handler that implements auto scroll for lyrics panel
 * -----------------------------------------------
 * Copyright (c) 2015 - 2017, Light Studio, David Huang, Bingxing Wang. All rights reserved.
 * Copyright (c) 2017, The Little Moe New LLC, Bingxing Wang. All rights reserved.
 *
 */

(function(){

    (<any>ko.bindingHandlers).scrollTo =
    {
        update: function (element, valueAccessor)
        {
            const _value = valueAccessor();
            const _valueUnwrapped = ko.unwrap(_value);
            if (_valueUnwrapped)
            {
                const lyricsContainer = element.parentElement;
                if (lyricsContainer)
                {
                    const currLnIndex = Array.prototype.indexOf.call(lyricsContainer.children, element);
                    let containerVerticalCenterOffset = lyricsContainer.clientHeight / 2;
                    let height = -containerVerticalCenterOffset;

                    for (let i = 0; i < currLnIndex; i++)
                    {
                        height += lyricsContainer.children[i].scrollHeight;
                    }

                    let lastPos = lyricsContainer.scrollTop;
                    if (Math.abs(lastPos - height) < 10) return;
                    height = height + 20;

                    if ((<any>window).jQuery != undefined)
                    {
                        $(lyricsContainer).clearQueue().animate({
                            scrollTop: height
                        }, 370);
                    }
                    else
                    {
                        lyricsContainer.scrollTop = height;
                    }
                }
            }
        }
    }

})();