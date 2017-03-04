<?php

/**
 * Sm2ShimConstants: Constants definition for SoundManager2 Shim.
 * Author: Bingxing Wang, The Little Moe New LLC
 * Copyright (c) 2016 - 2017 The Little Moe New LLC. All rights reserved.
 * https://github.com/imbushuo/MediaWiki-Sm2Shim
 * Code provided under BSD-2-Clause license.
 */

class Sm2ShimConstants {

    const EmptyString = '';
    const Space = ' ';
    const FlashMp3Tag = 'flashmp3';
    const SoundManager2ButtonTag = 'sm2';
    const ModernSoundManager2Tag = 'modernsoundmanager';

    const ParamsQualifier = '|';
    const ParamValueQualifier = '=';
    const FilesQualifier = ',';

    const Sm2ShimPlayerBaseClass = 'sm2-bar-ui';
    const Sm2ShimAutoPlayClass = 'auto-play';
    const Sm2ShimLoopPlayClass = 'repeat-playback';
    const Sm2ShimPlayerLiteClass = 'sm2-bar-ui-lite';
    const Sm2ShimPlaylistOpenClass = 'playlist-open';

    const FlashMp3ParamTypeId = 'type';
    const FlashMp3ParamBackgroundId = 'bg';
    const FlashMp3ParamForegroundId = 'text';
    const FlashMp3ParamTrackColorId = 'tracker';
    const FlashMp3ParamThumbColorId = 'track';
    const FlashMp3ParamValueTypeLastFm = 'lastfm';
    const FlashMp3ParamValueBackgroundMagicHeader = '0x';
    const FlashMp3ParamAutoPlayId = 'autostart';
    const FlashMp3ParamLoopId = 'loop';
    const Sm2ShimOpenPlaylist = 'openplaylist';

    const Sm2ShimParamTypeFiles = 'files';
    const Sm2ShimBundleId = 'ext.sm2Shim';

    const HttpUrlHeader = 'http://';
    const HttpsUrlHeader = 'https://';

    const HtmlElementA = 'a';
    const HtmlElementAAttributeHref = 'href';
    const HtmlElementLi = 'li';
    const HtmlElementLink = 'link';
    const HtmlElementScript = 'script';
    const HtmlElementLinkAttributeRel = 'rel';
    const HtmlElementLinkAttributeHref = 'href';
    const HtmlElementScriptAttributeType = 'type';
    const HtmlElementScriptAttributeSrc = 'src';
    const HtmlElementADatasetSrcHref = 'data-filesrc';

    const Sm2ShimInlineElementClassId = 'sm2-inline-element';
    const Sm2ShimButtonElementClassId = 'sm2-button-element';
    const Sm2ShimButtonContainerClassId = 'sm2-button-bd';
    const Sm2ShimInlineButtonClassId = 'sm2-inline-button';
    const Sm2ShimPreviousButtonClassId = 'sm2-icon-previous';
    const Sm2ShimNextButtonClassId = 'sm2-icon-next';
    const Sm2ShimRepeatButtonClassId = 'sm2-icon-repeat';
    const Sm2ShimPlaylistButtonClassId = 'sm2-icon-menu';

}
