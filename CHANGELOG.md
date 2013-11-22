## 2.3.0-rc1

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
