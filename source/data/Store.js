(function (enyo) {
	//*@public
	/**
		_enyo.Store_ is a runtime database of data records. The store indexes
		records internally for faster lookup. While an application may have multiple
		stores, there is always a top-level store at _enyo.store_ that is used by
		[enyo.Model](#enyo.Model) and [enyo.Collection](#enyo.Collection).

		The store serves as a liason between records and the
		[enyo.Source](#enyo.Source) that dictates how they are retrieved and/or
		persisted. Every record and every collection has a reference to a store. If
		none is explicitly provided, it will resolve to _enyo.store_.
	*/
	enyo.kind({
		name: "enyo.Store",
		kind: enyo.Object,
		noDefer: true,
		/**
			The hash of named sources that are available for use on this store. The
			default source is _ajax_, but others may be added by providing
			_enyo.defaultStoreProperties_ with a _sources_ hash of sources to add.
		*/
		sources: {ajax: "enyo.AjaxSource", jsonp: "enyo.JsonpSource"},
		/**
			By default, the store indexes records in several ways, one of which is by
			the _primaryKey_ value (if it exists). This value is intended to be
			unique; the store will complain if it finds multiple instances of the same
			record. If you set this flag to true, the store will no longer complain;
			however, if a store has duplicate entries with the same _primaryKey_, you
			will not be able to search for records by _primaryKey_ in _find()_ or
			_findLocal()_, but will need to search by _euid_ instead.
		*/
		ignoreDuplicates: false,
		//*@protected
		records: null,
		collections: null,
		//*@public
		/**
			Creates a new record of a given _kind_ (string or constructor) and returns
			the newly created instance (with its _store_ property set to this   store).
			Accepts optional attributes (_attrs_) and options (_opts_) that will be
			passed to the constructor of the [enyo.Model](#enyo.Model) (see
			[enyo.Model.constructor](#enyo.Model::constructor)). If no _kind_ is
			specified, _enyo.Model_ will be used by default.
		*/
		createRecord: function (kind, attrs, opts) {
			if (arguments.length < 3) {
				if (enyo.isObject(kind)) {
					opts  = attrs;
					attrs = kind;
					kind  = enyo.Model;
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
			Retrieves a record (if it exists) by its _euid_.
		*/
		getRecord: function (euid) {
			return this.records.euid[euid];
		},
		/**
			Retrieves a collection (if it exists) by its _euid_.
		*/
		getCollection: function (euid) {
			return this.collections[euid];
		},
		/**
			Creates a collection of a given _kind_ (string or constructor) and returns
			the newly created instance (with its _store_ property set to this store).
			Accepts optional _records_ array and options (_opts_) to be passed to the
			collection's constructor. If no _kind_ is specified,
			[enyo.Collection](#enyo.Collection) will be used by default.
		*/
		createCollection: function (kind, records, opts) {
			if (arguments.length < 3) {
				if (enyo.isArray(kind)) {
					opts    = records;
					records = kind;
					kind    = enyo.Collection;
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
			Adds a record by its _euid_ and, if it has a known value for its
			_primaryKey_, indexes the record by that value as well for quicker
			reference later. This method is mostly used internally, as it is called
			automatically by models as they are created. A record can only exist to one
			_enyo.Store_ at a time thus this method will first remove it from an existing store
			for the record if it isn't this store.
		*/
		addRecord: function (rec) {
			var records = this.records,
				// the named primary key (string) of the kind
				pkey    = rec.primaryKey,
				// the entries per-instance-primary-key for this kind
				kinds   = records.pk[rec.kindName] || (records.pk[rec.kindName] = {}),
				// the value (if any) for the primary key of the record
				id      = rec.get(pkey),
				// the universally unique identifier for this record
				euid    = rec.euid;
			// a record can only belong to one store at a time so if it already has a store and it
			// isn't this store we need to remove it from there first
			if (rec.store && rec.store !== this) {
				rec.store.removeRecord(rec);
			}
			// for sanity and absolute certainty we check to make sure there is no
			// existing entry for this record by its unique id
			if (records.euid[euid] && records.euid[euid] !== rec) {
				// this scenario should never, ever, happen...ever...for 'reakin real
				throw "enyo.Store.addRecord: duplicate and unmatching euid entries - parallel euid's " +
					"should not exist";
			} else {
				records.euid[euid] = rec;
			}
			// if a primaryKey was resolved to an actual value we add that now too but the same
			// is true for unique primaryKey values as is euid just it only matters from within the scope
			// of the kind
			if (id !== undefined && id !== null) {
				// here's the sanity check
				if (kinds[id] && kinds[id] !== rec) {
					// uh oh we've got a duplicate primaryKey for the record but it is possible that the
					// primaryKey is...somehow not a unique or useful property and the only unique property
					// is euid so this flag could be set
					if (!this.ignoreDuplicates) {
						throw "enyo.Store.addRecord: duplicate record added to store for kind `" + rec.kindName + "` " +
							"with primaryKey set to `" + pkey + "` and the same value of `" + id + "` which cannot coexist " +
							"for the kind without the `ignoreDuplicates` flag of the store set to `true`";
					}
				} else {
					kinds[id] = rec;
				}
			}
			// now to index the record by its kind name
			records.kn[rec.kindName] = records.kn[rec.kindName] || (records.kn[rec.kindName] = {});
			records.kn[rec.kindName][euid] = rec;
			if (!rec.store) {
				rec.store = this;
			}
		},
		/**
			Adds a collection to the store. This is typically executed automatically and does
			not need to be called in application code. Accepts a reference to the
			collection to be added, and sets the collection's _store_ property to this
			store. A collection can only exist in a single _enyo.Store_ at a time thus
			this method will remove it from any existing store prior to adding it.
		*/
		addCollection: function (c) {
			var collections = this.collections,
				euid        = c.euid;
			if (c.store && c.store !== this) {
				c.store.removeCollection(c);
			}
			c.addListener("destroy", this._collectionDestroyed);
			collections[euid] = c;
			if (!c.store) {
				c.store = this;
			}
		},
		/**
			Removes the reference for the given collection if it is found in the store.
			This is called automatically when a collection is destroyed.
		*/
		removeCollection: function (c) {
			var collections = this.collections,
				euid        = c.euid;
			delete collections[euid];
			c.removeListener("destroy", this._collectionDestroyed);
		},
		/**
			Removes the reference for the given record if it is found in the store.
			This is called automatically when a record is destroyed.
		*/
		removeRecord: function (rec) {
			var records = this.records,
				pkey    = rec.primaryKey,
				euid    = rec.euid,
				id      = rec.get(pkey);
			delete records.euid[euid];
			delete records.kn[rec.kindName][euid];
			delete records.pk[rec.kindName][id];
		},
		/**
			Adds sources to this store.  Requires a hash with _key/value_ pairs, in
			which a key is a source's name and a value is that source's constructor,
			an instance, or the path to either expressed as a string.
		*/
		addSources: function (props) {
			var dd = this.sources;
			for (var k in props) { dd[k] = props[k]; }
			this._initSources();
		},
		/**
			Removes the source with the passed-in name from this store.
		*/
		removeSource: function (name) {
			delete this.sources[name];
		},
		/**
			Accepts an array of source names for removal from the store.
		*/
		removeSources: function (sources) {
			var dd = this.sources;
			for (var i=0, k; (k=sources[i]); ++i) { delete dd[k]; }
		},
		/**
			Queries a source for a record (or records), with the ability to use
			various strategies to compile the results in the current store. This is an
			asynchronous method that requires two parameters--the kind of record to
			use (in the form of a constructor or string), and an options hash that
			includes a _success_ method, an optional _fail_ method, a _source_
			designating the source to use (or else the record kind's default will be
			used), a _strategy_ (explained below), and a hash of _attributes_ to use
			in the query. How these attributes are used in the query depends on the
			source being used. The _success_ method expects to receive the original
			options hash passed into _find()_, followed by the result set (returned by
			the _strategy_, as explained below).

			There is a special use for this method if an _euid_ or _primaryKey_ value
			is provided (the _euid_ directly on the options hash; the _primaryKey_ in
			the _attributes_ hash of the options). In this case, the method will
			attempt to find the record locally first; if it is found, the _success_
			method will be called and the source will not be queried. If the record
			cannot be found locally, the method will proceed normally. Regardless of
			whether the source is used, whenever the _euid_ or _primaryKey_ value is
			provided, the result will be either a single record or _undefined_; it
			will not be an array.

			For queries against runtime records only (i.e., records in the store), see
			_findLocal()_.

			When results are retrieved from the requested source, they will be handled
			according to the requested _strategy_ (the default is _merge_). Strategies
			may easily be extended by creating a method on the store of the form
			_&lt;name&gt;Strategy_, and then setting the _name_ as the _strategy_ option
			passed to this method. The strategy resolvers receive two parameters--the
			current array of records for the kind in the original request, and the
			incoming results from the source query. These methods are executed under
			the context of the store.

			There are two available strategies: _replace_ and _merge_.

			* When the _replace_ strategy is used, all known records are thrown away
				(though not destroyed) and replaced by the new results.

			* When using the _merge_ strategy (the default), any incoming records with
				the same _primaryKey_ as records already in the store are updated with
				the values retrieved, and new records are simply added to the store.
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
			Queries the runtime database (in the store); will not query a source even
			if one is provided. This is a synchronous method and will return an array
			of records, or an empty array if no matching records are found.

			As with _find()_, this method behaves somewhat differently when an _euid_
			or _primaryKey_ value is provided (the _euid_ directly on the options
			hash; the _primaryKey_ in the _attributes_ hash of the options).  In this
			case,   a specific record is sought, with the return value being not an
			array, but rather a single record or _undefined_.

			This method accepts three parameters, the kind as a constructor or string,
			the options to match against, and an optional _filter_ method. Unlike
			_find()_, there are no _success_ or _fail_ methods. Also, note that all
			keys specified in the options will be used as criteria to match against.
			If you provide an _euid_ key, a key matching the _primaryKey_ of the
			model kind, or a _kindName_ property, the method will not query for any
			other values or scan the entire dataset. Using the _kindName_ property
			will return all records registered in this store for that _kindName_.

			The filtering process is handled by the store's _filter_ method. Overload
			this method or provide an optional third parameter that may be a function
			or string name of a method on the store. This filter method will receive
			the options to match against and the record as the second parameter, and
			should return either _true_ or _false_ to indicate whether it should be
			included in the result set.
		*/
		findLocal: function (kind, opts, filter) {
			if (arguments.length < 3 && enyo.isObject(kind)) {
				if (enyo.isFunction (opts)) { filter = opts; }
				opts = kind;
				kind = enyo.Model;
			}
				// we need to find the constructor (for the prototype) of the requested
				// record type so we know what kind of primaryKey we might be looking for
			var proto   = (typeof kind == "string"? enyo.constructorForKind(kind): kind).prototype,
				records = this.records,
				pkey    = proto? proto.primaryKey: "",
				id      = opts[pkey],
				base;
			// fast path search for single entry by euid, quickest way to find a record
			if (opts.euid) {
				return records.euid[opts.euid];
			}
			// if there is a provided primary key value we can use that too
			if (id !== undefined && id !== null) {
				base = records.pk[proto.kindName];
				// we ensure an explicit undefined not a 'false' value return in cases
				// where it could not be determined
				return (base && base[id]) || undefined;
			}
			// if a kindName property exists on opts we return an array of all the records
			// for that kind
			if (opts.kindName) {
				base = records.kn[opts.kindName];
				return (base && enyo.values(base)) || [];
			}
			// if we've gotten here lets check and see if we have a filter we need to apply
			// to find results
			filter = (filter && ((typeof filter == "string" && this[filter]) || filter)) || this.filter;
			filter = this.bindSafely(filter, opts);
			return enyo.filter((enyo.values(records.kn[proto.kindName]) || []), filter, this);
		},
		/**
			Overload this method to handle special cases. The default filtering
			behavior simply matches a record according to the options provided as
			attributes. This method is used internally by other methods of the store.
		*/
		filter: function (opts, rec) {
			for (var k in opts) {
				if (rec.get(k) !== opts[k]) {
					return false;
				}
			}
			return true;
		},
		/**
			Responds to _find_ requests asynchronously and executes the correct
			strategy for the results before responding to user callbacks.
		*/
		didFind: function () {
			// TODO:
			this.log(arguments);
		},
		//*@public
		/**
			When the _fetch()_ method is executed on a record and is successful, this
			method will be called before any _success_ method supplied as an option to
			the record itself. Overload this method to handle other scenarios.
		*/
		didFetch: function (rec, opts, res) {
			if (opts) {
				if (opts.success) { opts.success(res); }
			}
		},
		/**
			When the _commit()_ method is executed on a record and is successful, this
			method will be called before any _success_ method supplied as an option to
			the record itself. Overload this method to handle other scenarios.
		*/
		didCommit: function (rec, opts, res) {
			if (opts) {
				if (opts.success) { opts.success(res); }
			}
		},
		/**
			When the _destroy()_ method is executed on a record and is successful,
			this method will be called before any _success_ method supplied as an
			option to the record itself. Overload this method to handle other
			scenarios.
		*/
		didDestroy: function (rec, opts, res) {
			if (opts) {
				if (opts.success) { opts.success(res); }
			}
		},
		/**
			This method is executed when one of the primary actions has failed. It has
			the name of the action (one of _"fetch"_, _"commit"_, or _"destroy"_), a
			reference to the record the action failed on, and the options originally
			passed to the store for the action. Overload this method to handle other
			possible failure cases gracefully. By default, it will look for a _fail_
			method in the options and (if one is found) execute it.
		*/
		didFail: function (action, rec, opts, res) {
			if (opts) {
				if (opts.fail) { return opts.fail(res); }
			}
		},
		//*@protected
		/**
			Internal method called to find the requested source and execute the
			correct method. It also hooks the store's own response mechanisms via the
			options hash.
		*/
		fetchRecord: function (rec, opts) {
			var ss = this.sources,
				o  = opts? enyo.clone(opts): {},
				s  = ss[o.source || rec.defaultSource];
			if (!s) {
				throw "enyo.Store: Could not find source '" + (o.source || rec.defaultSource) + "'";
			}
			o.success = this.bindSafely("didFetch", rec, opts);
			o.fail    = this.bindSafely("didFail", "fetch", rec, opts);
			s.fetch(rec, o);
		},
		/**
			Internal method called to find the requested source and execute the
			correct method. It also hooks the store's own response mechanisms via the
			options hash.
		*/
		commitRecord: function (rec, opts) {
			var ss = this.sources,
				o  = opts? enyo.clone(opts): {},
				s  = ss[o.source || rec.defaultSource];
			if (!s) {
				throw "enyo.Store: Could not find source '" + (o.source || rec.defaultSource) + "'";
			}
			o.success = this.bindSafely("didCommit", rec, opts);
			o.fail    = this.bindSafely("didFail", "commit", rec, opts);
			s.commit(rec, o);
		},
		/**
			Internal method called to find the requested source and execute the
			correct method. It also hooks the store's own response mechanisms via the
			options hash.
		*/
		destroyRecord: function (rec, opts) {
			var ss = this.sources,
				o  = opts? enyo.clone(opts): {},
				s  = ss[o.source || rec.defaultSource];
			if (!s) {
				throw "enyo.Store: Could not find source '" + (o.source || rec.defaultSource) + "'";
			}
			o.success = this.bindSafely("didDestroy", rec, opts);
			o.fail    = this.bindSafely("didFail", "destroy", rec, opts);
			s.destroy(rec, o);
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
		//* this cannot be handled in the didDestroy method because that happens before
		//* the record has a chance to do its own notifications, this must happen last
		_recordDestroyed: function (rec) {
			this.removeRecord(rec);
		},
		_collectionDestroyed: function (col) {
			this.removeCollection(col);
		},
		_recordKeyChanged: function (rec, prev) {
			// ultimately we need to remove only the entry for the record by its kindName's
			// unique primaryKey value
			if (prev) {
				delete this.records.pk[rec.kindName][prev];
			}
			this.addRecord(rec);
		},
		constructor: enyo.inherit(function (sup) {
			return function (props) {
				var r            = sup.apply(this, arguments);
				this.sources     = this.sources     || {};
				this.records     = this.records     || {};
				this.collections = this.collections || {};
				this._initRecords();
				this._initSources();
				this._recordDestroyed     = this.bindSafely("_recordDestroyed");
				this._collectionDestroyed = this.bindSafely("_collectionDestroyed");
				return r;
			};
		})
	});
	//*@protected
	enyo.Store.concat = function (ctor, props) {
		if (props.sources) {
			var p = ctor.prototype || ctor;
			p.sources = (p.sources? enyo.mixin(enyo.clone(p.sources), props.sources): props.sources);
			delete props.sources;
		}
	};
	//*@public
	/**
		There must always be an _enyo.store_ instance. If the default is not what
		you need, simply create a new instance and assign it to this variable, or
		use it to create your collections and models and they will not use this
		instance.
	*/
	enyo.store = new enyo.Store();
})(enyo);
