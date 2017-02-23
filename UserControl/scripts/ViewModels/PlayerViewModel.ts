/**
 * @license
 *
 * PlayerViewModel.ts: Core player ViewModel
 * -----------------------------------------------
 * Copyright (c) 2014, Scott Schiller. All rights reserved.
 * Copyright (c) 2016 - 2017, The Little Moe New LLC. All rights reserved.
 * Copyright (c) 2017 David Huang. All rights reserved.
 *
 * This file is part of the project 'Sm2Shim'.
 * Code released under BSD-2-Clause license.
 *
 */

/// <reference path="../../../Models/ModernPlaylist.ts" />

namespace Sm2Shim.Player.ViewModels
{
    import IModernPlaylist = Sm2Shim.Player.Models.IModernPlaylist;
    import ArgumentNullException = System.ArgumentNullException;
    import ISmSound = soundManager.ISmSound;
    import ISmSoundOptions = soundManager.ISmSoundOptions;

    class PlaylistItemViewModel
    {
        audioFileSrc: KnockoutObservable<string>;
        lrcFileSrc: KnockoutObservable<string>;
        isExplicit: KnockoutObservable<boolean>;
        navigationLink: KnockoutObservable<string>;
        tooltip: KnockoutObservable<string>;
        isCurrent: KnockoutObservable<boolean>;

        lrcTitle: string;
        lrcAlbum: string;
        lrcArtist: string;

        titleMetadataOverride: string;
        albumMetadataOverride: string;
        artistMetadataOverride: string;

        title: KnockoutObservable<string>;
        album: KnockoutObservable<string>;
        artist: KnockoutObservable<string>;

        constructor(
            audioFileSrc: string, lrcFileSrc?: string,
            titleMetadataOverride?: string, albumMetadataOverride?: string,
            artistMetadataOverride?: string, isExplicit?: boolean,
            navigationLink?: string)
        {
            this.audioFileSrc = ko.observable(audioFileSrc);
            this.lrcFileSrc = ko.observable(lrcFileSrc);
            this.titleMetadataOverride = titleMetadataOverride;
            this.albumMetadataOverride = albumMetadataOverride;
            this.artistMetadataOverride = artistMetadataOverride;
            this.isExplicit = ko.observable(isExplicit);
            this.navigationLink = ko.observable(navigationLink);
            this.lrcTitle = "";
            this.lrcAlbum = "";
            this.lrcArtist = "";
            this.isCurrent = ko.observable(false);

            this.tooltip = ko.computed(() => {
                return this.titleMetadataOverride + " " + this.artistMetadataOverride;
            });

            this.title = ko.computed(() =>
                PlaylistItemViewModel.overrideStringSelection(this.titleMetadataOverride, this.lrcTitle));
            this.artist = ko.computed(() =>
                PlaylistItemViewModel.overrideStringSelection(this.artistMetadataOverride, this.lrcArtist));
            this.album = ko.computed(() =>
                PlaylistItemViewModel.overrideStringSelection(this.albumMetadataOverride, this.lrcAlbum));

        }

        private static overrideStringSelection(
            override: string, fallback: string) : string
        {
            return (override && override != "") ? override : fallback;
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
            this.m_isChangeAllowed = true;
        }

        onInputStart() : boolean
        {
            this.m_isChangeAllowed = false;
            return true;
        }

        onInputEnd(viewModel: TimeControlViewModel, event: MouseEvent) : boolean
        {
            // Get target
            const target = <HTMLInputElement> event.target;
            // Commit change
            this.m_parent.setPosition(parseInt(target.value));
            // Unlock
            this.m_isChangeAllowed = true;
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

    export class PlayerViewModel
    {
        playlistItems: KnockoutObservableArray<PlaylistItemViewModel>;
        currentItem: KnockoutObservable<PlaylistItemViewModel>;
        currentIndex: KnockoutObservable<number>;
        isCompactMode: KnockoutObservable<boolean>;

        isPlaylistExpanded: KnockoutObservable<boolean>;
        isLoopEnabled: KnockoutObservable<boolean>;
        isAutoPlayEnabled: KnockoutObservable<boolean>;
        initialSanityCheckVerified: boolean;

        isPrevButtonDisabled: KnockoutObservable<boolean>;
        isNextButtonDisabled: KnockoutObservable<boolean>;
        isSingleEntityPlayback: KnockoutObservable<boolean>;
        isPlaying: KnockoutObservable<boolean>;
        isPaused: KnockoutObservable<boolean>;
        isGrabbing: KnockoutObservable<boolean>;

        timerViewModel: KnockoutObservable<TimeControlViewModel>;

        currentSound: ISmSound;

        constructor(playlist: IModernPlaylist)
        {
            if (!playlist) throw new ArgumentNullException("playlist");

            // Initialize collections
            this.playlistItems = ko.observableArray<PlaylistItemViewModel>();
            this.isPlaylistExpanded = ko.observable(playlist.isPlaylistOpen);
            this.isLoopEnabled = ko.observable(playlist.loop);
            this.isAutoPlayEnabled = ko.observable(playlist.autoPlay);
            this.isPaused = ko.observable(true);
            this.isPlaying = ko.computed(() => !this.isPaused());
            this.isCompactMode = ko.observable(playlist.compactMode);
            this.isGrabbing = ko.observable(false);
            this.timerViewModel = ko.observable(new TimeControlViewModel(this));

            // Load playlist
            let i: number;
            for (i = 0; i < playlist.playlist.length; i++)
            {
                const playlistEntity = playlist.playlist[i];
                if (!playlistEntity || !playlistEntity.audioFileUrl) continue;
                const title = playlistEntity.title ? playlistEntity.title : "Unknown Title";
                const artist = playlistEntity.artist ? playlistEntity.artist : "Unknown Artist";
                const album = playlistEntity.album ? playlistEntity.album : "Unknown Album";

                this.playlistItems.push(
                    new PlaylistItemViewModel(playlistEntity.audioFileUrl, playlistEntity.lrcUrl,
                        title, album, artist, playlistEntity.isExplicit, playlistEntity.navigationUrl));
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
            this.initialSanityCheckVerified = this.playlistItems().length > 0;
            this.currentItem = ko.computed(() => this.playlistItems()[this.currentIndex()]);
            this.currentItem().isCurrent(true);

            // Start playback if set
            if (this.isAutoPlayEnabled()) this.play();

        }

        resetTimer() : void
        {
            this.timerViewModel().resetTimer();
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
            if (!this.initialSanityCheckVerified) return;
            this.setIndex(this.currentIndex() - 1);
        }

        nextHandler() : void
        {
            if (!this.initialSanityCheckVerified) return;
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
            if (!this.initialSanityCheckVerified) return;
            // Assume as checked
            const entity = this.currentItem();
            // Clean up
            this.resetTimer();
            this.isPaused(true);
            if (!silentSwitch) soundManager.pauseAll();

            // Create sound object
            this.currentSound = soundManager.createSound(<ISmSoundOptions>
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
                    if (this.currentSound.duration)
                    {
                        this.timerViewModel().currentTime = this.currentSound.position;
                    }
                },
                onload: (success: boolean) => {
                    if (success)
                    {
                        this.timerViewModel().duration = this.currentSound.duration;
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
                        this.isPaused(true);
                    }
                }
            });

            if (!silentSwitch)
            {
                this.currentSound.stop();
                this.currentSound.play(<ISmSoundOptions>
                    {
                        url: entity.audioFileSrc(),
                        position: 0
                    });
                this.isPaused(false);
            }
        }

        playPauseHandler() : void
        {
            if (this.currentSound)
            {
                const isTransitionToPlay = this.isPaused();
                // Transition to play status
                if (isTransitionToPlay) soundManager.pauseAll();
                this.currentSound.togglePause();
                // Synchronize status
                this.isPaused(!isTransitionToPlay);
            }
            else
            {
                this.play();
            }
        }

        setPosition(position: number) : void
        {
            if (this.currentSound && this.currentSound.duration)
            {
                this.timerViewModel().currentTime = position;
                this.currentSound.setPosition(position);
                // A little hackish: ensure UI updates immediately with current position,
                // even if audio is buffering and hasn't moved there yet.
                if (this.currentSound._iO && this.currentSound._iO.whileplaying)
                {
                    this.currentSound._iO.whileplaying.apply(this.currentSound);
                }
            }
        }

        onPlaylistItemClick = (item: PlaylistItemViewModel) : void =>
        {
            const index = this.playlistItems.indexOf(item);
            if (index >= 0) this.setIndex(index, true);
        }

        private static isRightClick(e: MouseEvent) : boolean
        {
            // Only pay attention to left clicks.
            // Old IE differs where there's no e.which, but e.button is 1 on left click.
            if (e && ((e.which && e.which === 3) || (e.which === undefined && e.button !== 1)))
            {
                // http://www.quirksmode.org/js/events_properties.html#button
                return true;
            }
        }
    }
}