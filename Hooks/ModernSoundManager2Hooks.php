<?php
/**
 * ModernSoundManager2Hooks.php: Hook for Modern SoundManager2 player.
 * Author: Bingxing Wang, The Little Moe New LLC
 * Copyright (c) 2016 - 2017 The Little Moe New LLC. All rights reserved.
 * https://github.com/imbushuo/MediaWiki-Sm2Shim
 * Code provided under BSD-2-Clause license.
 */

namespace TheLittleMoeNewLlc\Sm2Shim\Hooks;

use TheLittleMoeNewLlc\Sm2Shim\Exceptions;
use TheLittleMoeNewLlc\Sm2Shim\Models;

class ModernSoundManager2Hooks
{
    /**
     * Hook handler that configures MediaWiki parser.
     *
     * @param \Parser $parser MediaWiki parser.
     * @return bool
     */
    public static function onParserSetup(\Parser &$parser) {
        $parser->setHook(\Sm2ShimConstants::ModernSoundManager2Tag,
            'TheLittleMoeNewLlc\Sm2Shim\Hooks\ModernSoundManager2Hooks::renderModernSoundManager');

        return true;
    }

    /**
     * Render SoundManager2 Bar Player with given Playlist.
     * @param Models\Playlist $playlist The playlist to play.
     * @param \Parser $parser MediaWiki parser.
     * @param boolean $isLightMode Value indicates whether the player's functionality is limited.
     * @return mixed Rendered play control.
     * @throws \InvalidArgumentException Thrown if the given parameter is null.
     */
    private static function renderModernSoundManagerByModel(
        Models\Playlist $playlist, \Parser $parser, $isLightMode = null)
    {
        if ($playlist == null) throw new \InvalidArgumentException();

        $playerClasses = array(\Sm2ShimConstants::Sm2ShimPlayerBaseClass);

        if (!$isLightMode)
        {
            if ($playlist->getAutoPlay()) array_push($playerClasses, \Sm2ShimConstants::Sm2ShimAutoPlayClass);
            if ($playlist->getLoop()) array_push($playerClasses, \Sm2ShimConstants::Sm2ShimLoopPlayClass);
        }
        else
        {
            array_push($playerClasses, \Sm2ShimConstants::Sm2ShimPlayerLiteClass);
        }

        $baseClassName = implode(\Sm2ShimConstants::Space, $playerClasses);

        $playlistElementContent = array();
        $parserOutput = $parser->getOutput();

        foreach ($playlist->getPlaylist() as &$playlistItem)
        {
            // Initialize
            $entityAttributes = array();
            
            // Metadata
            $escapedArtist = htmlentities($playlistItem->getArtist());
            $escapedAlbum = htmlentities($playlistItem->getAlbum());
            $escapedTitle = htmlentities($playlistItem->getTitle());

            // File address and LRC properties
            $entityAddress = $playlistItem->getAudioFileUrl();
            $entityNavigationAddress = $playlistItem->getAudioFileUrl();

            if (ModernSoundManager2Hooks::isInternalFile($entityAddress))
            {
                // Get address for internal files
                $entityTitle = \Title::newFromText($entityAddress, NS_IMAGE);
                if ($entityTitle == null) continue;

                $fileLocation = wfFindFile($entityTitle);
                if ($fileLocation)
                {
                    $entityAddress = $fileLocation->getUrl();
                    $entityTitle = $fileLocation->getTitle();
                    // Add HTML link to file page instead of raw file
                    $entityNavigationAddress = $entityTitle->getLocalURL();

                    // Add internal file dependency
                    $parserOutput->addImage($entityTitle->getDBkey());
                    $parserOutput->addLink($entityTitle);
                }
            }

            $entityAttributes["data-filesrc"] = $entityAddress;
            $entityAttributes["href"] = $entityNavigationAddress;
            $metadata = "<b>$escapedArtist</b> $escapedTitle - $escapedAlbum";

            if (!empty($playlistItem->getLrcFileUrl()))
            {
                $entityAttributes["data-lyricsrc"] = $playlistItem->getLrcFileUrl();
            }
            if ($playlistItem->isIgnoreLrcMetadata())
            {
                $entityAttributes["data-lyricignoremetadata"] = true;
            }
            if ($playlistItem->getLrcFileOffset() != 0)
            {
                $entityAttributes["data-lyricoffset"] = $playlistItem->getLrcFileOffset();
            }

            $entityHtmlContent = \Html::rawElement(\Sm2ShimConstants::HtmlElementLi, [],
                \Html::rawElement(\Sm2ShimConstants::HtmlElementA, $entityAttributes, $metadata));
            array_push($playlistElementContent, $entityHtmlContent);

            // Lite mode will have only one file
            if ($isLightMode) break;
        }

        $playlistContent = implode(\Sm2ShimConstants::EmptyString, $playlistElementContent);
        $inlineBackgroundStyle = \Sm2ShimConstants::EmptyString;

        if (!$isLightMode)
        {
            // Validate and set CSS for additional settings
            if ($playlist->getBackgroundColor() != \Sm2ShimConstants::EmptyString) {
                // To Lowercase and trim the magic "0x"
                $colorRaw = strtolower($playlist->getBackgroundColor());
                // Make sure it starts with "0x"
                // No magic header
                // Perform sanity check for input values
                if (ModernSoundManager2Hooks::validateHexColor($colorRaw)) {
                    $inlineBackgroundStyle = "background-color: #$colorRaw";
                }
            }
        }

        // Because input validation is completed, required CSS and JS will be injected.
        // ResourceLoader is so slow - we can't wait for that.
        global $wgSm2Shim_UseResourceManager,
               $wgSm2Shim_ExternalCDNEndpoint,
               $wgSm2Shim_ExternalCDNVersionControlId;

        if ($wgSm2Shim_UseResourceManager) {
            $parserOutput->addModules(\Sm2ShimConstants::Sm2ShimBundleId);
            $parserOutput->addModuleStyles(\Sm2ShimConstants::Sm2ShimBundleId);
        } else {
            $cssEndpoint = "$wgSm2Shim_ExternalCDNEndpoint/css/player-ui.min.$wgSm2Shim_ExternalCDNVersionControlId.css";
            $jsEndpoint = "$wgSm2Shim_ExternalCDNEndpoint/js/player-bundled.min.$wgSm2Shim_ExternalCDNVersionControlId.js";

            $sm2ModuleHeader = <<<HTML
<link rel="stylesheet" href="{$cssEndpoint}">
<script type="text/javascript" src="{$jsEndpoint}"></script>
HTML;

            $parserOutput->addHeadItem($sm2ModuleHeader, $sm2ModuleHeader);
        }

        $locResPlayback = wfMessage('sm2shim-playpause')->escaped();
        $locResJsRequired = wfMessage('sm2shim-jsrequired')->escaped();
        $locResPrevious = wfMessage('sm2shim-previous')->escaped();
        $locResNext = wfMessage('sm2shim-next')->escaped();
        $locResRepeat = wfMessage('sm2shim-repeat')->escaped();
        $locResMenu = wfMessage('sm2shim-menu')->escaped();

        $fullFeaturedControl = \Sm2ShimConstants::EmptyString;

        if (!$isLightMode) {
            $fullFeaturedControl = <<<HTML
            <div class="sm2-inline-element sm2-button-element">
                    <div class="sm2-button-bd">
                            <a href="#prev" title="{$locResPrevious}" class="sm2-inline-button sm2-icon-previous"></a>
                        </div>
                    </div>
                    <div class="sm2-inline-element sm2-button-element">
                        <div class="sm2-button-bd">
                            <a href="#next" title="{$locResNext}" class="sm2-inline-button sm2-icon-next"></a>
                        </div>
                    </div>
                    <div class="sm2-inline-element sm2-button-element">
                        <div class="sm2-button-bd">
                            <a href="#repeat" title="{$locResRepeat}" class="sm2-inline-button sm2-icon-repeat"></a>
                        </div>
                    </div>
                    <div class="sm2-inline-element sm2-button-element sm2-menu">
                        <div class="sm2-button-bd">
                            <a href="#menu" title="{$locResMenu}" class="sm2-inline-button sm2-icon-menu"></a>
                    </div>
            </div>
HTML;
        }

        $output = <<<HTML
            <div class="{$baseClassName}">
                <div class="bd sm2-main-controls" style="{$inlineBackgroundStyle}">
                    <div class="sm2-inline-texture"></div>
                    <div class="sm2-inline-element sm2-button-element">
                        <div class="sm2-button-bd">
                            <a href="#play" title="{$locResPlayback}" class="sm2-inline-button sm2-icon-play-pause"></a>
                        </div>
                    </div>
                    <div class="sm2-inline-element sm2-inline-status">
                        <div class="sm2-playlist">
                            <div class="sm2-playlist-target">
                                <noscript>
                                    <p>{$locResJsRequired}</p>
                                </noscript>
                            </div>
                        </div>

                        <div class="sm2-progress">
                            <div class="sm2-row">
                                <div class="sm2-inline-time">0:00</div>
                                <div class="sm2-progress-bd">
                                    <div class="sm2-progress-track">
                                        <div class="sm2-progress-bar"></div>
                                        <div class="sm2-progress-ball">
                                            <div class="icon-overlay"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="sm2-inline-duration">0:00</div>
                            </div>
                        </div>
                    </div>
                    {$fullFeaturedControl}
                </div>
                <div class="bd sm2-playlist-drawer sm2-element" style="{$inlineBackgroundStyle}">
                    <div class="sm2-inline-texture">
                        <div class="sm2-box-shadow"></div>
                    </div>
                    <!-- BEGIN PLAYLIST CONTENT -->
                    <div class="sm2-playlist-wrapper">
                        <ul class="sm2-playlist-bd">
                            {$playlistContent}
                        </ul>
                    </div>
                </div>
                <div class="bd sm2-lyric-drawer sm2-element">
                    <div class="sm2-inline-texture">
                        <div class="sm2-box-shadow"></div>
                    </div>
                    <!-- Lyrics content goes here -->
                    <div class="sm2-lyric-wrapper">
                        <ul class="sm2-lyric-bd">
                        </ul>
                    </div>
                </div>
            </div>
HTML;

        return array($output, "markerType" => 'nowiki');
    }

    /**
     * Method that validates color inputs.
     *
     * @param string $colorInput Color representation in hex string.
     * @return bool Value indicates whether the color representation is valid or not.
     */
    private static function validateHexColor(string $colorInput) {
        $validationResult = preg_match('/^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', $colorInput);
        return !empty($validationResult);
    }

    /**
     * Method that determines whether a given file location is located locally.
     * @param string $fileLocation File location representation.
     * @return bool Value indicates whether a file is an internal file.
     */
    private static function isInternalFile(string $fileLocation) {
        return strpos($fileLocation, \Sm2ShimConstants::HttpUrlHeader) !== 0 &&
            strpos($fileLocation, \Sm2ShimConstants::HttpsUrlHeader) !== 0;
    }

    public static function renderModernSoundManager(
        $input, array $args, \Parser $parser, \PPFrame $frame)
    {
        if (empty($input)) return \Sm2ShimConstants::EmptyString;

        try
        {
            $rawDeserialized = json_decode($input);
            $schemaVersion = 1;
            $loop = false;
            $autoPlay = false;
            $bgColor = '';

            $parsedPlaylist = array();

            // Parse structure
            if (!isset($rawDeserialized->playlist) && !is_array($rawDeserialized->playlist))
                throw new Exceptions\InvalidDataException(wfMessage("sm2shim-playlistRequired")->plain(), 80070057);

            if (isset($rawDeserialized->schemaVersion) && is_int($rawDeserialized->schemaVersion))
                $schemaVersion = (int) $rawDeserialized->schemaVersion;

            if (isset($rawDeserialized->loop) && is_bool($rawDeserialized->loop))
                $loop = (boolean) $rawDeserialized->loop;

            if (isset($rawDeserialized->autoPlay) && is_bool($rawDeserialized->autoPlay))
                $autoPlay = (boolean) $rawDeserialized->autoPlay;

            if (isset($rawDeserialized->backgroundColor)
                && is_string($rawDeserialized->backgroundColor)
                && !empty($rawDeserialized->backgroundColor))
                $bgColor = (string) $rawDeserialized->backgroundColor;

            // Parse playlist items
            foreach ($rawDeserialized->playlist as &$playlistEntity)
            {
                array_push($parsedPlaylist, Models\PlaylistItem::parse($playlistEntity));
            }

            // Get playlist entity.
            $playlist = new Models\Playlist($parsedPlaylist, $schemaVersion, $loop, $autoPlay, $bgColor);

            // Render playback control
            return ModernSoundManager2Hooks::renderModernSoundManagerByModel($playlist, $parser);
        }
        catch (Exceptions\InvalidDataException $exc)
        {
            return <<<HTML
<p class="warning" style="color: red">Error occurred: {$exc->getMessage()}</p>
HTML;

        }
    }
}