# Migration Notes/API Changes

This file tracks changes made to the Enyo API since the last public release.
While this list should not be considered exhaustive, we hope it will provide
useful guidance for those maintaining existing Enyo apps, as well as those
planning new ones.

Since the release of Enyo 2.5.1.1, we have made many changes across the
framework to replace Enyo's proprietary loader (and its `package.js` manifest
files) with a modular system based on the CommonJS format.

Some of the most readily apparent changes involve the reorganization of existing
repos and the introduction of new ones.  For example, code samples, which were
previously grouped together within each library, have been consolidated in the
new `enyo-strawman` repo.  Similarly, the old build tools formerly housed in
Enyo core have been replaced by a new set of tools found in the new `enyo-dev`
repo.

Less obvious, but no less significant, are changes affecting the way that Enyo
applications are structured and built.  Owners of existing apps will need to
perform certain tasks to make their apps compatible with the new scheme.  (These
are outlined in the Enyo 2.6 Conversion Guide.)

In addition to the overarching structural changes, there have also been some
significant changes in functionality.  Most notably, we have introduced support
for resolution independence, a set of new abilities that allow apps to
automatically scale themselves to run under different screen resolutions.
Within Enyo core, this is achieved largely through code in `resolution.js`, home
of the new `ri` namespace.

In addition to the work on resolution independence, we have made the following
API changes in Enyo core:

* Added `enyo.Loop`, a run-loop based on requestAnimationFrame.

* Added work-in-progress kinds `enyo.BackgroundTaskManager`,
    `enyo.PriorityQueue`, and `enyo.SystemMonitor`, and work-in-progress mixin
    `enyo.TaskManagerSupport`.

* Added work-in-progress kind `enyo.LightPanels` and work-in-progress mixin
    `enyo.ViewPreloadSupport`.

* Added work-in-progress kinds `enyo.NewDataList`, `enyo.VirtualDataRepeater`,
    `enyo.NewAnimator`, `enyo.NewDrawer`, and `enyo.NewScrollThumb`, and
    work-in-progress mixin `enyo.Scrollable`.

* In `enyo.Animator`, added `complete()` method.

* In `enyo.Control`:

    + Added `renderOnShow` property.  If set to `true`, the control will not be
        rendered until its `showing` property has also been set to `true`.

    + Added second parameter (`preventRooting`) to `renderInto()`.

* In `enyo.DataList`, added new API method `getVisibleControlRange()` and
    related configuration property `visibleThreshold`.

* In `enyo.DataRepeater`, added new `selectionType` property.

* In `gesture.drag`, added `configureHoldPulse()`, which may be used to
    define custom hold events.

* In `enyo.Scroller`, added `stop()` method.

* In `enyo.Scroller` and `enyo.TouchScrollStrategy`, added `remeasure()` method.

* In `enyo.Select`, added new configuration properties `size`, `multiple`, and
    `disabled`.

* In `enyo.SpriteAnimation`, added support for JavaScript timing-based
    animation, which may be enabled by setting the new `useCssAnimation` flag to
    `false`.

* In `enyo.UiComponent`, added `getNextControl()` method, which returns a
    control's next sibling control.
