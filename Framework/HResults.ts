/**
 *
 * HResults.ts: Define HResult constants. Every exception has one of these.
 * Copyright (c) Microsoft Corporation.  All rights reserved.
 *
 */

namespace System
{
    export class __HResults
    {
        static E_NOTIMPL: number = 0x80004001;
        static COR_E_NULLREFERENCE: number = 0x80004003;
        static E_POINTER: number = 0x80040003;
    }
}