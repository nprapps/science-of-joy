web-story elements
==================

These elements act as a reusable UI component for "stories" within the larger presentation. The element marks all its children as `hidden`, except the current "page" for display. We typically put `section` elements inside a web-story.

Page content elements are in the light DOM and can be styled as normal. If your page does not need to expose events or clickable areas (such as links or interactive content), set the `intangible` attribute on it to allow the web-story element to respond to clicks or swipes.

Pages also have some special data attributes that can be used to trigger behavior from the story:

* data-slug - sets a "slug" attribute on the web-story for styling purposes
* data-takeover - hides the story controls if not empty

Styles for the internal controls and parts of web-story elements are in its Shadow DOM template, `_web-story.html`. Inside this template, we can only use CSS, not LESS. However, you can set values as CSS custom properties and pass those through by setting them on the appropriate element in your LESS file. For example, to change the background color of the control section to True Blue, you could set `web-story#example { --controls-bg: @true }` in the LESS.



