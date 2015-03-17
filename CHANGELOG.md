# Migration Notes/API Changes

This file tracks changes made to the Enyo API since the last public release.
While this list should not be considered exhaustive, we hope it will provide
useful guidance for those maintaining existing Enyo apps, as well as those
planning new ones.

Since the release of Enyo 2.5.1.1, we have introduced support for resolution
independence, a set of new abilities that allow apps to automatically scale
themselves to run under different screen resolutions.  Within Enyo core, this
is achieved largely through code in the new Node module
`less-plugin-resolution-independence` (under `tools/minifier/node_modules`) and
in `resolution.js`, home of the new `enyo.ri` namespace.

In addition to the work on resolution independence, we have made the following
API changes in Enyo core:

* In `enyo.Animator`, added `complete()` method.

* In `enyo.Control`, added accessibility API for voice readout (text-to-speech).
    This includes configuration properties `accessibilityLabel`,
    `accessibilityAlert`, and `accessibilityDisabled`, along with their
    associated getter and setter methods.  Also added second parameter
    (`preventRooting`) to `renderInto()`.

* In `enyo.DataList`, added new API method `getVisibleControlRange()` and
    related configuration property `visibleThreshold`.

* In `enyo.DataRepeater`, added new `selectionType` property.

* In `enyo.gesture.drag`, added `configureHoldPulse()`, which may be used to
    define custom hold events.

* In `enyo.Scroller`, added `stop()` method.

* In `enyo.Scroller` and `enyo.TouchScrollStrategy`, added `remeasure()` method.

* In `enyo.SpriteAnimation`, added support for JavaScript timing-based
    animation, which may be enabled by setting the new `useCssAnimation` flag to
    `false`.
