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
			The hash of named _drivers_ that are available for use on this _store_.
			The default _driver_ is _ajax_ but other may be added by providing
			`enyo.defaultStoreProperties` with a _drivers_ hash of those to add.
		*/
		drivers: {ajax: "enyo.AjaxDriver"},
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
		concat: ["drivers", "recordEvents"],
		//*@public
		/**
			Will create a new record of _kind_ (string or constructor) and accepts
			an optional _attributes_ and _options_ parameter(s) that will be passed
			to the constructor of the _enyo.Model_ (see enyo.Model.constructor).
		*/
		createRecord: function (kind, attrs, opts) {
			var k = enyo.isString(kind)? enyo.getPath(kind): kind,
				opts = opts? enyo.mixin(opts, {store: this}): {store: this};
			/*jshint newcap:false */
			return new k(attrs, opts);
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
			Requires a hash with _key_ _value_ pairs that are the driver's name by
			which it can be referred to by this _store_ and the constructor, instance
			or path to either in a string.
		*/
		addDrivers: function (props) {
			var dd = this.drivers;
			for (var k in props) {
				dd[k] = props;
			}
			this._initDrivers();
		},
		/**
			Accepts the name of a driver of this _store_ to remove.
		*/
		removeDriver: function (name) {
			delete this.drivers[name];
		},
		/**
			Accepts an array of drivers names to remove from the _store_.
		*/
		removeDrivers: function (drivers) {
			var dd = this.drivers;
			for (var i=0, k; (k=drivers[i]); ++i) {
				delete dd[k];
			}
		},
		find: function () {
			
		},
		/**
			Find a single record by the given criteria. The first parameter is the
			_kind_ of the _record_, either a string or constructor, followed by the
			options hash that can contain a _success_ and _fail_ method but also a
			_driver_, _euid_, and _attributes_ hash of any properties to compare against.
			It will attempt to find the record locally (runtime database) and make a fetch
			request if any _driver_ is supplied. If no _success_ method is supplied the
			_driver_ will be ignored and it will return synchronously only having searched
			_locally_.
		*/
		findOne: function (kind, opts) {
			var c  = enyo.isString(kind)? enyo.getPath(kind): kind,
				k  = c.prototype.kindName,
				o  = opts,
				pk = c.prototype.primaryKey,
				rr = this.records, rec;
			// we try to shortcut the process if the euid is provided
			if ((rec = rr.kn[o.euid])) {
				if (o.success) { return o.success(rec); }
				else { return rec; }
			}
			// if there are attributes and one is the primaryKey for the kind
			// and we have that we will do the same thing
			if (o.attributes && (pk = o.attributes[pk])) {
				if ((rec = rr.pk[pk])) {
					if (o.success) { return o.success(rec); }
					else { return rec; }
				}
			}
			// that didn't work so we will have to execute on the _driver_
			// if one was provided
			if (o.driver && o.success) {
				var dd = this.drivers,
					d  = dd[o.driver],
					o  = enyo.clone(o);
				o.success = enyo.bindSafely("didFindOne", opts);
				o.fail = enyo.bindSafely("didFail", "findOne", opts);
				if (!d) { return this.warn("could not find driver `" + (o.driver) + "`"); }
				d.find(c, o);
			}
		},
		/**
			This method responds asynchronously to calls from the _findOne_ method.
		*/
		didFindOne: function (opts, res) {
			// TODO:
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
		didFetch: function (rec, opts, res) {
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
		didCommit: function (rec, opts, res) {
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
		didDestroy: function (rec, opts, res) {
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
		didFail: function (action, rec, opts, res) {
			if (opts) {
				if (opts.fail) { return opts.fail(res); }
			}
		},
		//*@protected
		/**
			Internal method called to find the requested driver and execute the correct
			method. It also hooks the _stores_ own response mechanisms via the options hash.
		*/
		fetchRecord: function (rec, opts) {
			var dd = this.drivers,
				o  = opts? enyo.clone(opts): {},
				d  = dd[o.driver || rec.defaultDriver];
			if (!d) { return this.warn("could not find driver `" + (o.driver || rec.defaultDriver) + "`"); }
			o.success = enyo.bindSafely("didFetch", rec, opts);
			o.fail = enyo.bindSafely("didFail", "fetch", rec, opts);
			d.fetch(rec, o);
		},
		/**
			Internal method called to find the requested driver and execute the correct
			method. It also hooks the _stores_ own response mechanisms via the options hash.
		*/

		commitRecord: function (rec, opts) {
			var dd = this.drivers,
				o  = opts? enyo.clone(opts): {},
				d  = dd[oo.driver || rec.defaultDriver];
			if (!d) { return this.warn("could not find driver `" + (o.driver || rec.defaultDriver) + "`"); }
			o.success = enyo.bindSafely("didCommit", rec, opts);
			o.fail = enyo.bindSafely("didFail", "commit", rec, opts);
			d.commit(rec, o);
		},
		/**
			Internal method called to find the requested driver and execute the correct
			method. It also hooks the _stores_ own response mechanisms via the options hash.
		*/
		destroyRecord: function (rec, opts) {
			var dd = this.drivers,
				o  = opts? enyo.clone(opts): {},
				d  = dd[oo.driver || rec.defaultDriver];
			if (!d) { return this.warn("could not find driver `" + (o.driver || rec.defaultDriver) + "`"); }
			o.success = enyo.bindSafely("didDestroy", rec, opts);
			o.fail = enyo.bindSafely("didFail", "destroy", rec, opts);
			d.destroy(rec, o);
		},
		_initRecords: function () {
			var r  = this.records,
				pp = ["euid", "pk", "kn"];
			for (var i=0, k; (k=pp[i]); ++i) {
				r[k] = r[k] || {};
			}
		},
		_initDrivers: function () {
			var dd = this.drivers, d;
			for (var k in dd) {
				if ((d = dd[k]) && enyo.isString(d)) { d = enyo.getPath(d); }
				if (d) {
					if ("function" == typeof d && d.prototype) {
						/*jshint newcap:false */ 
						dd[k] = new d({store: this});
					} else { 
						dd[k] = d;
						d.store = this;
					}
				} else if (!d && enyo.isString(dd[k])) { this.warn("could not find driver -> `" + dd[k] + "`"); }
			}
		},
		constructor: enyo.super(function (sup) {
			return function (props) {
				var r = sup.apply(this, arguments);
				this.drivers = this.drivers || {};
				this.records = this.records || {};
				this._initRecords();
				this._initDrivers();
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
	enyo.concatHandler("drivers", function (proto, props) {
		if (props.drivers) {
			var pd = proto.drivers? enyo.clone(proto.drivers): {},
				rd = props.drivers;
			// will deliberately override already defined drivers so they can
			// be remapped by subkinds
			proto.drivers = enyo.mixin(pd, rd);
			// we don't want this to whipeout what we just did
			delete props.drivers;
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