/**
 * Sm2Player.ts: Core player component for Sm2Shim
 *
 * Copyright (c) 2014, Scott Schiller. All rights reserved.
 * Copyright (c) 2016 - 2017, The Little Moe New LLC. All rights reserved.
 *
 * This file is part of the project 'Sm2Shim'.
 * Code released under BSD-2-Clause license.
 *
 */

/// <reference path="../Options/PlayerOptions.ts" />
/// <reference path="../Library/SoundManager2.d.ts" />
/// <reference path="../Framework/NotImplementedException.ts" />
/// <reference path="../Utils/Utils.ts" />
/// <reference path="../Utils/ParamUtils.ts" />

namespace Sm2Shim.Player
{

    import cssUtils = Sm2ShimUtils.CssUtils;
    import domUtils = Sm2ShimUtils.DomUtils;
    import eventUtils = Sm2ShimUtils.EventUtils;
    import positionUtils = Sm2ShimUtils.PositionUtils;
    import styleUtils = Sm2ShimUtils.StyleUtils;
    
    import ISmSound = soundManager.ISmSound;
    import ISmSoundOptions = soundManager.ISmSoundOptions;
    import Sm2PlayerOption = Sm2Shim.Options.Sm2PlayerOption;

    export interface ISm2PlayerDomElements
    {
        o: HTMLElement;
        playlist: HTMLElement;
        playlistTarget: HTMLElement;
        playlistContainer: HTMLElement;
        time: HTMLElement;
        player: HTMLElement;
        progress: HTMLElement;
        progressTrack: HTMLElement;
        progressBar: HTMLElement;
        duration: HTMLElement;
        volume: HTMLElement
    }

    export interface ISm2PlayerEventCallbacks
    {
        play: (player: Sm2Player) => void;
        finish: (player: Sm2Player) => void;
        pause: (player: Sm2Player) => void;
        error: (player: Sm2Player) => void;
        end: (player: Sm2Player) => void;
    }

    export interface ISm2PlayerCssDefinition
    {
        disabled: string;
        selected: string;
        active: string;
        legacy: string;
        noVolume: string;
        playlistOpen: string;
    }

    export class Sm2Player
    {
        private playerNode: HTMLElement;

        private css = <ISm2PlayerCssDefinition>
        {
            disabled: 'disabled',
            selected: 'selected',
            active: 'active',
            legacy: 'legacy',
            noVolume: 'no-volume',
            playlistOpen: 'playlist-open'
        };
        private extras =
        {
            loadFailedCharacter: '<span title="Failed to load/play." class="load-error">✖</span>'
        };
        private playerOptions = <Sm2PlayerOption>
        {
            stopOtherSounds: true,
            excludeClass: 'sm2-exclude'
        };

        private firstOpen: boolean;
        private failureCount = 0;
        private failureThreshold = 5;
        private soundObject: soundManager.ISmSound;
        private defaultVolume: number;
        private isGrabbing: boolean;

        playlistController: Sm2PlaylistController;
        on: ISm2PlayerEventCallbacks;
        dom = <ISm2PlayerDomElements>
            {
                o: null,
                playlist: null,
                playlistTarget: null,
                playlistContainer: null,
                time: null,
                player: null,
                progress: null,
                progressTrack: null,
                progressBar: null,
                duration: null,
                volume: null
            };

        private self = this;

        constructor(playerNode: HTMLElement)
        {
            this.playerNode = playerNode;
            this.defaultVolume = soundManager.defaultOptions.volume;

            (<any>window).sm2BarPlayerOptions = this.playerOptions;

            if (!this.playerNode)
            {
                console.warn('Sm2Player.constructor(): No playerNode element?');
            }

            this.dom.o = playerNode;

            // are we dealing with a crap browser? apply legacy CSS if so.
            if (window.navigator.userAgent.match(/msie [678]/i))
            {
                cssUtils.addClass(this.dom.o, this.css.legacy);
            }

            if (window.navigator.userAgent.match(/mobile/i))
            {
                // Majority of mobile devices don't let HTML5 audio set volume.
                cssUtils.addClass(this.dom.o, this.css.noVolume);
            }

            this.dom.progress = domUtils.get(this.dom.o, '.sm2-progress-ball');
            this.dom.progressTrack = domUtils.get(this.dom.o, '.sm2-progress-track');
            this.dom.progressBar = domUtils.get(this.dom.o, '.sm2-progress-bar');
            this.dom.volume = domUtils.get(this.dom.o, 'a.sm2-volume-control');

            // Measure volume control dimensions

            this.dom.duration = domUtils.get(this.dom.o, '.sm2-inline-duration');
            this.dom.time = domUtils.get(this.dom.o, '.sm2-inline-time');

            this.playlistController = new Sm2PlaylistController(this, this.dom, this.css);

            const defaultItem = this.playlistController.getItem(0);
            this.playlistController.select(defaultItem);
            this.isGrabbing = false;

            if (defaultItem)
            {
                this.setTitle(defaultItem);
            }

            // Register events
            eventUtils.add<MouseEvent>(this.dom.o, 'mousedown', (e: MouseEvent) => this.handleMouseDown(e));
            eventUtils.add<MouseEvent>(this.dom.o, 'click', (e: MouseEvent) => this.handleClick(e));
            eventUtils.add<MouseEvent>(document, 'mousemove', this.handleMouse.bind(this));
            eventUtils.add<MouseEvent>(document, 'mouseup', this.releaseMouse.bind(this));
            eventUtils.add<MouseEvent>(this.dom.progressTrack, 'mousedown', (e: MouseEvent) =>
            {
                if (Sm2Player.isRightClick(e))
                {
                    return true;
                }

                this.isGrabbing = true;
                cssUtils.addClass(this.dom.o, 'grabbing');

                return this.handleMouse(e);
            });

            // Platform specific operations
            // Start playing if class is set on desktop devices
            if (!window.navigator.userAgent.match(/mobile/i))
            {
                if (cssUtils.hasClass(this.dom.o, 'auto-play')) {
                    window.setTimeout(() =>
                    {
                        this.playlistController.playItemByOffset(0);
                    }, 2);
                }
            }

            // Set repeat attribute if class is set
            if (cssUtils.hasClass(this.dom.o, 'repeat-playback')) {

                window.setTimeout(() =>
                {
                    this.playlistController.data.loopMode = true;
                    // Toggle button
                    cssUtils.toggleClass(
                        <HTMLElement>domUtils.get(this.dom.o, '.sm2-icon-repeat').parentNode,
                        this.css.active);
                }, 2);

            }
        }

        private stopOtherSounds() : void
        {
            if (this.playerOptions.stopOtherSounds) soundManager.stopAll();
        }

        playLink(link: HTMLLinkElement) : void
        {
            const mediaFileSrc = link.getAttribute(Sm2Shim.Options.FileSrcAttribute);
            // If a link is OK, play it.
            if (soundManager.canPlayURL(mediaFileSrc))
            {
                // If there's a timer due to failure to play one track, cancel it.
                // catches case when user may use previous/next after an error.
                if (this.playlistController.data.timer)
                {
                    window.clearTimeout(this.playlistController.data.timer);
                    this.playlistController.data.timer = null;
                }

                if (!this.soundObject)
                {
                    this.soundObject = this.makeSound(mediaFileSrc);
                }

                // Required to reset pause/play state on iOS so whileplaying() works? odd.
                this.soundObject.stop();

                this.playlistController.select(<HTMLElement> link.parentNode);
                this.setTitle(<HTMLElement> link.parentNode);

                // Reset the UI
                // TODO: function that also resets/hides timing info.
                this.dom.progress.style.left = '0px';
                this.dom.progressBar.style.width = '0px';

                this.stopOtherSounds();

                this.soundObject.play(<ISmSoundOptions>
                {
                    url: mediaFileSrc,
                    position: 0
                });
            }
        }

        private makeSound(path: string) : ISmSound
        {
            const self = this;
            return soundManager.createSound(<ISmSoundOptions>
            {
                url: path,
                volume: this.defaultVolume,
                whileplaying: function()
                {
                    const progressMaxLeft = 100;
                    let left,
                        width;

                    left = Math.min(progressMaxLeft,
                            Math.max(0, (progressMaxLeft * (this.position / this.durationEstimate)))) + '%';

                    width = Math.min(100,
                            Math.max(0, (100 * this.position / this.durationEstimate))) + '%';

                    if (this.duration)
                    {

                        self.dom.progress.style.left = left;
                        self.dom.progressBar.style.width = width;

                        // TODO: only write changes
                        self.dom.time.innerHTML = Sm2Shim.Player.Sm2Player.getTime(this.position, true);
                    }

                },
                whileloading: function()
                {
                    if (!this.isHTML5)
                    {
                        self.dom.duration.innerHTML = Sm2Shim.Player.Sm2Player.getTime(this.durationEstimate, true);
                    }
                },
                onbufferchange: (isBuffering: boolean) =>
                {
                    (isBuffering ?
                        cssUtils.addClass :
                        cssUtils.removeClass)(this.dom.o, 'buffering');
                },
                onplay: () =>
                {
                    cssUtils.swapClass(this.dom.o, 'paused', 'playing');
                    this.callback('play');
                },
                onpause: () =>
                {
                    cssUtils.swapClass(this.dom.o, 'playing', 'paused');
                    this.callback('pause');
                },
                onresume: () =>
                {
                    cssUtils.swapClass(this.dom.o, 'paused', 'playing');
                },
                onload: function (success: boolean)
                {
                    if (success)
                    {
                        self.dom.duration.innerHTML = Sm2Shim.Player.Sm2Player.getTime(this.duration, true);
                        // Clear failure count.
                        self.failureCount = 0;
                    }
                    // Undocumented: Sm2Sound doesn't mention this
                    // Shall we explore it ourselves and document it?
                    else if ((<any>this)._iO && (<any>this)._iO.onerror)
                    {
                        (<any>this)._iO.onerror();
                    }
                },
                onerror: () =>
                {
                    // Increment failure count.
                    this.failureCount++;

                    // Stop auto playback if we failed more than 5 times.
                    if (this.failureCount >= this.failureThreshold &&
                        this.playlistController.data.loopMode)
                    {
                        this.playlistController.data.loopMode = false;
                        // Toggle button
                        cssUtils.toggleClass(
                            <HTMLElement>domUtils.get(this.dom.o, '.sm2-icon-repeat').parentNode,
                            this.css.active);
                    }

                    // sound failed to load.
                    let item, element, html;

                    item = this.playlistController.getItem();

                    if (item)
                    {

                        // note error, delay 2 seconds and advance?
                        // playlistTarget.innerHTML = '<ul class="sm2-playlist-bd"><li>' + item.innerHTML + '</li></ul>';

                        if (this.extras.loadFailedCharacter)
                        {
                            this.dom.playlistTarget.innerHTML =
                                this.dom.playlistTarget.innerHTML.replace('<li>',
                                    '<li>' + this.extras.loadFailedCharacter + ' ');
                            if (this.playlistController.data.playlist &&
                                this.playlistController.data.playlist[this.playlistController.data.selectedIndex]) {
                                element = this.playlistController.data.playlist[this.playlistController.data.selectedIndex]
                                    .getElementsByTagName('a')[0];
                                html = element.innerHTML;
                                if (html.indexOf(this.extras.loadFailedCharacter) === -1)
                                {
                                    element.innerHTML = this.extras.loadFailedCharacter + ' ' + html;
                                }
                            }
                        }
                    }

                    this.callback('error');

                    // Load next track, possibly with delay.

                    if (navigator.userAgent.match(/mobile/i)) {
                        // Mobile will likely block the next play() call if there is a setTimeout() - so don't use one here.
                        this.actions.next();
                    } else {
                        if (this.playlistController.data.timer)
                        {
                            window.clearTimeout(this.playlistController.data.timer);
                        }
                        this.playlistController.data.timer = window.setTimeout(this.actions.next, 2000);
                    }
                },
                onstop: () =>
                {
                    cssUtils.removeClass(this.dom.o, 'playing');
                },
                onfinish: function()
                {

                    cssUtils.removeClass(self.dom.o, 'playing');
                    self.dom.progress.style.left = '0%';
                    const lastIndex = self.playlistController.data.selectedIndex;

                    self.callback('finish');

                    // Next track?
                    const item = self.playlistController.getNext();

                    // Don't play the same item over and over again, if at end of playlist etc.
                    // Or if there is only one item and loop mode is on - play again
                    if (item && self.playlistController.data.selectedIndex !== lastIndex ||
                        item && self.playlistController.data.loopMode)
                    {
                        self.playlistController.select(item);
                        self.setTitle(item);
                        self.stopOtherSounds();

                        // Play next track
                        this.play(<ISmSoundOptions>
                        {
                            url: self.playlistController.getURL()
                        });

                    }
                    else
                    {
                        // end of playlist case
                        // explicitly stop?
                        // this.stop();

                        self.callback('end');
                    }
                }
            });
        }

        private setTitle(item: HTMLElement) : void
        {
            // given a link, update the "now playing" UI.

            // if this is an <li> with an inner link, grab and use the text from that.
            const links = item.getElementsByTagName('a');

            if (links.length)
            {
                item = links[0];
            }

            // remove any failed character sequence, also
            this.dom.playlistTarget.innerHTML =
                '<ul class="sm2-playlist-bd"><li>' +
                item.innerHTML.replace(this.extras.loadFailedCharacter, '') +
                '</li></ul>';

            if (this.dom.playlistTarget.getElementsByTagName('li')[0].scrollWidth >
                this.dom.playlistTarget.offsetWidth)
            {
                // this item can use <marquee>, in fact.
                this.dom.playlistTarget.innerHTML = '<ul class="sm2-playlist-bd"><li><marquee>' +
                    item.innerHTML + '</marquee></li></ul>';
            }
        }

        private static getTime(msec, useString) : any
        {

            // convert milliseconds to hh:mm:ss, return as object literal or string
            const nSec = Math.floor(msec / 1000),
                hh = Math.floor(nSec / 3600),
                min = Math.floor(nSec / 60) - Math.floor(hh * 60),
                sec = Math.floor(nSec - (hh * 3600) - (min * 60));

            // if (min === 0 && sec === 0) return null; // return 0:00 as null
            return (useString ?
                    ((hh ? hh + ':' : '') + (hh && min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec)) :
                    {
                        'min': min,
                        'sec': sec
                    });
        }

        private callback(method: string) : void
        {
            if (method)
            {
                // Fire callback, passing current turntable object
                if (this.on && this.on[method])
                {
                    this.on[method](this);
                }
            }
        }

        // Event handlers
        private actionData =
        {
            volume:
            {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                backgroundSize: 0
            }
        };

        actions =
        {
            /**
             * This is an overloaded function that takes mouse/touch events or offset-based item indices.
             * Remember, "auto-play" will not work on mobile devices unless this function is called
             * immediately from a touch or click event.
             * If you have the link but not the offset, you can also pass a fake event object with a
             * target of an <a> inside the playlist - e.g. { target: someMP3Link }
             */
            play: function (offsetOrEvent: any) : any
            {
                let target,
                    mediaFileSrc,
                    e;

                if (offsetOrEvent !== undefined && !isNaN(offsetOrEvent))
                {
                    // Smells like a number.
                    return this.self.playlistController.playItemByOffset(offsetOrEvent);
                }

                // DRY things a bit
                e = offsetOrEvent;

                if (e && e.target)
                {
                    target = e.target || e.srcElement;
                    mediaFileSrc = target.getAttribute(Sm2Shim.Options.FileSrcAttribute);
                }

                // Hack - if null due to no event, OR '#' due to play/pause link, get first link from playlist
                if (!mediaFileSrc || mediaFileSrc.indexOf('#') !== -1) {
                    mediaFileSrc = this.self.dom.playlist.getElementsByTagName('a')[0].getAttribute(
                        Sm2Shim.Options.FileSrcAttribute);
                }

                if (!this.self.soundObject)
                {
                    this.self.soundObject = this.self.makeSound(mediaFileSrc);
                }

                // Edge case: if the current sound is not playing, stop all others.
                if (!this.self.soundObject.playState)
                {
                    this.self.stopOtherSounds();
                }

                this.self.soundObject.togglePause();

                // Special case: clear "play next" timeout, if one exists.
                // Edge case: user pauses after a song failed to load.
                if (this.self.soundObject.paused &&
                    this.self.playlistController.data.timer)
                {
                    window.clearTimeout(this.self.playlistController.data.timer);
                    this.self.playlistController.data.timer = null;
                }
            },
            pause: () =>
            {
                if (this.self.soundObject && this.self.soundObject.readyState)
                {
                    this.self.soundObject.pause();
                }
            },
            resume: () =>
            {
                if (this.self.soundObject && this.self.soundObject.readyState)
                {
                    this.self.soundObject.resume();
                }
            },
            stop: () =>
            {
                // Just an alias for pause, really.
                // Don't actually stop because that will mess up some UI state, i.e., dragging the slider.
                return this.actions.pause();
            },
            next: () =>
            {
                let item, lastIndex;

                // Special case: clear "play next" timeout, if one exists.
                if (this.playlistController.data.timer)
                {
                    window.clearTimeout(this.playlistController.data.timer);
                    this.playlistController.data.timer = null;
                }

                lastIndex = this.playlistController.data.selectedIndex;

                item = this.playlistController.getNext();

                // don't play the same item again
                if (item &&
                    this.playlistController.data.selectedIndex !== lastIndex)
                {
                    this.playLink(item.getElementsByTagName('a')[0]);
                }
            },
            prev: () =>
            {
                let item, lastIndex;

                lastIndex = this.playlistController.data.selectedIndex;
                item = this.playlistController.getPrevious();

                // don't play the same item again
                if (item && this.playlistController.data.selectedIndex !== lastIndex)
                {
                    this.playLink(item.getElementsByTagName('a')[0]);
                }
            },
            repeat: (e: any) =>
            {
                const target = (e ? e.target || e.srcElement : domUtils.get(this.dom.o, '.repeat'));

                if (target && !cssUtils.hasClass(target, this.css.disabled))
                {
                    cssUtils.toggleClass(target.parentNode, this.css.active);
                    this.playlistController.data.loopMode = !this.playlistController.data.loopMode;
                }
            },
            menu: (ignoreToggle: any) =>
            {
                let isOpen;

                isOpen = cssUtils.hasClass(this.dom.o, this.css.playlistOpen);

                // Hackish: reset scrollTop in default first open case. odd, but some browsers have a non-zero scroll offset the first time the playlist opens.
                if (this.playlistController &&
                    !this.playlistController.data.selectedIndex && !this.firstOpen)
                {
                    this.dom.playlist.scrollTop = 0;
                    this.firstOpen = true;
                }

                // Sniff out booleans from mouse events, as this is referenced directly by event handlers.
                if (typeof ignoreToggle !== 'boolean' || !ignoreToggle)
                {
                    if (!isOpen)
                    {
                        // Explicitly set height:0, so the first closed -> open animation runs properly
                        this.dom.playlistContainer.style.height = '0px';
                    }

                    isOpen = cssUtils.toggleClass(this.dom.o, this.css.playlistOpen);
                }

                // Playlist
                this.dom.playlistContainer.style.height =
                    (isOpen ? this.dom.playlistContainer.scrollHeight : 0) + 'px';
            },
            adjustVolume: function (e: any)
            {
                /**
                 * NOTE: this is the mousemove() event handler version.
                 * Use setVolume(50), etc., to assign volume directly.
                 */

                let backgroundMargin,
                    pixelMargin,
                    target,
                    volume;

                target = this.dom.volume;

                // safety net
                if (e === undefined)
                {
                    return false;
                }

                if (!e || e.clientX === undefined)
                {
                    // called directly or with a non-mouseEvent object, etc.
                    // proxy to the proper method.
                    if (arguments.length && window.console && window.console.warn)
                    {
                        console.warn('Bar UI: call setVolume(' + e + ') instead of adjustVolume(' + e + ').');
                    }
                    return this.actions.setVolume.apply(this, arguments);
                }

                // based on getStyle() result
                // figure out spacing around background image based on background size, eg. 60% background size.
                // 60% wide means 20% margin on each side.
                backgroundMargin = (100 - this.actionData.volume.backgroundSize) / 2;

                // relative position of mouse over element
                const value = Math.max(0,
                    Math.min(1, (e.clientX - this.actionData.volume.x) / this.actionData.volume.width));

                target.style.clip = 'rect(0px, ' +
                    (this.actionData.volume.width * value) + 'px, ' + this.actionData.volume.height + 'px, ' +
                    (this.actionData.volume.width * (backgroundMargin / 100)) + 'px)';

                // determine logical volume, including background margin
                pixelMargin = ((backgroundMargin / 100) * this.actionData.volume.width);

                volume = Math.max(0, Math.min(1, ((e.clientX - this.actionData.volume.x) - pixelMargin) /
                        (this.actionData.volume.width - (pixelMargin * 2)))) * 100;

                // set volume
                if (this.soundObject)
                {
                    this.soundObject.setVolume(volume);
                }

                this.defaultVolume = volume;

                return eventUtils.preventDefault(e);
            },
            releaseVolume: function()
            {
                eventUtils.remove(document, 'mousemove', this.actions.adjustVolume);
                eventUtils.remove(document, 'mouseup', this.actions.releaseVolume);
            },
            setVolume: function(volume : number)
            {
                // Set volume (0-100) and update volume slider UI.
                let backgroundSize,
                    backgroundMargin,
                    backgroundOffset,
                    target,
                    from,
                    to;

                if (volume === undefined || isNaN(volume))
                {
                    return;
                }

                if (this.dom.volume)
                {

                    target = this.dom.volume;
                    // based on getStyle() result
                    backgroundSize = this.actionData.volume.backgroundSize;
                    // figure out spacing around background image based on background size, eg. 60% background size.
                    // 60% wide means 20% margin on each side.
                    backgroundMargin = (100 - backgroundSize) / 2;
                    // margin as pixel value relative to width
                    backgroundOffset = this.actionData.volume.width * (backgroundMargin / 100);
                    from = backgroundOffset;
                    to = from + ((this.actionData.volume.width - (backgroundOffset * 2)) * (volume / 100));
                    target.style.clip = 'rect(0px, ' + to + 'px, ' + this.actionData.volume.height + 'px, ' + from + 'px)';
                }

                // apply volume to sound, as applicable
                if (this.soundObject)
                {
                    this.soundObject.setVolume(volume);
                }

                this.defaultVolume = volume;
            },
            self: this
        };

        private static isRightClick(e: MouseEvent) : boolean
        {
            // only pay attention to left clicks. old IE differs where there's no e.which, but e.button is 1 on left click.
            if (e && ((e.which && e.which === 2) || (e.which === undefined && e.button !== 1)))
            {
                // http://www.quirksmode.org/js/events_properties.html#button
                return true;
            }
        }

        private getActionData(target: any) : any
        {
            // DOM measurements for volume slider

            if (!target)
            {
                return false;
            }

            this.actionData.volume.x = positionUtils.getOffX(target);
            this.actionData.volume.y = positionUtils.getOffY(target);

            this.actionData.volume.width = target.offsetWidth;
            this.actionData.volume.height = target.offsetHeight;

            // potentially dangerous: this should, but may not be a percentage-based value.
            this.actionData.volume.backgroundSize = parseInt(styleUtils.get(target, 'background-size'), 10);

            // IE gives pixels even if background-size specified as % in CSS. Boourns.
            if (window.navigator.userAgent.match(/msie|trident/i))
            {
                this.actionData.volume.backgroundSize =
                    (this.actionData.volume.backgroundSize / this.actionData.volume.width) * 100;
            }
        }

        private handleMouse (e: MouseEvent) : any
        {
            if (this.isGrabbing)
            {
                let target, barX, barWidth, x, newPosition, sound;

                target = this.dom.progressTrack;

                barX = positionUtils.getOffX(target);
                barWidth = target.offsetWidth;

                x = (e.clientX - barX);

                newPosition = (x / barWidth);

                // Sanity check: Overflow prevention
                if (newPosition >= 1) newPosition = 1;

                sound = this.soundObject;

                if (sound && sound.duration)
                {
                    sound.setPosition(sound.duration * newPosition);
                    // A little hackish: ensure UI updates immediately with current position,
                    // even if audio is buffering and hasn't moved there yet.
                    if (sound._iO && sound._iO.whileplaying)
                    {
                        sound._iO.whileplaying.apply(sound);
                    }
                }

                if (e.preventDefault)
                {
                    e.preventDefault();
                }
            }

            return false;
        }

        // Local Events
        private handleMouseDown(e: MouseEvent)
        {
            let links,
                target;

            target = e.target || e.srcElement;

            if (Sm2Player.isRightClick(e))
            {
                return true;
            }

            // normalize to <a>, if applicable.
            if (target.nodeName.toLowerCase() !== 'a')
            {
                links = target.getElementsByTagName('a');
                if (links && links.length)
                {
                    target = target.getElementsByTagName('a')[0];
                }

            }

            if (cssUtils.hasClass(target, 'sm2-volume-control'))
            {
                // drag case for volume
                this.getActionData(target);

                eventUtils.add(document, 'mousemove', this.actions.adjustVolume.bind(this));
                eventUtils.add(document, 'mouseup', this.actions.releaseVolume.bind(this));

                // and apply right away
                return this.actions.adjustVolume(e);
            }
        }

        private releaseMouse(e: MouseEvent) : boolean
        {
            this.isGrabbing = false;
            cssUtils.removeClass(this.dom.o, 'grabbing');
            eventUtils.preventDefault(e);
            return false;
        }

        private handleClick(e: MouseEvent)
        {
            let evt,
                target,
                offset,
                targetNodeName,
                mediaFileSrc,
                handled;

            evt = (e || window.event);
            target = evt.target || evt.srcElement;

            if (target && target.nodeName)
            {
                targetNodeName = target.nodeName.toLowerCase();
                if (targetNodeName !== 'a')
                {
                    // old IE (IE 8) might return nested elements inside the <a>, eg., <b> etc. Try to find the parent <a>.
                    if (target.parentNode)
                    {
                        do
                        {
                            target = target.parentNode;
                            targetNodeName = target.nodeName.toLowerCase();
                        }
                        while (targetNodeName !== 'a' && target.parentNode);

                        if (!target)
                        {
                            // something went wrong. bail.
                            return false;
                        }
                    }
                }

                if (targetNodeName === 'a')
                {
                    // yep, it's a link.
                    mediaFileSrc = target.getAttribute(Sm2Shim.Options.FileSrcAttribute);
                    if (soundManager.canPlayURL(mediaFileSrc))
                    {
                        // not excluded
                        if (!cssUtils.hasClass(target, this.playerOptions.excludeClass))
                        {
                            // find this in the playlist
                            this.playLink(target);
                            handled = true;
                        }
                    }
                    else
                    {
                        // is this one of the action buttons, eg., play/pause, volume, etc.?
                        offset = target.href.lastIndexOf('#');

                        if (offset !== -1)
                        {
                            // Assume as handled
                            handled = true;
                            const methodName = target.href.substr(offset + 1);

                            switch (methodName)
                            {
                                case "play":
                                    this.actions.play(e);
                                    break;
                                case "pause":
                                    this.actions.pause();
                                    break;
                                case "prev":
                                    this.actions.prev();
                                    break;
                                case "next":
                                    this.actions.next();
                                    break;
                                case "repeat":
                                    this.actions.repeat(e);
                                    break;
                                case "menu":
                                    this.actions.menu(e);
                                    break;
                                default:
                                    handled = false;
                            }
                        }
                    }

                    // fall-through case
                    if (handled)
                    {
                        // prevent browser fall-through
                        return eventUtils.preventDefault(evt);
                    }
                }
            }
        }

    }
}