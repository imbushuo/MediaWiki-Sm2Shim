/**
 * ParsedLrc.ts: LRC parser component for Sm2Shim
 *
 * Copyright (c) 2014 - 2017, Light Studio. All rights reserved.
 * Copyright (c) 2017, The Little Moe New LLC. All rights reserved.
 *
 * This file is part of the project 'Sm2Shim'.
 * Code licensed under BSD license.
 *
 */
/// <reference path="LrcSentence.ts" />
var Light;
(function (Light) {
    var Lyrics;
    (function (Lyrics) {
        var Model;
        (function (Model) {
            var ParsedLrc = (function () {
                function ParsedLrc(title, album, artist, sentences) {
                    this._title = title;
                    this._album = album;
                    this._artist = artist;
                    if (sentences) {
                        this._sentences = sentences;
                    }
                    else {
                        this._sentences = [];
                    }
                }
                Object.defineProperty(ParsedLrc.prototype, "album", {
                    get: function () {
                        return this._album;
                    },
                    set: function (value) {
                        this._album = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ParsedLrc.prototype, "artist", {
                    get: function () {
                        return this._artist;
                    },
                    set: function (value) {
                        this._artist = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ParsedLrc.prototype, "title", {
                    get: function () {
                        return this._title;
                    },
                    set: function (value) {
                        this._title = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ParsedLrc.prototype, "sentences", {
                    get: function () {
                        return this._sentences;
                    },
                    set: function (value) {
                        this._sentences = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                ParsedLrc.prototype.getPositionFromTime = function (ms) {
                    if (this.sentences.length == 0 || ms < this.sentences[0].time)
                        return 0;
                    var i;
                    for (i = 0; i < this.sentences.length; i++) {
                        if (ms < this.sentences[i].time)
                            return i - 1;
                    }
                    return this.sentences.length - 1;
                };
                return ParsedLrc;
            }());
            Model.ParsedLrc = ParsedLrc;
        })(Model = Lyrics.Model || (Lyrics.Model = {}));
    })(Lyrics = Light.Lyrics || (Light.Lyrics = {}));
})(Light || (Light = {}));
//# sourceMappingURL=ParsedLrc.js.map