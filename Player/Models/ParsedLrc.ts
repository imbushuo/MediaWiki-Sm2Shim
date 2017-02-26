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

namespace Light.Lyrics.Model
{
    export class ParsedLrc
    {
        private _album: string;
        private _artist: string;
        private _title: string;
        private _sentences: Array<LrcSentence>;

        get album()
        {
            return this._album;
        }

        set album(value: string)
        {
            this._album = value;
        }

        get artist()
        {
            return this._artist;
        }

        set artist(value: string)
        {
            this._artist = value;
        }

        get title()
        {
            return this._title;
        }

        set title(value: string)
        {
            this._title = value;
        }

        get sentences()
        {
            return this._sentences;
        }

        set sentences(value: Array<LrcSentence>)
        {
            this._sentences = value;
        }

        constructor(title?: string, album?: string, artist?:string, sentences?: Array<LrcSentence>);
        constructor(title: string, album: string, artist: string, sentences: Array<LrcSentence>)
        {
            this._title = title;
            this._album = album;
            this._artist = artist;
            if (sentences)
            {
                this._sentences = sentences;
            }
            else
            {
                this._sentences = [];
            }
        }

        public getPositionFromTime(ms: number) : number
        {
            if (this.sentences.length == 0 || ms < this.sentences[0].time)
                return 0;

            let i;
            for (i = 0; i < this.sentences.length; i++)
            {
                if (ms < this.sentences[i].time)
                    return i - 1;
            }

            return this.sentences.length - 1;
        }
    }
}