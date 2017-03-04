/**
 * @license
 *
 * IEnvironmentDefinition.ts: Environment definition interface for Sm2Shim
 * -----------------------------------------------
 * Copyright (c) 2016 - 2017, The Little Moe New LLC. All rights reserved.
 *
 * This file is part of the project 'Sm2Shim'.
 * Code released under BSD-2-Clause license.
 *
 */

namespace Sm2Shim.Models
{
    /**
     * @interface IEnvironmentDefinition Interface that defines runtime environment settings.
     */
    export interface IEnvironmentDefinition
    {
        definitionReleaseId: string;
        environment: string;
        debug: boolean;

        widgetEndpoint: string;
        scriptEndpoint: string;
        stylesheetEndpoint: string;
        localizationEndpoint: string;

        widgetReleaseId: string;
        stylesheetReleaseId: string;
        scriptReleaseId: string;
        localizationReleaseId: string;
    }
}

