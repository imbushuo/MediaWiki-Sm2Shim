/**
 * @license
 *
 * PlayerStub.ts: Loader for Sm2Shim
 * -----------------------------------------------
 * Copyright (c) 2016 - 2017, The Little Moe New LLC. All rights reserved.
 *
 * This file is part of the project 'Sm2Shim'.
 * Code released under BSD-2-Clause license.
 *
 */

import PlayerLoader = Sm2Shim.CoreServices.PlayerLoader;

(function (){

    if (!(<any> window).sm2ShimLoader)
    {
        let loader = new PlayerLoader();
        (<any> window).sm2ShimLoader = loader;
    }

})();