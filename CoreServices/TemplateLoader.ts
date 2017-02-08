/**
 * @license
 *
 * TemplateLoader.ts: Knockout template loader
 * -----------------------------------------------
 * Copyright (c) 2016 - 2017, The Little Moe New LLC. All rights reserved.
 *
 * This file is part of the project 'Sm2Shim'.
 * Code released under BSD-2-Clause license.
 *
 */

(function (){

    if ((<any>window).TemplateLoader) return;

    // Export
    (<any>window).TemplateLoader =
    {
        loadTemplate: function(name, templateConfig, callback)
        {
            if (templateConfig.fromUrl)
            {
                let xhr = new XMLHttpRequest();
                xhr.open("GET", templateConfig.fromUrl, true);

                xhr.onload = (ev: Event) =>
                {
                    const content = xhr.responseText;
                    // We need an array of DOM nodes, not a string.
                    // We can use the default loader to convert to the
                    // required format.
                    const respType = xhr.getResponseHeader('content-type');
                    if (respType === 'text/html' || respType === 'x-lmn/template')
                    {
                        ko.components.defaultLoader.loadTemplate(name, content, callback);
                    }
                    else
                    {
                        callback(null);
                    }
                };

                xhr.onerror = () =>
                {
                    // Something happened. Let another loader handle it.
                    callback(null);
                };

                xhr.send(null);
            }
            else
            {
                // Unrecognized config format. Let another loader handle it.
                callback(null);
            }
        }
    };

    // Register
    ko.components.loaders.unshift((<any>window).TemplateLoader);

}());