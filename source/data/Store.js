(function (enyo) {
	//*@public
	/**
		The _enyo.Store_ object is a runtime database of _records_ as they are created.
		While there can be multiple _stores_, there is always a top-level _store_ at
		_enyo.store_ that is used by _enyo.Model_ and _enyo.Collection_. The _store serves
		as a liason between _records_ and the requested _enyo.Source_ that dictates how they
		are retrieved and/or persisted.
	*/
	enyo.kind({
		name: "enyo.Store",
		kind: enyo.Object,
		/**
			The hash of named _sources_ that are available for use on this _store_.
			The default _source_ is _ajax_ but other may be added by providing
			`enyo.defaultStoreProperties` with a _sources_ hash of those to add.
		*/
		sources: {ajax: "enyo.AjaxSource", jsonp: "enyo.JsonpSource", localStorage: "enyo.LocalStorageSource"},
		/**
			By default, the store indexes records in several ways one of which is by its
			_primaryKey_ value if it exists. This is intended to be unique and it will
			complain when it finds multiple instances of the same _record_. Set this flag to
			`true` and it will no longer complain but __note__: having duplicate entries of the
			same unique _primaryKey_ in a single _store_ means you cannot use _find_ or
			_findLocal_ on that _primaryKey_, you would need to use _euid_.
		*/
		ignoreDuplicates: false,
		//*@protected
		records: null,
		collections: null,
		concat: ["sources"],
		//*@public
		/**
			Will create a new record of _kind_ (string or constructor) and accepts
			an optional _attributes_ and _options_ parameter(s) that will be passed
			to the constructor of the _enyo.Model_ (see enyo.Model.constructor). If
			_kind_ is not provided _enyo.Model_ will be used by default. Returns the
			newly created instance. Will set the _records_ _store_ property to this
			_store_.
		*/
		createRecord: function (kind, attrs, opts) {
			if (arguments.length < 3) {
				if (enyo.isObject(kind)) {
					opts = attrs;
					attrs = kind;
					kind = enyo.Model;
				}
			}
			var Kind = (enyo.isString(kind) && enyo.getPath(kind)) || (enyo.isFunction(kind) && kind);
			// test to see if opts are opts or attrs are opts
			opts = opts || {};
			enyo.mixin(opts, {store: this});
			// if we didn't find the constructor we just use default
			if (!Kind) { Kind = enyo.Model; }
			return new Kind(attrs, opts);
		},
		/**
			Retrieve a _record_ if it exists by its _euid_.
		*/
		getRecord: function (euid) {
			return this.records.euid[euid];
		},
		/**
			Retrieve a _collection_ if it exists by its _euid_.
		*/
		getCollection: function (euid) {
			return this.collections[euid];
		},
		/**
			Creates a _collection_ of _kind_ (string or constructor) and accepts
			an optional _records_ array and options to be passed to the constructor
			of the _collection_ as the second parameter. Will set the _store_ property
			to this _store_. Returns the newly created instance. If _kind_ is omitted
			_enyo.Collection_ will be used by default.
		*/
		createCollection: function (kind, records, opts) {
			if (arguments.length < 3) {
				if (enyo.isArray(kind)) {
					opts = records;
					records = kind;
					kind = enyo.Collection;
				}
			}
			var Kind = (enyo.isString(kind) && enyo.getPath(kind)) || (enyo.isFunction(kind) && kind);
			// test to see if opts are opts or records are opts
			opts = opts || {};
			enyo.mixin(opts, {store: this});
			// if we didn't find the constructor we just use default
			if (!Kind) { Kind = enyo.Collection; }
			return new Kind(records, opts);
		},
		/**
			Add a record by its _euid_ and if it has a value for its known
			_primaryKey_ we index it by this value as well for quicker reference
			later. This is mostly used internally as it is called automatically by
			_models_ as they are created. Returns `true` on successful addition,
			`false` otherwise.
		*/
		addRecord: function (rec) {
			var rr = this.records,
				pk = rec.primaryKey,
				// this is the object storing the primary keys by instance of a kind
				// since there could be overlap, have to create it if it doesn't already
				// exist
				kn = rr.pk[rec.kindName] || (rr.pk[rec.kindName] = {}),
				f  = false, id, p;
			// the one true universally unique identifier across all bounds at runtime
			// is the simplest case
			if (!rr.euid[rec.euid]) { (rr.euid[rec.euid]=rec) && (f=true); }
			// if there is a value for the primary key we need to add that
			if (enyo.exists((id=rec.get(pk)))) {
				// in this special indexing we ensure that a primary key does not
				// have duplicate entry -- same primary key value but different euid
				// indicates duplicates
				if ((p=kn[id]) && p.euid != rec.euid) {
					// we have a duplicate
					if (!this.ignoreDuplicates) {
						this.warn("duplicate record added to store, euid's `" + p.euid + "` and `" + rec.euid + "`" +
							", for primary key `" + pk + ": " + rec.get(pk) + "`, previous submission being overwritten " +
							"by newer, be careful as you don't know which instance you may have in any given control; " +
							"use strategies when possible to avoid this scenario or set enyo.store's `ignoreDuplicates` " +
							"flag to true.");
					}
				}
				f = (kn[id]=rec) && true;
			}
			// regardless of whether or not the record has a primary key now, that could be because
			// it is delayed in retrieving one, doesn't have one and won't, or either way we want to
			// know if it changes so mappings are accurate internally
			rec.addObserver(pk, this._recordKeyChanged);
			// for kind name registration we have to make sure that there are any entries
			// for that kind already
			if (!rr.kn[rec.kindName]) { rr.kn[rec.kindName] = {}; }
			if (!rr.kn[rec.kindName][rec.euid]) { (rr.kn[rec.kindName][rec.euid]=rec) && (f=true); }
			if (f) { rec.store = this; }
			return f;
		},
		/**
			Adds a collection to the _store_. This is typically done automatically
			and does not need to be called. Accepts a reference to the _collection_.
			Will set the _store_ to the _store_ property on the _collection_. Returns
			`true` on successful addition, `false` otherwise.
		*/
		addCollection: function (c) {
			var cc = this.collections,
				f  = false;
			if (!cc[c.euid]) { (cc[c.euid]=c) && (f=true); }
			if (f) {
				c.store = this;
				c.addListener("destroy", this._collectionDestroyed);
			}
			return f;
		},
		/**
			Removes a _collection_ from the _store_. Accepts a reference to the _collection_
			or the euid of the _collection_ to remove. Returns `true` on successful removal,
			`false` otherwise.
		*/
		removeCollection: function (c) {
			var cc = this.collections,
				f  = false;
			c = (enyo.isString(c) && cc[c]) || c;
			delete cc[c.euid];
			c.removeListener("destroy", this._collectionDestroyed);
		},
		/**
			Will remove the reference for the given _record_ if it was in
			the _store_. This is called automatically when a _record_ is destroyed.
		*/
		removeRecord: function (rec) {
			var rr = this.records,
				pk = rec.primaryKey, id;
			rec.euid && delete rr.euid[rec.euid];
			(enyo.exists(id=rec.get(pk))) && (delete rr.pk[rec.kindName][id]);
			rec.euid && delete rr.kn[rec.kindName][rec.euid];
			rec.removeListener("destroy", this._recordDestroyed);
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
			// in cases where no kind is provided we assume enyo.Model which is consistent with
			// other similar api's
			if (arguments.length == 1) {
				opts = kind;
				kind = enyo.Model;
			}
			// first find the kind, get access to its prototype and the
			// options so we can bind our own success and fail methods
			var c  = enyo.isString(kind)? enyo.constructorForKind(kind): kind,
				p  = c.prototype,
				o  = opts,
				a  = o.attributes;
			// now we need to figure out what strategy, source, pk...
			var dd = this.sources,
				rr = this.records,
				pk = p.primaryKey,
				d  = (o.source && ((enyo.isString(o.source) && dd[o.source]) || o.source)) || dd[p.defaultSource],
				r  = (o.euid && rr.euid[o.euid]) || (a && a[pk] && rr.pk[p.kindName][a[pk]]);
			// if we already found the record then we know that it was one of the cases where searching
			// locally first worked so we return this value directly to the original success method
			if (r) { return o.success(o, r); }
			// now we have to ensure we have a valid source
			if (!d) { return this.warn("could not find source `" + (o.source || p.defaultSource) + "`"); }
			// otherwise we need to clone the options so we can now add our own success methods
			o = enyo.clone(o);
			// bind our methods
			o.success = this.bindSafely("didFind", opts);
			o.fail = this.bindSafely("didFail", "find", opts);
			// set the strategy, note that we're setting this on the options being passed to the
			// success method not our clone
			opts.strategy = opts.strategy || "merge";
			// and fire off the request assuming the source will be able to handle the request
			d.find(c, o);
		},
		/**
			This method allows queries to be executed against the runtime database (in the _store_)
			and will not query a _source_ even if it is provided. This is a synchronous method and
			will return an array of _records_ or an empty array if none could be matched on the
			criterion. As is explained below, if a _primaryKey_ value is provided or an _euid_ in the
			options it will return a single _record_ or _undefined_, not an array as this is a
			narrow search for a specific _record_.
		
			This method accepts three parameters, the kind as a constructor or string, the
			options to match against and an optional _filter_ method. Unlike _find_, there are no
			_success_ or _fail_ methods, note that all _keys_ of the options will be used as criteria
			to match against. If you provide an _euid_ key, a key matching the _primaryKey_ of the
			model kind, or a _kindName_ property it will not query for any other values or scan the entire
			dataset. Using the _kindName_ property will return all records registered in this _store_
			for that _kindName_.
		
			The filtering process is handled by the _filter_ method of the _store_. Overload this
			method or provide an optional third parameter that can be a function or string name of a
			method on the _store_. This filter method will receive the _options_ to match against and
			the _record_ as the second parameter and should return `true` or `false` as to whether or
			not it should be included in the result-set.
		*/
		findLocal: function (kind, opts, filter) {
			if (arguments.length < 3 && enyo.isObject(kind)) {
				if (enyo.isFunction (opts)) { filter = opts; }
				opts = kind;
				kind = enyo.Model;
			}
			var c  = enyo.isString(kind)? enyo.constructorForKind(kind): kind,
				p  = c.prototype,
				pk = p.primaryKey,
				rr = this.records, fn, r;
			// first check for a provided euid to shortcut the search, we return
			// a non-array here
			if (opts.euid) { return rr.euid[opts.euid]; }
			// if the options have a primary key value we do the same and do not
			// return an array
			if (enyo.exists(opts[pk])) { return rr.pk[p.kindName][opts[pk]]; }
			if (opts.kindName) { return (r=rr.kn[opts.kindName]) && enyo.values(r); }
			// determine which filter to use
			fn = (filter && (enyo.isString(filter)? this[filter]: filter)) || this.filter;
			fn = this.bindSafely(fn, opts);
			// ok we need to grab all of the _records_ for the given kind and search
			// them for the features
			rr = enyo.values(rr.kn[p.kindName]) || [];
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
			for (var k in opts) { if (rec.get(k) !== opts[k]) return false; }
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
			fn = enyo.isString(fn)? (ctx? ctx[fn]: enyo.getPath(fn)): (ctx? enyo.bind(ctx, fn): fn);
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
			Removes all listeners from a given _record_ or _collection_.
		*/
		removeAllListeners: function (rec) {
			var rr = this.records,
				r  = enyo.isString(rec)? rr.euid[rec]: rec,
				ed = r.euid,
				m  = this._recordListeners, hh; 
			m = m[ed];
			if (m) {
				for (var e in m) {
					hh = m[e];
					for (var i=0, h; (h=hh[i]); ++i) { this.removeListener(r, e, h); }
				}
			}
		},
		/**
			Triggers the given _event_ for the requested _record_ _rec_ passing optional
			_args_ as a single parameter. Note _args_ is expected to be a mutable object literal
			or instance of a _kind_. Event listeners accept the _record_, the _event_ name and
			the optional _args_ parameter.
		*/
		triggerEvent: function (rec, event, args) {
			var m  = this._recordListeners,
				ed = enyo.isString(rec)? rec: rec.euid,
				r  = enyo.isString(rec)? this.records.euid[rec]: rec;
			m = m[ed];
			if (m) {
				m = m[event];
				if (m && m.length) {
					for (var i=0, fn; (fn=m[i]); ++i) {
						fn(rec, event, args);
					}
				}
			}
		},
		//*@protected
		_addObserver: function (rec, prop, fn, ctx) {
			var m  = this._recordObservers,
				ed = enyo.isString(rec)? rec: rec.euid;
			// add a new entry in map for this record if there isn't one already
			m = m[ed] = m[ed] || {};
			// now add a new entry in the map for that record if this property hasn't
			// been tagged before
			m = m[prop] = m[prop] || [];
			fn = enyo.isString(fn)? (ctx? ctx[fn]: enyo.getPath(fn)): (ctx? enyo.bind(ctx, fn): fn);
			!~enyo.indexOf(fn, m) && m.push(fn);
			return fn;
		},
		_removeObserver: function (rec, prop, fn) {
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
		_removeAllObservers: function (rec) {
			var m  = this._recordObservers,
				ed = enyo.isString(rec)? rec: rec.euid, hh;
			m = m[ed];
			if (m) {
				for (var p in m) {
					hh = m[p];
					if (hh) {
						for (var i=0, h; (h=hh[i]); ++i) { this._removeObserver(rec, p, h); }
					}
				}
			}
		},
		_notifyObservers: function (rec, prop, prev, val) {
			var ro = this._recordObservers[rec.euid],
				rh = ro && ro[prop];
			if (rh) {
				for (var i=0, h; (h=rh[i]); ++i) { h(prev, val, prop, rec); }
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
				if (opts.success) { opts.success(res); }
			}
			// once that is done we can execute the remaining things to be done
			this._recordDestroyed(rec);
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
		destroyRecordLocal: function (rec, opts) {
			this.didDestroy(rec, opts);
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
		//* this cannot be handled in the didDestroy method because that happen before
		//* the record has a chance to do its own notifications, this must happen last
		_recordDestroyed: function (rec) {
			this.removeRecord(rec);
			this.removeAllListeners(rec);
			this._removeAllObservers(rec);
			rec.store = null;
		},
		_collectionDestroyed: function (col) {
			this.removeCollection(col);
			this.removeAllListeners(col);
			this._removeAllObservers(col);
		},
		_recordKeyChanged: function (prev, val, prop, rec) {
			// we use the same test for normalized addition via the _addRecord_ method
			// that will warn if some other record already has this id or if the id somehow
			// is now different for that particular record
			this.addRecord(rec);
			// in cases where this was update we check for a duplicate entry for the
			// previous id
			if (prev) {
				if (this.records.pk[prev] === rec) { delete this.records.pk[prev]; }
			}
		},
		constructor: enyo.inherit(function (sup) {
			return function (props) {
				var r = sup.apply(this, arguments);
				this.sources = this.sources || {};
				this.records = this.records || {};
				this.collections = this.collections || {};
				this._initRecords();
				this._initSources();
				this._recordObservers = {};
				this._recordListeners = {};
				this._recordKeyChanged = this.bindSafely(this._recordKeyChanged);
				this._collectionDestroyed = this.bindSafely(this._collectionDestroyed);
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
		There needs to always be an _enyo.store_ instance. If the default is not what you
		need simply create a new instance and assign it to this variable or use it to create
		your _collections_ and _models_ and they will not use this instance.
	*/
	enyo.store = new enyo.Store();
})(enyo);