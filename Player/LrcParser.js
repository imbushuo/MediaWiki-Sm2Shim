/**
 * @license
 *
 * LrcParser.ts: LRC parser component (Light.Lyrics) for Sm2Shim
 * -------------------------------------------------------------
 * Copyright (c) 2014 - 2017, Light Studio(Henry King, David Huang, Ben Wang). All rights reserved.
 * Copyright (c) 2016 - 2017, AnnAngela. All rights reserved.
 * Copyright (c) 2017, The Little Moe New LLC. All rights reserved.
 *
 * This file is part of the project 'Sm2Shim' and 'Light Player'.
 * TypeScript version licensed under BSD-2-Clause license.
 *
 */
/// <reference path="../Framework/TextReader.ts" />
/// <reference path="../Utilities/Utils.ts" />
/// <reference path="../Utilities/ParamUtils.ts" />
/// <reference path="Models/LrcSentence.ts" />
/// <reference path="Models/ParsedLrc.ts" />
var Light;
(function (Light) {
    var Lyrics;
    (function (Lyrics) {
        var LrcSentence = Light.Lyrics.Model.LrcSentence;
        var ParsedLrc = Light.Lyrics.Model.ParsedLrc;
        var TextReader = System.Text.TextReader;
        var LrcParser = (function () {
            function LrcParser() {
            }
            LrcParser.parse = function (lrcText) {
                var lrc = new ParsedLrc();
                var line;
                var reader = new TextReader(lrcText);
                while ((line = reader.readLine().trim())) {
                    var parts = LrcParser.extractMorpheme(line);
                    if (parts == null || parts.length < 1)
                        continue;
                    // Metadata line
                    if (parts[0][2] == ':')
                        LrcParser.setMetadata(line, lrc);
                    var i = void 0;
                    var content = parts[parts.length - 1];
                    for (i = 0; i < parts.length - 1; i++) {
                        lrc.sentences.push(new LrcSentence(LrcParser.parseTime(parts[i]), content));
                    }
                }
                lrc.sentences.sort(LrcSentenceComparer.compare);
                return lrc;
            };
            LrcParser.parseTime = function (time) {
                var timeParts = time.split(/[:.]+/);
                if (timeParts == null)
                    return -1;
                return parseInt(timeParts[0]) * 60000 +
                    parseInt(timeParts[1]) * 1000 +
                    parseInt(timeParts[2]);
            };
            LrcParser.setMetadata = function (line, lrc) {
                var metadata = line.substr(4, line.length - 5);
                switch (line[1]) {
                    case 'a':
                        if (line[2] == 'l')
                            lrc.album = metadata;
                        if (line[2] == 'r')
                            lrc.artist = metadata;
                        break;
                    case 't':
                        if (line[2] == 'i')
                            lrc.title = metadata;
                        break;
                }
            };
            LrcParser.extractMorpheme = function (line) {
                var parts = [];
                if (line.length < 3 || line[0] != '[')
                    return null;
                var borderPos;
                if ((borderPos = line.indexOf(']')) < 2)
                    return null;
                parts.push(line.substr(1, borderPos - 1));
                // Check if it has more timestamps
                var lastBorderPos;
                if (borderPos != (lastBorderPos = line.lastIndexOf(']'))) {
                    var nextPos = 0;
                    do {
                        nextPos = line.indexOf(']', borderPos + 1);
                        // +2 because of ][
                        parts.push(line.substr(borderPos + 2, nextPos - borderPos - 2));
                        borderPos = nextPos;
                    } while (nextPos < lastBorderPos);
                }
                if (lastBorderPos != line.length - 1)
                    parts.push(line.substr(lastBorderPos + 1));
                return parts;
            };
            return LrcParser;
        }());
        Lyrics.LrcParser = LrcParser;
        var LrcSentenceComparer = (function () {
            function LrcSentenceComparer() {
            }
            LrcSentenceComparer.compare = function (x, y) {
                if (y == null && x == null)
                    return 0;
                if (y == null)
                    return 1;
                if (x == null)
                    return -1;
                var delta = x.time - y.time;
                if (delta == 0)
                    return 0;
                return (delta > 0) ? 1 : -1;
            };
            return LrcSentenceComparer;
        }());
        Lyrics.LrcSentenceComparer = LrcSentenceComparer;
    })(Lyrics = Light.Lyrics || (Light.Lyrics = {}));
})(Light || (Light = {}));
var Sm2Shim;
(function (Sm2Shim) {
    var Lyrics;
    (function (Lyrics) {
        /*
         * Data class represents LRC fetch result.
         */
        var LrcResult = (function () {
            /*
             * Class constructor that creates instance of LrcResult.
             * @param isRequestSucceeded Value indicates whether the request is succeeded or not.
             * @param requestId Request ID.
             * @param lrcContent LRC content, can be null if the request fails.
             * @param content Parsed LRC content.
             */
            function LrcResult(isRequestSucceeded, requestId, lrcContent, content) {
                this._isRequestSucceeded = isRequestSucceeded;
                this._requestId = requestId;
                this._lrcContent = lrcContent;
                this._content = content;
            }
            Object.defineProperty(LrcResult.prototype, "lrcContent", {
                /*
                 * LRC content, can be null if the request fails.
                 */
                get: function () {
                    return this._lrcContent;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(LrcResult.prototype, "requestId", {
                /*
                 * Request ID.
                 */
                get: function () {
                    return this._requestId;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(LrcResult.prototype, "isRequestSucceeded", {
                /*
                 * Value indicates whether the request is succeeded or not.
                 */
                get: function () {
                    return this._isRequestSucceeded;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(LrcResult.prototype, "content", {
                get: function () {
                    return this._content;
                },
                enumerable: true,
                configurable: true
            });
            return LrcResult;
        }());
        Lyrics.LrcResult = LrcResult;
    })(Lyrics = Sm2Shim.Lyrics || (Sm2Shim.Lyrics = {}));
})(Sm2Shim || (Sm2Shim = {}));
//# sourceMappingURL=LrcParser.js.map