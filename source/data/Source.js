//*@public
/**
	The _enyo.Source_ kind is used to create _sources_ for _enyo.Stores_. They
	are an abstract kind that provides an interface to overload for a particular
	_drivers'_ implementation needs. By default, _enyo.store_ will have the _ajax_
	_source_ already, see that for an example of how to create a _source_ specific
	to your implementation needs.

	Instances of a _source_ will have its _store_ property automatically set to the
	_store_ it belongs to for backreference.

	Note that when subclassing _enyo.Source_, for methods not needed (such as _destroy_
	or _commit_) in read-only backends, they are already nop actions and can be ignored
	safely unless the kind your are subclassing has their own implementation.
*/
enyo.kind({
	name: "enyo.Source",
	kind: null,
	/**
		When a _source_ is assigned to a _store_ this will be a reference to that
		_stores_ instance.
	*/
	store: null,
	/**
		An abstract method designed to retrieve a _record_ or _records_ from the
		target of this _source_. Accepts the _record_ to fetch and the options
		associated with the request. This is an asynchronous method.
	*/
	fetch: function (rec, opts) {
		// action defined here
	},
	/**
		An abstract method designed to commit a _records current state_ to the
		target of this _source_. Accepts the _record_ to commit and the options
		associated with the request. This is an asynchronous method.
	*/
	commit: function (rec, opts) {
		// action defined here
	},
	/**
		An abstract method designed to delete a _record_ from the target of this
		_source_. Accepts the _record_ to destroy and the options associated with the
		request. This is an asynchronous method.
	*/
	destroy: function (rec, opts) {
		// action defined here
	},
	/**
		An abstract method designed to execute a query with the given parameters against
		the target of this _source_. Accepts the constructor for the kind being queried
		for and the options passed to the original _find_ request (from the _store_).
	*/
	find: function (ctor, opts) {
		// action defined here
	},
	/**
		See _enyo.Object.get_ for details on this method.
	*/
	get: function () {
		return enyo.getPath.apply(this, arguments);
	},
	/**
		See _enyo.Object.set_ for details on this method.
	*/
	set: function () {
		return enyo.setPath.apply(this, arguments);
	}
});
