/**
 * @license
 *
 * SynchronizedLyricsHandler.ts: Knockout binding handler that implements auto scroll for lyrics panel
 * -----------------------------------------------
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
                    // Basic scroll support (pretty dirty)
                    const currLnIndex = Array.prototype.indexOf.call(lyricsContainer.children, element);
                    if (currLnIndex >= 3 || currLnIndex + 3 < lyricsContainer.childElementCount)
                    {
                        lyricsContainer.children[currLnIndex + 3].scrollIntoView(false);
                    }
                }
            }
        }
    }

})();