/**
 * TextReader.ts: Sm2Shim utilities
 *
 * Copyright (c) 2016 - 2017, The Little Moe New LLC. All rights reserved.
 *
 * This file is part of the project 'Sm2Shim'.
 * Code licensed under BSD license.
 *
 */
/// <reference path="ArgumentNullException.ts" />
var System;
(function (System) {
    var Text;
    (function (Text) {
        var TextReader = (function () {
            function TextReader(text) {
                this._currentLine = -1;
                if (text) {
                    this._originalText = text;
                }
                else {
                    throw new System.ArgumentNullException("text");
                }
                // Detect CR + LF/LF.
                this._useLfOnly = !TextReader.isCrLf(text);
                this._lineSegments = text.split(this._useLfOnly ? TextReader.Lf : TextReader.CrAndLf);
            }
            TextReader.prototype.readLine = function () {
                var lnAttempt = this._currentLine + 1;
                if (lnAttempt < this._lineSegments.length) {
                    this._currentLine = lnAttempt;
                    return this._lineSegments[lnAttempt];
                }
                return "";
            };
            TextReader.isCrLf = function (text) {
                if (text) {
                    return text.indexOf(TextReader.CrAndLf) != -1;
                }
                return false;
            };
            return TextReader;
        }());
        TextReader.CrAndLf = "\r\n";
        TextReader.Lf = "\n";
        Text.TextReader = TextReader;
    })(Text = System.Text || (System.Text = {}));
})(System || (System = {}));
//# sourceMappingURL=TextReader.js.map