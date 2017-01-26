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
    interface Sm2SetupOption
    {
        allowScriptAccess: string;
        bgColor: string;
        consoleOnly: boolean;
        url: string;
        debugFlash: boolean;
        debugMode: boolean;
        flashVersion: number;
        flashPollingInterval: number;
        forceUseGlobalHTML5Audio: boolean;
        html5PollingInterval: number;
        html5Test: any;
        flashLoadTimeout: number;
        idPrefix: string;
        ignoreMobileRestrictions: boolean;
        noSWFCache: boolean;
        preferFlash: boolean;
        useConsole: boolean;
        useFlashBlock: boolean;
        useHighPerformance: boolean;
        useHTML5Audio: boolean;
        waitForWindowLoad: boolean;
        wmode: string;
    }

    interface Sm2AudioType
    {
        type: string[];
        required: boolean;
        related: string[];
    }

    interface Sm2DefaultOptions
    {
        autoLoad: boolean;          // enable automatic loading (otherwise .load() will call with .play())
        autoPlay: boolean;          // enable playing of file ASAP (much faster if "stream" is boolean)
        from: null;                 // position to start playback within a sound (msec); see demo
        loops: number;              // number of times to play the sound. Related: looping (API demo)
        multiShot: boolean;         // let sounds "restart" or "chorus" when played multiple times..
        multiShotEvents: boolean;   // allow events (onfinish()) to fire for each shot; if supported.
        onid3: void;                // callback function for "ID3 data is added/available"
        onload: void;               // callback function for "load finished"
        onstop: void;               // callback for "user stop"
        onfinish: void;             // callback function for "sound finished playing"
        onpause: void;              // callback for "pause"
        onplay: void;               // callback for "play" start
        onresume: void;             // callback for "resume" (pause toggle)
        position: number;           // offset (milliseconds) to seek to within downloaded sound.
        pan: number;                // "pan" settings; left-to-right; -100 to 100
        stream: boolean;            // allows playing before entire file has loaded (recommended)
        to: number;                 // position to end playback within a sound (msec); see demo
        type: string;               // MIME-like hint for canPlay() tests; eg. 'audio/mp3'
        usePolicyFile: boolean;     // enable crossdomain.xml request for remote domains (for ID3/waveform access)
        volume: number;             // self-explanatory. 0-100; the latter being the max.
        whileloading: void;         // callback function for updating progress (X of Y bytes received)
        whileplaying: void;         // callback during play (position update)
        // see optional flash 9-specific options; too
    }

    interface Sm2Flash9Options
    {
        isMovieStar?: boolean;    // "MovieStar" MPEG4 audio mode. Null (default) = auto detect MP4; AAC etc. based on URL.
                                  // true = force on; ignore URL
        usePeakData: boolean;     // enable left/right channel peak (level) data
        useWaveformData: boolean; // enable sound spectrum (raw waveform data) - WARNING: May set CPUs on fire.
        useEQData: boolean;       // enable sound EQ (frequency spectrum data) - WARNING: Also CPU-intensive.
        onbufferchange: void;	  // callback for "isBuffering" property change
        ondataerror: void	      // callback for waveform/eq data access error (flash playing audio in other tabs/domains)
    }

    interface Sm2MovieStarOptions
    {
        bufferTime?: number; // seconds of data to buffer
                             // (null = flash default of 0.1 - if AAC gappy, try up to 3 seconds)
    }

    interface Sm2Features
    {
        buffering: boolean;
        peakData: boolean;
        waveformData: boolean;
        eqData: boolean;
        movieStar: boolean;
    }

    interface SmSoundOptions
    {
        autoLoad: boolean;
        autoPlay: boolean;
        bufferTime: number;
        eqData?: Sm2EqData;
        from?: number;
        id: string;
        isMovieStar?: boolean;
        loops: number;
        multiShot: boolean;
        multiShotEvents: boolean;
        pan: number;
        peakData: Sm2PeakData;
        position: number;
        serverURL?: string;
        stream: boolean;
        to?: number;
        type?: string;
        url: any[];
        usePolicyFile: boolean;
        volume: number;
        waveformData?: Sm2EqData;
    }

    interface Sm2EqData
    {
        left: number[];
        right: number[];
    }

    interface Sm2PeakData
    {
        left: number;
        right: number;
    }

    interface Sm2BufferedBlock
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

    interface SmSound
    {
        autoLoad: boolean;
        autoPlay: boolean;
        bufferTime: number;
        eqData?: Sm2EqData;
        from?: number;
        id: string;
        isMovieStar?: boolean;
        loops: number;
        multiShot: boolean;
        multiShotEvents: boolean;
        pan: number;
        peakData: Sm2PeakData;
        position: number;
        serverURL?: string;
        stream: boolean;
        to?: number;
        type?: string;
        url: any[];
        usePolicyFile: boolean;
        volume: number;
        waveformData?: Sm2EqData;

        buffered?: Sm2BufferedBlock[];
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

        destruct(): void;
        load(options: SmSoundOptions): SmSound;
        clearOnPosition(msecOffset: number, callback?: void) : SmSound;
        onPosition(msecOffset: number, callback?: void) : SmSound;
        mute(): SmSound;
        pause(): SmSound;
        play(options: SmSoundOptions) : SmSound;
        resume(): SmSound;
        setPan(volume: number) : SmSound;
        setPosition(msecOffset: number) : SmSound;
        setVolume(volume: number) : SmSound;
        stop() : SmSound;
        toggleMute() : SmSound;
        togglePause() : SmSound;
        unload() : SmSound;
        unmute() : SmSound;

        onbufferchange(callback: void) : void;
        onconnect(callback: (bConnect: any) => void) : void;
        ondataerror(callback: void) : void;
        onfinish(callback: void) : void;
        onload(callback: (success: boolean) => void) : void;
        onpause(callback: void) : void;
        onplay(callback: void) : void;
        onresume(callback: void) : void;
        onsuspend(callback: void) : void;
        onstop(callback: void) : void;
        onid3(callback: void) : void;
        whileloading(callback: void) : void;
        whileplaying(callback: void) : void;
    }

    export let allowScriptAccess: string;
    export let altURL: string;
    export let audioFormats: { [format: string]: Sm2AudioType };
    export let bgColor: string;
    export let consoleOnly: boolean;
    export let debugFlash: boolean;
    export let debugMode: boolean;
    export let defaultOptions: Sm2DefaultOptions;
    export let flash9Options: Sm2Flash9Options;
    export let features: Sm2Features;
    export let flashLoadTimeout: number;
    export let flashPollingInterval: number;
    export let flashVersion: number;
    export let forceUseGlobalHTML5Audio: boolean;
    export let html5Only: boolean;
    export let html5PollingInterval: number;
    export let ignoreMobileRestrictions: boolean;
    export let movieStarOptions: Sm2MovieStarOptions;
    export let preferFlash: boolean;
    export let url: string;
    export let useConsole: boolean;
    export let useFastPolling: boolean;
    export let useFlashBlock: boolean;
    export let useHighPerformance: boolean;
    export let useHTML5Audio: boolean;
    export let wmode: string;
    export let waitForWindowLoad: boolean;

    function canPlayLink(domElement: HTMLElement) : boolean;
    function canPlayMIME(mimeType: string) : boolean;
    function canPlayURL(mediaUrl: string) : boolean;
    function clearOnPosition(id: string, msecOffset: number, callback?: void) : SmSound;
    function createSound(options: SmSoundOptions) : SmSound;
    function destroySound(id: string) : void;
    function getMemoryUse() : number;
    function getSoundById(id: string) : SmSound;
    function load(id: string, options?: SmSoundOptions) : SmSound;
    function mute(id: string);

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
     * @param callback Evnet callback.
     */
    function onPosition(id: string, msecOffset: number, callback: void) : SmSound;

    /**
     * Pauses the sound specified by ID. Does not toggle.
     * Affects paused property (boolean.) Returns the given sound object.
     * @param id Sound ID.
     */
    function pause(id: string) : SmSound;

    /**
     * Pauses all sounds whose playState is >0. Affects paused property (boolean.)
     */
    function pauseAll() : void;

    /**
     * Starts playing the sound specified by ID. (Will start loading if applicable, and will play ASAP.)
     * @param id Sound ID.
     * @param options Options that determines sound's behavior.
     */
    function play(id: string, options?: SmSoundOptions) : SmSound;

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
    function resume(id: string) : SmSound;

    /**
     * Resumes all currently-paused sounds.
     */
    function resumeAll() : void;

    /**
     * Method used to assign configurable values prior to DOM ready.
     * @param setupOption Options that determines player's behavior.
     */
    function setup(setupOption: Sm2SetupOption) : void;

    /**
     * Sets the stereo pan (left/right bias) of the sound specified by ID, and returns the related sound object.
     * Accepted values: -100 to 100 (L/R, 0 = center.) Affects pan property.
     * @param id Sound ID,
     * @param volume left/right bias, value in -100 to 100.
     */
    function setPan(id: string, volume: number) : SmSound;

    /**
     * Seeeks to a given position within a sound, specified by milliseconds (1000 msec = 1 second)
     * and returns the related sound object. Affects position property.
     * @param id Sound ID.
     * @param msecOffset Position in millisecond.
     */
    function setPosition(id: string, msecOffset: number) : SmSound;

    /**
     * Sets the volume of the sound specified by ID and returns the related sound object.
     * Accepted values: 0-100. Affects volume property.
     * @param id Sound ID.
     * @param volume Volume to set.
     */
    function setVolume(id: string, volume: number) : SmSound;

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
    function stop(id: string) : SmSound;

    /**
     * Stops any currently-playing sounds.
     */
    function stopAll() : void;

    /**
     * Mutes/unmutes the sound specified by ID. Returns the related sound object.
     * @param id Sound ID.
     */
    function toggleMute(id: string) : SmSound;

    /**
     * Pauses/resumes play on the sound specified by ID. Returns the related sound object.
     * @param id Sound ID.
     */
    function togglePause(id: string) : SmSound;

    /**
     * Stops loading the sound specified by ID, canceling any current HTTP request.
     * Returns the related sound object.
     * @param id Sound ID.
     */
    function unload(id: string) : SmSound;

    /**
     * Unmutes the sound specified by ID. If no ID specified, all sounds will be unmuted.
     * Affects muted property (boolean.) Returns the related sound object.
     * @param id Sound ID.
     */
    function unmute(id: string) : SmSound;

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
    function onready(callback: void) : void;

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