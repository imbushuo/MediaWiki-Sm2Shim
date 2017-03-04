/**
 * @license
 *
 * PlayerViewModel.ts: Core player ViewModel
 * -----------------------------------------------
 * Copyright (c) 2014, Scott Schiller. All rights reserved.
 * Copyright (c) 2015 - 2017, Light Studio, David Huang, Bingxing Wang and Henry King. All rights reserved.
 * Copyright (c) 2016 - 2017, The Little Moe New LLC, Bingxing Wang. All rights reserved.
 *
 * This file is part of the project 'Sm2Shim'.
 * Code released under BSD-2-Clause license.
 *
 */

namespace Sm2Shim.Player.ViewModels
{
    import ArgumentNullException = System.ArgumentNullException;
    import IModernPlaylist = Sm2Shim.Player.Models.IModernPlaylist;
    import ISmSound = soundManager.ISmSound;
    import ISmSoundOptions = soundManager.ISmSoundOptions;
    import OnlineMetadata = Sm2Shim.Player.Models.OnlineMetadata;
    import ParsedLrc = Light.Lyrics.Model.ParsedLrc;
    import WebClient = System.Net.WebClient;

    import play = soundManager.play;

    class PlaylistItemViewModel
    {
        private m_lrcOffset: number;

        audioFileSrc: KnockoutObservable<string>;
        lrcFileSrc: KnockoutObservable<string>;
        isExplicit: KnockoutObservable<boolean>;
        navigationLink: KnockoutObservable<string>;
        tooltip: KnockoutObservable<string>;
        isCurrent: KnockoutObservable<boolean>;
        coverImageUrl: KnockoutObservable<string>;
        lrcTitle: KnockoutObservable<string>;
        lrcAlbum: KnockoutObservable<string>;
        lrcArtist: KnockoutObservable<string>;
        titleMetadataOverride: KnockoutObservable<string>;
        albumMetadataOverride: KnockoutObservable<string>;
        artistMetadataOverride: KnockoutObservable<string>;
        title: KnockoutObservable<string>;
        album: KnockoutObservable<string>;
        artist: KnockoutObservable<string>;

        get lrcOffset()
        {
            return this.m_lrcOffset;
        }

        constructor(
            audioFileSrc: string, lrcFileSrc?: string,
            titleMetadataOverride?: string, albumMetadataOverride?: string,
            artistMetadataOverride?: string, isExplicit?: boolean,
            navigationLink?: string, coverImageUrl?: string, lrcOffset: number = 0)
        {
            this.audioFileSrc = ko.observable(audioFileSrc);
            this.lrcFileSrc = ko.observable(lrcFileSrc);
            this.titleMetadataOverride = ko.observable(titleMetadataOverride);
            this.albumMetadataOverride = ko.observable(albumMetadataOverride);
            this.artistMetadataOverride = ko.observable(artistMetadataOverride);
            this.isExplicit = ko.observable(isExplicit);
            this.navigationLink = ko.observable(navigationLink);
            this.coverImageUrl = ko.observable(coverImageUrl);
            this.lrcTitle = ko.observable("");
            this.lrcAlbum = ko.observable("");
            this.lrcArtist = ko.observable("");
            this.isCurrent = ko.observable(false);
            this.m_lrcOffset = lrcOffset;

            this.title = ko.computed(() =>
                PlaylistItemViewModel.overrideStringSelection([
                    this.titleMetadataOverride(),
                    this.lrcTitle(),
                    "Unknown Title"
                ]));
            this.artist = ko.computed(() =>
                PlaylistItemViewModel.overrideStringSelection([
                    this.artistMetadataOverride(),
                    this.lrcArtist(),
                    "Unknown Artist"
                ]));
            this.album = ko.computed(() =>
                PlaylistItemViewModel.overrideStringSelection([
                    this.albumMetadataOverride(),
                    this.lrcAlbum(),
                    "Unknown Album"
                ]));

            this.tooltip = ko.computed(() => {
                return this.title() + " - " + this.album() + ", " + this.artist();
            });

        }

        private static overrideStringSelection(
            fallbackSequence: string[]) : string
        {
            if (fallbackSequence)
            {
                for (let i = 0; i < fallbackSequence.length; i++)
                {
                    if (fallbackSequence[i]) return fallbackSequence[i];
                }
            }

            return "Unknown";
        }
    }

    class TimeControlViewModel
    {
        timeIndicatorText: KnockoutObservable<string>;
        durationIndicatorText: KnockoutObservable<string>;
        progressbarLeft: KnockoutObservable<string>;
        progressbarWidth: KnockoutObservable<string>;

        private _currentTime: KnockoutObservable<number>;
        private _duration: KnockoutObservable<number>;
        private m_parent: PlayerViewModel;
        private m_isChangeAllowed: boolean;
        private m_prevPos: number;

        get currentTime() : number
        {
            return this._currentTime();
        }

        set currentTime(value: number)
        {
            if (value >= 0 && value <= this.duration && this.m_isChangeAllowed) this._currentTime(value);
        }

        get duration() : number
        {
            return this._duration();
        }

        set duration(value: number)
        {
            if (value >= 0) this._duration(value);
        }

        resetTimer() : void
        {
            this._currentTime(0);
            this._duration(0);
            this.m_prevPos = 0;
            this.m_isChangeAllowed = true;
        }

        onInputStart() : boolean
        {
            this.m_isChangeAllowed = false;
            this.m_prevPos = this._currentTime();
            return true;
        }

        onInputEnd(viewModel: TimeControlViewModel, event: MouseEvent) : boolean
        {
            // Get target
            const target = <HTMLInputElement> event.target;
            // Commit change
            viewModel.m_parent.setPosition(parseInt(target.value)).catch(() =>
            {
                // Rejected - reset timer
                viewModel._currentTime(this.m_prevPos);
            });
            // Unlock
            viewModel.m_isChangeAllowed = true;

            // Make default event work so we can adjust time
            return true;
        }

        static getTime(msec, useString) : any
        {
            // Convert milliseconds to hh:mm:ss, return as object literal or string
            const nSec = Math.floor(msec / 1000),
                hh = Math.floor(nSec / 3600),
                min = Math.floor(nSec / 60) - Math.floor(hh * 60),
                sec = Math.floor(nSec - (hh * 3600) - (min * 60));

            // If (min === 0 && sec === 0) return null; // return 0:00 as null
            return (useString ?
                ((hh ? hh + ':' : '') + (hh && min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec)) :
                {
                    'min': min,
                    'sec': sec
                });
        }

        constructor(parent: PlayerViewModel)
        {
            this._currentTime = ko.observable(0);
            this._duration = ko.observable(0);
            this.m_prevPos = 0;
            this.m_parent = parent;
            this.m_isChangeAllowed = true;

            this.timeIndicatorText = ko.computed(() => TimeControlViewModel.getTime(this._currentTime(), true));
            this.durationIndicatorText = ko.computed(() => TimeControlViewModel.getTime(this._duration(), true));
            this.progressbarLeft = ko.computed(() =>
            {
                const progressMaxLeft = 100;
                return Math.min(progressMaxLeft,
                        Math.max(0, (progressMaxLeft *
                        (this._currentTime() / this._duration())))) + '%';

            });
            this.progressbarWidth = ko.computed(() =>
            {
                return Math.min(100,
                        Math.max(0,
                            (100 * this._currentTime() / this._duration()))) + '%';
            });
        }
    }

    class LyricsSentenceViewModel
    {
        time: number;
        content: KnockoutObservable<string>;
        line: number;

        constructor(time: number, content: string, line: number)
        {
            this.time = time;
            this.content = ko.observable(content);
            this.line = line;
        }
    }

    class LyricsViewModel
    {
        isEnabled: KnockoutObservable<boolean>;
        sentences: KnockoutObservableArray<LyricsSentenceViewModel>;
        currentPivot: KnockoutObservable<number>;

        private m_current: PlaylistItemViewModel;
        private m_parsedLrcResult: Lyrics.LrcResult;
        private m_prevPivot: number;
        private m_nextTimeMark: number;
        private m_timeMarks: number[];
        private m_pollingInterval: number;
        private m_isFinished: boolean;

        constructor()
        {
            this.isEnabled = ko.observable(false);
            this.currentPivot = ko.observable(0).extend({notify: 'always'});
            this.sentences = ko.observableArray<LyricsSentenceViewModel>();
            this.m_prevPivot = -1;
            this.m_nextTimeMark = -1;
            this.m_timeMarks = [];
            this.m_isFinished = false;

            this.m_pollingInterval = 200;
            // Detect mobile devices (power optimization)
            if (window.navigator.userAgent.match(/mobile/i))
            {
                this.m_pollingInterval = 500;
            }
        }

        initializeLyrics(item: PlaylistItemViewModel)
        {
            // Sanity check
            if (item && item.lrcFileSrc())
            {
                this.isEnabled(true);
                this.m_current = item;

                // If sanity check passed, load LRC file.
                this.loadAndParseLrcFileAsync().then(() => this.bindLyricsSentences());
            }
        }

        synchronizeLyrics(position: number, overridePivot?: boolean);
        synchronizeLyrics(position: number, overridePivot: boolean) : void
        {
            if (!this.isEnabled()) return;

            // Determine if we have to update lyrics
            // Determine if we reached end
            if ((position < this.m_nextTimeMark && !overridePivot) ||
                (this.m_isFinished && !overridePivot)) return;

            // Reset if required
            if (overridePivot)
            {
                this.m_prevPivot = -1;
                this.m_nextTimeMark = 0;
                this.m_isFinished = false;
            }

            const searchPivot = (this.m_prevPivot >= 0) ? this.m_prevPivot : 0;
            let i: number;
            for (i = searchPivot; i < this.m_timeMarks.length; i++)
            {
                if (this.m_timeMarks[i] > position) break;
            }

            // Reset boundary (last sentence)
            if (i >= this.m_timeMarks.length &&
                this.m_prevPivot != this.m_timeMarks.length - 1)
            {
                i = this.m_timeMarks.length - 1;
            }

            // Update sentence and pivots
            if (i < this.m_timeMarks.length - 1)
                this.m_nextTimeMark = this.m_timeMarks[i + 1] - this.m_pollingInterval;
            else
                this.m_isFinished = true;

            // Toggle current
            this.currentPivot(i);

            // Set previous pivot
            this.m_prevPivot = i;
        }

        private async loadAndParseLrcFileAsync()
        {
            // No sanity check since the caller path is determined

            const lrcResult = await LyricsViewModel.downloadLrcAsync(
                this.m_current.lrcFileSrc(), this.m_current.audioFileSrc());

            // Make sure we are still loading lyrics for correct file
            if (lrcResult &&
                lrcResult.isRequestSucceeded &&
                lrcResult.requestId == this.m_current.audioFileSrc())
            {
                this.m_parsedLrcResult = lrcResult;
            }
        }

        private bindLyricsSentences()
        {
            // Update metadata
            this.m_current.lrcAlbum(this.m_parsedLrcResult.content.album);
            this.m_current.lrcArtist(this.m_parsedLrcResult.content.artist);
            this.m_current.lrcTitle(this.m_parsedLrcResult.content.title);

            // Push lyrics to panel (with offset)
            let i: number;
            const offset = this.m_current.lrcOffset;
            const lrcSentences = this.m_parsedLrcResult.content.sentences;

            for (i = 0; i < lrcSentences.length; i++)
            {
                const sentence = lrcSentences[i];
                this.sentences.push(new LyricsSentenceViewModel(sentence.time + offset, sentence.content, i));
                this.m_timeMarks.push(sentence.time + offset);
            }
        }

        private static async downloadLrcAsync(lrcPath: string, requestId: string)
        {
            try
            {
                const content = await WebClient.downloadStringAsync(lrcPath);
                const parsedLrc = Light.Lyrics.LrcParser.parse(content);
                return new Lyrics.LrcResult(parsedLrc != null, requestId, content, parsedLrc);
            }
            catch (exception)
            {
                return null;
            }
        }

        reset() : void
        {
            this.m_prevPivot = -1;
            this.m_nextTimeMark = -1;
            this.m_timeMarks = [];
            this.m_isFinished = false;
            this.m_current = null;
            this.m_parsedLrcResult = null;
            this.sentences.removeAll();
            this.isEnabled(false);
            this.currentPivot(0);
        }
    }

    export class PlayerViewModel
    {
        controlIdClass: KnockoutObservable<string>;

        playlistItems: KnockoutObservableArray<PlaylistItemViewModel>;
        currentItem: KnockoutObservable<PlaylistItemViewModel>;
        currentIndex: KnockoutObservable<number>;
        isCompactMode: KnockoutObservable<boolean>;

        isMouseOnPlaylist: KnockoutObservable<boolean>;
        isPlaylistExpanded: KnockoutObservable<boolean>;
        isLoopEnabled: KnockoutObservable<boolean>;
        isAutoPlayEnabled: KnockoutObservable<boolean>;

        isPrevButtonDisabled: KnockoutObservable<boolean>;
        isNextButtonDisabled: KnockoutObservable<boolean>;
        isSingleEntityPlayback: KnockoutObservable<boolean>;
        isPlaying: KnockoutObservable<boolean>;
        isPaused: KnockoutObservable<boolean>;

        m_runtimeThemeViewModel: RuntimeThemeViewModel;
        m_timerViewModel: TimeControlViewModel;
        m_lyricsViewModel: LyricsViewModel;
        m_localizationViewModel: LocalizationViewModel;

        private m_currentSound: ISmSound;
        private m_stopped: boolean;
        private m_debug: boolean = false;
        private m_instanceId: string;
        private m_initialSanityCheckVerified: boolean;

        constructor(playlist: IModernPlaylist)
        {
            if (!playlist) throw new ArgumentNullException("playlist");

            // Determine if we are debugging
            if ((<any> window).sm2ShimLoaderConfig)
            {
                const config = <Sm2Shim.Models.IEnvironmentDefinition> ((<any> window).sm2ShimLoaderConfig);
                this.m_debug = config.debug;
            }

            // Invoke stub removal if deferral loader is present
            let loader = <PlayerLoader> (<any> window).sm2ShimLoader;
            if (loader) loader.removeStubs();

            // Initialize instance ID
            this.m_instanceId = PlayerViewModel.newGuid();
            this.controlIdClass = ko.computed(() => "sm2-widget-" + this.m_instanceId);

            // Overwrite auto play if mobile device was detected
            if (navigator.userAgent.match(/mobile/i))
            {
                playlist.autoPlay = false;
            }

            // Initialize collections
            this.playlistItems = ko.observableArray<PlaylistItemViewModel>();
            this.isPlaylistExpanded = ko.observable(playlist.isPlaylistOpen);
            this.isMouseOnPlaylist = ko.observable(false);
            this.isLoopEnabled = ko.observable(playlist.loop);
            this.isAutoPlayEnabled = ko.observable(playlist.autoPlay);
            this.isPaused = ko.observable(true);
            this.isPlaying = ko.computed(() => !this.isPaused());
            this.isCompactMode = ko.observable(playlist.compactMode);
            this.m_timerViewModel = new TimeControlViewModel(this);
            this.m_lyricsViewModel = new LyricsViewModel();
            this.m_stopped = false;
            this.m_runtimeThemeViewModel = new RuntimeThemeViewModel(this.controlIdClass());
            this.m_localizationViewModel = new LocalizationViewModel();

            // Set background and foreground if available
            if (playlist.backgroundColor) this.m_runtimeThemeViewModel.background = playlist.backgroundColor;
            if (playlist.foregroundColor) this.m_runtimeThemeViewModel.foreground = playlist.foregroundColor;
            if (playlist.trackColor) this.m_runtimeThemeViewModel.trackColor = playlist.trackColor;
            if (playlist.thumbColor) this.m_runtimeThemeViewModel.thumbColor = playlist.thumbColor;

            // Load playlist
            let i: number;
            for (i = 0; i < playlist.playlist.length; i++)
            {
                const playlistEntity = playlist.playlist[i];
                if (!playlistEntity || !playlistEntity.audioFileUrl) continue;

                this.playlistItems.push(
                    new PlaylistItemViewModel(playlistEntity.audioFileUrl, playlistEntity.lrcFileUrl,
                        playlistEntity.title, playlistEntity.album, playlistEntity.artist,
                        playlistEntity.isExplicit, playlistEntity.navigationUrl,
                        playlistEntity.coverImageUrl, playlistEntity.lrcFileOffset));
            }

            // Set current index to 0 as default
            this.currentIndex = ko.observable(0);

            // Button applicability state
            this.isPrevButtonDisabled = ko.computed(() =>
                (!this.isLoopEnabled() && this.currentIndex() <= 0));
            this.isNextButtonDisabled = ko.computed(() =>
                (!this.isLoopEnabled() && this.currentIndex() >= this.playlistItems().length - 1));
            this.isSingleEntityPlayback = ko.observable(this.playlistItems().length <= 1);

            // If items are loaded, take the first one to stage
            this.m_initialSanityCheckVerified = this.playlistItems().length > 0;
            this.currentItem = ko.computed(() => this.playlistItems()[this.currentIndex()]);
            this.currentItem().isCurrent(true);

            // Start playback if set
            if (this.isAutoPlayEnabled()) this.play();

            // Begin metadata retrieval
            this.getMetadataForAllItemsAsync().then(() => {});
        }

        resetTimer() : void
        {
            this.m_timerViewModel.resetTimer();
        }

        loopButtonHandler() : void
        {
            this.isLoopEnabled(!this.isLoopEnabled.peek());
        }

        menuHandler() : void
        {
            this.isPlaylistExpanded(!this.isPlaylistExpanded.peek());
        }

        prevHandler() : void
        {
            if (!this.m_initialSanityCheckVerified) return;
            this.setIndex(this.currentIndex() - 1);
        }

        nextHandler() : void
        {
            if (!this.m_initialSanityCheckVerified) return;
            this.setIndex(this.currentIndex() + 1);
        }

        setIndex(index: number) : void
        setIndex(index: number, forcePlay: boolean) : void
        setIndex(index: number, forcePlay?: boolean) : void
        {
            // Check applicability state: is it okay to set index?
            // Out of bound is not allowed. If loop mode is enabled, index will be reset.
            if (index < 0 || index >= this.playlistItems().length)
            {
                if (this.isLoopEnabled())
                {
                    if (index < 0) index = this.playlistItems().length - 1;
                    else index = 0;
                }
                else
                {
                    // Request rejected
                    return;
                }
            }

            // Reset last item
            this.currentItem().isCurrent(false);
            // Set index and synchronize item
            this.currentIndex(index);
            this.currentItem().isCurrent(true);

            // Reset current item
            this.play(forcePlay ? !forcePlay : this.isPaused());
        }

        play() : void;
        play(silentSwitch: boolean) : void;
        play(silentSwitch?: boolean) : void
        {
            if (!this.m_initialSanityCheckVerified) return;
            // Assume as checked
            const entity = this.currentItem();
            // Clean up
            this.resetTimer();
            this.isPaused(true);
            this.m_lyricsViewModel.reset();
            if (!silentSwitch) soundManager.pauseAll();
            this.m_stopped = false;

            // Request LRC to load.
            // LRC ViewModel will check entity anyway
            this.m_lyricsViewModel.initializeLyrics(entity);

            // Create sound object
            this.m_currentSound = soundManager.createSound(<ISmSoundOptions>
            {
                url: entity.audioFileSrc(),
                onpause: () => {
                    // Synchronize status
                    this.isPaused(true);
                },
                onplay: () => {
                    // Synchronize status
                    this.isPaused(false);
                },
                onstop: () => {
                    // Synchronize status
                    this.isPaused(true);
                },
                onresume: () => {
                    // Synchronize status
                    this.isPaused(false);
                },
                whileplaying: () => {
                    // Update time
                    if (this.m_currentSound.duration)
                        this.m_timerViewModel.currentTime = this.m_currentSound.position;
                    // Synchronize lyrics
                    this.m_lyricsViewModel.synchronizeLyrics(this.m_currentSound.position);
                },
                onload: (success: boolean) => {
                    if (success)
                    {
                        this.m_timerViewModel.duration = this.m_currentSound.duration;
                    }
                },
                onfinish: () => {
                    // Check if continue
                    if (!this.isNextButtonDisabled())
                    {
                        this.setIndex(this.currentIndex() + 1);
                    }
                    else
                    {
                        this.m_stopped = true;
                        this.isPaused(true);
                    }
                }
            });

            if (!silentSwitch)
            {
                this.m_currentSound.stop();
                this.m_currentSound.play(<ISmSoundOptions>
                    {
                        url: entity.audioFileSrc(),
                        position: 0
                    });
                this.isPaused(false);
            }
        }

        playPauseHandler() : void
        {
            this.m_stopped = false;

            if (this.m_currentSound)
            {
                const isTransitionToPlay = this.isPaused();
                // Transition to play status
                if (isTransitionToPlay)
                {
                    soundManager.pauseAll();
                }
                this.m_currentSound.togglePause();
                // Synchronize status
                this.isPaused(!isTransitionToPlay);
            }
            else
            {
                this.play();
            }
        }

        setPosition(position: number) : Promise<boolean>
        {
            return new Promise<boolean>((resolve, reject) =>
            {
                if (this.m_currentSound && this.m_currentSound.duration)
                {
                    // If the sound has stopped, reject the request.
                    if (this.m_stopped)
                    {
                        reject(false);
                    }
                    else
                    {
                        this.m_timerViewModel.currentTime = position;
                        this.m_currentSound.setPosition(position);
                        // A little hackish: ensure UI updates immediately with current position,
                        // even if audio is buffering and hasn't moved there yet.
                        if (this.m_currentSound._iO && this.m_currentSound._iO.whileplaying)
                        {
                            this.m_currentSound._iO.whileplaying.apply(this.m_currentSound);
                        }
                        // Reset lyrics
                        this.m_lyricsViewModel.synchronizeLyrics(position, true);
                        // Accept request
                        resolve(true);
                    }
                }
                else
                {
                    reject(false);
                }
            });
        }

        onPlaylistItemClick = (item: PlaylistItemViewModel) : void =>
        {
            const index = this.playlistItems.indexOf(item);
            if (index >= 0) this.setIndex(index, true);
        };

        onPlaylistHover() : void
        {
            if (this.isMouseOnPlaylist()) return;
            this.isMouseOnPlaylist(true);
        }

        onPlaylistHoverLost() : void
        {
            if (!this.isMouseOnPlaylist()) return;
            this.isMouseOnPlaylist(false);
        }

        private async getOnlineMetadataAsync(item?: PlaylistItemViewModel)
        {
            if (!item) item = this.currentItem();
            const urlEncoded = encodeURIComponent(item.audioFileSrc());

            let reqUrl = "https://audiometadata-origin.moegirlpedia.moetransit.com/id3tag?path=" + urlEncoded;
            let coverPrefix = "https://audiometadata-origin.moegirlpedia.moetransit.com/cover/index/";

            if (this.m_debug)
            {
                reqUrl = "http://localhost:5000/id3tag?path=" + urlEncoded;
                coverPrefix = "http://localhost:5000/cover/index/";
            }

            try
            {
                const metadata = await WebClient.downloadStringAsync(reqUrl);
                if (!metadata) return;

                const metadataParsed = <OnlineMetadata> JSON.parse(metadata);
                if (!metadataParsed) return;

                // Update metadata
                if (metadataParsed.coverId)
                {
                    const cover = coverPrefix + encodeURIComponent(metadataParsed.coverId);
                    item.coverImageUrl(cover);
                }

                if (metadataParsed.title && !item.titleMetadataOverride())
                    item.titleMetadataOverride(metadataParsed.title);

                if (metadataParsed.album && !item.albumMetadataOverride())
                    item.albumMetadataOverride(metadataParsed.album);

                if (!item.artistMetadataOverride())
                {
                    if (metadataParsed.albumArtists) item.artistMetadataOverride(metadataParsed.albumArtists);
                    else if (metadataParsed.artists) item.artistMetadataOverride(metadataParsed.artists);
                }

            }
            catch (exception)
            {
                // Ignore
            }
        }

        private async getMetadataForAllItemsAsync()
        {
            const items = this.playlistItems();
            for (let i = 0; i < items.length; i++)
            {
                const itemToQuery = items[i];
                try
                {
                    await this.getOnlineMetadataAsync(itemToQuery);
                }
                catch (exception)
                {
                    // Ignore, assume as failed
                }
            }
        }

        private static newGuid(): string
        {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        }
    }
}