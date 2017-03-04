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
        $parser->setHook(\Sm2ShimConstants::FlashMp3Tag,
            'TheLittleMoeNewLlc\Sm2Shim\Hooks\ModernSoundManager2Hooks::renderLegacyFlashMp3');
        $parser->setHook(\Sm2ShimConstants::SoundManager2ButtonTag,
            'TheLittleMoeNewLlc\Sm2Shim\Hooks\ModernSoundManager2Hooks::renderLegacySoundManager2Button');

        return true;
    }

    /**
     * Render SoundManager2 Bar Player with given Playlist.
     * @param Models\Playlist $playlist The playlist to play.
     * @param \Parser $parser MediaWiki parser.
     * @return mixed Rendered play control.
     * @internal param bool $isLightMode Value indicates whether the player's functionality is limited.
     */
    private static function renderModernSoundManagerByModel(
        Models\Playlist $playlist, \Parser &$parser)
    {
        if ($playlist == null) throw new \InvalidArgumentException();
        $widgetOptions = new Models\WidgetOptions($playlist);
        $bindingOptions = new Models\BindingOptions($widgetOptions);
        $bindingOptionsSerialized = json_encode($bindingOptions, JSON_UNESCAPED_UNICODE);

        $widgetAttributes["data-bind"] = $bindingOptionsSerialized;
        $widgetHtmlContent = \Html::rawElement("div", $widgetAttributes);
        $loadingStub = self::getLoadingStub();

        ModernSoundManager2Hooks::addClientDependency($parser);
        return array($loadingStub . $widgetHtmlContent, "markerType" => 'nowiki');
    }

    private static function getLoadingStub()
    {
        $circleAttribute["class"] = "circle";
        $boxAttribute["class"] = "box";
        $loaderAttribute["class"] = "loader";
        $stubAttribute["class"] = "sm2-loading-stub";

        $loaderRings = array();
        for ($i = 0; $i < 6; $i++)
        {
            $circle = \Html::rawElement("div", $circleAttribute);
            $box = \Html::rawElement("div", $boxAttribute, $circle);
            array_push($loaderRings, $box);
        }

        $loader = \Html::rawElement("div", $loaderAttribute, implode("", $loaderRings));
        return \Html::rawElement("div", $stubAttribute, $loader);
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

    /**
     * Method that injects client dependency.
     * @param \Parser $parser MediaWiki parser.
     */
    private static function addClientDependency(\Parser &$parser)
    {
        $parserOutput = $parser->getOutput();

        // Because input validation is completed, required CSS and JS will be injected.
        // ResourceLoader is so slow - we can't wait for that.
        global $wgSm2Shim_ExternalCDNEndpoint,
               $wgSm2Shim_ExternalCDNJsVersionControlId;

        $preStubEndpoint = "$wgSm2Shim_ExternalCDNEndpoint/assets/win-ring-bundled.min.css";
        $jsEndpoint = "$wgSm2Shim_ExternalCDNEndpoint/bin/ProdLoader.$wgSm2Shim_ExternalCDNJsVersionControlId.min.js";

        $sm2ModuleHeader = <<<HTML
<link rel="stylesheet" href="{$preStubEndpoint}">
<script async type="text/javascript" src="{$jsEndpoint}"></script>
HTML;

        $parserOutput->addHeadItem($sm2ModuleHeader, $sm2ModuleHeader);
    }

    /**
     * Method that renders modern sound manager.
     * @param $input string Parser input (JSON string)
     * @param array $args Parser attributes (not used)
     * @param \Parser $parser MediaWiki parser.
     * @param \PPFrame $frame Preprocessor frame.
     * @return mixed|string
     */
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
            $fgColor = '';
            $trackColor = '';
            $thumbColor = '';
            $playlistOpen = false;

            $parsedPlaylist = array();

            if (!isset($rawDeserialized))
            {
                throw new Exceptions\InvalidDataException(wfMessage("sm2shim-invalidJson")->plain(), 80070057);
            }

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
                && is_string($rawDeserialized->backgroundColor))
                $bgColor = (string) $rawDeserialized->backgroundColor;

            if (isset($rawDeserialized->foregroundColor)
                && is_string($rawDeserialized->foregroundColor))
                $fgColor = (string) $rawDeserialized->foregroundColor;

            if (isset($rawDeserialized->trackColor)
                && is_string($rawDeserialized->trackColor))
                $trackColor = (string) $rawDeserialized->trackColor;

            if (isset($rawDeserialized->thumbColor)
                && is_string($rawDeserialized->thumbColor))
                $thumbColor = (string) $rawDeserialized->thumbColor;

            if (isset($rawDeserialized->isPlaylistOpen) && is_bool($rawDeserialized->isPlaylistOpen))
                $playlistOpen = (boolean) $rawDeserialized->isPlaylistOpen;

            $parserOutput = $parser->getOutput();

            // Parse playlist items
            foreach ($rawDeserialized->playlist as &$playlistEntity)
            {
                if ($playlistEntity == null || $playlistEntity->audioFileUrl == null) continue;
                // Validate file location
                if (self::isInternalFile($playlistEntity->audioFileUrl))
                {
                    // Get address for internal files
                    $mwEntityTitle = \Title::newFromText($playlistEntity->audioFileUrl, NS_IMAGE);
                    if ($mwEntityTitle == null) continue;

                    $fileLocation = wfFindFile($mwEntityTitle);
                    if ($fileLocation)
                    {
                        $entityAddress = $fileLocation->getUrl();
                        if ($entityAddress != "")
                        {
                            $mwInternalTitle = $fileLocation->getTitle();
                            $playlistEntity->audioFileUrl = $fileLocation->getUrl();
                            $playlistEntity->navigationUrl = $mwInternalTitle->getLocalURL();

                            // Add file usage reference
                            $parserOutput->addImage($mwInternalTitle->getDBkey());
                            $parserOutput->addLink($mwInternalTitle);
                        }
                    }
                }

                array_push($parsedPlaylist, Models\PlaylistItem::parse($playlistEntity));
            }

            // Get playlist entity.
            $playlist = new Models\Playlist(
                $parsedPlaylist,
                $schemaVersion,
                false, /* No compact version for modern syntax */
                $loop,
                $autoPlay,
                $playlistOpen,
                $bgColor,
                $fgColor,
                $trackColor,
                $thumbColor);

            // Render playback control
            return ModernSoundManager2Hooks::renderModernSoundManagerByModel($playlist, $parser);
        }
        catch (Exceptions\InvalidDataException $exc)
        {
            $errorHeader = wfMessage("sm2shim-error")->escaped();
            $exceptionMsg = $exc->getMessage();
            if (!empty($exceptionMsg)) $exceptionMsg = htmlentities($exceptionMsg);
            else $exceptionMsg = wfMessage("sm2shim-unknown")->escaped();

            return <<<HTML
<b class="warning" style="color: #820009">{$errorHeader}{$exceptionMsg}</b>
HTML;

        }
    }

    /**
     * Method that handles legacy <flashmp3> tags.
     *
     * @param $input mixed between tags, or null if the tag is "closed", i.e. <sample />
     *
     * @param array $args Tag arguments, which are entered like HTML tag attributes;
     * this is an associative array indexed by attribute name.
     *
     * @param \Parser $parser The parent parser (a Parser object);
     * more advanced extensions use this to obtain the contextual Title, parse wiki text,
     * expand braces, register link relationships and dependencies, etc.
     *
     * @param \PPFrame $frame The parent frame (a PPFrame object).
     * This is used together with $parser to provide the parser with more complete
     * information on the context in which the extension was called.
     *
     * @return mixed Parsed HTML content.
     */
    public static function renderLegacyFlashMp3(
        $input, array $args, \Parser $parser, \PPFrame $frame)
    {
        // Render player using full-feature mode
        return self::renderLegacyPlayer($input, $args, $parser, false);
    }

    /**
     * Method that handles legacy <sm2> tags.
     *
     * @param $input Mixed between tags, or null if the tag is "closed", i.e. <sample />
     *
     * @param array $args Tag arguments, which are entered like HTML tag attributes;
     * this is an associative array indexed by attribute name.
     *
     * @param \Parser $parser The parent parser (a Parser object);
     * more advanced extensions use this to obtain the contextual Title, parse wiki text,
     * expand braces, register link relationships and dependencies, etc.
     *
     * @param \PPFrame $frame The parent frame (a PPFrame object).
     * This is used together with $parser to provide the parser with more complete
     * information on the context in which the extension was called.
     *
     * @return mixed Parsed HTML content.
     */
    public static function renderLegacySoundManager2Button(
        $input, array $args, \Parser $parser, \PPFrame $frame)
    {
        // Render player using light mode
        return self::renderLegacyPlayer($input, $args, $parser, true);
    }

    /**
     * Method that handles player output.
     *
     * @param $input mixed between tags, or null if the tag is "closed", i.e. <sample />
     *
     * @param array $args Tag arguments, which are entered like HTML tag attributes;
     * this is an associative array indexed by attribute name.
     *
     * @param \Parser $parser The parent parser (a Parser object);
     * more advanced extensions use this to obtain the contextual Title, parse wiki text,
     * expand braces, register link relationships and dependencies, etc.
     *
     * @param bool $isLiteMode Value indicates whether use lite mode.
     *
     * @return mixed Parsed HTML content.
     */
    private static function renderLegacyPlayer(
        $input, array $args, \Parser $parser, bool $isLiteMode) {

        // Sanity check: Did we receive non self-closed tags?
        if ($input != null)
        {
            // Parse arguments without escaping characters, we will do it later
            // And files will always be the first element
            // TODO: Sanity check for the first element
            $params = explode(\Sm2ShimConstants::ParamsQualifier, $input);

            // Sanity check: Are parameters well-formed?
            if (empty($params)) return \Sm2ShimConstants::EmptyString;

            // The first one must present - files
            $files = $params[0];
            unset($params[0]);

            $paramsParsed[\Sm2ShimConstants::Sm2ShimParamTypeFiles] = $files;
            $filesParsed = preg_split("/,(?=([^\"]*\"[^\"]*\")*[^\"]*$)/", $files);

            if (empty($filesParsed)) return \Sm2ShimConstants::EmptyString;

            // Sanity check: Did we retrieved more than one parameter?
            // Rest parameters will be parsed again in order to obtain key-value structure
            if (!empty($params))
            {
                foreach ($params as $param)
                {
                    $keyValue = explode(\Sm2ShimConstants::ParamValueQualifier, $param);
                    if (count($keyValue) == 2)
                    {
                        $paramsParsed[$keyValue[0]] = $keyValue[1];
                    }
                }
            }

            // LastFM support is dropped in this SM2 shim.
            // Type will be detected - any <flashmp3> tags with attribute type="lastfm" will be ignored.
            // ID support is deprecated, attempts to set ID for <flashmp3> tags will be ignored.
            if (isset($args[\Sm2ShimConstants::FlashMp3ParamTypeId]) &&
                $args[\Sm2ShimConstants::FlashMp3ParamTypeId] == \Sm2ShimConstants::FlashMp3ParamValueTypeLastFm
            )
            {
                return \Sm2ShimConstants::EmptyString;
            }

            // Additional settings expect those stated below is deprecated and will be ignored.
            // Parse additional settings: AutoStart, Loop, Bg (Background color)
            // Going to generate HTML code.

            $loop = false;
            $autoPlay = false;
            $openPlaylist = false;
            $liteMode = false;
            $backgroundColor = "";
            $foregroundColor = "";
            $trackColor = "";
            $thumbColor = "";

            if (!$isLiteMode)
            {
                if (isset($paramsParsed[\Sm2ShimConstants::FlashMp3ParamAutoPlayId]) &&
                    $paramsParsed[\Sm2ShimConstants::FlashMp3ParamAutoPlayId] === "yes"
                ) {
                    $autoPlay = true;
                }

                if (isset($paramsParsed[\Sm2ShimConstants::FlashMp3ParamLoopId]) &&
                    $paramsParsed[\Sm2ShimConstants::FlashMp3ParamLoopId] === "yes"
                ) {
                    $loop = true;
                }

                if (isset($paramsParsed[\Sm2ShimConstants::Sm2ShimOpenPlaylist]) &&
                    $paramsParsed[\Sm2ShimConstants::Sm2ShimOpenPlaylist] === "yes"
                ) {
                    $openPlaylist = true;
                }
            }
            else
            {
                $liteMode = true;
            }

            // Validate and set CSS for additional settings
            if (isset($paramsParsed[\Sm2ShimConstants::FlashMp3ParamBackgroundId]) &&
                $paramsParsed[\Sm2ShimConstants::FlashMp3ParamBackgroundId] != \Sm2ShimConstants::EmptyString)
            {
                // To Lowercase and trim the magic "0x"
                $colorRaw = strtolower($paramsParsed[\Sm2ShimConstants::FlashMp3ParamBackgroundId]);
                // If starts "0x", trim it
                if (strpos($colorRaw, \Sm2ShimConstants::FlashMp3ParamValueBackgroundMagicHeader) === 0) {
                    // So trim the magic header
                    $colorRaw = substr($colorRaw, 2);
                }

                if (self::validateHexColor($colorRaw)) $backgroundColor = "#{$colorRaw}";
            }

            if (isset($paramsParsed[\Sm2ShimConstants::FlashMp3ParamForegroundId]) &&
                $paramsParsed[\Sm2ShimConstants::FlashMp3ParamForegroundId] != \Sm2ShimConstants::EmptyString)
            {
                // To Lowercase and trim the magic "0x"
                $colorRaw = strtolower($paramsParsed[\Sm2ShimConstants::FlashMp3ParamForegroundId]);
                // If starts "0x", trim it
                if (strpos($colorRaw, \Sm2ShimConstants::FlashMp3ParamValueBackgroundMagicHeader) === 0) {
                    // So trim the magic header
                    $colorRaw = substr($colorRaw, 2);
                }

                if (self::validateHexColor($colorRaw)) $foregroundColor = "#{$colorRaw}";
            }

            if (isset($paramsParsed[\Sm2ShimConstants::FlashMp3ParamTrackColorId]) &&
                $paramsParsed[\Sm2ShimConstants::FlashMp3ParamTrackColorId] != \Sm2ShimConstants::EmptyString)
            {
                // To Lowercase and trim the magic "0x"
                $colorRaw = strtolower($paramsParsed[\Sm2ShimConstants::FlashMp3ParamTrackColorId]);
                // If starts "0x", trim it
                if (strpos($colorRaw, \Sm2ShimConstants::FlashMp3ParamValueBackgroundMagicHeader) === 0) {
                    // So trim the magic header
                    $colorRaw = substr($colorRaw, 2);
                }

                if (self::validateHexColor($colorRaw)) $trackColor = "#{$colorRaw}";
            }

            if (isset($paramsParsed[\Sm2ShimConstants::FlashMp3ParamThumbColorId]) &&
                $paramsParsed[\Sm2ShimConstants::FlashMp3ParamThumbColorId] != \Sm2ShimConstants::EmptyString)
            {
                // To Lowercase and trim the magic "0x"
                $colorRaw = strtolower($paramsParsed[\Sm2ShimConstants::FlashMp3ParamThumbColorId]);
                // If starts "0x", trim it
                if (strpos($colorRaw, \Sm2ShimConstants::FlashMp3ParamValueBackgroundMagicHeader) === 0) {
                    // So trim the magic header
                    $colorRaw = substr($colorRaw, 2);
                }

                if (self::validateHexColor($colorRaw)) $thumbColor = "#{$colorRaw}";
            }


            $playlistItems = array();

            $parserOutput = $parser->getOutput();

            // Iterate all files to retrieve link
            foreach ($filesParsed as $fileLocation)
            {
                $entityAddress = $fileLocation;
                $entityTitle = "";
                $entityNavigationAddress = "";
                if (self::isInternalFile($fileLocation))
                {
                    // Get address for internal files
                    $mwEntityTitle = \Title::newFromText($fileLocation, NS_IMAGE);
                    if ($mwEntityTitle == null) continue;

                    $fileLocation = wfFindFile($mwEntityTitle);
                    if ($fileLocation)
                    {
                        $entityAddress = $fileLocation->getUrl();
                        if ($entityAddress != "")
                        {
                            $mwInternalTitle = $fileLocation->getTitle();
                            $entityTitle = $mwInternalTitle->getText();
                            $entityNavigationAddress = $mwInternalTitle->getLocalURL();

                            // Add file usage reference
                            $parserOutput->addImage($mwInternalTitle->getDBkey());
                            $parserOutput->addLink($mwInternalTitle);
                        }
                    }
                }
                else
                {
                    // Generate title and add external link reference
                    // Link to external site
                    $entityNavigationAddress = $entityAddress;
                }

                $playlistItem = new Models\PlaylistItem(
                    $entityAddress,
                    "", /* No LRC file for legacy syntax */
                    0,  /* No LRC file for legacy syntax */
                    $entityTitle, /* Title */
                    "", /* No manual metadata override for legacy syntax */
                    "", /* No manual metadata override for legacy syntax */
                    false,
                    $entityNavigationAddress, /* Link src */
                    "");

                array_push($playlistItems, $playlistItem);
            }

            $playlist = new Models\Playlist(
                $playlistItems,
                1,
                $liteMode,
                $loop,
                $autoPlay,
                $openPlaylist,
                $backgroundColor,
                $foregroundColor,
                $trackColor,
                $thumbColor);

            return self::renderModernSoundManagerByModel($playlist, $parser);
        }

        return \Sm2ShimConstants::EmptyString;
    }
}