/**
 * @license
 *
 * PlayerGlobal.ts: Core player component for Sm2Shim using KnockoutJS technology
 * -----------------------------------------------
 * Copyright (c) 2014, Scott Schiller. All rights reserved.
 * Copyright (c) 2016 - 2017, The Little Moe New LLC. All rights reserved.
 * Copyright (c) 2017 David Huang. All rights reserved.
 *
 * This file is part of the project 'Sm2Shim'.
 * Code released under BSD-2-Clause license.
 *
 */

import IModernPlaylist = Sm2Shim.Player.Models.IModernPlaylist;
import PlayerViewModel = Sm2Shim.Player.ViewModels.PlayerViewModel;
import load = soundManager.load;
import IModule = Sm2Shim.Models.IModule;

/// <reference path="../Framework/SoundManager2.d.ts" />
/// <reference path="../UserControl/scripts/ViewModels/PlayerViewModel.ts" />

(function (){

    // Prevent multiple initialization
    if((<any>window).WidgetInitializer) return;

    // Initialize SoundManager2
    let pollingInterval = 200;

    // Detect mobile devices (power optimization)
    if (window.navigator.userAgent.match(/mobile/i))
    {
        pollingInterval = 500;
    }

    // Expose utility for stub removal


    soundManager.setup(<soundManager.ISm2SetupOption>
    {
        html5PollingInterval: pollingInterval,
        flashPollingInterval: pollingInterval,
        flashVersion: 9,
        debugMode: false,
        debugFlash: false,
        preferFlash: false,
        url: 'https://mmixstaticassets.azureedge.net/Sm2Shim/'
    });

    soundManager.onready(() =>
    {
        let loader = <PlayerLoader> (<any> window).sm2ShimLoader;
        let bundle = <IBundle> (<any> window).sm2ShimModules;
        let widgetSrc = "UserControl/PlayerWidget.html";

        if (loader && bundle)
        {
            if (bundle.widget)
            {
                widgetSrc = loader.buildResourceURI(bundle.widget);
            }
        }

        // Register widgets
        ko.components.register("sm2-player-fx",
        {
            template:
            {
                fromUrl: widgetSrc
            },
            viewModel: (param) =>
            {
                return new PlayerViewModel(<IModernPlaylist> param);
            }
        });

        ko.applyBindings();

        if (!loader)
        {
            // Remove any loading stubs
            const loadingStubs = document.getElementsByClassName("sm2-loading-stub");
            if (loadingStubs)
            {
                while (loadingStubs.length > 0)
                {
                    loadingStubs[0].parentNode.removeChild(loadingStubs[0]);
                }
            }
        }
    });

    // Expose to global
    (<any>window).WidgetInitializer = true;
})();