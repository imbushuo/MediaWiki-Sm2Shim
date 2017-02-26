/**
 *
 * NotImplementedException.ts: Exception thrown when a requested method or operation is not implemented.
 * Copyright (c) Microsoft Corporation.  All rights reserved.
 *
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="Exception.ts" />
/// <reference path="HResults.ts" />
var System;
(function (System) {
    var NotImplementedException = (function (_super) {
        __extends(NotImplementedException, _super);
        function NotImplementedException(message) {
            var _this = _super.call(this, message ? message : NotImplementedException.Arg_NotImplementedException) || this;
            _this.name = "NotImplementedException";
            _this.stack = new Error().stack;
            _this.setErrorCode(System.__HResults.E_NOTIMPL);
            return _this;
        }
        return NotImplementedException;
    }(System.Exception));
    NotImplementedException.Arg_NotImplementedException = "The method or operation is not implemented.";
    System.NotImplementedException = NotImplementedException;
})(System || (System = {}));
//# sourceMappingURL=NotImplementedException.js.map