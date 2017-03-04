/**
 * @license
 *
 * IBundle.ts: Definition for player bundle
 * -----------------------------------------------
 * Copyright (c) 2016 - 2017, The Little Moe New LLC. All rights reserved.
 *
 * This file is part of the project 'Sm2Shim'.
 * Code released under BSD-2-Clause license.
 *
 */

namespace Sm2Shim.Models
{
    export interface IBundle
    {
        stylesheets: Array<IModule>;
        scripts: Array<IModule>;
        widget: IModule;
        id: string;
    }
}