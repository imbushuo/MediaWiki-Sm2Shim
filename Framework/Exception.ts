/**
 *
 * Exception.ts: The base class for all exceptional conditions.
 * Copyright (c) Microsoft Corporation.  All rights reserved.
 *
 */

namespace System
{
    /**
     * Represents errors that occur during application execution.
     */
    export class Exception extends Error
    {
        private _helpLink: string;
        private _hResult: number;

        /**
         * Gets link to the help file associated with this exception.
         * @returns string
         */
        get helpLink() : string
        {
            return this._helpLink;
        }

        /**
         * Sets a link to the help file associated with this exception.
         * @param helpLink The help link in string to set. Cannot be null value.
         */
        set helpLink(helpLink: string)
        {
            if (helpLink) this._helpLink = helpLink;
        }

        /**
         * Gets HRESULT, a coded numerical value that is assigned to a specific exception.
         */
        get hResult() : number
        {
            return this._hResult;
        }

        /**
         * Initializes a new instance of the Exception class.
         */
        constructor();
        /**
         * Initializes a new instance of the Exception class with a specified error message.
         * @param message The message that describes the error.
         */
        constructor(message: string);
        /**
         * Initializes a new instance of the Exception class with a specified error message.
         * @param message The message that describes the error.
         */
        constructor(message?: string)
        {
            super(message);
            this.helpLink = '';
        }

        /**
         * Sets HRESULT, a coded numerical value that is assigned to a specific exception.
         * @param errorCode Specific coded numerical value that is assigned to a specific exception.
         */
        protected setErrorCode(errorCode: number) : void
        {
            this._hResult = errorCode;
        }
    }
}