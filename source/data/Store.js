(function (enyo) {
	//*public
	/**
		These properties will be applied to the global and automatically generated
		_enyo.store_ object.
	*/
	enyo.defaultStoreProperties = {};
	/**
	*/
	enyo.kind({
		name: "enyo.Store",
		kind: enyo.Object,
		/**
			The hash of named _sources_ that are available for use on this _store_.
			The default _source_ is _ajax_ but other may be added by providing
			`enyo.defaultStoreProperties` with a _sources_ hash of those to add.
		*/
		sources: {ajax: "enyo.AjaxSource"},
		/**
			These are special events that objects can register for, for a given
			record. They are emitted at various times as a substitute for normal events
			as would be used by _enyo.Components_. To add events to this array in
			a subkind, simply set the value to an array with the new events your objects
			will emit as notifications. This property is concatenated by default, so
			setting this array will not overwrite the underlying events. These events are
			registered for via the _addListener_, _removeListener_ and _triggerEvent_ API
			of _enyo.Store_.
		
			- `change` is emitted when new values were set on a record
			- `didFetch`, `didCommit` and `didDestroy` are emitted after their appropriate
			  action has successfully completed
		*/
		recordEvents: ["change", "didFetch", "didCommit", "didDestroy"],
		//*@protected
		records: null,
		concat: ["sources", "recordEvents"],
		//*@public
		/**
			Will create a new record of _kind_ (string or constructor) and accepts
			an optional _attributes_ and _options_ parameter(s) that will be passed
			to the constructor of the _enyo.Model_ (see enyo.Model.constructor).
		*/
		createRecord: function (kind, attrs, opts) {
			var Kind = enyo.isString(kind)? enyo.getPath(kind): kind,
				opts = opts? enyo.mixin(opts, {store: this}): {store: this};
			return new Kind(attrs, opts);
		},
		/**
			Add a record by its _euid_ and if it has a value for its known
			_primaryKey_ we index it by this value as well for quicker reference
			later. This is mostly used internally as it is called automatically by
			_models_ as they are created.
		*/
		addRecord: function (rec) {
			var r  = this.records,
				pk = rec.primaryKey;
			if (!r.euid[rec.euid]) { r.euid[rec.euid] = rec; }
			if (rec[pk] && !r.pk[rec[pk]]) { r.pk[rec[pk]] = rec; }
			if (!r.kn[rec.euid]) { r.kn[rec.euid] = rec; }
		},
		/**
			Will remove the reference for the given _record_ if it was in
			the _store_. This is called automatically when a _record_ is destroyed.
		*/
		removeRecord: function (rec) {
			var r  = this.records,
				pk = rec.primaryKey;
			if (r.euid[rec.euid]) { delete r.euid[rec.euid]; }
			if (rec[pk] && r.pk[rec[pk]]) { delete r.pk[rec[pk]]; }
			if (r.kn[rec.euid]) { delete r.kn[rec.euid]; }
		},
		/**
			Requires a hash with _key_ _value_ pairs that are the source's name by
			which it can be referred to by this _store_ and the constructor, instance
			or path to either in a string.
		*/
		addSources: function (props) {
			var dd = this.sources;
			for (var k in props) { dd[k] = props; }
			this._initSources();
		},
		/**
			Accepts the name of a source of this _store_ to remove.
		*/
		removeSource: function (name) {
			delete this.sources[name];
		},
		/**
			Accepts an array of sources names to remove from the _store_.
		*/
		removeSources: function (sources) {
			var dd = this.sources;
			for (var i=0, k; (k=sources[i]); ++i) { delete dd[k]; }
		},
		/**
			This method is designed to query for a _record or records_ via a _source_ and can
			use various strategies to perform compilation of the results in the current _store_.
			This is an asynchronous method and requires 2 parameters, the kind of record to use
			as a constructor or string, and an options hash that includes a _success_ method,
			optionally a _fail_ method, a _source_ designating what source to use (or will use
			record kind's default), a _strategy_ (explained below), and a _attributes_ hash of the
			attributes to use in the query. How these _attributes_ are used in the query depends on
			the _source_ being used. The _success_ method expects to receive the original options
			hash passed into find followed by the result-set (returned by the _strategy_ explained below).
		
			There is a special use for this method if an _euid_ or _primaryKey_ value is provided, the
			_euid_ directly on the options hash and the _primaryKey_ value in the _attributes_ hash of the
			options. It will attempt to find the record locally first, and if found, call the
			_success_ method without using the _source_. If it cannot be found, it will continue normally.
			Whether the _source_ is used or not, in a case where the _euid_ or _primaryKey_ value are provided
			the result will be a single _record_ or _undefined_, not an array.
			
			For queries against only runtime _records_ (in the _store_) see _findLocal_.
				
			When results are retrieved from the requested _source_ it will be handled according to
			the requested _strategy_ (the default is `merge`). Strategies can easily be extended
			or added to by creating a method on the _store_ of the form _[name]Strategy_ then setting
			the _name_ as the _strategy_ option passed to this method. The strategy resolvers receive
			two parameters, the current array of records for the kind in the original request and the
			incoming results from the _source_ query. These methods are executed under the context of
			the _store_. The available strategies with descriptions are below.
				
			Strategies:
		
			1. `replace` - all known _records_ are thrown away (not destroyed) and are replaced by the
			   new results.
			2. `merge` (the default) - any incoming _records_ with the same _primaryKey_ as records
			   already in the _store_ will be updated with the values retrieved, and any new records
			   will simply be added to the store.
		*/
		find: function (kind, opts) {
			var c  = enyo.isString(kind)? enyo.constructorForKind(kind): kind,
				p  = c.prototype,
				o  = enyo.clone(opts),
				pk = p.primaryKey,
				rr = this.records,
				dd = this.sources,
				// d  = enyo.isString(opts.source)? dd[opts.source]: opts.source,
				d  = (o.source && ((enyo.isString(o.source) && dd[o.source]) || o.source)) || dd[p.defaultSource],
				r;
			if (!d) { return this.warn("could not find source `" + (o.source || p.defaultSource) + "`"); }
			// check for the _euid_ to ensure we actually have to use the source, if the _euid_ or
			// the _primaryKey_ value exists and we find the record there were no changes so we call the
			// user provided _success_ method
			if (opts.euid && (r=rr.euid[opts.euid])) { return opts.success(opts, r); }
			if (opts.attributes[pk] && (r=rr.pk[opts.attributes[pk]])) { return opts.success(opts, r); }
			// alright, couldn't find a single record locally so we go ahead and continue down the chain
			o.success = this.bindSafely("didFind", opts);
			o.fail = this.bindSafely("didFail", "find", opts);
			d.find(c, o);
		},
		/**
			This method allows queries to be executed against the runtime database (in the _store_)
			and will not query a _source_ even if it is provided. This is a synchronous method and
			will return an array of _records_ or an empty array if none could be matched on the
			criterion. As is explained below, if a _primaryKey_ value is provided or an _euid_ in the
			options it will return a single _record_ or _undefined_, not an array as this is a
			narrow search for a specific _record_.
		
			This method accepts two parameters, the kind as a constructor or string, and the
			options to match against. Unlike _find_, there are no _success_ or _fail_ methods,
			note that all _keys_ of the options will be used as criteria to match against. If you
			provide an _euid_ key or a key matching the _primaryKey_ of the model kind it will not
			query for any other values or scan the entire dataset.
		
			The filtering process is handled by the _filter_ method of the _store_. Overload this
			method or provide an optional third parameter that can be a function or string name of a
			method on the _store_. This filter method will receive the _options_ to match against and
			the _record_ as the second parameter and should return `true` or `false` as to whether or
			not it should be included in the result-set.
		*/
		findLocal: function (kind, opts, filter) {
			var c  = enyo.isString(kind)? enyo.constructorForKind(kind): kind,
				p  = c.prototype,
				pk = p.primaryKey,
				rr = this.records, fn, r;
			// determine which filter to use
			fn = (filter && (enyo.isString(filter)? this[filter]: filter)) || this.filter;
			fn = this.bindSafely(fn, opts);
			// first check for a provided euid to shortcut the search, we return
			// a non-array here
			if (opts.euid) { return rr.euid[opts.euid]; }
			// if the options have a primary key value we do the same and do not
			// return an array
			if (opts[pk]) { return rr.pk[opts[pk]]; }
			// ok we need to grab all of the _records_ for the given kind and search
			// them for the features
			rr = rr.kn[p.kindName] || [];
			r = enyo.filter(rr, fn, this);
			return r;
		},
		/**
			Overload this method to handle filtering data in special cases. The default
			behavior simply matches a _record_ according to the options provided as attributes.
			This method is used internally by other methods of the _store_. Overload this method
			to handle special cases.
		*/
		filter: function (opts, rec) {
			for (var k in opts) { if (rec[k] !== opts[k]) return false; }
			return true;
		},
		/**
			Responds to _find_ requests asynchronously and executes the correct _strategy_
			for the results before responding to user callbacks.
		*/
		didFind: function () {
			// TODO:
			this.log(arguments);
		},
		/**
			Adds a _listener_ for a specific _event_ that any _records_ or the _store_
			might fire. This is not the same as the _enyo.Component_ event system as this
			does not bubble. Accepts the record _rec_, the _event_, the method _fn_ and
			an optional context _ctx_ for the method to be bound or found on. Returns the
			appropriate listener that needs to be supplied to _removeListener_ later.
		*/
		addListener: function (rec, event, fn, ctx) {
			var m  = this._recordListeners,
				ed = enyo.isString(rec)? rec: rec.euid;
			// add a new entry in map for this record if there isn't one already
			m = m[ed] = m[ed] || {};
			// now add a new entry in the map for that record if this property hasn't
			// been tagged before
			m = m[event] = m[event] || [];
			fn = enyo.isString(fn)? (ctx? ctx[fn]: enyo.getPath(fn)): (ctx? enyo.bind(fn, ctx): fn);
			m.push(fn);
			return fn;
		},
		/**
			Removes a _listener_ for an event. Accepts the record _rec_, the _event_ the
			_listener_ is registered on and the method _fn_ that was returned from _addListener_.
		*/
		removeListener: function (rec, event, fn) {
			var m  = this._recordListeners,
				ed = enyo.isString(rec)? rec: rec.euid, i;
			m = m[ed];
			if (m) {
				m = m[event];
				if (m) {
					i = enyo.indexOf(fn, m);
					if (i > -1) { m.splice(i, 1); }
				}
			}
		},
		/**
			Triggers the given _event_ for the requested _record_ _rec_.
		*/
		triggerEvent: function (rec, event) {
			var m  = this._recordListeners,
				ed = enyo.isString(rec)? rec: rec.euid;
				r  = enyo.isString(rec)? this.records.euid[rec]: rec;
			m = m[ed];
			if (m) {
				m = m[event];
				if (m && m.length) {
					for (var i=0, fn; (fn=m[i]); ++i) {
						fn(rec, event);
					}
				}
			}
		},
		/**
			Adds an observer for a particular event to a specific _record_. The
			first property can be a reference to the desired _record_ or the _euid_
			of the record. The _prop_ parameter is the string for the desired attribute
			to watch, _fn_ can be a function reference, a string for the function of the
			optional _ctx_ property or a path to resolve for the method. Returns the method
			that can be used later to remove the observer. If the optional _ctx_ parameter
			is provided the _fn_ will be bound to it via _enyo.bind_.
		
			Note that these observers are called according to the _enyo.ObserverSupport_ API
			with the exception of the addition of a fourth parameter that is a reference to
			the _record_ caused the observer to fire.
		*/
		addRecordObserver: function (rec, prop, fn, ctx) {
			var m  = this._recordObservers,
				ed = enyo.isString(rec)? rec: rec.euid;
			// add a new entry in map for this record if there isn't one already
			m = m[ed] = m[ed] || {};
			// now add a new entry in the map for that record if this property hasn't
			// been tagged before
			m = m[prop] = m[prop] || [];
			fn = enyo.isString(fn)? (ctx? ctx[fn]: enyo.getPath(fn)): (ctx? enyo.bind(fn, ctx): fn);
			m.push(fn);
			return fn;
		},
		/**
			Removes an observer for the given _rec_(its euid or instance) for the given _prop_
			and matched on the provided _fn_.
		*/
		removeRecordObserver: function (rec, prop, fn) {
			var m  = this._recordObservers,
				ed = enyo.isString(rec)? rec: rec.euid, i;
			m = m[ed];
			if (m) {
				m = m[prop];
				if (m) {
					i = enyo.indexOf(fn, m);
					if (i > -1) { m.splice(i, 1); }
				}
			}
		},
		/**
			Will notify any observers of _rec_ for any properties of the _rec_ in the _changed_
			hash. The optional _prop_ parameter will ensure that notifications are run for any
			observers of the _prop_ for the given _rec_. No other properties will be fired. The
			_rec_ parameter can be the record or its euid.
		*/
		notifyRecordObservers: function (rec, prop) {
			var m  = this._recordObservers,
				ed = enyo.isString(rec)? rec: rec.euid,
				r  = enyo.isString(rec)? this.records.euid[rec]: rec,
				ch = false;
			m = m[ed];
			if (m) {
				if (prop) {
					this._notifyObservers(r, m[prop], prop);
				} else {
					for (var k in r.changed) {
						if (m[k] && m[k].length) {
							this._notifyObservers(r, m[k], k);
						}
					}
				}
			}
			// if something changed, we go ahead and notify listeners of the _change_ event
			this.triggerEvent(rec, "change");
		},
		//*@protected
		_notifyObservers: function (rec, lrs, prop) {
			var rv = rec.previous[prop],
				v  = rec.get(prop);
			for (var i=0, o; (o=lrs[i]); ++i) {
				// called according to the observer parameters, prev, current, prop
				o(rv, v, prop, rec);
			}
		},
		//*@public
		/**
			When the `fetch` method is executed on a _record_ and it is successful this
			method will be called before any success method supplie as an option to the
			_record_ itself. Overload this method to handle other scenarios.
		*/
		didFetch: function (rec, opts, xhr, res) {
			if (opts) {
				if (opts.success) { return opts.success(res); }
			}
			this.triggerEvent(rec, "didFetch");
		},
		/**
			When the `commit` method is executed on a _record_ and it is successful this
			method will be called before any success method supplied as an option to the
			_record_ itself. Overload this method to handle other scenarios.
		*/
		didCommit: function (rec, opts, xhr, res) {
			if (opts) {
				if (opts.success) { return opts.success(res); }
			}
			this.triggerEvent(rec, "didCommit");
		},
		/**
			When the `destroy` method is executed on a _record_ and it is successful
			this method will be called before any success method supplied as an option to
			the _record_ itself. Overload this method to handle other scenarios.
		*/
		didDestroy: function (rec, opts, xhr, res) {
			if (opts) {
				if (opts.success) { return opts.success(res); }
			}
			this.triggerEvent(rec, "didDestroy");
		},
		/**
			This method is executed when one of the primary actions as failed. It has the
			name of the action (one of "fetch", "commit", "destroy"), the reference to the
			record the action failed on, and the options originally passed to the store for
			this action. Overload this method to handle other possible fail cases gracefully.
			By default it will look for and execute a "fail" method of the options should it
			exist.
		*/
		didFail: function (action, rec, opts, xhr, res) {
			if (opts) {
				if (opts.fail) { return opts.fail(res); }
			}
		},
		//*@protected
		/**
			Internal method called to find the requested source and execute the correct
			method. It also hooks the _stores_ own response mechanisms via the options hash.
		*/
		fetchRecord: function (rec, opts) {
			var dd = this.sources,
				o  = opts? enyo.clone(opts): {},
				d  = dd[o.source || rec.defaultSource];
			if (!d) { return this.warn("could not find source `" + (o.source || rec.defaultSource) + "`"); }
			o.success = this.bindSafely("didFetch", rec, opts);
			o.fail = this.bindSafely("didFail", "fetch", rec, opts);
			d.fetch(rec, o);
		},
		/**
			Internal method called to find the requested source and execute the correct
			method. It also hooks the _stores_ own response mechanisms via the options hash.
		*/

		commitRecord: function (rec, opts) {
			var dd = this.sources,
				o  = opts? enyo.clone(opts): {},
				d  = dd[o.source || rec.defaultSource];
			if (!d) { return this.warn("could not find source `" + (o.source || rec.defaultSource) + "`"); }
			o.success = this.bindSafely("didCommit", rec, opts);
			o.fail = this.bindSafely("didFail", "commit", rec, opts);
			d.commit(rec, o);
		},
		/**
			Internal method called to find the requested source and execute the correct
			method. It also hooks the _stores_ own response mechanisms via the options hash.
		*/
		destroyRecord: function (rec, opts) {
			var dd = this.sources,
				o  = opts? enyo.clone(opts): {},
				d  = dd[o.source || rec.defaultSource];
			if (!d) { return this.warn("could not find source `" + (o.source || rec.defaultSource) + "`"); }
			o.success = this.bindSafely("didDestroy", rec, opts);
			o.fail = this.bindSafely("didFail", "destroy", rec, opts);
			d.destroy(rec, o);
		},
		_initRecords: function () {
			var r  = this.records,
				pp = ["euid", "pk", "kn"];
			for (var i=0, k; (k=pp[i]); ++i) {
				r[k] = r[k] || {};
			}
		},
		_initSources: function () {
			var dd = this.sources,
				Kind;
			for (var k in dd) {
				if ((Kind = dd[k]) && enyo.isString(Kind)) { Kind = enyo.getPath(Kind); }
				if (Kind) {
					if ("function" == typeof Kind && Kind.prototype) {
						dd[k] = new Kind({store: this});
					} else { 
						dd[k] = Kind;
						Kind.store = this;
					}
				} else if (!Kind && enyo.isString(dd[k])) { this.warn("could not find source -> `" + dd[k] + "`"); }
			}
		},
		constructor: enyo.super(function (sup) {
			return function (props) {
				var r = sup.apply(this, arguments);
				this.sources = this.sources || {};
				this.records = this.records || {};
				this._initRecords();
				this._initSources();
				this._recordObservers = {};
				this._recordListeners = {};
				return r;
			};
		}),
		//*@protected
		_recordObservers: null,
		_recordListeners: null
	});
	//*@protected
	enyo.concatHandler("sources", function (proto, props) {
		if (props.sources) {
			var pd = proto.sources? enyo.clone(proto.sources): {},
				rd = props.sources;
			// will deliberately override already defined sources so they can
			// be remapped by subkinds
			proto.sources = enyo.mixin(pd, rd);
			// we don't want this to whipeout what we just did
			delete props.sources;
		}
	});
	//*@public
	/**
		This method will put-off instancing the global enyo.store until after client-source has
		been loaded and evaluated so that if they modify the _enyo.DefaultStoreProperties_ hash
		it can be applied.
	*/
	enyo.ready(function () { enyo.store = new enyo.Store(enyo.defaultStoreProperties); });
})(enyo);