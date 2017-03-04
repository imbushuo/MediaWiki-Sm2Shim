/**
 * @license
 *
 * DebugConfig.ts: Debug configuration for Sm2Shim
 * -----------------------------------------------
 * Copyright (c) 2016 - 2017, The Little Moe New LLC. All rights reserved.
 *
 * This file is part of the project 'Sm2Shim'.
 * Code released under BSD-2-Clause license.
 *
 */

import IEnvironmentDefinition = Sm2Shim.Models.IEnvironmentDefinition;
import IBundle = Sm2Shim.Models.IBundle;


(function(){

    if (!(<any> window).sm2ShimLoaderConfig)
    {
        (<any> window).sm2ShimLoaderConfig = <Sm2Shim.Models.IEnvironmentDefinition>
        {
            debug: true,
            definitionReleaseId: "",
            environment: "debug",
            localizationEndpoint: "localhost:63342/MediaWiki-Sm2Shim/i18n/",
            localizationReleaseId: "",
            scriptEndpoint: "localhost:63342/MediaWiki-Sm2Shim/bin/Debug/",
            scriptReleaseId: "",
            stylesheetReleaseId: "",
            widgetEndpoint: "localhost:63342/MediaWiki-Sm2Shim/UserControl/",
            widgetReleaseId: "",
            stylesheetEndpoint: "localhost:63342/MediaWiki-Sm2Shim/bin/Debug/assets/"
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
                releaseId: ""
            },
            scripts: [
                {
                    name: "CoreSupport",
                    type: "script",
                    description: "Core support library (SoundManager2, KnockoutJS, CorePromise)",
                    releaseId: "",
                    release: true
                },
                {
                    name: "PlayerCore",
                    type: "script",
                    description: "Player Core",
                    releaseId: "",
                    release: true
                }
            ],
            stylesheets: [
                {
                    name: "BarUI",
                    type: "stylesheet",
                    description: "Player styles",
                    releaseId: "",
                    release: true
                }
            ],
            id: "1703.303.0800.0000"
        };
    }

})();