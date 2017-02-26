/**
 *
 * ArgumentNullException.ts: Exception class for null arguments to a method.
 * Copyright (c) Microsoft Corporation.  All rights reserved.
 *
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var System;
(function (System) {
    var ArgumentNullException = (function (_super) {
        __extends(ArgumentNullException, _super);
        function ArgumentNullException(message) {
            var _this = _super.call(this, message ?
                ArgumentNullException.formatString(ArgumentNullException.ArgumentNull_WithParam, message) :
                ArgumentNullException.ArgumentNull_Generic) || this;
            _this.name = "ArgumentNullException";
            _this.stack = new Error().stack;
            _this.setErrorCode(System.__HResults.E_POINTER);
            return _this;
        }
        ArgumentNullException.formatString = function (format, param) {
            var args = Array.prototype.slice.call(arguments, 1);
            return format.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != 'undefined'
                    ? args[number]
                    : match;
            });
        };
        ;
        return ArgumentNullException;
    }(System.Exception));
    ArgumentNullException.ArgumentNull_Generic = "Value cannot be null.";
    ArgumentNullException.ArgumentNull_WithParam = "Value {0} cannot be null.";
    System.ArgumentNullException = ArgumentNullException;
})(System || (System = {}));
//# sourceMappingURL=ArgumentNullException.js.map