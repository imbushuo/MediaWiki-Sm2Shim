<?php
/**
 * Sm2Shim.PlaylistItem.php: Model class for playlist items.
 * Author: Bingxing Wang, The Little Moe New LLC
 * Copyright (c) 2016 - 2017 The Little Moe New LLC. All rights reserved.
 * https://github.com/imbushuo/MediaWiki-Sm2Shim
 * Code provided under BSD-2-Clause license.
 */

namespace TheLittleMoeNewLlc\Sm2Shim\Models;

include_once "../Exceptions/InvalidDataException.php";
use TheLittleMoeNewLlc\Sm2Shim\Exceptions;

class PlaylistItem
{
    private $title;
    private $album;
    private $artist;
    private $isExplicit;

    private $audioFileUrl;
    private $lrcFileUrl;
    private $lrcFileOffset;
    private $ignoreLrcMetadata;

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
        $lrcFileOffset = isset($entity->lrcFileOffset) ? $entity->lrcFileOffset : 0;
        $ignoreLrcMetadata = isset($entity->ignoreLrcMetadata) ? $entity->ignoreLrcMetadata : false;
        $title = isset($entity->title) ? $entity->title : "";
        $album = isset($entity->album) ? $entity->album : "";
        $artist = isset($entity->artist) ? $entity->artist : "";
        $isExplicit = isset($entity->isExplicit) ? $entity->isExplicit : false;

        return new PlaylistItem($audioFileUrl, $lrcFileUrl, $lrcFileOffset, $ignoreLrcMetadata,
            $title, $album, $artist, $isExplicit);
    }


    /**
     * PlaylistItem constructor.
     * @param $audioFileUrl string Audio file URL (required)
     * @param $lrcFileUrl string LRC file URL (optional)
     * @param $lrcFileOffset int LRC file timing offset (optional)
     * @param $ignoreLrcMetadata boolean Whether ignore metadata from LRC or not (optional)
     * @param $title string File title (optional)
     * @param $album string Album title (optional)
     * @param $artist string Artist name (optional)
     * @param $isExplicit boolean Whether is explicit song or not (optional)
     * @throws Exceptions\InvalidDataException Thrown if the given @param $audioFileUrl is null or empty.
     */
    public function __construct($audioFileUrl, $lrcFileUrl = "", $lrcFileOffset = 0, $ignoreLrcMetadata = false,
                                $title = "", $album = "", $artist = "", $isExplicit = false)
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

        if (empty($title))
        {
            $this->title = wfMessage('sm2shim-defaultTitle')->plain();
        }
        else
        {
            $this->title = $title;
        }

        if (empty($album))
        {
            $this->title = wfMessage('sm2shim-defaultAlbum')->plain();
        }
        else
        {
            $this->album = $album;
        }

        if (empty($artist))
        {
            $this->title = wfMessage('sm2shim-defaultArtist')->plain();
        }
        else
        {
            $this->artist = $artist;
        }

        $this->isExplicit = $isExplicit;
        $this->lrcFileOffset = $lrcFileOffset;
        $this->lrcFileUrl = $lrcFileUrl;
        $this->ignoreLrcMetadata = $ignoreLrcMetadata;
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
     * @return bool Value indicates whether ignore metadata from LRC or not.
     */
    public function isIgnoreLrcMetadata(): bool
    {
        return $this->ignoreLrcMetadata;
    }

}

class Playlist
{
    private $playlist;
    private $schemaVersion;
    private $loop;
    private $autoPlay;
    private $backgroundColor;

    /**
     * Playlist constructor.
     * @param $playlist array|PlaylistItem[] List of PlaylistItem.
     * @param $schemaVersion integer Schema version.
     * @param $loop boolean Value indicates whether loop is enabled.
     * @param $autoPlay boolean Value indicates whether auto play is enabled.
     * @param $backgroundColor string Background color value in hex string form.
     */
    public function __construct($playlist, $schemaVersion = 1,
                                $loop = false, $autoPlay = false, $backgroundColor = '')
    {
        $this->playlist = $playlist;
        $this->schemaVersion = $schemaVersion;
        $this->loop = $loop;
        $this->autoPlay = $autoPlay;
        $this->backgroundColor = $backgroundColor;
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
     * @return string Background color value in hex string form.
     */
    public function getBackgroundColor(): string
    {
        return $this->backgroundColor;
    }
}