//*@public
/**
	_enyo.Collection_ is an array-like structure that houses collections of
	[enyo.Model](#enyo.Model) instances. A collection may be set as the
	_controller_ property of an [enyo.Control](#enyo.Control) or declared in the
	_controllers_ block of an _enyo.Application_. Collections are read-only
	entities in terms of retrieving and setting data via an
	[enyo.Source](#enyo.Source). The implementation of observers and events is the
	same as in _enyo.Model_.

	A collection lazily instantiates records when they are requested. This is 
	important to keep in mind with respect to the order of operations.

	Collection objects generate _add_, _remove_, and _destroy_ events that may be
	listened for using the _addListener()_ method.
*/
enyo.kind({
	name: "enyo.Collection",
	kind: null,
	noDefer: true,
	/**
		The kind of records the collection will house. By default, it is simply
		_enyo.Model_, but it may be set to any kind of model.
	*/
	model: enyo.Model,
	/**
		The correct URL for requesting data for this collection.
	*/
	url: "",
	/**
		By default, collections instantiate records only as needed; set this flag to
		true if you want records to be created as soon as as they are added to the
		collection
	*/
	instanceAllRecords: false,
	/**
		The default source for requests made by this collection
	*/
	defaultSource: "ajax",
	/**
		The underlying array that stores the records for this collection. Modifying
		this array may have undesirable effects.
	*/
	records: null,
	/**
		All collections have a store reference. You may set this to a specific
		store instance in your application or use the default (the _enyo.store_
		global).
	*/
	store: null,
	/**
		The number of records in the collection
	*/
	length: 0,
	/**
		Fetches the data for this collection. Accepts options with optional
		callbacks, _success_ and _fail_, the _source_ (if not specified, the
		_defaultSource_ for the kind will be used), and the _replace_ flag. If
		_replace_ is true, all current records in the collection will be removed
		(though not	destroyed) before adding any results. If this is the case, the
		method will return an array of any records that were removed.
		
		The options	may include a _strategy_ for how received data is added to the
		collection. The _"add"_ strategy (the default) is most efficient; it places
		each incoming record at the end of the collection. The _"merge"_ strategy
		will make the collection attempt to identify existing records with the same
		_primaryKey_ as the incoming one, updating any matching records. When using
		the _add_ strategy, if incoming data from _fetch()_ belongs to a record
		already in the collection, this record will be duplicated and have a unique
		_euid_.
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
		Convenience method that does not require the callee to set the _replace_
		parameter in the passed-in options.
	*/
	fetchAndReplace: function (opts) {
		var o = opts || {};
		o.replace = true;
		return this.fetch(o);
	},
	/**
		Convenience method that does not require the callee to set the _destroy_
		parameter in the passed-in options.
	*/
	fetchAndDestroy: function (opts) {
		var o = opts || {};
		o.destroy = true;
		return this.fetch(o);
	},
	/**
		This method is executed after a successful fetch, asynchronously. Any new
		data either replaces or is merged with the existing data (as determined by
		the_replace_ option for _fetch()_). Receives the collection, the options,
		and the result (_res_).
	*/
	didFetch: function (rec, opts, res) {
		// the parsed result
		var rr = this.parse(res),
			s  = opts.strategy, fn;
		if (rr) {
			// mark the data as having been retrieved remotely so when it is instanced it
			// will know to pass the parse flag
			for (var i=0, r; (r=rr[i]); ++i) { r.didFetch = true; }
			// even if replace was requested it will have already taken place so we
			// need only evaluate the strategy for merging the new results
			if ((fn=this[s]) && enyo.isFunction(fn)) {
				fn.call(this, rr);
			}
		}
		if (opts) {
			if (opts.success) { opts.success(rec, opts, res); }
		}
	},
	/**
		When a record fails during a request, this method is executed with the name
		of the command that failed, followed by a reference to the record, the
		original options, and the result (if any).
	*/
	didFail: function (which, rec, opts, res) {
		if (opts && opts.fail) {
			opts.fail(rec, opts, res);
		}
	},
	/**
		Overload this method to process incoming data before _didFetch()_ attempts
		to merge it. This method should _always_ return an array of record hashes.
	*/
	parse: function (data) {
		return data;
	},
	/**
		Produces an immutable hash of the contents of the collection as a
		JSON-parseable array.
	*/
	raw: function () {
		// since we use our own _map_ method we are sure all records will be resolved
		return this.map(function (rec) { return rec.raw(); });
	},
	/**
		Returns the output of _raw()_ for this record as a JSON string.
	*/
	toJSON: function () {
		return enyo.json.stringify(this.raw());
	},
	/**
		One of the strategies for adding data retrieved via _fetch()_ to the
		collection. It attempts to find and update any matching records already in
		the collection. If the model kind associated with this collection has
		_mergeKeys_, they will be used to compare the records; if not, the
		_primaryKey_ value is used for comparison. Any unmerged records will be
		added at the end of the collection. If a _primaryKey_ value exists on the
		incoming records, it will take precedence over _mergeKeys_. Set the optional
		second parameter to true to force parsing of all records by the model kind's
		built-in _parse()_ method.
	*/
	merge: function (rec, didFetch) {
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
							// check for the _didFetch_ flag that would have been added if
							// this was called from that method so we can know whether to
							// parse the data or not
							var df = nr.didFetch || didFetch;
							delete nr.didFetch;
							r.setObject(df? r.parse(nr): nr);
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
		Adds a passed-in record, or array of records, to the collection. Optionally,
		you may provide the index at which to insert the record(s). Records are
		added at the end by default. If additions are made successfully, an _add_
		event is fired with the array of the indices of any records successfully
		added. The method also returns this array of indices. Set the optional third
		parameter to true to force all data to be parsed by the model kind's own
		_parse()_ method.
	*/
	add: function (rec, i, didFetch) {
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
			if (f) { rec[j] = this.createRecord(r, didFetch? {didFetch: true}: null, false); }
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
		Accepts a record, or an array of records, to be removed from the collection.
		Returns a hash of any records that were successfully removed (along with
		their former indices). Emits the _remove_ event, which specifies the records
		that were removed. Unlike the _add_ event, which contains only indices, the
		_remove_ event has references to the actual records.
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
		Removes all records from the collection. This action _does not_ destroy the
		records; they will simply no longer belong to this _collection_. If the
		desired action is to remove and destroy all records, use _destroyAll()_
		instead. This method returns an array of all of the removed records.
	*/
	removeAll: function () {
		return this.remove(this.records);
	},
	/**
		Removes all records from the collection and destroys them. This will still
		emit the _remove_ event, and any records being destroyed will also emit
		their own _destroy_ events.
	*/
	destroyAll: function () {
		var rr = this.removeAll(), r;
		this._destroyAll = true;
		for (var k in rr) { (r=rr[k]) && r.destroy(); }
		this._destroyAll = false;
	},
	/**
		Returns the index of the given record if it exists in this collection;
		otherwise, returns _-1_. Supply an optional offset to begin searching at a
		non-zero index.
	*/
	indexOf: function (rec, offset) {
		return enyo.indexOf(rec, this.records, offset);
	},
	/**
		Iterates over all the records in this collection, accepting the
		return value of _fn_ (under optional context _ctx_), and returning the
		immutable array of that result. If no context is provided, the function is
		executed in the context of the collection.
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
		Iterates over all the records in this collection, filtering them out of the
		result set if _fn_ returns false. You may pass in an optional context	_ctx_;
		otherwise, the function will be executed in the context of this collection.
		Returns an array of all the records that caused _fn_ to return true.
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
		Returns the record at the requested index, or _undefined_ if there is none.
		Since records may be stored or malformed, this method resolves them as they
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
		Creates an instance of a record immediately in this collection. This method
		is used internally when instantiating records according to the _model_
		property. Accepts the attributes (_attrs_) to be used, the properties
		(_props_) to apply, and an optional index at which to insert the record into
		the _collection_. If the index is false, the record will not be added to the
		collection at all. Returns the newly created record instance.
	*/
	createRecord: function (attrs, props, i) {
		// ensure we know whether or not to flag the data as needing to be parsed
		var df = attrs.didFetch;
		delete attrs.didFetch;
		var d = {owner: this, parse: df? true: false},
			r = this.store.createRecord(this.model, attrs, props? enyo.mixin(d, props): d);
		i = false === i? -1: (!isNaN(i) && i >= 0? i: this.length);
		r.addListener("change", this._recordChanged);
		r.addListener("destroy", this._recordDestroyed);
		if (i >= 0) { this.add(r, i); }
		return r;
	},
	/**
		Implement a method called _recordChanged()_ that receives the record, the
		event, and any additional properties passed along when any record in the
		collection emits its _change_ event.
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
		Notifies observers, but, unlike the _enyo.ObserverSupport_ API, accepts only
		a single, optional parameter. If _prop_ is not specified, observers of any
		changed properties will be notified.
	*/
	notifyObservers: function (prop) {
		this.store._notifyObservers(this, prop);
	},
	/**
		Adds a listener for the given event. Callbacks will be executed with two
		parameters, _record_ and _event_, where _record_ is the record that is
		firing the event and _event_ is the name (string) for the event being fired.
		This method accepts parameters according to the _enyo.ObserverSupport_ API,
		but does not function in the same way.
	*/
	addListener: function (prop, fn, ctx) {
		return this.store.addListener(this, prop, fn, ctx);
	},
	/**
		Removes a listener. Accepts the name of the event that the listener is
		registered on and the method returned from the _addListener()_ call (if a
		_ctx_ was provided). Returns true on successful removal; otherwise, false.
	*/
	removeListener: function (prop, fn) {
		return this.store.removeListener(this, prop, fn);
	},
	/**
		Triggers any listeners for this record's specified event, with optional
		_args_.
	*/
	triggerEvent: function (event, args) {
		this.store.triggerEvent(this, event, args);
	},
	/**
		When creating a new collection, you may pass it an array of records	(either
		instances or hashes to be converted) and an optional hash of properties to
		be applied to the collection. Both are optional, meaning that you can supply
		neither, either one, or both. If both options and data are present, options
		will be applied first.
	*/
	constructor: function (data, opts) {
		var d  = data && enyo.isArray(data) && data,
			o  = opts || (data && !enyo.isArray(data) && data),
			p  = o? o.parse: false,
			df = o? o.didFetch: false;
		if (o) { this.importProps(o); }
		this.records = (d && (p && this.parse(d)) || d) || [];
		// if the _didFetch_ flag is present we need to mark the props as having been
		// fetched so they will appropriately be parsed later
		if (df) { for (var i=0, r; (r=d[i]); ++i) { r.didFetch = true; } }
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
		Destroys the collection and removes all records. This does not destroy the
		records.
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
		Retrieves the passed-in _path_ from the collection and returns its value or
		_undefined_. Note that passing _path_ as an integer is the same as calling
		_at()_. You cannot use _get()_ to retrieve data from a record in the
		collection; this will only retrieve properties of the collection.
	*/
	get: function (path) {
		if (!isNaN(path)) { return this.at(path); }
		return enyo.getPath.call(this, path);
	},
	/**
		Sets the value of _path_ to _val_ on the collection. This will not work for
		setting values on properties of records in the collection.
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
			for (var k in p) { if (k != "didFetch" && k != "parse") { this[k] = p[k]; } }
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