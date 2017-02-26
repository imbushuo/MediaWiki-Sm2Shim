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
/// <reference path="../Framework/SoundManager2.d.ts" />
/// <reference path="../Utils/Utils.ts" />
/// <reference path="../Utils/ParamUtils.ts" />
/// <reference path="Sm2Player.ts" />
var Sm2Player = Sm2Shim.Player.Sm2Player;
var domUtils = Sm2ShimUtils.DomUtils;
(function () {
    if (!window.SM2BarPlayer) {
        var playerSelector_1 = '.sm2-bar-ui';
        var players_1 = [];
        var pollingInterval = 200;
        // Detect mobile devices (power optimization)
        if (window.navigator.userAgent.match(/mobile/i)) {
            pollingInterval = 500;
        }
        soundManager.setup({
            // Trade-off: higher UI responsiveness (play/progress bar), but may use more CPU.
            html5PollingInterval: pollingInterval,
            flashPollingInterval: pollingInterval,
            flashVersion: 9,
            debugMode: false,
            debugFlash: false,
            preferFlash: false,
            url: 'https://mmixstaticassets.azureedge.net/Sm2Shim/'
        });
        soundManager.onready(function () {
            var i, j;
            var nodes = domUtils.getAll(playerSelector_1);
            if (nodes && nodes.length) {
                for (i = 0, j = nodes.length; i < j; i++) {
                    players_1.push(new Sm2Player(nodes[i]));
                }
            }
        });
        // Expose to global
        window.sm2BarPlayers = players_1;
        window.SM2BarPlayer = Sm2Player;
    }
}());
//# sourceMappingURL=PlayerUI.js.map