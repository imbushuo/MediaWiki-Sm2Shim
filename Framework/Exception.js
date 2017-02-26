/**
 *
 * Exception.ts: The base class for all exceptional conditions.
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
    /**
     * Represents errors that occur during application execution.
     */
    var Exception = (function (_super) {
        __extends(Exception, _super);
        /**
         * Initializes a new instance of the Exception class with a specified error message.
         * @param message The message that describes the error.
         */
        function Exception(message) {
            var _this = _super.call(this, message) || this;
            _this.helpLink = '';
            return _this;
        }
        Object.defineProperty(Exception.prototype, "helpLink", {
            /**
             * Gets link to the help file associated with this exception.
             * @returns string
             */
            get: function () {
                return this._helpLink;
            },
            /**
             * Sets a link to the help file associated with this exception.
             * @param helpLink The help link in string to set. Cannot be null value.
             */
            set: function (helpLink) {
                if (helpLink)
                    this._helpLink = helpLink;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Exception.prototype, "hResult", {
            /**
             * Gets HRESULT, a coded numerical value that is assigned to a specific exception.
             */
            get: function () {
                return this._hResult;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Sets HRESULT, a coded numerical value that is assigned to a specific exception.
         * @param errorCode Specific coded numerical value that is assigned to a specific exception.
         */
        Exception.prototype.setErrorCode = function (errorCode) {
            this._hResult = errorCode;
        };
        return Exception;
    }(Error));
    System.Exception = Exception;
})(System || (System = {}));
//# sourceMappingURL=Exception.js.map