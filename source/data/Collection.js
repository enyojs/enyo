//*@public
/**
	The _enyo.Collection_ kind is an array-like structure that houses collections
	of _enyo.Models_. An _enyo.Collection_ can be set as the _controller_ property
	of an _enyo.Control_ or the _controllers_ block of an _enyo.Application_. They
	are read-only entities in terms of retrieving and setting data via an _enyo.Source_.
	Their implementation of _observers_ and _events_ are the same as _enyo.Model_.

	A _collection_ will lazily instantiate _records_ when they are requested. This
	is important to be aware of depending on the order of operations.

	An _enyo.Collection_ object can generate "add", "remove", and "destroy"
	events that can be received using the _addListener_ method.
*/
enyo.kind({
	name: "enyo.Collection",
	kind: null,
	noDefer: true,
	/**
		This represents the _kind_ of records the _collection_ will house. By
		default it is simply _enyo.Model_ but can be set to any _kind_ of model.
	*/
	model: enyo.Model,
	/**
		Set this to the correct _url_ for requesting data for this _collection_.
	*/
	url: "",
	/**
		By default _collections_ will instantiate records only as needed, but if
		the desired action is to create them all instantly as they are added set
		this flag to true.
	*/
	instanceAllRecords: false,
	/**
		This is the default _source_ for requests made by this _collection_.
	*/
	defaultSource: "ajax",
	/**
		This will be the underlying array storing the _records_ for this _collection_.
		Modifying this array may have undesirable affects.
	*/
	records: null,
	/**
		All _collections_ have a _store_ reference. You can set this to a specific _store_
		instance in your application or use its default (the enyo.store global).
	*/
	store: null,
	/**
		The number of _records_ in the _collection_.
	*/
	length: 0,
	/**
		Fetch the _data_ for this _collection_. Accepts options with optional
		callbacks, _success_ and _fail_, the _source_ (or the _defaultSource_
		for the kind will be used), and the _replace_ flag. If _replace_ is
		`true` all current _records_ in the _collection_ will be removed (not
		destroyed) before adding any results. If _replace_ is set this method
		will return an array of any _records_ that were removed. The options can
		also specify the strategy for how to add the received data, indicating
		_strategy_ as `add` or `merge` where `add` is the most efficient and will
		place all incoming _records_ at the end of the _collection_ and _merge_
		will attempt to identify existing records with the same _primaryKey_
		and update that record with the results. When using the `add` strategy, if
		incoming data from _fetch_ belongs to a _record_ already in the _collection_
		this _record_ will be duplicated and have a unique _euid_. By default, `add`
		is used unless specified otherwise.
	*/
	fetch: function (opts) {
		var o = opts? enyo.clone(opts): {};
		// ensure there is a strategy for the _didFetch_ method
		(opts = opts || {}) && (opts.strategy = opts.strategy || "add");
		o.success = enyo.bindSafely(this, "didFetch", this, opts);
		o.fail = enyo.bindSafely(this, "didFail", "fetch", this, opts);
		// now if we need to lets remove the records and attempt to do this
		// while any possible asynchronous remote (not always remote...) calls
		// are made for efficiency
		enyo.asyncMethod(this, function () { this.store.fetchRecord(this, o); });
		if (o.replace && !o.destroy) { this.removeAll(); }
		else if (o.destroy) { this.destroyAll(); }
	},
	/**
		Convenience method not requiring the callee to supply the _replace_
		parameter of the options.
	*/
	fetchAndReplace: function (opts) {
		var o = opts || {};
		o.replace = true;
		return this.fetch(o);
	},
	/**
		Convenience method not requiring the callee to supply the _destroy_
		parameter of the options.
	*/
	fetchAndDestroy: function (opts) {
		var o = opts || {};
		o.destroy = true;
		return this.fetch(o);
	},
	/**
		This method is executed after a successful _fetch_, asynchronously. It
		will _merge_ or _replace_ any new _data_ with its existing _data_ (see
		_replace_ option for _fetch_). Receives the _collection_, the options and
		the result (_res_).
	*/
	didFetch: function (rec, opts, res) {
		// the parsed result
		var r = this.parse(res),
			s = opts.strategy, fn;
		if (r) {
			// even if replace was requested it will have already taken place so we
			// need only evaluate the strategy for merging the new results
			if ((fn=this[s]) && enyo.isFunction(fn)) {
				fn.call(this, r);
			}
		}
		if (opts) {
			if (opts.success) { opts.success(rec, opts, res); }
		}
	},
	/**
		When a _record_ fails during a request this method is executed with the name of
		the command that failed followed by the reference to the record, the original
		options and the result (if any).
	*/
	didFail: function (which, rec, opts, res) {
		if (opts && opts.fail) {
			opts.fail(rec, opts, res);
		}
	},
	/**
		Overload this method to process incoming data before _didFetch_ will attempt
		to merge it. This method should __always return an array of record hashes__.
	*/
	parse: function (data) {
		return data;
	},
	/**
		Produces an immutable hash of contents of the _collection_ as a JSON
		parseable array.
	*/
	raw: function () {
		// since we use our own _map_ method we are sure all records will be resolved
		return this.map(function (rec) { return rec.raw(); });
	},
	/**
		Will return the JSON stringified version of the output of _raw_ of this record.
	*/
	toJSON: function () {
		return enyo.json.stringify(this.raw());
	},
	/**
		One of the strategies available after the _collection_ has retrieved data
		from its _fetch_ method. It will attempt to find and update any record already
		in the _collection_. If the _model kind_ associated with this _collection_ has
		_mergeKeys_ they will be used to compare the records otherwise it will depend
		on the _primaryKey_ value for comparison. Any unmerged records will be added at
		the end of the _collection_. If a _primaryKey_ value exists on the incoming _records_
		it will take precedence over _mergeKeys_.
	*/
	merge: function (rec) {
		// TODO: with a little more time this could be optimized a bit better...
		var p  = this.model.prototype,
			pk = p.primaryKey,
			mk = p.mergeKeys,
			a  = [], r, f, k, m, w;
		rec = (enyo.isArray(rec) && rec) || [rec];
		for (var j=0, nr; (nr=rec[j]); ++j) {
			if (enyo.exists(nr[pk]) || mk) {
				f = false;
				for (k=0; !f && (r=this.at(k)); ++k) {
					if ((!isNaN(nr[pk]) || nr[pk]) && r.get(pk) == nr[pk]) {
						// ensure that the incoming data is properly parsed
						r.setObject(r.parse(nr));
						f = true;
					} else if (mk) {
						w = false;
						for (m=0; m<mk.length; ++m) {
							if (nr[mk[m]] != r.get(mk[m])) { w=false; break; }
							else { w=true; }
						}
						if (w) {
							r.setObject(r.parse(nr));
							f = true;
						}
					}
				}
				if (!f) { a.push(nr); }
			} else { a.push(nr); }
		}
		// for any records that didn't get merged we need to add them
		// now as a group
		if (a.length) { this.add(a); }
	},
	/**
		Adds a _record_ or _records_ if an array to the _collection_. Optionally
		you can provide the index at which to insert the _record(s)_. The default is to
		add them at the end. If additions are made successfully this triggers a `add` event
		to be fired with the array of the index of any _records_ successfully added. Returns
		the array of indices as well.
	*/
	add: function (rec, i) {
		var rr = this.records,
			d  = [],
			l  = this.length,
			f  = this.instanceAllRecords;
		// figure out what the index we will be inserting them at
		i = (!isNaN(i) && (i=Math.max(0,i)) && (i=Math.min(this.length, i))) || this.length;
		// if this is not at array already we ensure that it is
		rec = (enyo.isArray(rec) && rec) || [rec];
		// if there aren't actually any models we just return an empty array
		if (!rec.length) { return d; }
		// we will only provide the indices in the return and events so that we can lazily
		// instantiate the records as they are needed
		for (var j=0, r; (r=rec[j]); ++j) {
			if (f) { rec[j] = this.createRecord(r, null, false); }
			d.push(j+i);
		}
		// rather than perform a splice over and over potentially we run it once
		rec.unshift.apply(rec, [i, 0]);
		rr.splice.apply(rr, rec);
		// update the new length
		this.length = rr.length;
		// trigger the event with the indices
		if (d.length) { this.triggerEvent("add", {records: d}); }
		// now alert any observers of the length change
		if (l != this.length) { this.notifyObservers("length", l, this.length); }
	},
	/**
		Accepts a _record_ or _records_ if an array to remove from the _collection_.
		Returns a hash of any records (and the index they were at) that were successfully removed.
		This emits the "remove" event that will have an argument with the _records_ that were
		removed. Unlike the "add" event that only has indices, this event has references
		to the actual _records_.
	*/
	remove: function (rec) {
		// in order to do this as efficiently as possible we have to find any
		// record(s) that exist that we actually can remove and ensure that they
		// are ordered so, in reverse order, we can remove them without the need
		// to lookup their indices more than once or make copies of any arrays beyond
		// the ordering array, unfortunately we have to make two passes against the
		// records being removed
		// TODO: there may be even faster ways...
		var rr = [],
			d  = {},
			l  = this.length, x=0, m=0;
		// if not an array, make it one
		rec = (enyo.isArray(rec) && rec) || [rec];
		for (var j=0, r, i, k; (r=rec[j]); ++j) {
			if ((i=this.indexOf(r)) > -1) {
				if (i <= m) {
					m=i;
					rr.unshift(i);
				} else if (i >= x) {
					x=i;
					rr.push(i);
				} else {
					k=0;
					while (rr[k] < i) { ++k; }
					rr.splice(k-1, 0, i);
				}
				d[i] = r;
			}
		}
		// now we iterate over any indices we know we'll remove in reverse
		// order safely being able to use the index we just found for both the
		// splice and the return index
		for (j=rr.length-1; !isNaN((i=rr[j])); --j) {
			this.records.splice(i, 1);
			if (d[i] instanceof this.model) {
				d[i].removeListener("change", this._recordChanged);
				d[i].removeListener("destroy", this._recordDestroyed);
			}
		}
		// fix up our new length
		this.length = this.records.length;
		// trigger the event with the instances
		if (rr.length) { this.triggerEvent("remove", {records: d}); }
		// now alert any observers of the length change
		if (l != this.length) { this.notifyObservers("length", l, this.length); }
		return d;
	},
	/**
		Removes all _records_ from the _collection_. This action does __not destroy
		the records__, they will no longer belong to this _collection_. If the desired
		action is to remove and destroy all _records_ see _destroyAll_. This method
		returns an array with all of the removed _records_.
	*/
	removeAll: function () {
		return this.remove(this.records);
	},
	/**
		Removes all _records_ from the _collection_ and _destroys_ them. This will
		still emit the _remove_ event, and any _records_ being destroyed will also
		emit their own _destroy_ events.
	*/
	destroyAll: function () {
		var rr = this.removeAll(), r;
		this._destroyAll = true;
		for (var k in rr) { (r=rr[k]) && r.destroy(); }
		this._destroyAll = false;
	},
	/**
		Returns the index of the given _record_ if it exists in this _collection_.
		Will be `-1` otherwise. Supply optional offset to begin search at an index
		other than `0`.
	*/
	indexOf: function (rec, offset) {
		return enyo.indexOf(rec, this.records, offset);
	},
	/**
		Iterates over all the _records_ in this _collection_ accepting the
		return value of _fn_ (under optional context _ctx_) and returns the
		immutable array of that result. If no context is provided the function
		will be executed in the context of the _collection_.
	*/
	map: function (fn, ctx) {
		ctx = ctx || this;
		// we have to ensure that all of our records have been resolved to the
		// correct kind so we hijack the map call to use our _at_ method
		return enyo.map(this.records, function (r, i) {
			return fn.call(ctx, this.at(i));
		}, this);
	},
	/**
		Iterates over all the _records_ in this _collection_ filtering them
		out of the result set if _fn_ returns `false`. Pass an optional context
		_ctx_ (or the function will be executed in the context of this _collection).
		Returns an array of all the _records_ that caused _fn_ to return `true`.
	*/
	filter: function (fn, ctx) {
		ctx = ctx || this;
		// we have to ensure that all of our records have been resolved to the
		// correct kind so we hijack the filter call to use our _at_ method
		return enyo.filter(this.records, function (r, i) {
			return fn.call(ctx, this.at(i));
		}, this);
	},
	/**
		Returns the _record_ at the requested index, `undefined` if none. Since records
		may be stored or not of the correct form, this method will resolve them as they
		are requested (lazily).
	*/
	at: function (i) {
		var r = this.records[i];
		if (r && !(r instanceof this.model)) {
			r = this.records[i] = this.createRecord(r, null, false);
		}
		return r;
	},
	/**
		To create an instance of a _record_ immediately in this _collection_ use this
		method. This method is used internally when instantiating _records_ according to
		its _model_ property. Accepts the _attrs_ to be used, the _props_ to apply and an
		optional index at which to insert the record into the _collection_. If the index is
		`false` it will not add the record to the _collection_ at all. Returns the instance
		of the newly created _record_.
	*/
	createRecord: function (attrs, props, i) {
		var d = {parse: true, owner: this},
			r = this.store.createRecord(this.model, attrs, props? enyo.mixin(d, props): d);
		i = false === i? -1: (!isNaN(i) && i >= 0? i: this.length);
		r.addListener("change", this._recordChanged);
		r.addListener("destroy", this._recordDestroyed);
		if (i >= 0) { this.add(r, i); }
		return r;
	},
	/**
		Implement a method called _recordChanged_ that receives the _record_,
		the _event_ and any additional properties passed along when any _record_
		in the _collection_ emits its `change` event.
	*/
	recordChanged: null,
	/**
		Adds an observer according to the the _enyo.ObserverSupport_ API.
	*/
	addObserver: function (prop, fn, ctx) {
		return this.store._addObserver(this, prop, fn, ctx);
	},
	/**
		Removes an observer according to the the _enyo.ObserverSupport_ API.
	*/
	removeObserver: function (prop, fn) {
		return this.store._removeObserver(this, prop, fn);
	},
	/**
		Notifies observers, but, unlike the _enyo.ObserverSupport_ API it accepts
		only one, optional, parameter _prop_, otherwise any _changed_ properties
		will be notified.
	*/
	notifyObservers: function (prop) {
		this.store._notifyObservers(this, prop);
	},
	/**
		Add a listener for the given _event_. Callbacks will be executed with two
		parameters of the form _record_, _event_ -- where _record_ is the _record_
		that is firing the event and _event_ is the name (string) for the event
		being fired. The _addListener_ method accepts parameters according to the
		_enyo.ObserverSupport_ API but does not function the same way.
	*/
	addListener: function (prop, fn, ctx) {
		return this.store.addListener(this, prop, fn, ctx);
	},
	/**
		Removes a listener. Accepts the name of the _event_ that the listener is
		registered on and the method returned from the _addListener_ call (if a
		_ctx_ was provided otherwise just the method is fine). Returns `true` on
		successful removal and `false` otherwise.
	*/
	removeListener: function (prop, fn) {
		return this.store.removeListener(this, prop, fn);
	},
	/**
		Triggers any _listeners_ for the _event_ of this _record_ with optional
		_args_.
	*/
	triggerEvent: function (event, args) {
		this.store.triggerEvent(this, event, args);
	},
	/**
		When creating a new _collection_ you may pass it an array of _records_
		(hashes to be converted or instances) and an optional hash of properties
		to be applied to the collection. Both are optional, meaning, you can supply
		neither, either, or both. If options and data are present, options will be
		applied first.
	*/
	constructor: function (data, opts) {
		var d = data && enyo.isArray(data) && data,
			o = opts || (data && !enyo.isArray(data) && data);
		if (o) { this.importProps(o); }
		this.records = d || [];
		// initialized our length property
		this.length = this.records.length;
		// we bind this method to our collection so it can be reused as an event listener
		// for many records
		this._recordChanged = enyo.bindSafely(this, this._recordChanged);
		this._recordDestroyed = enyo.bindSafely(this, this._recordDestroyed);
		this.euid = enyo.uuid();
		// attempt to resolve the kind of model if it is a string and not a constructor
		// for the kind
		var m = this.model;
		if (m && enyo.isString(m)) {
			this.model = enyo.getPath(m);
		} else {
			this.model = enyo.checkConstructor(m);
		}
		// initialize the store
		this.storeChanged();
	},
	/**
		Destroys the _collection_ and removes all _records_. This does not destroy the
		_records_.
	*/
	destroy: function () {
		var rr = this.removeAll(), r;
		for (var k in rr) {
			r = rr[k];
			if (r.owner === this) {
				r.destroy();
			}
		}
		this.triggerEvent("destroy");
		this.store = null;
		this.destroyed = true;
	},
	/**
		Retrieves _path_ from the _collection_ and returns its value or undefined.
		Note that passing _path_ as an integer is the same as calling _at_. You cannot
		use _get_ to retrieve data from a _record_ in the _collection_ this will only
		retrieve properties of the _collection_.
	*/
	get: function (path) {
		if (!isNaN(path)) { return this.at(path); }
		return enyo.getPath.call(this, path);
	},
	/**
		Sets the value of _path_ to _val_ on the _collection_. This will not work
		for setting values on properties of _records_ in the _collection_.
	*/
	set: function (path, val) {
		return enyo.setPath.call(this, path, val);
	},
	//*@protected
	importProps: function (p) {
		if (p) {
			if (p.records) {
				this.records = this.records? this.records.concat(p.records): p.records;
				delete p.records;
			}
			for (var k in p) { this[k] = p[k]; }
		}
	},
	storeChanged: function () {
		var s = this.store || enyo.store;
		if (s) {
			if (enyo.isString(s)) {
				s = enyo.getPath(s);
				if (!s) {
					enyo.warn("enyo.Collection: could not find the requested store -> ", this.store, ", using" +
						"the default store");
				}
			}
		}
		s = this.store = s || enyo.store;
		s.addCollection(this);
	},
	_recordChanged: function (rec, e, p) {
		// TODO: this will be used internally for relational data structures
		// if the developer provided a _recordChanged_ method we need to call
		// it now
		if (this.recordChanged) {
			this.recordChanged(rec, e, p);
		}
	},
	_recordDestroyed: function (rec) {
		// if we're destroying all records we ignore this as the record
		// will have already been removed, otherwise we remove the record
		// from the collection
		if (!this._destroyAll) { this.remove(rec); }
	},
	_destroyAll: false
});