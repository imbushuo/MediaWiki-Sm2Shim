# Sm2Shim: A shim layer for MediaWiki FlashMP3 replacement

Sm2Shim provides a shim layer that maintains the compatibility of FlashMP3 syntax while replacing Flash media playback with modern dual-stack technology (HTML5 preferred, Flash as backup) using SoundManager2.

This project is inspired by the [SoundManager2 Bar Demo](http://www.schillmania.com/projects/soundmanager2/demo/bar-ui/).

## Installation

Make sure you have a recent MediaWiki installation (tested on 1.27.1). 

Remove FlashMP3 extension if you installed it. Then go to your extension folder, clone this project:

    git clone https://github.com/imbushuo/MediaWiki-Sm2Shim Sm2Shim

Then enable this extension in your `LocalSettings.php`:

    wfLoadExtension('Sm2Shim');

That's it - you are all set.

## Optimization

Sometimes ResourceLoader is slow - which means users have to wait long time for scripts loaded so they can play media files. You can skip ResourceLoader by setting `$wgSm2Shim_UseResourceManager` to `false` in your `LocalSettings.php` to utilize external CDN for player.

## License

This project is licensed under BSD.