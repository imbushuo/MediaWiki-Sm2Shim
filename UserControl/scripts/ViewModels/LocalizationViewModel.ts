/**
 * @license
 *
 * LocalizationViewModel.ts: ViewModel for localization
 * -----------------------------------------------
 * Copyright (c) 2016 - 2017, The Little Moe New LLC. All rights reserved.
 *
 * This file is part of the project 'Sm2Shim'.
 * Code released under BSD-2-Clause license.
 *
 */

namespace Sm2Shim.Player.ViewModels
{
    import WebClient = System.Net.WebClient;
    export class LocalizationViewModel
    {
        private m_fallbackLanguage: string = "en";
        private m_canonicalLanguage: string;
        private m_config: Sm2Shim.Models.IEnvironmentDefinition;

        playPauseLabel: KnockoutObservable<string>;
        prevLabel: KnockoutObservable<string>;
        nextLabel: KnockoutObservable<string>;
        loopLabel: KnockoutObservable<string>;
        playlistLabel: KnockoutObservable<string>;

        private static get currentLanguage()
        {
            return (<any> window.navigator).userLanguage || window.navigator.language;
        }

        constructor()
        {
            let currLanguage = LocalizationViewModel.currentLanguage;
            currLanguage = currLanguage.toLowerCase();

            this.playPauseLabel = ko.observable("Play / Pause");
            this.prevLabel = ko.observable("< Previous");
            this.nextLabel = ko.observable("Next >");
            this.loopLabel = ko.observable("Loop");
            this.playlistLabel = ko.observable("Playlist");

            this.m_config = <Sm2Shim.Models.IEnvironmentDefinition> (<any> window).sm2ShimLoaderConfig;
            if (!this.m_config)
            {
                console.warn("LocalizationViewModel::constructor(): Precondition is not satisfied. "
                    + "Localization resources will not be loaded.");

                return;
            }

            // English languages: Use general one for all
            if (currLanguage.indexOf('en') === 0)
            {
                this.m_canonicalLanguage = 'en';
            }
            else if (currLanguage.indexOf('zh') === 0)
            {
                switch (currLanguage)
                {
                    case 'zh':
                    case 'zh-chs':
                    case 'zh-cn':
                    case 'zh-sg':
                    case 'zh-hans':
                    case 'zh-hans-cn':
                        this.m_canonicalLanguage = 'zh-hans';
                        break;
                    case 'zh-tw':
                    case 'zh-hk':
                    case 'zh-hant':
                    case 'zh-hant-hk':
                    case 'zh-hant-tw':
                        this.m_canonicalLanguage = 'zh-hant';
                        break;
                }
            }
            else
            {
                // Fallback language
                this.m_canonicalLanguage = this.m_fallbackLanguage;
            }

            this.loadLocalizationAsync().then(() =>
                console.log("LocalizationViewModel::constructor(): Localization resources loaded."));
        }

        private async loadLocalizationAsync()
        {
            let loader = <PlayerLoader> (<any> window).sm2ShimLoader;
            if (loader)
            {
                const localizationModule = <IModule>
                {
                    type: "localization",
                    name: this.m_canonicalLanguage,
                    description: `Language resources (${this.m_canonicalLanguage})`,
                    release: false,
                    releaseId: this.m_config.localizationReleaseId
                };

                const localizationUri = loader.buildResourceURI(localizationModule);
                console.log(`LocalizationViewModel::loadLocalizationAsync() Loading localization resources for ${this.m_canonicalLanguage}`);

                try
                {
                    const content = await WebClient.downloadStringAsync(localizationUri);
                    this.parseLocalizationFile(content);
                }
                catch (exception)
                {
                    // Ignore
                }
            }

        }

        private parseLocalizationFile(resource: string) : void
        {
            if (!resource) return;
            let resourceParsed = JSON.parse(resource);
            if (!resourceParsed) return;

            if (resourceParsed.clientPlayPause) this.playPauseLabel(resourceParsed.clientPlayPause);
            if (resourceParsed.clientPrev) this.prevLabel(resourceParsed.clientPrev);
            if (resourceParsed.clientNext) this.nextLabel(resourceParsed.clientNext);
            if (resourceParsed.clientRepeat) this.loopLabel(resourceParsed.clientRepeat);
            if (resourceParsed.clientMenu) this.playlistLabel(resourceParsed.clientMenu);

            console.log("LocalizationViewModel::parseLocalizationFile(): Localization resources parsed.");
        }
    }
}