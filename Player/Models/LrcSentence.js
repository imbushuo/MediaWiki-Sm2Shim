/**
 * LrcSentence.ts: LRC parser component for Sm2Shim
 *
 * Copyright (c) 2014 - 2017, Light Studio. All rights reserved.
 * Copyright (c) 2017, The Little Moe New LLC. All rights reserved.
 *
 * This file is part of the project 'Sm2Shim'.
 * Code licensed under BSD license.
 *
 */
var Light;
(function (Light) {
    var Lyrics;
    (function (Lyrics) {
        var Model;
        (function (Model) {
            var LrcSentence = (function () {
                function LrcSentence(time, content) {
                    var _this = this;
                    this.toString = function () {
                        return _this._time.toString() + " ms, content: " + _this._content;
                    };
                    this._time = time;
                    this._content = content;
                }
                Object.defineProperty(LrcSentence.prototype, "time", {
                    get: function () {
                        return this._time;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(LrcSentence.prototype, "content", {
                    get: function () {
                        return this._content;
                    },
                    enumerable: true,
                    configurable: true
                });
                return LrcSentence;
            }());
            Model.LrcSentence = LrcSentence;
        })(Model = Lyrics.Model || (Lyrics.Model = {}));
    })(Lyrics = Light.Lyrics || (Light.Lyrics = {}));
})(Light || (Light = {}));
//# sourceMappingURL=LrcSentence.js.map