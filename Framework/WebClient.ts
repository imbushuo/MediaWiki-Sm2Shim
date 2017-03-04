/**
 * WebClient.ts
 *
 * Copyright (c) Microsoft Corporation.  All rights reserved.
 *
 */

namespace System.Net
{
    export class WebClient
    {
        static downloadStringAsync(url: string) : Promise<string>
        {
            return new Promise<string>((resolve, reject) =>
            {
                let xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);

                xhr.onload = () =>
                {
                    resolve(xhr.responseText);
                };

                xhr.onerror = () =>
                {
                    reject();
                };

                xhr.send(null);
            });
        }
    }
}
