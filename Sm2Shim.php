<?php

/**
* Sm2Shim: A shim layer for FlashMP3 replacement
* Copyright (c) 2016 - 2017 The Little Moe New LLC. All rights reserved.
* https://github.com/imbushuo/MediaWiki-Sm2Shim
* Code provoded under BSD license.
*/

if (function_exists('wfLoadExtension')) {
        wfLoadExtension('Sm2Shim');
        return;
} else {
        die( 'This version of the Sm2Shim extension requires MediaWiki 1.25+' );
}
