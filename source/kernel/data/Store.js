(function (enyo) {
	//*public
	/**
	*/
	enyo.kind({
		name: "enyo.Store",
		kind: enyo.Object,
		/**
		*/
		drivers: {localStorage: "enyo.LocalStorage"},
		records: null,
		concat: ["drivers"],
		createRecord: function () {
			
		},
		addRecord: function () {
			
		},
		removeRecord: function () {
			
		},
		addDriver: function () {
			
		},
		removeDriver: function () {
			
		},
		find: function () {
			
		},
		findOne: function () {
			
		},
		addModelObserver: function () {
			
		},
		removeModelObserver: function () {
			
		},
		notifyModelObservers: function () {
			
		},
		commit: function () {
			
		},
		//*@protected
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
						dd[k] = new d({name: k, store: this});
					} else { dd[k] = d; }
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
				return r;
			};
		}),
		//*@protected
		_dirty: false
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
	*/
	enyo.store = new enyo.Store();
})(enyo);