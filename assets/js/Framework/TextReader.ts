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

namespace System.Text
{
    export class TextReader
    {
        private _originalText: string;
        private _useLfOnly: boolean;
        private static CrAndLf: string = "\r\n";
        private static Lf: string = "\n";
        private _lineSegments: string[];
        private _currentLine: number = -1;

        constructor(text: string)
        {
            if (text)
            {
                this._originalText = text;
            }
            else
            {
                throw new ArgumentNullException("text");
            }

            // Detect CR + LF/LF.
            this._useLfOnly = !TextReader.isCrLf(text);
            this._lineSegments = text.split(this._useLfOnly ? TextReader.Lf : TextReader.CrAndLf);
        }

        readLine() : string
        {
            const lnAttempt = this._currentLine + 1;
            if (lnAttempt < this._lineSegments.length)
            {
                this._currentLine = lnAttempt;
                return this._lineSegments[lnAttempt];
            }

            return "";
        }

        private static isCrLf(text: string)
        {
            if (text)
            {
                return text.indexOf(TextReader.CrAndLf) != -1;
            }

            return false;
        }
    }
}