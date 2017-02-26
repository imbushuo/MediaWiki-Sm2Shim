/**
 *
 * NotImplementedException.ts: Exception thrown when a requested method or operation is not implemented.
 * Copyright (c) Microsoft Corporation.  All rights reserved.
 *
 */

/// <reference path="Exception.ts" />
/// <reference path="HResults.ts" />

namespace System
{
    export class NotImplementedException extends Exception
    {
        public static Arg_NotImplementedException : string = "The method or operation is not implemented.";

        constructor();
        constructor(message: string);
        constructor(message?: string)
        {
            super(message ? message : NotImplementedException.Arg_NotImplementedException);
            this.name = "NotImplementedException";
            this.stack = (<any> new Error()).stack;

            this.setErrorCode(__HResults.E_NOTIMPL);
        }
    }
}