<?php

/**
* Sm2Shim: A shim layer for FlashMP3 replacement
* Author: Bingxing Wang, The Little Moe New LLC
* Copyright (c) 2016 - 2017 The Little Moe New LLC. All rights reserved.
* https://github.com/imbushuo/MediaWiki-Sm2Shim
* Code provided under BSD-2-Clause license.
*/

class Sm2ShimHooks {

    const EmptyString = '';

    /**
     * Hook handler that configures MediaWiki parser.
     *
     * @param Parser $parser
     * @return bool
     */
    public static function onParserSetup(Parser &$parser) {
        $parser->setHook(Sm2ShimConstants::FlashMp3Tag, 'Sm2ShimHooks::renderLegacyFlashMp3');
        $parser->setHook(Sm2ShimConstants::SoundManager2ButtonTag, 'Sm2ShimHooks::renderLegacySoundManager2Button');

        return true;
    }

    /**
     * Method that handles legacy <flashmp3> tags.
     *
     * @param $input mixed between tags, or null if the tag is "closed", i.e. <sample />
     *
     * @param array $args Tag arguments, which are entered like HTML tag attributes;
     * this is an associative array indexed by attribute name.
     *
     * @param Parser $parser The parent parser (a Parser object);
     * more advanced extensions use this to obtain the contextual Title, parse wiki text,
     * expand braces, register link relationships and dependencies, etc.
     *
     * @param PPFrame $frame The parent frame (a PPFrame object).
     * This is used together with $parser to provide the parser with more complete
     * information on the context in which the extension was called.
     *
     * @return mixed Parsed HTML content.
     */
    public static function renderLegacyFlashMp3(
        $input, array $args, Parser $parser, PPFrame $frame) {
        // Render player using full-feature mode
        return self::renderPlayer($input, $args, $parser, false);
    }

    /**
     * Method that handles legacy <sm2> tags.
     *
     * @param $input Mixed between tags, or null if the tag is "closed", i.e. <sample />
     *
     * @param array $args Tag arguments, which are entered like HTML tag attributes;
     * this is an associative array indexed by attribute name.
     *
     * @param Parser $parser The parent parser (a Parser object);
     * more advanced extensions use this to obtain the contextual Title, parse wiki text,
     * expand braces, register link relationships and dependencies, etc.
     *
     * @param PPFrame $frame The parent frame (a PPFrame object).
     * This is used together with $parser to provide the parser with more complete
     * information on the context in which the extension was called.
     *
     * @return mixed Parsed HTML content.
     */
    public static function renderLegacySoundManager2Button(
        $input, array $args, Parser $parser, PPFrame $frame) {
        // Render player using light mode
        return self::renderPlayer($input, $args, $parser, true);
    }

    /**
     * Method that handles player output.
     *
     * @param $input mixed between tags, or null if the tag is "closed", i.e. <sample />
     *
     * @param array $args Tag arguments, which are entered like HTML tag attributes;
     * this is an associative array indexed by attribute name.
     *
     * @param Parser $parser The parent parser (a Parser object);
     * more advanced extensions use this to obtain the contextual Title, parse wiki text,
     * expand braces, register link relationships and dependencies, etc.
     *
     * @param bool $isLiteMode Value indicates whether use lite mode.
     *
     * @return mixed Parsed HTML content.
     */
    private static function renderPlayer(
        $input, array $args, Parser $parser, bool $isLiteMode) {

        // Sanity check: Did we receive non self-closed tags?
        if ($input != null) {

            // Parse arguments without escaping characters, we will do it later
            // And files will always be the first element
            // TODO: Sanity check for the first element
            $params = explode(Sm2ShimConstants::ParamsQualifier, $input);

            // Sanity check: Are parameters well-formed?
            if (empty($params)) return Sm2ShimHooks::EmptyString;

            // The first one must present - files
            $files = $params[0];
            unset($params[0]);

            $paramsParsed[Sm2ShimConstants::Sm2ShimParamTypeFiles] = $files;
            $filesParsed = explode(Sm2ShimConstants::FilesQualifier, $files);
            if(empty($filesParsed)) return Sm2ShimHooks::EmptyString;

            // Sanity check: Did we retrieved more than one parameter?
            // Rest parameters will be parsed again in order to obtain key-value structure
            if (!empty($params)) {
                foreach ($params as $param) {
                    $keyValue = explode(Sm2ShimConstants::ParamValueQualifier, $param);
                    if (count($keyValue) == 2) {
                        $paramsParsed[$keyValue[0]] = $keyValue[1];
                    }
                }
            }

            // LastFM support is dropped in this SM2 shim.
            // Type will be detected - any <flashmp3> tags with attribute type="lastfm" will be ignored.
            // ID support is deprecated, attempts to set ID for <flashmp3> tags will be ignored.
            if (isset($args[Sm2ShimConstants::FlashMp3ParamTypeId]) &&
                $args[Sm2ShimConstants::FlashMp3ParamTypeId] == Sm2ShimConstants::FlashMp3ParamValueTypeLastFm) {
                return Sm2ShimHooks::EmptyString;
            }

            // Additional settings expect those stated below is deprecated and will be ignored.
            // Parse additional settings: AutoStart, Loop, Bg (Background color)
            // Going to generate HTML code.

            $playerClasses = array(Sm2ShimConstants::Sm2ShimPlayerBaseClass);

            if (!$isLiteMode) {
                if (isset($paramsParsed[Sm2ShimConstants::FlashMp3ParamAutoPlayId]) &&
                    $paramsParsed[Sm2ShimConstants::FlashMp3ParamAutoPlayId] === "yes") {
                    array_push($playerClasses, Sm2ShimConstants::Sm2ShimAutoPlayClass);
                }

                if (isset($paramsParsed[Sm2ShimConstants::FlashMp3ParamLoopId]) &&
                    $paramsParsed[Sm2ShimConstants::FlashMp3ParamLoopId] === "yes") {
                    array_push($playerClasses, Sm2ShimConstants::Sm2ShimLoopPlayClass);
                }
            } else {
                array_push($playerClasses, Sm2ShimConstants::Sm2ShimPlayerLiteClass);
            }

            $baseClassName = implode(Sm2ShimConstants::Space, $playerClasses);

            $playlistElementContent = array();
            $trackCount = 1;
            $locTrack = wfMessage('sm2shim-track')->plain();

            $parserOutput = $parser->getOutput();

            // Iterate all files to retrieve link
            foreach ($filesParsed as $fileLocation) {

                $entityAddress = $fileLocation;

                if (self::isInternalFile($fileLocation)) {
                    // Get address for internal files
                    $entityTitle = Title::newFromText($fileLocation, NS_IMAGE);
                    if ($entityTitle == null) continue;

                    $fileLocation = wfFindFile( $entityTitle );
                    if ($fileLocation) {
                        $entityAddress = $fileLocation->getUrl();
                        $entityTitle = $fileLocation->getTitle();
                        // Add internal file dependency
                        $parserOutput->addImage($entityTitle->getDBkey());
                        $parserOutput->addLink($entityTitle);
                    }

                } else {

                    // Generate title and add external link reference
                    $entityTitle = "{$locTrack} {$trackCount}";
                    $parserOutput->addExternalLink($entityAddress);

                }

                $entityTitle = htmlspecialchars($entityTitle);
                $entityAddress = htmlspecialchars($entityAddress);
                $entityAttributes[Sm2ShimConstants::HtmlElementAAttributeHref] = $entityAddress;

                $entityHtmlContent = Html::rawElement(Sm2ShimConstants::HtmlElementLi, [],
                    Html::element(Sm2ShimConstants::HtmlElementA, $entityAttributes, $entityTitle));

                array_push($playlistElementContent, $entityHtmlContent);

                // Lite mode will have only one file
                if ($isLiteMode) break;

                $trackCount++;
            }

            $playlistContent = implode(Sm2ShimConstants::EmptyString, $playlistElementContent);

            if ($playlistContent == Sm2ShimConstants::EmptyString) return Sm2ShimHooks::EmptyString;

            $inlineBackgroundStyle = Sm2ShimConstants::EmptyString;

            if (!$isLiteMode) {
                // Validate and set CSS for additional settings
                if (isset($paramsParsed[Sm2ShimConstants::FlashMp3ParamBackgroundId]) &&
                    $paramsParsed[Sm2ShimConstants::FlashMp3ParamBackgroundId] != Sm2ShimConstants::EmptyString) {
                    // To Lowercase and trim the magic "0x"
                    $colorRaw = strtolower($paramsParsed[Sm2ShimConstants::FlashMp3ParamBackgroundId]);
                    // Make sure it starts with "0x"
                    if (strpos($colorRaw, Sm2ShimConstants::FlashMp3ParamValueBackgroundMagicHeader) === 0) {
                        // So trim the magic header
                        $colorRaw = substr($colorRaw, 2);
                        // Perform sanity check for input values
                        if (Sm2ShimHooks::validateHexColor($colorRaw)) {
                            $inlineBackgroundStyle = "background-color: #$colorRaw";
                        }
                    }
                }
            }

            // Because input validation is completed, required CSS and JS will be injected.
            // ResourceLoader is so slow - we can't wait for that.
            global $wgSm2Shim_UseResourceManager,
                   $wgSm2Shim_ExternalCDNEndpoint,
                   $wgSm2Shim_ExternalCDNVersionControlId;

            if ($wgSm2Shim_UseResourceManager) {
                $parserOutput->addModules(Sm2ShimConstants::Sm2ShimBundleId);
                $parserOutput->addModuleStyles(Sm2ShimConstants::Sm2ShimBundleId);
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

            $fullFeaturedControl = Sm2ShimConstants::EmptyString;

            if (!$isLiteMode) {
                $fullFeaturedControl = <<<HTML
            <div class="sm2-inline-element sm2-button-element">
                    <div class="sm2-button-bd">
                            <a href="#prev" title="{$locResPrevious}" class="sm2-inline-button sm2-icon-previous">{$locResPrevious}</a>
                        </div>
                    </div>
                    <div class="sm2-inline-element sm2-button-element">
                        <div class="sm2-button-bd">
                            <a href="#next" title="{$locResNext}" class="sm2-inline-button sm2-icon-next">{$locResNext}</a>
                        </div>
                    </div>
                    <div class="sm2-inline-element sm2-button-element">
                        <div class="sm2-button-bd">
                            <a title="{$locResRepeat}" class="sm2-inline-button sm2-icon-repeat" href="#repeat">{$locResRepeat}</a>
                        </div>
                    </div>
                    <div class="sm2-inline-element sm2-button-element sm2-menu">
                        <div class="sm2-button-bd">
                            <a href="#menu" title="{$locResMenu}" class="sm2-inline-button sm2-icon-menu">{$locResMenu}</a>
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
                            <a href="#play" title="{$locResPlayback}" class="sm2-inline-button sm2-icon-play-pause">{$locResPlayback}</a>
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
            </div>
HTML;

            return array($output, "markerType" => 'nowiki');
        }

        return Sm2ShimConstants::EmptyString;

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
        return strpos($fileLocation, Sm2ShimConstants::HttpUrlHeader) !== 0 &&
        strpos($fileLocation, Sm2ShimConstants::HttpsUrlHeader) !== 0;
    }

}
