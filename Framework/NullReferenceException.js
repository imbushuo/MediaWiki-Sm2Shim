/**
 *
 * NullReferenceException.ts: Exception class for dereferencing a null reference.
 * Copyright (c) Microsoft Corporation.  All rights reserved.
 *
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="Exception.ts" />
var System;
(function (System) {
    var NullReferenceException = (function (_super) {
        __extends(NullReferenceException, _super);
        function NullReferenceException(message) {
            var _this = _super.call(this, message ? message : NullReferenceException.Arg_NullReferenceException) || this;
            _this.name = "NullReferenceException";
            _this.stack = new Error().stack;
            _this.setErrorCode(System.__HResults.COR_E_NULLREFERENCE);
            return _this;
        }
        return NullReferenceException;
    }(System.Exception));
    NullReferenceException.Arg_NullReferenceException = "Object reference not set to an instance of an object.";
    System.NullReferenceException = NullReferenceException;
})(System || (System = {}));
//# sourceMappingURL=NullReferenceException.js.map