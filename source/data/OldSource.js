//*@public
/**
	_enyo.Source_ is used to create data source objects for instances of
	[enyo.Store](#enyo.Store). It is an abstract kind that provides an interface
	to overload according to the implementation needs of your particular driver.
	_enyo.Store_ has the _ajax_ source by default; it provides an example of how
	to create a source to meet specific needs.

	A Source instance will have its _store_ property automatically set to the
	store it belongs to, for back reference.

	Note that when subclassing _enyo.Source_, any method not needed in a read-only
	backend (e.g., _destroy()_ or _commit()_) is already a _nop_ action and may
	be safely ignored unless the kind you are subclassing has its own
	implementation.
*/
enyo.kind({
	name: "enyo.Source",
	kind: null,
	/**
		When a source is assigned to a store, this will be a reference to that
		store's instance.
	*/
	store: null,
	/**
		An abstract method designed to retrieve a record or records from this
		source's target. Accepts the record to fetch and the options associated with
		the request. This is an asynchronous method.
	*/
	fetch: function (rec, opts) {
		// action defined here
	},
	/**
		An abstract method designed to commit a record's current state to this
		source's target. Accepts the record to commit and the options associated
		with the request. This is an asynchronous method.
	*/
	commit: function (rec, opts) {
		// action defined here
	},
	/**
		An abstract method designed to delete a record from this source's target.
		Accepts the record to destroy and the options associated with the request.
		This is an asynchronous method.
	*/
	destroy: function (rec, opts) {
		// action defined here
	},
	/**
		An abstract method designed to execute a query with the given parameters
		against this source's target. Accepts the constructor for the kind being
		queried for and the options passed to the original _find()_ request (from
		the store).
	*/
	find: function (ctor, opts) {
		// action defined here
	},
	/**
		See [enyo.Object.get()](#enyo.Object::get) for details on this method.
	*/
	get: function () {
		return enyo.getPath.apply(this, arguments);
	},
	/**
		See [enyo.Object.set()](#enyo.Object::set) for details on this method.
	*/
	set: function () {
		return enyo.setPath.apply(this, arguments);
	}
});
