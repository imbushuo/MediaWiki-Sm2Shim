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

namespace Light.Lyrics.Model
{
    export class LrcSentence
    {
        private _time: number;
        private _content: string;

        get time()
        {
            return this._time;
        }

        get content()
        {
            return this._content;
        }

        constructor(time: number, content: string)
        {
            this._time = time;
            this._content = content;
        }

        public toString = () : string =>
        {
            return this._time.toString() + " ms, content: " + this._content;
        };
    }
}