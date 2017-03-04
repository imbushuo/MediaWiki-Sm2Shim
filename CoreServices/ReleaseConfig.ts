/**
 * @license
 *
 * ReleaseConfig.ts: Release configuration for Sm2Shim
 * -----------------------------------------------
 * Copyright (c) 2016 - 2017, The Little Moe New LLC. All rights reserved.
 *
 * This file is part of the project 'Sm2Shim'.
 * Code released under BSD-2-Clause license.
 *
 */

(function(){

    if (!(<any> window).sm2ShimLoaderConfig)
    {
        (<any> window).sm2ShimLoaderConfig = <Sm2Shim.Models.IEnvironmentDefinition>
        {
            debug: false,
            definitionReleaseId: "",
            environment: "release",
            localizationEndpoint: "mmixstaticassets.azureedge.net/Sm2ShimRM/strings/",
            localizationReleaseId: "170304-0456",
            scriptEndpoint: "mmixstaticassets.azureedge.net/Sm2ShimRM/bin/",
            scriptReleaseId: "",
            stylesheetReleaseId: "",
            widgetEndpoint: "mmixstaticassets.azureedge.net/Sm2ShimRM/UserControl/",
            widgetReleaseId: "",
            stylesheetEndpoint: "mmixstaticassets.azureedge.net/Sm2ShimRM/assets/"
        };
    }

    if (!(<any> window).sm2ShimModules)
    {
        (<any> window).sm2ShimModules = <Sm2Shim.Models.IBundle>
        {
            widget: {
                type: "widget",
                description: "Sm2Shim Player Widget",
                name: "PlayerWidget",
                release: false,
                releaseId: "170304-0456"
            },
            scripts: [
                {
                    name: "CoreSupport",
                    type: "script",
                    description: "Core support library (SoundManager2, KnockoutJS, CorePromise)",
                    releaseId: "170304-0304",
                    release: true
                },
                {
                    name: "PlayerCore",
                    type: "script",
                    description: "Player Core",
                    releaseId: "170304-0456",
                    release: true
                }
            ],
            stylesheets: [
                {
                    name: "BarUI",
                    type: "stylesheet",
                    description: "Player styles",
                    releaseId: "170304-0304",
                    release: true
                }
            ],
            id: "1703.304.0456.0000"
        };
    }

})();