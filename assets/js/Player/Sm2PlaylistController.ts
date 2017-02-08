/**
 * Sm2PlaylistController.ts: Core player component for Sm2Shim
 *
 * Copyright (c) 2014, Scott Schiller. All rights reserved.
 * Copyright (c) 2016 - 2017, The Little Moe New LLC. All rights reserved.
 *
 * This file is part of the project 'Sm2Shim'.
 * Code released under BSD-2-Clause license.
 *
 */

/// <reference path="../Options/PlayerOptions.ts" />
/// <reference path="../Framework/SoundManager2.d.ts" />
/// <reference path="../Utils/Utils.ts" />

namespace Sm2Shim.Player
{

    import domUtils = Sm2ShimUtils.DomUtils;
    import cssUtils = Sm2ShimUtils.CssUtils;

    export class Sm2PlaylistController
    {
       
        data = <ISm2PlaylistData>
        {
            // list of nodes?
            playlist: null,
            // NOTE: not implemented yet.
            // shuffledIndex: [],
            // shuffleMode: false,
            // selection
            selectedIndex: 0,
            loopMode: false,
            timer: null
        };

        css: ISm2PlayerCssDefinition;
        dom: ISm2PlayerDomElements;

        player: Sm2Player;
        defaultVolume: number;

        constructor(player: Sm2Player,
            dom: ISm2PlayerDomElements,
            css: ISm2PlayerCssDefinition)
        {
            this.player = player;
            this.dom = dom;
            this.css = css;

            // inherit the default SM2 volume
            this.defaultVolume = soundManager.defaultOptions.volume;

            // Initialize DOM
            this.initDOM();
            this.refreshDOM();

            // animate playlist open, if HTML classname indicates so.
            if (Sm2ShimUtils.CssUtils.hasClass(this.dom.o, this.css.playlistOpen)) {
                // hackish: run this after API has returned
                window.setTimeout(function() {
                    // TODO: Implement action
                    // actions.menu(true);
                }, 1);
            }
        }

        getPlaylist() : any {
            return this.data.playlist;
        }

        getItem(offset?: number) : any
        {
            let list,
                item;

            // given the current selection (or an offset), return the current item.

            // if currently null, may be end of list case. bail.
            if (this.data.selectedIndex === null)
            {
                return offset;
            }

            list = this.getPlaylist();

            // use offset if provided, otherwise take default selected.
            offset = (offset !== undefined ? offset : this.data.selectedIndex);

            // safety check - limit to between 0 and list length
            offset = Math.max(0, Math.min(offset, list.length));

            item = list[offset];

            return item;
        }

        getNext() : any
        {
            // don't increment if null.
            if (this.data.selectedIndex !== null) {
                this.data.selectedIndex++;
            }

            if (this.data.playlist.length > 1)
            {
                if (this.data.selectedIndex >= this.data.playlist.length)
                {
                    if (this.data.loopMode)
                    {
                        // Loop to beginning
                        this.data.selectedIndex = 0;
                    }
                    else
                    {
                        // No change
                        this.data.selectedIndex--;
                        // End playback
                        // data.selectedIndex = null;
                    }
                }
            }
            else
            {
                if (this.data.loopMode)
                {
                    // Play again
                    this.data.selectedIndex = 0;
                }
                else
                {
                    this.data.selectedIndex = null;
                }
            }

            return this.getItem();
        }

        getPrevious() : any
        {
            this.data.selectedIndex--;

            if (this.data.selectedIndex < 0) {
                // wrapping around beginning of list? loop or exit.
                if (this.data.loopMode) {
                    this.data.selectedIndex = this.data.playlist.length - 1;
                } else {
                    // undo
                    this.data.selectedIndex++;
                }
            }

            return this.getItem();
        }

        getURL() : string
        {
            // return URL of currently-selected item
            let item, url;

            item = this.getItem();

            if (item) {
                url = item.getElementsByTagName('a')[0].getAttribute(Sm2Shim.Options.FileSrcAttribute);
            }

            return url;
        }

        playItemByOffset(offset: number) : void
        {
            offset = (offset || 0);

            const item = this.getItem(offset);

            if (item)
            {
                this.player.playLink(item.getElementsByTagName('a')[0]);
            }
        }

        select(item: HTMLElement) : void
        {

            let offset,
                itemTop,
                itemBottom,
                containerHeight,
                scrollTop,
                itemPadding,
                liElement;

            // remove last selected, if any
            this.resetLastSelected();

            if (item) {

                liElement = domUtils.ancestor('li', item);

                cssUtils.addClass(liElement, this.css.selected);

                itemTop = item.offsetTop;
                itemBottom = itemTop + item.offsetHeight;
                containerHeight = this.dom.playlistContainer.offsetHeight;
                scrollTop = this.dom.playlist.scrollTop;
                itemPadding = 8;

                if (itemBottom > containerHeight + scrollTop) {
                    // bottom-align
                    this.dom.playlist.scrollTop = itemBottom - containerHeight + itemPadding;
                } else if (itemTop < scrollTop) {
                    // top-align
                    this.dom.playlist.scrollTop = item.offsetTop - itemPadding;
                }

            }

            // update selected offset, too.
            offset = this.findOffsetFromItem(liElement);

            this.data.selectedIndex = offset;
        }

        refresh() : any
        {
            return this.refreshDOM();
        }

        private findOffsetFromItem(item) : any
        {
            // given an <li> item, find it in the playlist array and return the index.
            let list,
                i,
                j,
                offset;

            offset = -1;

            list = this.getPlaylist();

            if (list) {

                for (i = 0, j = list.length; i < j; i++) {
                    if (list[i] === item) {
                        offset = i;
                        break;
                    }
                }

            }

            return offset;
        }

        private resetLastSelected() : void
        {
            // remove UI highlight(s) on selected items.
            let i, j;

            const items = domUtils.getAll(this.dom.playlist, '.' + this.css.selected);

            for (i = 0, j = items.length; i < j; i++) {
                cssUtils.removeClass(items[i], this.css.selected);
            }
        }

        private initDOM() : void
        {
            this.dom.playlistTarget = domUtils.get(this.dom.o, '.sm2-playlist-target');
            this.dom.playlistContainer = domUtils.get(this.dom.o, '.sm2-playlist-drawer');
            this.dom.playlist = domUtils.get(this.dom.o, '.sm2-playlist-bd');
        }

        private refreshDOM() : any
        {
            // get / update playlist from DOM
            if (!this.dom.playlist)
            {
                if (window.console && console.warn) {
                    console.warn('refreshDOM(): playlist node not found?');
                }
                return false;
            }

            this.data.playlist = this.dom.playlist.getElementsByTagName('li');
        }
    }

    export interface ISm2PlaylistData
    {
        playlist: NodeListOf<HTMLElement>;
        selectedIndex: number;
        loopMode: boolean;
        timer: any;
    }
}