As opposed to have separate unique id's for all various additional, registerable properties, all of the
mixins now share a single _euid_ that any of them can create when necessary. This same _euid_ will be
used for _enyo.Model_ and _enyo.Collection_ with _enyo.Store_ internally.

### ObserverSupport

_addObserver()_ and (new) _observe()_ methods return `this` as opposed to a bound method or
method since it stores the context reference if supplied as an optimization.

Added _observe()_ as an alias to _addObserver()_.

Added _unobserve()_ as an alias to _removeObserver()_.

Added _isObserving()_ method.

_removeAllObservers()_ now accepts an optional `path` parameter to remove all observers of a particular
`path`.

_addObserver()_ and (new) _observe()_ methods no longer create a link/chain of observers adhoc; instead
they create an instance of _ChainObserver_ when necessary.

_removeObserver()_ and (new) _unobserve()_ methods return `this`.

While _observers_ is still the property to use for declarative observers in a kind definition
for any instance _observers()_ is a method that returns the mutable array of observers registered for
the instance.

### RegisteredEventSupport (alias EventEmitter)

Source file _RegisteredEventSupport.js_ has been moved to _EventEmitter.js_.

_enyo.RegisteredEventSupport_ is now an alias to _enyo.EventEmitter_ mixin.

Added _on()_ as an alias to _addListener()_.

Added _emit()_ as an alias to _triggerEvent()_.

_listeners_ is a property used for declarative additions in kind definitions but for an instance
is the _listeners()_ method returning a mutable array of any listeners for the instance.

### ComputedSupport

_defaultValue_ was removed as an operational configuration option for a computed property.

Added _isComputed()_ method, primarily for internal use.

### BindingSupport

Removed the previously public _initBindings()_ method (was used only during initialization of object and nowhere else in framework).

Revmoed the previous public _refreshBindings()_ and _rebuildBindings()_ methods as they are no longer relevant.