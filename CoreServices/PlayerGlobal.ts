import IModernPlaylist = Sm2Shim.Player.Models.IModernPlaylist;
import PlayerViewModel = Sm2Shim.Player.ViewModels.PlayerViewModel;
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

/// <reference path="../assets/js/Framework/SoundManager2.d.ts" />
/// <reference path="../UserControl/scripts/ViewModels/PlayerViewModel.ts" />

(function (){

    // Prevent multiple initialization
    if((<any>window).WidgetInitializer) return;

    // Import module

    // Initialize SoundManager2
    let pollingInterval = 200;
    let players = [];

    // Detect mobile devices (power optimization)
    if (window.navigator.userAgent.match(/mobile/i))
    {
        pollingInterval = 500;
    }

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

    soundManager.onready(() => {
        ko.components.register("sm2-player-fx", {
            template: { fromUrl: 'UserControl/PlayerWidget.html' },
            viewModel: (param) => {
                return new PlayerViewModel(<IModernPlaylist> param);
            }
        });

        ko.applyBindings();
    });

    // Expose to global
    (<any>window).WidgetInitializer = true;
})();