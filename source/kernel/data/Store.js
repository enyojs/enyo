(function (enyo) {


	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.Store",

		//*@public
		kind: "enyo.Component",

		//*@public
		mixins: ["enyo.MultipleDispatchSupport"],

		// ...........................
		// PROTECTED PROPERTIES

		//*@protected
		_sources: null,

		// ...........................
		// COMPUTED PROPERTIES

		//*@public
		/**
			Retrieve an array of all of the sources available
			to this store.
		*/
		sources: enyo.computed(function () {
			return enyo.toArray(this._sources);
		}, "_sources", {cached: true, defer: true}),

		// ...........................
		// PUBLIC METHODS

		//*@public
		/**
			Add a source to the store. The _source_ parameter
			should be a hash with at least a _kind_ and a _name_
			for identification. The _kind_ must be of the type
			_enyo.Source_. The store can have multiple sources.
		*/
		source: function (source) {
			var sources = this._sources;
			sources[source.name] = this.createComponent(source);
		},

		//*@public
		/**
			Synchronize data with the named source. The _source_
			parameter is a string that can be matched to an initialized
			_source_ of the store. If there is only one source for the
			store then no _source_ parameter is required.
		*/
		sync: function (source) {
			this.log(source);
		},

		//*@public
		/**
			This find method accepts a model _kind_ and an optional
			parameter, _options_ that is a configuration hash to be
			passed to the driver.
		*/
		find: function (model, source, options) {

		},

		// ...........................
		// PROTECTED METHODS

		constructor: function () {
			this.inherited(arguments);
			// initialize the sources hash
			this._sources = {};
		},

		// ...........................
		// OBSERVERS

	});


})(enyo);