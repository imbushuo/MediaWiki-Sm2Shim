/**
 *
 * ArgumentNullException.ts: Exception class for null arguments to a method.
 * Copyright (c) Microsoft Corporation.  All rights reserved.
 *
 */

namespace System
{
    export class ArgumentNullException extends Exception
    {
        private static ArgumentNull_Generic = "Value cannot be null.";
        private static ArgumentNull_WithParam = "Value {0} cannot be null.";

        constructor();
        constructor(message: string);
        constructor(message?: string)
        {
            super(message ?
                ArgumentNullException.formatString(ArgumentNullException.ArgumentNull_WithParam, message) :
                ArgumentNullException.ArgumentNull_Generic);

            this.name = "ArgumentNullException";
            this.stack = (<any> new Error()).stack;

            this.setErrorCode(__HResults.E_POINTER);
        }

        private static formatString(format: string, param: any) : string {
            const args = Array.prototype.slice.call(arguments, 1);
            return format.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined'
                    ? args[number]
                    : match;
            });
        };
    }
}