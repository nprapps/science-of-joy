web-story elements
==================

These elements act as a reusable UI component for "stories" within the larger presentation. The element marks all its children as `hidden`, except the current "page" for display. We typically put `section` elements inside a web-story.

Page content elements are in the light DOM and can be styled as normal. If your page does not need to expose events or clickable areas (such as links or interactive content), set the `intangible` attribute on it to allow the web-story element to respond to clicks or swipes.

Pages also have some special data attributes that can be used to trigger behavior from the story:

* data-slug - sets a "slug" attribute on the web-story for styling purposes
* data-takeover - hides the story controls if not empty
* data-goto - transfers the page to a new location instead of loading this page

Styles for the internal controls and parts of web-story elements are in its Shadow DOM template, `_web-story.html`. Inside this template, we can only use CSS, not LESS. However, you can set values as CSS custom properties and pass those through by setting them on the appropriate element in your LESS file. For example, to change the background color of the control section to True Blue, you could set `web-story#example { --controls-bg: @true }` in the LESS.

These elements dispatch some events when they update:

* webstorypage - when the user goes to a new page, event detail will include `page` index
* webstorygoto - dispatched when a page is marked with `data-goto`
* webstoryclose - when the user clicks the close button

Custom Element superclass
-------------------------

`web-story` inherits from a `CustomElement` superclass that provides a few utility functions:

* static `boundMethods` property will automatically bind functions to this instance
* static `mirroredProps` property will create getters and setters for attributes
* static `template` property will attach a shadow DOM and populate it, and create a lookup on `this.elements` for any tags with an `as="..."` attribute.

