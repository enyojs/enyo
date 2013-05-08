(function (enyo) {
	
	//*@public
	/**
	*/
	enyo.kind({
		
		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.ArrayController",
		
		//*@public
		kind: "enyo.Enumerable",
		
		//*@public
		url: "",
		
		//*@public
		autoFetch: false,
		
		//*@public
		batchMode: true,

		//*@public
		/**
			This bindable property will indicate whether the controller
			is processing an asynchronous fetch request.
		*/
		fetching: false,
		
		//*@public
		events: {
			onItemsAdded: "",
			onItemsRemoved: ""
		},

		// ...........................
		// PROTECTED PROPERTIES

		// ...........................
		// COMPUTED PROPERTIES

		// ...........................
		// PUBLIC METHODS
		
		//*public
		/**
			Accepts a single value or an array of values to add.
			For batch additions this is the most effient method.
		*/
		add: function (items) {
			var len = this.length;
			items = items instanceof Array? items: [items];
			this._store = this._store.concat(items);
			if (len !== this._store.length) {
				this._did_add(items);
				this.length = this._store.length;
				this.notifyObservers("length", len, this.length);
			}
		},
		
		//*@public
		/**
			An abstract method to fetch data. By default it attempts
			to make an Ajax call via the url provided. Can be overloaded
			to do additional things.
		*/
		fetch: function () {
			// set our fetching state to true
			this.set("fetching", true);
			var xhr = new enyo.Ajax({url: this.url});
			xhr.response(this, this.didFetch);
			xhr.go();
		},
		
		//*@public
		/**
			An abstract method used for handling retrieved
			data from a fetch command.
		*/
		didFetch: function (sender, response) {
			this.add(response);
			// all done fetching
			this.set("fetching", false);
		},

		// ...........................
		// PROTECTED METHODS
		
		//*@protected
		create: function () {
			this.inherited(arguments);
			if (true === this.autoFetch && this.url) {
				enyo.asyncMethod(this, this.fetch);
			}
		},
		
		//*@protected
		_did_add: function (items) {
			if (this.batchMode) {
				this.doItemsAdded({items: items});
			} else {
				this.inherited(arguments);
			}
		},
		
		//*@protected
		_did_remove: function () {
			if (this.batchMode) {
				this.doItemsRemoved({items: items});
			} else {
				this.inherited(arguments);
			}
		}

		// ...........................
		// OBSERVERS	
		
	});
	
})(enyo);
