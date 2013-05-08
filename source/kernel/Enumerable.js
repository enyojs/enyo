(function (enyo) {
	
	//*@public
	/**
		_enyo.Enumerable_ is an array-like structure with array-like behaviors. It
		allows for notifications to be dispatched in response to changes within its
		indices.
	
		Any type of object may be stored in an enumerable.
	*/
	enyo.kind({
		
		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.Enumerable",
		
		//*@public
		kind: "enyo.Controller",
		
		//*@public
		events: {
			
			/**
				Fires when an individual index has been modified.
			*/
			onIndexChanged: "",
			
			/**
				Fires when an item is added to the enumerable.
			*/
			onItemAdded: "",
			
			/**
				Fires when an item is removed from the enumerable.
			*/
			onItemRemoved: "",
			
			/**
				Fires when the length of the enumerable changes.
			*/
			onLengthChanged: ""
		},
		
		//*@public
		length: 0,

		// ...........................
		// PROTECTED PROPERTIES
		
		//*@protected
		_store: null,

		// ...........................
		// PUBLIC METHODS

		//*@public
		push: function (/* _values_ */) {
			var store = this._store;
			var len = store.length;
			var values = arguments;
			Array.prototype.push.apply(store, values);
			if (len !== (this.length = store.length)) {
				this.notifyObservers("length", len, this.length);
			}
			this._did_add(values);
			return this.length;
		},
		
		//*@public
		pop: function () {
			var store = this._store;
			var len = store.length;
			var ret = store.pop();
			if (len !== (this.length = store.length)) {
				this.notifyObservers("length", len, this.length);
			}
			if (ret) {
				this._did_remove(ret);
			}
			return ret;
		},
		
		//*@public
		shift: function () {
			var store = this._store;
			var len = store.length;
			var ret = store.shift();
			if (len !== (this.length = store.length)) {
				this.notifyObservers("length", len, this.length);
			}
			// shift requires a reindex of every entry which might
			// be very unfortunateh depending on who is interested
			this._did_change_from(0);
			this._did_remove(ret);
			return ret;
		},
		
		//*@public
		unshift: function (/* _values_ */) {
			var store = this._store;
			var len = store.length;
			var values = arguments;
			// use the native array unshift
			Array.prototype.unshift.apply(store, values);
			if (len !== (this.length = store.length)) {
				this.notifyObservers("length", len, this.length);
			}
			// unshift requires a reindex of every entry, which might
			// be very unfortunate depending on who is interested
			this._did_change_from(0);
			this._did_add(values);
			return this.length;
		},
		
		//*@public
		indexOf: function (value, idx) {
			return enyo.indexOf(value, this._store, idx);
		},
		
		//*@public
		lastIndexOf: function (value, idx) {
			return enyo.lastIndexOf(value, this._store, idx);
		},
		
		//*@public
		splice: function (idx /*, _many_, _values_ */) {
			// a reference to our local store
			var store = this._store;
			// the length of our store at the beginning
			var len = store.length;
			// values that are inserted
			var values = enyo.toArray(arguments).slice(2);
			// we get to go ahead and use the native operation on the array
			// and deduce what changed based on what we know
			var ret = Array.prototype.splice.apply(store, arguments);
			// if the length changed we can notify any observers/bindings
			if (len !== (this.length = store.length)) {
				this.notifyObservers("length", len, this.length);
			}
			// we notify for necessary index updates
			if (values.length) {
				this._did_add(values);
			}
			if (ret && ret.length) {
				this._did_remove(ret);
			}
			if ((ret && ret.length) || values.length) {
				this._did_change_from(idx);
			}
		},
		
		//*@public
		join: function (separator) {
			return this._store.join(separator);
		},
		
		//*@public
		map: function (fn, context) {
			return enyo.map(this._store, fn, context);
		},
		
		//*@public
		filter: function (fn, context) {
			return enyo.filter(this._store, fn, context);
		},
		
		//*@public
		/**
			Returns boolean true | false whether _value_ is contained
			within this enumerable.
		*/
		contains: function (value) {
			return !!~enyo.indexOf(this._store, value);
		},
		
		//*@public
		/**
			Returns the value at _index_.
		*/
		at: function (index) {
			return this._store[index];
		},

		// ...........................
		// PROTECTED METHODS
		
		//*@protected
		constructor: function (props) {
			this.inherited(arguments);
			// if the initial parameter is an array we use that as
			// our starting properties
			if (props && props instanceof Array) {
				this._store = this._store? this._store.concat(props): props;
			}
			// initialize our store
			this._store = this._store || [];
			this.length = this._store.length;
		},
		
		//*@protected
		_did_change_from: function (idx) {
			var len = this.length;
			for (; idx < len; ++idx) {
				this.doIndexChanged({index: idx, item: this.at(idx)});
			}
		},
		
		//*@protected
		_did_add: function (items) {
			items = items.length? items: [items];
			for (var idx = 0, len = items.length; idx < len; ++idx) {
				this.doItemAdded({item: items[idx]});
			}
		},
		
		//*@protected
		_did_remove: function (items) {
			items = items.length? items: [items];
			for (var idx = 0, len = items.length; idx < len; ++idx) {
				this.doItemRemoved({item: items[idx]});
			}
		},
		
		//*@protected
		/**
			This is only necessary because of the way that component names are
			generated from the public property _name_, which creates the method
			"getName"; this class/kind is broken down to "enumerable", but this
			has a special meaning and acts strangely.
		*/
		getName: function () {
			return this.name || enyo.uid("enumerable");
		},

		// ...........................
		// OBSERVERS
		
		//*@protected
		_length_changed: enyo.observer(function (prop, prev, value) {
			this.doLengthChanged({previous: prev, length: value});
		}, "length")
		
	});
	
})(enyo);