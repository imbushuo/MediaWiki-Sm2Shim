/**
 * @license
 *
 * PlayerLoader.ts: Implementation of class PlayerLoader
 * -----------------------------------------------
 * Copyright (c) The Regents of the University of California. All rights reserved.
 * Copyright (c) 2016 - 2017, The Little Moe New LLC. All rights reserved.
 *
 * This file is part of the project 'Sm2Shim'.
 * Code released under BSD-2-Clause license.
 *
 */

namespace Sm2Shim.CoreServices
{
    import IModule = Sm2Shim.Models.IModule;
    import WebClient = System.Net.WebClient;

    export class PlayerLoader
    {
        private m_emitOnly: boolean = false;
        private m_config: IEnvironmentDefinition;
        private m_loaderVersion: string = "1703.304.241.0";
        private m_stubRemoved: boolean = false;

        constructor()
        {
            console.log(
                `This is Sm2Shim Deferred Loader ${this.m_loaderVersion} ${(this.m_emitOnly ? "DEBUG" : "PROD")}`
                 + ", greetings from San Francisco.");
            console.log("Copyright (c) The Regents of the University of California. All rights reserved.");
            console.log("Copyright (c) 2016 - 2017, The Little Moe New LLC. All rights reserved.");

            // Check if configuration override exists (typically in production)
            if ((<any> window).sm2ShimLoaderConfig)
            {
                this.m_config = <IEnvironmentDefinition> (<any> window).sm2ShimLoaderConfig;
            }
            else
            {
                console.warn("PlayerLoader::constructor(): Unable to find environment configuration. " +
                "That's not expected in production environment. Debug settings will be loaded.");
                // Load default settings for debugging
                this.m_config = <IEnvironmentDefinition>
                {
                    debug: true,
                    definitionReleaseId: "",
                    environment: "debug",
                    localizationEndpoint: "",
                    localizationReleaseId: "",
                    scriptEndpoint: "localhost:63342/MediaWiki-Sm2Shim/bin/Debug/",
                    scriptReleaseId: "",
                    stylesheetReleaseId: "",
                    widgetEndpoint: "localhost:63342/MediaWiki-Sm2Shim/UserControl/",
                    widgetReleaseId: "",
                    stylesheetEndpoint: "localhost:63342/MediaWiki-Sm2Shim/bin/Debug/assets/"
                };
                // Also export to global for further use
                (<any> window).sm2ShimLoaderConfig = this.m_config;
            }

            // Check module definition
            if ((<any> window).sm2ShimModules)
            {
                const bundle = <IBundle> (<any> window).sm2ShimModules;

                if (bundle)
                {
                    console.log("Hello San Francisco, this is Seattle. We are loading bundle " +
                        bundle.id + ".");
                    // Chain-load all dependencies
                    this.loadDependencies(bundle).then(() =>
                    {
                        console.log("PlayerLoader::constructor(): All dependencies have been loaded.");
                    });
                }
            }
            else
            {
                console.error("PlayerLoader::constructor(): Unable to find module definition. " +
                "That's not expected in production environment.");
            }
        }

        private async loadDependencies(bundle: IBundle)
        {
            console.log("PlayerLoader::loadDependencies(): Begin loading dependencies.");

            const htmlHeadCollection = document.getElementsByTagName("head");
            if (htmlHeadCollection && htmlHeadCollection.length > 0)
            {
                if (bundle.stylesheets)
                {
                    for (let i = 0; i < bundle.stylesheets.length; i++)
                    {
                        const module = bundle.stylesheets[i];
                        const resUri = this.buildResourceURI(module);

                        const resLink = document.createElement("link");
                        resLink.rel = "stylesheet";
                        resLink.href = resUri;
                        resLink.type = "text/css";

                        const htmlHead = htmlHeadCollection[0];
                        if(!this.m_emitOnly)
                        {
                            htmlHead.appendChild(resLink);
                            console.log(`PlayerLoader::loadDependencies(): Start loading ${module.name} (${module.description})`);
                        }
                        else
                        {
                            console.log(`PlayerLoader::loadDependencies(): Will load ${resLink.outerHTML}`);
                        }
                    }
                }

                if (bundle.scripts)
                {
                    for (let i = 0; i < bundle.scripts.length; i++)
                    {
                        const module = bundle.scripts[i];
                        const resUri = this.buildResourceURI(module);

                        // Download script
                        try
                        {
                            if (!this.m_emitOnly)
                            {
                                let scriptContent = await WebClient.downloadStringAsync(resUri);
                                if (scriptContent) eval(scriptContent);
                                console.log(`PlayerLoader::loadDependencies(): Loaded ${module.name} (${module.description})`);
                            }
                            else
                            {
                                console.log(`PlayerLoader::loadDependencies(): Will load ${resUri}`);
                            }
                        }
                        catch (exception)
                        {
                            // Ignore and stop loading.
                            console.error(`PlayerLoader::loadDependencies(): Failed to load module ${module.name}: ${exception}`);
                            break;
                        }
                    }
                }
            }
            else
            {
                console.log("PlayerLoader::loadDependencies(): Precondition is not satisfied. No module was loaded.")
            }
        }

        buildResourceURI(module: IModule) : string
        {
            let ret = "";
            let resEndpoint = "";
            let resExtension = "";

            // Determine endpoint
            switch (module.type)
            {
                case "script":
                    resEndpoint = this.m_config.scriptEndpoint;
                    resExtension = ".js";
                    break;
                case "stylesheet":
                    resEndpoint = this.m_config.stylesheetEndpoint;
                    resExtension = ".css";
                    break;
                case "widget":
                    resEndpoint = this.m_config.widgetEndpoint;
                    resExtension = ".html";
                    break;
                case "localization":
                    resEndpoint = this.m_config.localizationEndpoint;
                    resExtension = ".json";
                    break;
            }

            // Build URI
            if (resEndpoint) ret += ("//" + resEndpoint);
            ret += module.name;
            if (module.releaseId) ret += ("." + module.releaseId);
            if (module.release) ret += ".min";
            ret += resExtension;

            return ret;
        }

        removeStubs() : void
        {
            if (this.m_stubRemoved) return;

            // Remove any loading stubs
            const loadingStubs = document.getElementsByClassName("sm2-loading-stub");
            if (loadingStubs)
            {
                while (loadingStubs.length > 0)
                {
                    loadingStubs[0].parentNode.removeChild(loadingStubs[0]);
                }
            }

            // Set flag
            this.m_stubRemoved = true;
        }
    }
}