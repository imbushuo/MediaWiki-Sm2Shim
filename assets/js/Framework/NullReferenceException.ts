/**
 *
 * NullReferenceException.ts: Exception class for dereferencing a null reference.
 * Copyright (c) Microsoft Corporation.  All rights reserved.
 *
 */

/// <reference path="Exception.ts" />

namespace System
{
    export class NullReferenceException extends Exception
    {
        private static Arg_NullReferenceException = "Object reference not set to an instance of an object.";

        constructor();
        constructor(message: string);
        constructor(message?: string)
        {
            super(message ? message : NullReferenceException.Arg_NullReferenceException);
            this.name = "NullReferenceException";
            this.stack = (<any> new Error()).stack;

            this.setErrorCode(__HResults.COR_E_NULLREFERENCE);
        }
    }
}