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

/// <reference path="SoundManager2.d.ts" />
/// <reference path="Utils.ts" />
/// <reference path="Sm2Player.ts" />

import Sm2Player = Sm2Shim.Player.Sm2Player;
import domUtils = Sm2ShimUtils.DomUtils;

const playerSelector = '.sm2-bar-ui';
let players = [];

soundManager.setup(<soundManager.ISm2SetupOption>{
    // trade-off: higher UI responsiveness (play/progress bar), but may use more CPU.
    html5PollingInterval: 50,
    flashVersion: 9,
    debugMode: false,
    debugFlash: false,
    preferFlash: false,
    url: 'https://mmixstaticassets.azureedge.net/Sm2Shim/',
});

soundManager.onready(() => {
    let nodes, i, j;

    nodes = domUtils.getAll(playerSelector);

    if (nodes && nodes.length)
    {
        for (i = 0, j = nodes.length; i < j; i++)
        {
            players.push(new Sm2Player(nodes[i]));
        }
    }
});

// expose to global
(<any>window).sm2BarPlayers = players;
(<any>window).SM2BarPlayer = Sm2Player;


