## 2.4.0-pre.3

Added support for `mozAnon` and `mozSystem` properties to enyo.xhr. The mozSystem boolean enables cross-origin requests
 and the mozAnon boolean enables anonymous xhr by not sending cookies or authentication headers. Both these
settings are currently only working on Firefox OS.

Added triggerHandler method to Component that invokes the handler for a given event type.

## 2.4.0-pre.2

_controller_ is no longer a special property. This affects _DataRepeater_,
_DataList_ and _DataGridList_, _UiComponent_ (and child-kinds) and
_Application_. For _DataRepeater_, _DataList_ and _DataGridList_ use
_collection_ instead. For all other kinds there is no direct replacement for
the previous functionality. Instead use a binding from the path to the local
property desired.

_Application.controllers_ has been removed. Declare controllers as normal
_components_.

_DataRepeater.length_ is no longer a bound property. In its place, you should
check for the existence of _collection_ then the length. This value was not
very useful as it was and became a performance hog. This change affects
_DataRepeater_, _DataList_ and _DataGridList_.

_Collection_ no longer has _filtered_, _filters_, _filterProps_, and
_activeFilter_ properties and the _filter_ method no longer can be used to
clear the active filter.  This whole filtering feature is being rewritten to
be more flexible and performant.


## 2.4.0-pre.1

Added isFetching property to enyo.Collection, for common use case of showing loader spnner via binding.

Add sizing property to enyo.Image, which renders image as <div> with background-image, and allows use
of contain or cover background-size properties.  Also added `position` property for use with sizing property,
for setting background-position

Updated lessc.js and minify.js to use relative URL's when compiling less files, to be compatible with the
bootplate `Theme.less` scheme for importing and then overriding library variables in application less file.S

_enyo.asyncMethod()_ now accepts an anonymous function as a single parameter.
Previous asnyncMethod signature remains supported as well.

_enyo.Collection.destroyAll()_ now accepts a boolean parameter to signify it
will call the record's _destroyLocal()_ method as opposed to the default of
_destroy()_.

Added _enyo.Collection.destroyAllLocal()_ as a convenience method.

Added _enyo.Collection.fetchAndDestroyLocal()_ method to do the same as
_fetchAndDestroy()_ except it will call _destroyLocal()_ on the records
instead of _destroy()_. This also means you could call _fetch()_ with the
options property _destroyLocal_ set to _true_ to have the same effect.

Added support for the Page Visibility API by normalizing  visibilitychange
events, the document.hidden and the document.visibilityState properties. Uses
fallbacks to support older browsers.

## 2.3.0-rc.6

A new method, `enyo.dom.getAbsoluteBounds`, has been added. This method is more sophisticated than
previous methods for getting a node's absolute bounds, taking into account translateX, translateY
and matrix3d transforms. The existing `enyo.Control.getAbsoluteBounds` API remains unchanged, but its
implementation has been changed to utilize the new `enyo.dom.getAbsoluteBounds` method.

Added _configureHoldPulse_ method to "down" event for configuring subsequent "holdpulse" events. Pass in a
hash of options that can include "delay" (ms delay between "holdpulse" events), "moveTolerance" (threshold
for determining cursor has left original location), "endHold" (values include "onMove" and "onLeave",
determines whether "holdpulse" should be cancelled when cursor leaves tolerant target area or the control
itself, respectively), and "resume" (whether or not "holdpulse" should resume when re-entering either the
control ["onLeave" endHold value] or the thresholded original coordinates ["onMove" endHold value]).

Add _enyo.toUpperCase()_ and _enyo.toLowerCase()_ methods. Use these to replace calls to
_String.toUpperCase()_ and _String.toLowerCase()_ in code that needs to be locale-aware.

## 2.3.0-rc.5

From this release forward, the `display` style attribute will no longer be synced back to the
`showing` property after Control creation to avoid inconsistent state situations when `getShowing`
is called in a `showingChanged` handler before the `showing` and `display` values are synced.
Changing `showing` will update the `display` style, but changes to the style will not be reflected
in the showing property.

Added _fixedChildSize_ public property to _enyo.DataList_ to allow the list to optimize performance when
list items will have fixed dimensions. Whenever items in the list will be uniform this option should be
utilized.

Added _defaultValue_ value support for _computed properties_. Simply provide a configuration object with a key
_defaultValue_ and any value, even `undefined`.

Added _enyo.Control.absoluteShowing_ read-only boolean property that may be observed to indicate whether
the control is actually visible. Setting the _showing_ property to `false` for any control will flip this
properties value to `false` for all children. This property can then be reliably used to separate logic that
should only occur when a control is visible.

## 2.3.0-rc.4

Added _enyo.perfNow()_, a high-precision, high performance monotonic timestamp, which is independent of changes
to the system clock and safer for use in animation, etc.  Falls back to _enyo.now()_ (based on the JS _Date_
object) on platforms where `window.performance.now()` is not available.

_enyo.Control.getAbsoluteShowing()_ now accepts an optional boolean parameter that, if `true`, will
skip the _getBounds()_ call internally and rely solely on the return value of the _getShowing()_
public API.

_enyo.Scroller_ has been updated such that it will only propagate _resize_ events to children when its'
_showing_ property is `true`.

## 2.3.0-rc.1

_enyo.dispatcher.capture_ API no longer bubbles all captured events through the normal event chain, but
rather notifies the captureTarget when specific events occur through a map of callbacks passed as a parameter
to the `capture` API.  This is a breaking change to the enyo.dispatcher.capture API, however it is a very
unpublicized (and fairly difficult-to-use) feature that was only used in enyo.Popup among Enyo-team developed
controls, so we assume it will have low impact on the general public.

Needed to revert the change to _enyo.Binding_ from 2.3.0-pre.11. Re-implemented the _stop()_ method
for interrupting transform propagation (as was still indicated by the API docs) and note that bindings
will again propagate `undefined` values to ensure bindings clear when expected.

_enyo.Binding_ has a new property `allowUndefined` that defaults to `true` allowing the `undefined` object
to be propagated. Setting this to `false` will keep it from propagating `undefined` without the use of
a _transform_ or an overloaded binding _kind_.

_enyo.Collection's_ _filter()_ method may be called without any parameters to easily apply whatever the
_activeFilter_ may be set to, if anything. It will return an immutable array of either the filtered content
or if no _activeFilter_ was present the entire dataset. This is a convenience extension of the original
behavior and does not modify the existing behavior as it could not be called without parameters previously
and would throw an error.

_enyo.DataList's_ _getChildForIndex()_ and now _childForIndex()_ (same method, different name) now correctly
return `undefined` consistently rather than `false`. This correction is consistent with previous documentation
and base kind method (inheriting API from _enyo.DataRepeater_).

## 2.3.0-pre.12

_enyo.DataList_ no longer has the _controlsPerPage_ property but instead has a _pageSizeMultiplier_ value
as it now dynamically determines the number of controls for a given page.

## 2.3.0-pre.11

Enyo now supports the W3C pointer events recommendation and will use those in
preference to mouse events when available.  The earlier MSPointer event
support is now only enabled when W3C pointer events aren't detected, fixing a
touch-recognition problem in Internet Explorer 11.

enyo.Model.set() now supports the force parameter.

Removed unusable feature `dirty` from _enyo.Binding_ as implementing it would
cause unnecessary overhead and it ultimately a useless feature since they are
synchronously executed.

Removed the _modelChanged()_ and deprecated _controllerChanged()_ base methods from _enyo.UiComponent_
thus any developer code currently calling `this.inherited(arguments)` from within an overloaded
_modelChanged()_ method will fail and needs to be removed. This is a feature change required by ENYO-3339.

~~Removed the _stop()_ method from _enyo.Binding_ as required by ENYO-3338. Instead of
calling that method via the binding reference in a transform return `undefined`
(or nothing since `undefined` is the default) to achieve the same behavior.~~

Instances of _enyo.Binding_ will no longer propagate `undefined`; instead use `null`.

Deprecated the `controllers` array for _enyo.Application_; instead use `components`
with the same features. This should modify bindings from `.app.controllers.{name}` to
`.app.$.{name}` for controllers/components created for an _enyo.Application_ instance.

Deprecated the `controller` property for _enyo.DataRepeater_ and all sub-kinds; instead use
`collection`. This also means you should update any overloaded `controllerChanged` methods
to instead be `collectionChanged` and bindings referencing `controller` to `collection`.

The registered event system previously employed by _enyo.Model_ and _enyo.Collection_ has
been reworked and is no longer dependent on _enyo.Store_. See _enyo.RegisteredEventSupport_
for more information. This change means the API methods previously available via _enyo.Store_
(including the observer support implementation) no longer exist.

_enyo.Collection_ is now a sub-kind of _enyo.Component_ and thus employs the default
_enyo.ObserverSupport_ mechanims (as well as _enyo.ComputedSupport_).

_enyo.Model_ now employs the default _enyo.ObserverSupport_ and _enyo.BindingSupport_ with
the same limitation of only working with `attributes` of the record.

As required by ENYO-3339, _enyo.Binding_ now registers for an entire path and will update
based on changes anywhere in the path.

_enyo.Store_ now throws an _error_ instead of a _warning_ when a duplicate `primaryKey` is
found for unique records in the same _enyo.Store_.

_enyo.Scroller_ and _enyo.ScrollStrategy_ have been updated to normalize new properties available
on the returned hash of _getScrollBounds()_. It now will indicate via the xDir and yDir properties
a 1 (positive movement along the axis), -1 (negative movement along the axis) or 0 (no movement on
the axis).

_enyo.Store_ built-in methods: _didFetch()_, _didCommit()_, _didFail()_ have new method signatures
in the form _rec, opts, res_ from an _enyo.Source_. An _enyo.XHRSource_ adds a fourth parameter that
is the XHR object reference.

_enyo.DataRepeater_ has a new property _selectionEvents_ to allow for mapping other events to the
selection process previously tied only to _ontap_.

## 2.3.0-pre.10 (9 October 2013)

Removed macro support from bindings

Changed bindingDefaults to only apply to the bindings defined in the
description in which it lives

Changed computed and observers to use space delimited string of dependent
properties instead of array (array still supported, but deprecated)

Computed properties now send previous and current values to their observers.

enyo.ViewController.resetView removed, replaced with resetView property that
controls if the view is automatically recreated when destroyed.

Removed internal "concat" property, replaced by concat static method on kinds.
Should have no application impact unless code was extending the framework in
very deep ways.

Fixed missing "release" event for end of hold gesture, bug introduced in
2.3.0.pre.8

Fixed regression with this.inherited's handling of replacement argumments.

enyo.trim() updated to use native String.prototype.trim() when available.

Change to enyo.Model `parse` method handling, before it was confusing to
developers because it was only executed under specific circumstances (there
were reasons for this) but now it will be executed on all fetched data and all
data passed to the constructor (when call `new enyo.Model` and passing
attributes, or when it is created using `enyo.store.createRecord` or an
_enyo.Collection_ instantiates it). This does require that the method checks
to see what data is being passed in if it was relying on this method to
reformat fields or meta-properties from remote data but also creates local
records that already have the correct data format.

Change to enyo.Model `merge` strategy that now accepts instanced record(s) or
data hash(es), can merge without forcing the record to be instanced, and to
remain inline with the `parse` method change will parse any data being merged
if it is a data hash (not if it is an instanced record). This method no longer
accepts the optional second parameter.

Change to enyo.Model `add` method that no longer accepts optional third
parameter and will automatically call the model's `parse` method if it is a
data-hash (not an instanced record).

Added framework method `enyo.getPosition` that returns an immutable object with
the most recent _clientX, clientY_, _pageX, pageY_ and _screenX, screenY_ values.
As noted in the documentation, IE8 and Opera both report inconsistent values for
_screenX, screenY_ and we facade the _pageX, pageY_ values for IE8 since they are
unsupported.

The _enyo.Application_ `controllers` property has been deprecated. While current
code using it should continue to execute properly it is recommended you update your
applications to use the `components` array instead and bindings from `.app.controller.name`
should instead be `.app.$.name`. References of the `controllers` property on instances
of _enyo.Application_ are actually using the `$` property by alias. *THIS FUNCTIONALITY
WILL BE REMOVED IN THE NEXT MAJOR RELEASE AFTER 2.3.0*.

The `defaultKind` of _enyo.Application_ has been set to _enyo.Controller_.

The _enyo.Collection_ kind is now a subkind of _enyo.Component_ which means it now inherits
from the _enyo.ObserverSupport_ mixin as opposed to the special observer support in
_enyo.Model_.

The `global` property has now been moved to a property of the _enyo.Controller_ kind
and _controllers_ whose `global` flag is set to `true` will *not be destroyed even if
their `owner` is an _enyo.Application_ that is being destroyed*.

You can no longer retrieve an index from _enyo.Collection_ use the `get` method.
