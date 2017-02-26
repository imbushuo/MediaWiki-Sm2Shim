var Sm2Shim;
(function (Sm2Shim) {
    var Options;
    (function (Options) {
        /**
         Data object class that contains critical options of SM2 Shim layer player.
         @class Sm2Shim.Options.Sm2PlayerOption
         */
        var Sm2PlayerOption = (function () {
            function Sm2PlayerOption() {
            }
            return Sm2PlayerOption;
        }());
        Options.Sm2PlayerOption = Sm2PlayerOption;
        /**
         Data object class that contains initialization options of SoundManager2.
         @class Sm2Shim.Options.SoundManagerSetupOption
         */
        var SoundManagerSetupOption = (function () {
            function SoundManagerSetupOption() {
            }
            return SoundManagerSetupOption;
        }());
        Options.SoundManagerSetupOption = SoundManagerSetupOption;
        Options.FileSrcAttribute = "data-filesrc";
        Options.FileLyricAttribute = "data-lyricsrc";
        Options.FileLyricOffsetAttribute = "data-lyricoffset";
        Options.FileLyricIgnoreMetadataAttribute = "data-lyricignoremetadata";
    })(Options = Sm2Shim.Options || (Sm2Shim.Options = {}));
})(Sm2Shim || (Sm2Shim = {}));
//# sourceMappingURL=PlayerOptions.js.map