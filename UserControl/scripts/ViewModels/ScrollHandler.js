/**
 * @license
 *
 * ScrollExtender.js: Knockout binding handler that implements auto scroll
 * -----------------------------------------------
 * Copyright (c) 2016, Sroes. All rights reserved.
 *
 */

ko.bindingHandlers.scrollTo = {
    update: function (element, valueAccessor) {
        var _value = valueAccessor();
        var _valueUnwrapped = ko.unwrap(_value);
        if (_valueUnwrapped)
        {
            var lyricsContainer = element.parentElement;
            if (lyricsContainer)
            {
                // Basic scroll support
                element.scrollIntoView(false);
            }
        }
    }
};