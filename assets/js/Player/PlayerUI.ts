/**
 * PlayerUI.ts: Core player component for Sm2Shim
 *
 * Copyright (c) 2014, Scott Schiller. All rights reserved.
 * Copyright (c) 2016 - 2017, The Little Moe New LLC. All rights reserved.
 *
 * This file is part of the project 'Sm2Shim'.
 * Code licensed under BSD license.
 *
 */

/// <reference path="../Library/SoundManager2.d.ts" />
/// <reference path="../Utils/Utils.ts" />
/// <reference path="../Utils/ParamUtils.ts" />
/// <reference path="Sm2Player.ts" />

import Sm2Player = Sm2Shim.Player.Sm2Player;
import domUtils = Sm2ShimUtils.DomUtils;

(function (){
    if(!(<any>window).SM2BarPlayer)
    {
        const playerSelector = '.sm2-bar-ui';
        let players = [];

        let pollingInterval = 200;

        // Detect mobile devices (power optimization)
        if (window.navigator.userAgent.match(/mobile/i))
        {
            pollingInterval = 500;
        }

        soundManager.setup(<soundManager.ISm2SetupOption>
            {
                // Trade-off: higher UI responsiveness (play/progress bar), but may use more CPU.
                html5PollingInterval: pollingInterval,
                flashPollingInterval: pollingInterval,
                flashVersion: 9,
                debugMode: false,
                debugFlash: false,
                preferFlash: false,
                url: 'https://mmixstaticassets.azureedge.net/Sm2Shim/'
            });

        soundManager.onready(() => {

            let i, j;
            const nodes = domUtils.getAll(playerSelector);

            if (nodes && nodes.length)
            {
                for (i = 0, j = nodes.length; i < j; i++)
                {
                    players.push(new Sm2Player(nodes[i]));
                }
            }

        });

        // Expose to global
        (<any>window).sm2BarPlayers = players;
        (<any>window).SM2BarPlayer = Sm2Player;
    }
}());
