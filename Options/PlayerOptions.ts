namespace Sm2Shim.Options
{
    /**
     Data object class that contains critical options of SM2 Shim layer player.
     @class Sm2Shim.Options.Sm2PlayerOption
     */
    export class Sm2PlayerOption
    {
        /**
         * Value indicates whether use player in singleton mode.
         */
        stopOtherSounds: boolean;

        /**
         * CSS class to let the browser load the URL directly.
         * @example <a href="foo.mp3" class="sm2-exclude">download foo.mp3</a>
         */
        excludeClass: string;
    }

    /**
     Data object class that contains initialization options of SoundManager2.
     @class Sm2Shim.Options.SoundManagerSetupOption
     */
    export class SoundManagerSetupOption
    {
        html5PollingInterval: number;
        flashVersion: number;
        debugMode: boolean;
        debugFlash: boolean;
        preferFlash: boolean;
        url: string;
    }

    export const FileSrcAttribute: string = "data-filesrc";
    export const FileLyricAttribute: string = "data-lyricsrc";
    export const FileLyricOffsetAttribute: string = "data-lyricoffset";
    export const FileLyricIgnoreMetadataAttribute: string ="data-lyricignoremetadata";
}