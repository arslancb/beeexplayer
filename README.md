## BeeEx Player

BeeEx Player is an ultimate video player built on top of VideoJs
Beeex!


JS Embed Code
```
<script src="https://cdn.jsdelivr.net/gh/arslancb/beeexplayer@master/beeexplayer.min.js"></script>
```


## Sprites Thumbnails

BeeExplayer Supports Multiple Sprites. Following Syntax is supported

```html

<script>
  var player = BeeExPlayer('my-video');

  // setup 160x90 thumbnails in sprite.jpg, 1 per second
  player.spriteThumbnails({
    url: 'https://example.com/sprite.jpg',
    width: 160,
    height: 90
  });
</script>
```

### Configuration

option | type | mandatory | default | description
------ | ---- | --------- | ------- | -----------
`url`  | String | &#10004; |   | Sprite image location.
`width` | Integer | &#10004; |  | Width of a thumbnail in pixels.
`height` | Integer | &#10004; |   | Height of a thumbnail in pixels.
`interval` | Number |  | `1` | Interval between thumbnail frames in seconds.
`responsive` | Integer |  | `600` | Width of player in pixels below which thumbnails are reponsive. Set to `0` to disable.


