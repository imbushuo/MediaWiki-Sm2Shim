/**
 * @license
 *
 * RuntimeThemeViewModel.ts: ViewModel that dynamically controls player theme
 * -----------------------------------------------
 * Copyright (c) 2016 - 2017, The Little Moe New LLC, Bingxing Wang. All rights reserved.
 *
 * This file is part of the project 'Sm2Shim'.
 * Code released under BSD-2-Clause license.
 *
 */

namespace Sm2Shim.Player.ViewModels
{
    const DefaultBackground: string = "#e0e0e0";
    const DefaultForeground: string = "#000";
    const DefaultTrackColor: string = "rgba(0,0,0,0.4)";
    const DefaultThumbColor: string = "#3D3D3D";

    export class RuntimeThemeViewModel
    {
        m_background: KnockoutObservable<string>;
        m_foreground: KnockoutObservable<string>;
        m_thumbColor: KnockoutObservable<string>;
        m_trackColor: KnockoutObservable<string>;

        m_controlIdClass: KnockoutObservable<string>;
        m_computedCss: KnockoutObservable<string>;

        constructor(controlIdClass: string)
        {
            this.m_controlIdClass = ko.observable(controlIdClass);
            this.m_background = ko.observable(DefaultBackground);
            this.m_foreground = ko.observable(DefaultForeground);
            this.m_trackColor = ko.observable(DefaultTrackColor);
            this.m_thumbColor = ko.observable(DefaultThumbColor);

            this.m_computedCss = ko.computed(() => `
                .${this.m_controlIdClass()} .sm2-bar-ui .sm2-main-controls,
                .${this.m_controlIdClass()} .sm2-bar-ui .sm2-playlist-drawer,
                .${this.m_controlIdClass()} .sm2-bar-ui .sm2-lyric-drawer {
                    background-color: ${this.m_background()};
                }
                
                .${this.m_controlIdClass()} .sm2-bar-ui,
                .${this.m_controlIdClass()} .sm2-bar-ui .bd a {
                    color: ${this.m_foreground()};
                }
                
                .${this.m_controlIdClass()} input[type=range] {
                    background-color: ${this.m_trackColor()};
                }
                
                .${this.m_controlIdClass()} input[type=range]::-webkit-slider-thumb {
                    background: ${this.m_thumbColor()};
                }
                    
                .${this.m_controlIdClass()} input[type=range]::-ms-thumb {
                    background: ${this.m_thumbColor()};
                }
                    
                .${this.m_controlIdClass()} input[type=range]::-moz-range-thumb {
                    background: ${this.m_thumbColor()};
                }
            `);
        }

        get foreground()
        {
            return this.m_foreground();
        }

        set foreground(value: string)
        {
            if (RuntimeThemeViewModel.validate(value)) this.m_foreground(value);
        }

        get background()
        {
            return this.m_background();
        }

        set background(value: string)
        {
            if (RuntimeThemeViewModel.validate(value)) this.m_background(value);
        }

        get thumbColor()
        {
            return this.m_thumbColor();
        }

        set thumbColor(value: string)
        {
            if (RuntimeThemeViewModel.validate(value)) this.m_thumbColor(value);
        }

        get trackColor()
        {
            return this.m_trackColor();
        }

        set trackColor(value: string)
        {
            if (RuntimeThemeViewModel.validate(value)) this.m_trackColor(value);
        }

        private static validate(expression: string) : boolean
        {
            // Non-qualified expressions (e.g. null string) get rejection
            if (!expression) return false;

            let ret:boolean;

            // Create element to validate
            let validationElement = <HTMLDivElement> document.createElement("div");
            // Set to a specific expression
            validationElement.style.backgroundColor = DefaultBackground;
            validationElement.style.backgroundColor = expression;

            if (validationElement.style.background != DefaultBackground) ret = true;
            // Other situations
            else ret = expression === DefaultBackground;

            validationElement = null;
            return ret;
        }
    }
}