/**
 * SoundManager2.d.ts: TypeScript definition for SoundManager2
 *
 * Copyright (c) 2014, Scott Schiller. All rights reserved.
 * Copyright (c) 2016 - 2017, The Little Moe New LLC. All rights reserved.
 *
 * This file is part of the project 'Sm2Shim'.
 * Code licensed under BSD license.
 *
 */

declare module soundManager
{
    interface ISm2SetupOption
    {
        /**
         * For scripting the SWF (object/embed property), 'always' or 'sameDomain'
         */
        allowScriptAccess?: string;
        /**
         * SWF background color. N/A when wmode = 'transparent'
         */
        bgColor?: string;
        /**
         * If console is being used, do not create/write to #soundmanager-debug
         */
        consoleOnly?: boolean;
        /**
         * The directory where SM2 can find the flash movies (soundmanager2.swf, soundmanager2_flash9.swf
         * and debug versions etc.) Note that SM2 will append the correct SWF file name, depending
         * on flashVersion and debugMode settings.
         */
        url: string;
        /**
         * Enable debugging output (console.log() with HTML fallback)
         */
        debugFlash?: boolean;
        /**
         * Enable debugging output inside SWF, troubleshoot Flash/browser issues
         */
        debugMode?: boolean;
        /**
         * Flash build to use (8 or 9.) Some API features require 9.
         */
        flashVersion?: number;
        /**
         * Millisecond affecting whileplaying/loading callback frequency. If null, default of 50 msec is used.
         */
        flashPollingInterval?: number;
        /**
         * If true, a single Audio() object is used for all sounds - and only one can play at a time.
         */
        forceUseGlobalHTML5Audio?: boolean;
        /**
         * Millisecond affecting whileplaying/loading callback frequency. If null,
         * native HTML5 update events are used.
         */
        html5PollingInterval?: number;
        /**
         * HTML5 Audio() format support test. Use /^probably$/i; if you want to be more conservative.
         */
        html5Test?: RegExp;
        /**
         * Millisecond to wait for flash movie to load before failing (0 = infinity)
         */
        flashLoadTimeout?: number;
        /**
         * If an id is not provided to createSound(), this prefix is used for generated IDs - 'sound0', 'sound1' etc.
         */
        idPrefix?: string;
        /**
         * If true, SM2 will not apply global HTML5 audio rules to mobile UAs.
         * Apple iOS > 7 and WebViews may allow multiple Audio() instances.
         */
        ignoreMobileRestrictions?: boolean;
        /**
         * If true, appends ?ts={date} to break aggressive SWF caching.
         */
        noSWFCache?: boolean;
        /**
         * Overrides useHTML5audio. if true and flash support present, will try to use flash for
         * MP3/MP4 as needed. Useful if HTML5 audio support is quirky.
         */
        preferFlash?: boolean;
        /**
         * Use console.log() if available (otherwise, writes to #soundmanager-debug element)
         */
        useConsole?: boolean;
        /**
         * Requires flashblock.css, see demos - allow recovery from flash blockers.
         * Wait indefinitely and apply timeout CSS to SWF, if applicable.
         */
        useFlashBlock?: boolean;
        /**
         * Position:fixed flash movie can help increase js/flash speed, minimize lag
         */
        useHighPerformance?: boolean;
        /**
         * Use HTML5 Audio() where supported. Some browsers may not support "non-free"
         * MP3/MP4/AAC codecs. Ideally, transparent vs. Flash API where possible.
         */
        useHTML5Audio?: boolean;
        /**
         * Force SM2 to wait for window.onload() before trying to call soundManager.onready()
         */
        waitForWindowLoad?: boolean;
        /**
         * Flash rendering mode - null, 'transparent', or 'opaque' (last two allow z-index)
         */
        wmode?: string;
    }

    interface ISm2AudioType
    {
        type: string[];
        required: boolean;
        related: string[];
    }

    interface ISm2DefaultOptions
    {
        /**
         * Enable automatic loading (otherwise .load() will call with .play())
         */
        autoLoad: boolean;
        /**
         * Enable playing of file ASAP (much faster if "stream" is boolean)
         */
        autoPlay: boolean;
        /**
         * Position to start playback within a sound (msec); see demo
         */
        from?: number;
        /**
         * Number of times to play the sound. Related: looping (API demo)
         */
        loops: number;
        /**
         * Let sounds "restart" or "chorus" when played multiple times.
         */
        multiShot: boolean;
        /**
         * Allow events (onfinish()) to fire for each shot; if supported.
         */
        multiShotEvents: boolean;
        /**
         * Callback function for "ID3 data is added/available"
         */
        onid3?: () => void;
        /**
         * Callback function for "load finished"
         */
        onload?: () => void;
        /**
         * Callback for "user stop"
         */
        onstop?: () => void;
        /**
         * Callback function for "sound finished playing"
         */
        onfinish?: () => void;
        /**
         * Callback for "pause"
         */
        onpause?: () => void;
        /**
         * Callback for "play" start
         */
        onplay?: () => void;
        /**
         * Callback for "resume" (pause toggle)
         */
        onresume?: () => void;
        /**
         * Offset (milliseconds) to seek to within downloaded sound.
         */
        position?: number;
        /**
         * "Pan" settings; left-to-right; -100 to 100
         */
        pan: number;
        /**
         * Allows playing before entire file has loaded (recommended)
         */
        stream: boolean;
        /**
         * Position to end playback within a sound (msec); see demo
         */
        to: number;
        /**
         * MIME-like hint for canPlay() tests; eg. 'audio/mp3'
         */
        type?: string;
        /**
         * Enable crossdomain.xml request for remote domains (for ID3/waveform access)
         */
        usePolicyFile: boolean;
        /**
         * Self-explanatory. 0-100; the latter being the max.
         */
        volume: number;
        /**
         * Callback function for updating progress (X of Y bytes received)
         */
        whileloading?: () => void;
        /**
         * Callback during play (position update)
         */
        whileplaying?: () => void;
        // see optional flash 9-specific options; too
    }

    interface ISm2Flash9Options
    {
        /**
         * "MovieStar" MPEG4 audio mode. Null (default) = auto detect MP4; AAC etc. based on URL.
         * true = force on; ignore URL
         */
        isMovieStar?: boolean;
        /**
         * Enable left/right channel peak (level) data
         */
        usePeakData: boolean;
        /**
         * Enable sound spectrum (raw waveform data) - WARNING: May set CPUs on fire.
         */
        useWaveformData: boolean;
        /**
         * Enable sound EQ (frequency spectrum data) - WARNING: Also CPU-intensive.
         */
        useEQData: boolean;
        /**
         * Callback for "isBuffering" property change
         */
        onbufferchange: void;
        /**
         * Callback for waveform/eq data access error (flash playing audio in other tabs/domains)
         */
        ondataerror: void;
    }

    interface ISm2MovieStarOptions
    {
        /**
         * Seconds of data to buffer
         *  (null = flash default of 0.1 - if AAC gappy, try up to 3 seconds)
         */
        bufferTime?: number;
    }

    interface ISm2Features
    {
        buffering: boolean;
        peakData: boolean;
        waveformData: boolean;
        eqData: boolean;
        movieStar: boolean;
    }

    interface ISmSoundOptions
    {
        autoLoad?: boolean;
        autoPlay?: boolean;
        bufferTime?: number;
        eqData?: ISm2EqData;
        from?: number;
        id?: string;
        isMovieStar?: boolean;
        loops?: number;
        multiShot?: boolean;
        multiShotEvents?: boolean;
        pan?: number;
        peakData?: ISm2PeakData;
        position?: number;
        serverURL?: string;
        stream?: boolean;
        to?: number;
        type?: string;
        url: any;
        usePolicyFile?: boolean;
        volume?: number;
        waveformData?: ISm2EqData;

        onbufferchange? : (isBuffering: boolean) => void;
        onconnect? : (bConnect: any) => void;
        ondataerror? : () => void;
        onfinish? : (this: ISmSound) => void;
        onload? : (this: ISmSound, success: boolean) => void;
        onpause? : () => void;
        onplay? : () => void;
        onresume? : () => void;
        onsuspend? : () => void;
        onstop? : () => void;
        onid3? : () => void;
        whileloading? : (this: ISmSound) => void;
        whileplaying? : (this: ISmSound) => void;
    }

    interface ISm2EqData
    {
        left: number[];
        right: number[];
    }

    interface ISm2PeakData
    {
        left: number;
        right: number;
    }

    interface ISm2BufferedBlock
    {
        start: number;
        end: number;
    }

    enum PlayState
    {
        StoppedOrUnInitialized = 0,
        PlayingOrBuffering = 1
    }

    enum ReadyState
    {
        UnInitialized = 0,
        Loading = 1,
        Failed = 2,
        Loaded = 3
    }

    interface ISmSound
    {
        autoLoad: boolean;
        autoPlay: boolean;
        bufferTime: number;
        eqData?: ISm2EqData;
        from?: number;
        id: string;
        isMovieStar?: boolean;
        loops: number;
        multiShot: boolean;
        multiShotEvents: boolean;
        pan: number;
        peakData: ISm2PeakData;
        position: number;
        serverURL?: string;
        stream: boolean;
        to?: number;
        type?: string;
        url: any[];
        usePolicyFile: boolean;
        volume: number;
        waveformData?: ISm2EqData;

        buffered?: ISm2BufferedBlock[];
        bytesLoaded?: number;
        bytesTotal?: number;
        isBuffering?: boolean;
        connected?: boolean;
        duration?: number;
        durationEstimate?: number;
        isHTML5?: boolean;
        loaded?: boolean;
        muted?: boolean;
        paused?: boolean;
        playState?: PlayState;
        readyState?: ReadyState;
        id3?: any;

        _iO? : any;

        destruct(): void;
        load(options: ISmSoundOptions): ISmSound;
        clearOnPosition(msecOffset: number, callback?: void) : ISmSound;
        onPosition(msecOffset: number, callback?: void) : ISmSound;
        mute(): ISmSound;
        pause(): ISmSound;
        play(options: ISmSoundOptions) : ISmSound;
        resume(): ISmSound;
        setPan(volume: number) : ISmSound;
        setPosition(msecOffset: number) : ISmSound;
        setVolume(volume: number) : ISmSound;
        stop() : ISmSound;
        toggleMute() : ISmSound;
        togglePause() : ISmSound;
        unload() : ISmSound;
        unmute() : ISmSound;

        onbufferchange(callback: () => void) : void;
        onconnect(callback: (bConnect: any) => void) : void;
        ondataerror(callback: () => void) : void;
        onfinish(callback: () => void) : void;
        onload(callback: (success: boolean) => void) : void;
        onpause(callback: () => void) : void;
        onplay(callback: () => void) : void;
        onresume(callback: () => void) : void;
        onsuspend(callback: () => void) : void;
        onstop(callback: () => void) : void;
        onid3(callback: () => void) : void;
        whileloading(callback: () => void) : void;
        whileplaying(callback: () => void) : void;
    }

    /**
     * For scripting the SWF (object/embed property), 'always' or 'sameDomain'
     */
    export let allowScriptAccess: string;

    /**
     * Specifies an alternate path to soundManager.setupOptions.url which SM2 can load its SWF from.
     * 
     * @example soundManager.altURL = '../'; (Load from parent directory - note trailing slash)
     * @see soundManager.useAltURL
     */
    export let altURL: string;

    /**
     * Defines a structure listing the audio codecs that will be tested for support under both HTML5 and Flash. 
     * Each type is defined by a file extension and MIME types, and optionally, 
     * a list of related extensions (eg. MPEG-4 content can be in an .mp4 file, but may also be .aac, or .m4a.)
     * 
     * Additionally, each format can be defined as "required", meaning that SM2 can fail to start if 
     * playback support is not found via either HTML5 or Flash. By default, MP3 is a required format.
     */
    export let audioFormats: { [format: string]: ISm2AudioType };

    /**
     * SWF background color. N/A when wmode = 'transparent'
     */
    export let bgColor: string;

    /**
     * If console is being used, do not create/write to #soundmanager-debug
     */
    export let consoleOnly: boolean;

    /**
     * Enable debugging output (console.log() with HTML fallback)
     */
    export let debugFlash: boolean;

    /**
     * Enable debugging output inside SWF, troubleshoot Flash/browser issues
     */
    export let debugMode: boolean;

    /**
     * Default options that controls player behavior.
     */
    export let defaultOptions: ISm2DefaultOptions;

    /**
     * Default Flash options that controls player behavior.
     */
    export let flash9Options: ISm2Flash9Options;

    /**
     * Object that reports player features available in runtime.
     */
    export let features: ISm2Features;

    /**
     * Millisecond to wait for flash movie to load before failing (0 = infinity)
     */
    export let flashLoadTimeout: number;

    /**
     * Millisecond affecting whileplaying/loading callback frequency. If null, default of 50 msec is used.
     */
    export let flashPollingInterval: number;

    /**
     * Flash build to use (8 or 9.) Some API features require 9.
     */
    export let flashVersion: number;

    /**
     * If true, a single Audio() object is used for all sounds - and only one can play at a time.
     */
    export let forceUseGlobalHTML5Audio: boolean;

    /**
     * This property is set during initialization and reflects whether SM2 is running in "100% HTML5 mode",
     * based on support for required formats defined by soundManager.audioFormats.
     */
    export let html5Only: boolean;

    /**
     * Millisecond affecting whileplaying/loading callback frequency.
     * If null, native HTML5 update events are used.
     */
    export let html5PollingInterval: number;

    /**
     * If true, SM2 will not apply global HTML5 audio rules to mobile UAs.
     * Apple iOS > 7 and WebViews may allow multiple Audio() instances.
     */
    export let ignoreMobileRestrictions: boolean;

    /**
     * Object that controls movie star options in Flash mode.
     */
    export let movieStarOptions: ISm2MovieStarOptions;

    /**
     * Overrides useHTML5audio. if true and flash support present, will try to use flash for
     * MP3/MP4 as needed. Useful if HTML5 audio support is quirky.
     */
    export let preferFlash: boolean;

    /**
     * The directory where SM2 can find the flash movies (soundmanager2.swf, soundmanager2_flash9.swf
     * and debug versions etc.) Note that SM2 will append the correct SWF file name, depending
     * on flashVersion and debugMode settings.
     */
    export let url: string;

    /**
     * Alternative Flash file URL that for the convenience of development.
     */
    export let useAltURL: any;

    /**
     * Use console.log() if available (otherwise, writes to #soundmanager-debug element)
     */
    export let useConsole: boolean;

    /**
     * By default useFastPolling = false, and thus SoundManager uses a 50-millisecond timer inside Flash
     * when polling for updated sound properties such as bytesLoaded and data and event callbacks
     * eg. whileloading(), whileplaying() and so on. With useFastPolling = true,
     * a 10-msec timer is used and callback frequency may noticeably increase.
     *
     * This is best combined with useHighPerformance for optimal results.
     */
    export let useFastPolling: boolean;

    /**
     * Requires flashblock.css, see demos - allow recovery from flash blockers.
     * Wait indefinitely and apply timeout CSS to SWF, if applicable.
     */
    export let useFlashBlock: boolean;

    /**
     * Position:fixed flash movie can help increase js/flash speed, minimize lag
     */
    export let useHighPerformance: boolean;

    /**
     * Use HTML5 Audio() where supported. Some browsers may not support "non-free"
     * MP3/MP4/AAC codecs. Ideally, transparent vs. Flash API where possible.
     */
    export let useHTML5Audio: boolean;

    /**
     * Flash rendering mode - null, 'transparent', or 'opaque' (last two allow z-index)
     */
    export let wmode: string;

    /**
     * Force SM2 to wait for window.onload() before trying to call soundManager.onready()
     */
    export let waitForWindowLoad: boolean;

    /**
     * Normalized method which checks canPlayMIME() and canPlayURL() as needed 
     * to estimate the playability of an HTML link; this means both the href and 
     * type attributes, if provided, are checked for matching file extension 
     * and/or MIME type patterns.
     * 
     * @param domElement Sound DOM Element.
     */
    function canPlayLink(domElement: HTMLElement) : boolean;

    /**
     * Returns a boolean indicating whether soundManager can play the given MIME type - 
     * eg., audio/mp3. The types supported vary based on Flash version and 
     * MPEG4 (MovieStar mode) options.
     * 
     * @param mimeType The MIME type to be checked.
     */
    function canPlayMIME(mimeType: string) : boolean;

    /**
     * Returns a boolean indicating whether soundManager can play the given URL. 
     * Playability is determined by a matching URL pattern set at runtime, 
     * based on Flash version and MPEG4 (MovieStar mode) support.
     * 
     * @param mediaUrl The Media URL to be checked.
     */
    function canPlayURL(mediaUrl: string) : boolean;

    /**
     * Clears the event listener set via onPosition(), in the same way it was registered. 
     * If the callback is omitted, any and all callbacks registered for the given offset will be cleared.
     * 
     * @param id Sound ID.
     * @param msecOffset Time offset in millisecond.
     * @param callback Event Callback.
     * 
     * @returns ISmSound
     */
    function clearOnPosition(id: string, msecOffset: number, callback?: () => void) : ISmSound;

    /**
     * Creates a sound object, supporting an arbitrary number of optional arguments. 
     * Returns a SMSound object instance. At minimum, a url parameter is required.
     * 
     * @param options Sound options that configures URL and determines sound behavior.
     * @returns ISmSound
     */
    function createSound(options: ISmSoundOptions) : ISmSound;

    /**
     * Stops, unloads and destroys a sound specified by ID.
     * 
     * @param id Sound ID.
     */
    function destroySound(id: string) : void;

    /**
     * Returns the total number of bytes allocated to the Adobe Flash player or Adobe AIR, 
     * or 0 if unsupported (Flash 9+ only.) This number may include memory use across all tabs,
     *  browsers etc. See system.totalMemory (livedocs.adobe.com)
     */
    function getMemoryUse() : number;

    /**
     * Returns an SMSound object specified by ID, or null if a sound with that ID is not found.
     * 
     * @param id Sound ID.
     * @returns ISmSound
     */
    function getSoundById(id: string) : ISmSound;

    /**
     * Starts loading the sound specified by ID, with options if specified. 
     * Returns the related sound object.
     * 
     * @param id Sound ID.
     * @param options SoundManager sound setup options.
     * @returns ISmSound
     */
    function load(id: string, options?: ISmSoundOptions) : ISmSound;

    /**
     * Mutes the sound specified by ID and returns that sound object. 
     * If no ID specified, all sounds will be muted and null is returned. 
     * Affects muted property (boolean.)
     * 
     * @param id Sound ID.
     * @returns ISmSound
     */
    function mute(id: string) : ISmSound;

    /**
     * Returns a boolean indicating whether soundManager has attempted to and succeeded in initialising.
     * This function will return false if called before initialisation has occurred,
     * and is useful when you want to create or play a sound without knowing SM2's current state.
     */
    function ok() : boolean;

    /**
     * Registers an event listener, fired when a sound reaches or passes a certain position while playing.
     * Position being "listened" for is passed back to event handler.
     *
     * Will also fire if a sound is "rewound" (eg. via setPosition() to an earlier point)
     * and the given position is reached again. Listeners will be removed if a sound is unloaded.
     * An optional scope can be passed as well.
     *
     * Note that for multiShot cases, only the first play instance's position is tracked in Flash;
     * therefore, subsequent "shots" will not have onPosition() events being fired.
     * @param id Sound ID.
     * @param msecOffset Position in millisecond.
     * @param callback Event callback.
     */
    function onPosition(id: string, msecOffset: number, callback: () => void) : ISmSound;

    /**
     * Pauses the sound specified by ID. Does not toggle.
     * Affects paused property (boolean.) Returns the given sound object.
     * @param id Sound ID.
     */
    function pause(id: string) : ISmSound;

    /**
     * Pauses all sounds whose playState is >0. Affects paused property (boolean.)
     */
    function pauseAll() : void;

    /**
     * Starts playing the sound specified by ID. (Will start loading if applicable, and will play ASAP.)
     * @param id Sound ID.
     * @param options Options that determines sound's behavior.
     */
    function play(id: string, options?: ISmSoundOptions) : ISmSound;

    /**
     * Destroys any created SMSound objects, unloads the flash movie (removing it from the DOM)
     * and restarts the SM2 init process, retaining all currently-set properties.
     */
    function reboot() : void;

    /**
     * Effectively restores SoundManager's original state without rebooting (re-initializing).
     Similar to reboot() which destroys sound objects and the flash movie (as applicable),
     but also nukes any registered onready() and related callbacks.
     */
    function reset() : void;

    /**
     * Resumes and returns the currently-paused sound specified by ID.
     * @param id Sound ID.
     */
    function resume(id: string) : ISmSound;

    /**
     * Resumes all currently-paused sounds.
     */
    function resumeAll() : void;

    /**
     * Method used to assign configurable values prior to DOM ready.
     * @param setupOption Options that determines player's behavior.
     */
    function setup(setupOption: ISm2SetupOption) : void;

    /**
     * Sets the stereo pan (left/right bias) of the sound specified by ID, and returns the related sound object.
     * Accepted values: -100 to 100 (L/R, 0 = center.) Affects pan property.
     * @param id Sound ID,
     * @param volume left/right bias, value in -100 to 100.
     */
    function setPan(id: string, volume: number) : ISmSound;

    /**
     * Seeks to a given position within a sound, specified by milliseconds (1000 msec = 1 second)
     * and returns the related sound object. Affects position property.
     * @param id Sound ID.
     * @param msecOffset Position in millisecond.
     */
    function setPosition(id: string, msecOffset: number) : ISmSound;

    /**
     * Sets the volume of the sound specified by ID and returns the related sound object.
     * Accepted values: 0-100. Affects volume property.
     * @param id Sound ID.
     * @param volume Volume to set.
     */
    function setVolume(id: string, volume: number) : ISmSound;

    /**
     * Sets the volume of all sound objects. Accepted values: 0-100. Affects volume property.
     * @param volume Volume to set.
     */
    function setVolume(volume: number) : void;

    /**
     * Returns a boolean indicating whether soundManager has attempted to and succeeded in initialising.
     * This function will return false if called before initialisation has occurred,
     * and is useful when you want to create or play a sound without knowing SM2's current state.
     */
    function supported() : boolean;

    /**
     * Stops playing the sound specified by ID. Returns the related sound object.
     * @param id Sound ID.
     */
    function stop(id: string) : ISmSound;

    /**
     * Stops any currently-playing sounds.
     */
    function stopAll() : void;

    /**
     * Mutes/unmutes the sound specified by ID. Returns the related sound object.
     * @param id Sound ID.
     */
    function toggleMute(id: string) : ISmSound;

    /**
     * Pauses/resumes play on the sound specified by ID. Returns the related sound object.
     * @param id Sound ID.
     */
    function togglePause(id: string) : ISmSound;

    /**
     * Stops loading the sound specified by ID, canceling any current HTTP request.
     * Returns the related sound object.
     * @param id Sound ID.
     */
    function unload(id: string) : ISmSound;

    /**
     * Unmutes the sound specified by ID. If no ID specified, all sounds will be unmuted.
     * Affects muted property (boolean.) Returns the related sound object.
     * @param id Sound ID.
     */
    function unmute(id: string) : ISmSound;

    /**
     * Queues an event callback/handler for successful initialization and "ready to use" state of SoundManager 2.
     * An optional scope parameter can be specified; if none, the callback is scoped to the window.
     * If onready() is called after successful initialization, the callback will be executed immediately.
     * The onready() queue is processed before soundManager.onload().
     *
     * @example soundManager.onready(function() {
     * alert('Yay, SM2 loaded OK!');
     * });
     * @param callback Event callback.
     */
    function onready(callback: () => void) : void;

    /**
     * Queues an event callback/handler for SM2 init failure, processed at (or immediately, if added after)
     * SM2 initialization has failed, just before soundManager.onerror() is called.
     * An optional scope parameter can be specified; if none, the callback is scoped to the window.
     *
     * Additionally, a status object containing success and error->type parameters is passed
     * as an argument to your callback.
     *
     * @example soundManager.ontimeout(function(status) {
     * alert('SM2 failed to start. Flash missing, blocked or security error?');
     * alert('The status is ' + status.success + ', the error type is ' + status.error.type);
     * });
     *
     * @param callback Event callback.
     */
    function ontimeout(callback: (status: any) => void) : void;
}