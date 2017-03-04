<?php
/**
 * Sm2Shim.PlaylistItem.php: Model class for playlist items.
 * Author: Bingxing Wang, The Little Moe New LLC
 * Copyright (c) 2016 - 2017 The Little Moe New LLC. All rights reserved.
 * https://github.com/imbushuo/MediaWiki-Sm2Shim
 * Code provided under BSD-2-Clause license.
 */

namespace TheLittleMoeNewLlc\Sm2Shim\Models;
use TheLittleMoeNewLlc\Sm2Shim\Exceptions;

class PlaylistItem
{

    public $audioFileUrl;
    public $lrcFileUrl;
    public $title;
    public $album;
    public $artist;
    public $isExplicit;
    public $navigationUrl;
    public $coverImageUrl;
    public $lrcFileOffset;

    /**
     * @param $entity mixed Parse a deserialized object.
     * @return PlaylistItem Parsed playlist item.
     * @throws Exceptions\InvalidDataException Thrown if the given @param $entity is null or empty.
     * @throws Exceptions\InvalidDataException Thrown if the given @param $entity doesn't have a audio file URL.
     */
    public static function parse($entity) : PlaylistItem
    {
        // Sanity check.
        if ($entity == null || !isset($entity->audioFileUrl) || empty($entity->audioFileUrl))
            throw new Exceptions\InvalidDataException(wfMessage("sm2shim-invalidItem")->plain(), 80070057);

        $audioFileUrl = $entity->audioFileUrl;
        $lrcFileUrl = isset($entity->lrcFileUrl) ? $entity->lrcFileUrl : "";
        $navigationUrl = isset($entity->navigationUrl) ? $entity->navigationUrl : "";
        $coverImageUrl = isset($entity->coverImageUrl) ? $entity->coverImageUrl : "";
        $lrcFileOffset = isset($entity->lrcFileOffset) ? $entity->lrcFileOffset : 0;
        $title = isset($entity->title) ? $entity->title : "";
        $album = isset($entity->album) ? $entity->album : "";
        $artist = isset($entity->artist) ? $entity->artist : "";
        $isExplicit = isset($entity->isExplicit) ? $entity->isExplicit : false;

        return new PlaylistItem($audioFileUrl, $lrcFileUrl, $lrcFileOffset,
            $title, $album, $artist, $isExplicit, $navigationUrl, $coverImageUrl);
    }

    /**
     * PlaylistItem constructor.
     * @param $audioFileUrl string Audio file URL (required)
     * @param $lrcFileUrl string LRC file URL (optional)
     * @param $lrcFileOffset int LRC file timing offset (optional)
     * @param $title string File title (optional)
     * @param $album string Album title (optional)
     * @param $artist string Artist name (optional)
     * @param $isExplicit boolean Whether is explicit song or not (optional)
     * @param $navigationUrl string Navigation URL (optional)
     * @param $coverImageUrl string Cover image URL (optional)
     * @throws Exceptions\InvalidDataException Thrown if the given @param $audioFileUrl is null or empty.
     */
    public function __construct($audioFileUrl, $lrcFileUrl = "",
                                $lrcFileOffset = 0,
                                $title = "", $album = "",
                                $artist = "", $isExplicit = false,
                                $navigationUrl = "", $coverImageUrl = "")
    {
        // Sanity check
        if (empty($audioFileUrl))
        {
            throw new Exceptions\InvalidDataException(
                wfMessage("sm2shim-audioFileUrlRequired")->plain(), 80070057);
        }
        else
        {
            $this->audioFileUrl = $audioFileUrl;
        }

        $this->title = $title;
        $this->album = $album;
        $this->artist = $artist;
        $this->isExplicit = $isExplicit;
        $this->lrcFileOffset = $lrcFileOffset;
        $this->lrcFileUrl = $lrcFileUrl;
        $this->navigationUrl = $navigationUrl;
        $this->coverImageUrl = $coverImageUrl;
    }

    /**
     * @return string Audio file URL.
     */
    public function getTitle(): string
    {
        return $this->title;
    }

    /**
     * @return string Album title.
     */
    public function getAlbum(): string
    {
        return $this->album;
    }

    /**
     * @return string Artist name.
     */
    public function getArtist(): string
    {
        return $this->artist;
    }

    /**
     * @return bool Value indicates whether this is an explicit song or not.
     */
    public function isIsExplicit(): bool
    {
        return $this->isExplicit;
    }

    /**
     * @return string Audio file URL.
     */
    public function getAudioFileUrl(): string
    {
        return $this->audioFileUrl;
    }

    /**
     * @return string LRC file URL.
     */
    public function getLrcFileUrl(): string
    {
        return $this->lrcFileUrl;
    }

    /**
     * @return int LRC file timing offset
     */
    public function getLrcFileOffset(): int
    {
        return $this->lrcFileOffset;
    }

    /**
     * @return string Navigation URL.
     */
    public function getNavigationUrl(): string
    {
        return $this->navigationUrl;
    }

    /**
     * @return string Cover URL.
     */
    public function getCoverUrl() : string
    {
        return $this->coverImageUrl;
    }

}

class Playlist
{

    public $schemaVersion;
    public $loop;
    public $autoPlay;
    public $isPlaylistOpen;
    public $playlist;
    public $compactMode;
    public $backgroundColor;
    public $foregroundColor;
    public $trackColor;
    public $thumbColor;

    /**
     * Playlist constructor.
     * @param $playlist array|PlaylistItem[] List of PlaylistItem.
     * @param $schemaVersion integer Schema version.
     * @param $compactMode boolean Value indicates whether compact mode (single button) is enabled.
     * @param $loop boolean Value indicates whether loop is enabled.
     * @param $autoPlay boolean Value indicates whether auto play is enabled.
     * @param $isPlaylistOpen boolean Value indicates whether playlist is opened (at UI side).
     * @param $backgroundColor string Background color value in hex string form.
     * @param $foregroundColor string Foreground color value in hex string form.
     * @param $trackColor string TrackBar color value in hex string form.
     * @param $thumbColor string Thumb color value in hex string form.
     */
    public function __construct($playlist, $schemaVersion = 1,
                                $compactMode = false, $loop = false,
                                $autoPlay = false, $isPlaylistOpen = false,
                                $backgroundColor = '', $foregroundColor = '',
                                $trackColor = '', $thumbColor = '')
    {
        $this->playlist = $playlist;
        $this->schemaVersion = $schemaVersion;
        $this->loop = $loop;
        $this->autoPlay = $autoPlay;
        $this->backgroundColor = $backgroundColor;
        $this->foregroundColor = $foregroundColor;
        $this->isPlaylistOpen = $isPlaylistOpen;
        $this->compactMode = $compactMode;
        $this->trackColor = $trackColor;
        $this->thumbColor = $thumbColor;
    }

    /**
     * @return array|PlaylistItem[] List of PlaylistItem.
     */
    public function getPlaylist(): array
    {
        return $this->playlist;
    }

    /**
     * @return int Schema version.
     */
    public function getSchemaVersion(): int
    {
        return $this->schemaVersion;
    }

    /**
     * @return boolean Value indicates whether loop is enabled.
     */
    public function getLoop()
    {
        return $this->loop;
    }

    /**
     * @return boolean Value indicates whether auto play is enabled.
     */
    public function getAutoPlay()
    {
        return $this->autoPlay;
    }

    /**
     * @return string Foreground color value in hex string form.
     */
    public function getForegroundColor() : string
    {
        return $this->foregroundColor;
    }

    /**
     * @return string Background color value in hex string form.
     */
    public function getBackgroundColor(): string
    {
        return $this->backgroundColor;
    }

    /**
     * @return bool Value indicates whether playlist is opened (at UI side).
     */
    public function getPlaylistOpenStatus(): bool
    {
        return $this->isPlaylistOpen;
    }

    /**
     * @return bool Value indicates whether compact mode has been enabled.
     */
    public function getCompactModeStatus() : bool
    {
        return $this->compactMode;
    }
}

class WidgetOptions
{
    public $params;
    public $name;

    /**
     * WidgetOptions constructor.
     * @param $params Playlist Instance of modern playlist.
     */
    public function __construct($params)
    {
        $this->name = "sm2-player-fx";
        $this->params = $params;
    }
}

class BindingOptions
{
    public $component;

    /**
     * BindingOptions constructor.
     * @param $component WidgetOptions Instance of WidgetOptions.
     */
    public function __construct($component)
    {
        $this->component = $component;
    }
}