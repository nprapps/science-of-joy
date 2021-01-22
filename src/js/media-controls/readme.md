media-controls
==============

Universal remote for HTML media elements. Connect this to a media element using the `for` attribute to create a simple playback widget in a different part of the page:

```html
<!-- video tag with an ID -->
<video src="whatever.mp4" id="test-video"></vide>

<!-- controls widget located somewhere else -->
<media-controls for="test-video"></media-controls>
```

