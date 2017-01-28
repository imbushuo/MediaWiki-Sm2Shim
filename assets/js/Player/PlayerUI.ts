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

const playerSelector = '.sm2-bar-ui';
let players = [];

soundManager.setup(<soundManager.ISm2SetupOption>
{
    // Trade-off: higher UI responsiveness (play/progress bar), but may use more CPU.
    html5PollingInterval: 50,
    flashVersion: 9,
    debugMode: false,
    debugFlash: false,
    preferFlash: false,
    url: 'https://mmixstaticassets.azureedge.net/Sm2Shim/',
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

// Unreferenced variables
UNREFERENCED_PARAMETER(soundManager.PlayState.PlayingOrBuffering);
UNREFERENCED_PARAMETER(soundManager.PlayState.StoppedOrUnInitialized);
UNREFERENCED_PARAMETER(soundManager.ReadyState.Failed);
UNREFERENCED_PARAMETER(soundManager.ReadyState.Loaded);
UNREFERENCED_PARAMETER(soundManager.ReadyState.Loading);
UNREFERENCED_PARAMETER(soundManager.ReadyState.UnInitialized);
UNREFERENCED_PARAMETER(soundManager.canPlayLink);
UNREFERENCED_PARAMETER(soundManager.getMemoryUse);
UNREFERENCED_PARAMETER(soundManager.getSoundById);
UNREFERENCED_PARAMETER(soundManager.onPosition);
UNREFERENCED_PARAMETER(soundManager.pauseAll);
UNREFERENCED_PARAMETER(soundManager.resumeAll);
UNREFERENCED_PARAMETER(soundManager.supported);
