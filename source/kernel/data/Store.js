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
		//*@protected
		records: null,
		concat: ["drivers"],
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
		findOne: function () {
			
		},
		/**
			Adds an observer for a particular event to a specific _record_. The
			first property can be a reference to the desired _record_ or the _euid_
			of the record. The _prop_ parameter is the string for the desired attribute
			to watch, _fn_ can be a function reference, a string for the function of the
			optional _ctx_ property or a path to resolve for the method. Returns the method
			that can be used later to remove the observer. If the optional _ctx_ parameter
			is provided the _fn_ will be bound to it via _enyo.bind_.
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
					if (!~i) { m.splice(i, 1); }
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
				r  = enyo.isString(rec)? this.records.euid[rec]: rec;
			m = m[ed];
			if (m) {
				if (prop) {
					this._notifyObservers(r, m[prop], prop);
				} else {
					for (var k in r.changed) {
						if (m[k] && m[k].length) { this._notifyObservers(r, m[k], k); }
					}
				}
			}
		},
		//*@protected
		_notifyObservers: function (rec, lrs, prop) {
			for (var i=0, o; (o=lrs[i]); ++i) {
				// called according to the observer parameters, prev, current, prop
				o.call(rec, rec.previous[prop], rec.get(prop), prop);
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
				pp = ["euid", "pk"];
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
						dd[k] = new d();
					} else { 
						dd[k] = d;
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
				return r;
			};
		}),
		//*@protected
		_recordObservers: null
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