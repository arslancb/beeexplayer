## BeeEx Player

BeeEx Player is an ultimate video player built on top of VideoJs
Beeex!


JS Embed Code
```
<script src="https://cdn.jsdelivr.net/gh/arslancb/beeexplayer@master/beeexplayer.min.js"></script>
```


## Sprites Thumbnails

BeeExplayer Supports Multiple Sprites. Following Syntax is supported



### Options
There is only single property provided currently: `sprites`

```js
const options = {
  sprites: [
    {
      url: 'https://example.com/video-1.png',
      start: 0,
      duration: 10,
      interval: 2,
      width: 160,
      height: 90,
    },
    {
      url: 'https://example.com/video-2.png',
      start: 10,
      duration: 20,
      interval: 2,
      width: 160,
      height: 90,
    },
  ]
}
```


|Option name|Datatype|Default value|Description|
|--------|------------|----|----|
|`url`|`string`|`''`|URL of thumbnail sprite image
|`start`|`number`|`0`|Start point of time of the video section that this sprite image is covering
|`duration`|`number`|`0`|Duration of the video section that this sprite image is covering
|`width`|`number`|`0`|Width of preview thumbnail (`px`)
|`height`|`number`|`0`|Height of preview thumbnail (`px`)
|`interval`|`number`|`0`|Interval between each preview thumbnails of the video section that this sprite image is covering

You can use multiple sprite images in case that preview thumbnails for entire video is divided into several chunks. Just pass them as array of sprites, and the module will handle it on behalf of you.

### Rules to follow
To make things happen preperly, there are some rules to follow:

1. **Each `duration` of video sections should not overlap each other.** For example, if your first sprite image covers [0:00 ~ 10:00] and your second sprite image covers [5:00 ~ 15:00], then there is an overlap between them([5:00 ~ 10:00]). The module will emit warning on browser console if it catches any overlaps.
2. **`width` and `height` should be provided for each sprites.** If not, even if the images are loaded those will not be displayed as expected.
3. **`duration` should be multiple of `interval`.** From `start` point of time, at every `interval` seconds, the preview thumbnail will be displayed, so to display corresponding preview with hovering time correctly, follow this rule.


## Purge CDN
https://purge.jsdelivr.net/gh/arslancb/beeexplayer@latest/beeexplayer.min.js
