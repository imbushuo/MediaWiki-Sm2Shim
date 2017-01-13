<?php

class Sm2ShimHooks {

    const EmptyString = '';
    
    public static function onParserSetup(&$parser) {
        $parser->setHook('flashmp3', 'Sm2ShimHooks::renderLegacyFlashMp3');

        return true;
    }

    public static function renderLegacyFlashMp3($input, $args, $parser, $frame) {

        global $wgScriptPath;
        $type = "1pixelout";

        // Sanity check: Did we receive non self-closed tags?
        if ($input != null) {

            // Parse arguments without escaping characters, we will do it later
            // And files will always be the first element
            // TODO: Sanity check for the first element
            $params = explode("|", $input);

            // Sanity check: Are parameters well-formed?
            if (empty($params)) return Sm2ShimHooks::EmptyString;

            // The first one must present - files
            $files = $params[0];
            unset($params[0]);

            $paramsParsed["files"] = $files;
            $filesParsed = explode(",", $files);
            if(empty($filesParsed)) return Sm2ShimHooks::EmptyString;

            // Sanity check: Did we retrieved more than one parameter?
            // Rest parameters will be parsed again in order to obtain key-value structure
            if (!empty($params)) {
                foreach ($params as $param) {
                    $keyValue = explode("=", $param);
                    if (count($keyValue) == 2) {
                        $paramsParsed[$keyValue[0]] = $keyValue[1];
                    }
                }
            }

            // LastFM support is dropped in this SM2 shim.
            // Type will be detected - any <flashmp3> tags with attribute type="lastfm" will be ignored.
            // ID support is deprecated, attempts to set ID for <flashmp3> tags will be ignored.
            if (isset($args["type"]) && $args["type"] == "lastfm") {
                return Sm2ShimHooks::EmptyString;
            }

            // Because input validation is completed, required CSS and JS will be injected.
            $parser->getOutput()->addModules("ext.sm2Shim");
            $parser->getOutput()->addModuleStyles("ext.sm2Shim");

            // Additional settings expect those stated below is deprecated and will be ignored.
            // Parse additional settings: AutoStart, Loop, Bg (Background color)
            // Going to generate HTML code.

            $autoPlay = false;
            $loop = false;
            $baseClassName = "sm2-bar-ui";

            if ($paramsParsed["autostart"] === "yes") { 
                $autoPlay = true;
                $baseClassName .= " auto-play";
            }

            if ($paramsParsed["loop"] === "yes") {
                $loop = true;
                $baseClassName .= " repeat-playback";
            }

            $playlistContent = '';
            $trackCount = 1;

            foreach ($filesParsed as $file) {
                // Get address for internal files
                $addr = '';
                $title = '';

                if (strpos($file, "http://") !== 0 && strpos($file, "https://") !== 0) {
                    $title = Title::newFromText($file, NS_IMAGE);
                    if ($title == null) {
                        continue;
                    }

                    $file = wfFindFile( $title );
                    if ($file) {
                        $addr = $file->getUrl();
                        $title = $file->getTitle();
                    }
                } else {
                    $addr = $file;
                    $title = "Track {$trackCount}";
                }
                
                $title = htmlentities($title);
                $playlistContent .= <<<HTML
<li><a href="{$addr}">{$title}</a></li>
HTML;

                $trackCount++;
            }

            if ($playlistContent == '') return Sm2ShimHooks::EmptyString;

            $inlineBackgroundStyle = "";

            // Validate and set CSS for additional settings
            if (isset($paramsParsed["bg"]) && $paramsParsed["bg"] != '') {
                // To Lowercase and trim the magic "0x"
                $colorRaw = strtolower($paramsParsed["bg"]);
                // Make sure it starts with "0x"
                if (strpos($colorRaw, "0x") === 0) {
                    // So trim the magic header
                    $colorRaw = substr($colorRaw, 2);
                    // Perform sanity check for input values
                    if (Sm2ShimHooks::validateHexColor($colorRaw)) {
                        $inlineBackgroundStyle = "background-color: #$colorRaw";
                    }
                }
            }

            $locResPlayback = wfMessage('sm2shim-playpause')->escaped();
            $locResJsRequired = wfMessage('sm2shim-jsrequired')->escaped();
            $locResPervious = wfMessage('sm2shim-previous')->escaped();
            $locResNext = wfMessage('sm2shim-next')->escaped();
            $locResRepeat = wfMessage('sm2shim-repeat')->escaped();
            $locResMenu = wfMessage('sm2shim-menu')->escaped();

            $output = <<<HTML
            <div class="{$baseClassName}">
                <div class="bd sm2-main-controls" style="{$inlineBackgroundStyle}">
                    <div class="sm2-inline-texture"></div>
                    <div class="sm2-inline-element sm2-button-element">
                        <div class="sm2-button-bd">
                            <a href="#play" class="sm2-inline-button sm2-icon-play-pause">{$locResPlayback}</a>
                        </div>
                    </div><!-- EMD PLAY/PAUSE BUTTON -->
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
                    </div><!-- END PLAY INDICATOR AND PLAYLIST -->
                    <div class="sm2-inline-element sm2-button-element">
                        <div class="sm2-button-bd">
                            <a href="#prev" title="Previous" class="sm2-inline-button sm2-icon-previous">{$locResPervious}</a>
                        </div>
                    </div>
                    <div class="sm2-inline-element sm2-button-element">
                        <div class="sm2-button-bd">
                            <a href="#next" title="Next" class="sm2-inline-button sm2-icon-next">{$locResNext}</a>
                        </div>
                    </div>
                    <div class="sm2-inline-element sm2-button-element">
                        <div class="sm2-button-bd">
                        <a title="Repeat playlist" class="sm2-inline-button sm2-icon-repeat" href="#repeat">{$locResRepeat}</a>
                        </div>
                    </div>
                    <div class="sm2-inline-element sm2-button-element sm2-menu">
                        <div class="sm2-button-bd">
                            <a href="#menu" class="sm2-inline-button sm2-icon-menu">{$locResMenu}</a>
                        </div>
                    </div><!-- END BUTTONS -->
                </div><!-- END MAIN CONTROLS -->
                <!-- BEGIN PLAYLIST -->
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
                <!-- END PLAYLIST -->
            </div><!-- END PLAYER -->
HTML;

            return array($output, "markerType" => 'nowiki');
        }
    }

    private static function validateHexColor($colorInput) {
        $validationResult = preg_match('/^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', $colorInput);
        return !empty($validationResult);
    }
}