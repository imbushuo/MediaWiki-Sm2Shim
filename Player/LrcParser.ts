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
/// <reference path="Models/ParsedLrc.ts" />

namespace Light.Lyrics
{
    import LrcSentence = Light.Lyrics.Model.LrcSentence;
    import ParsedLrc = Light.Lyrics.Model.ParsedLrc;
    import NotImplementedException = System.NotImplementedException;
    import TextReader = System.Text.TextReader;

    export class LrcParser
    {
        static parse(lrcText: string) : ParsedLrc
        {
            let lrc = new ParsedLrc();
            let line: string;

            const reader = new TextReader(lrcText);
            while ((line = reader.readLine().trim()))
            {
                const parts = LrcParser.extractMorpheme(line);
                if (parts == null || parts.length < 1) continue;

                // Metadata line
                if (parts[0][2] == ':') LrcParser.setMetadata(line, lrc);

                let i;
                const content = parts[parts.length - 1];
                for (i = 0; i < parts.length - 1; i++)
                {
                    lrc.sentences.push(new LrcSentence(LrcParser.parseTime(parts[i]), content));
                }
            }

            lrc.sentences.sort(LrcSentenceComparer.compare);

            return lrc;
        }

        static parseTime(time: string) : number
        {
            const timeParts = time.split(/[:.]+/);
            if (timeParts == null) return -1;

            return parseInt(timeParts[0]) * 60000 +
                parseInt(timeParts[1]) * 1000 +
                parseInt(timeParts[2]);
        }

        static setMetadata(line: string, lrc: ParsedLrc)
        {
            const metadata = line.substr(4, line.length - 5);
            switch (line[1])
            {
                case 'a':
                    if (line[2] == 'l') lrc.album = metadata;
                    if (line[2] == 'r') lrc.artist = metadata;
                    break;
                case 't':
                    if (line[2] == 'i') lrc.title = metadata;
                    break;
            }
        }

        static extractMorpheme(line: string) : string[]
        {
            let parts = [];
            if (line.length < 3 || line[0] != '[') return null;

            let borderPos: number;
            if ((borderPos = line.indexOf(']')) < 2) return null;
            parts.push(line.substr(1, borderPos - 1));

            // Check if it has more timestamps
            let lastBorderPos: number;
            if (borderPos != (lastBorderPos = line.lastIndexOf(']')))
            {
                let nextPos: number = 0;
                do
                {
                    nextPos = line.indexOf(']', borderPos + 1);
                    // +2 because of ][
                    parts.push(line.substr(borderPos + 2, nextPos - borderPos - 2));
                    borderPos = nextPos;
                } while (nextPos < lastBorderPos);
            }
            if (lastBorderPos != line.length - 1)
                parts.push(line.substr(lastBorderPos + 1));

            return parts;
        }
    }

    export class LrcSentenceComparer
    {
        static compare(x: LrcSentence, y: LrcSentence) : number
        {
            if (y == null && x == null)
                return 0;

            if (y == null)
                return 1;
            if (x == null)
                return -1;

            const delta = x.time - y.time;
            if (delta == 0)
                return 0;

            return (delta > 0) ? 1 : -1;
        }
    }
}

namespace Sm2Shim.Lyrics
{
    import ParsedLrc = Light.Lyrics.Model.ParsedLrc;

    /*
     * Data class represents LRC fetch result.
     */
    export class LrcResult
    {
        private _lrcContent: string;
        private _requestId: string;
        private _isRequestSucceeded: boolean;
        private _content: ParsedLrc;

        /*
         * LRC content, can be null if the request fails.
         */
        get lrcContent()
        {
            return this._lrcContent;
        }

        /*
         * Request ID.
         */
        get requestId()
        {
            return this._requestId;
        }

        /*
         * Value indicates whether the request is succeeded or not.
         */
        get isRequestSucceeded()
        {
            return this._isRequestSucceeded;
        }

        get content()
        {
            return this._content;
        }

        /*
         * Class constructor that creates instance of LrcResult.
         * @param isRequestSucceeded Value indicates whether the request is succeeded or not.
         * @param requestId Request ID.
         * @param lrcContent LRC content, can be null if the request fails.
         * @param content Parsed LRC content.
         */
        constructor(isRequestSucceeded: boolean, requestId: string, lrcContent?: string, content?: ParsedLrc)
        {
            this._isRequestSucceeded = isRequestSucceeded;
            this._requestId = requestId;
            this._lrcContent = lrcContent;
            this._content = content;
        }
    }
}