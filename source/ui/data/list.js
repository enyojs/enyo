(function (enyo) {
	
	//*@public
	/**
	*/
	enyo.createMixin({
		
		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.DataListRowSupport",

		//*@public
		classes: "enyo-data-list-row"
		
	});
	
	//*@public
	/**
		NOTE: The list is selection-aware but the magic happens in the
		rows and their interaction with the dataset.
	*/
	enyo.kind({
		
		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.DataList",
		
		//*@public
		kind: "enyo.DataRepeater",
		
		//*@public
		/**
			The _enyo.DataList_ kind places its rows inside of a scroller. Any
			configurable options associated with an _enyo.Scroller_ can be
			placed in this hash and will be set accordingly on the scroller
			for this list. If none are specified default _enyo.Scroller_
			settings are used.
		*/
		scrollerOptions: null,
		
		//*@public
		enableSelection: true,
		
		//*@public
		enableMultipleSelection: false,
		
		//*@public
		statics: {
			defaultScrollerOptions: {
				preventScrollPropagation: false
			}
		},

		// ...........................
		// PROTECTED PROPERTIES
		
		//*@protected
		controlParentName: "rows",
		
		//*@protected
		mixins: ["enyo.SelectionSupport"],
		
		//*@protected
		classes: "enyo-fill enyo-data-list",
		
		//*@protected
		_container: {
			name: "scroller",
			kind: "enyo.Scroller",
			classes: "enyo-fill enyo-data-list-scroller",
			components: [{
				name: "upperBuffer"
			}, {
				name: "rows",
				classes: "enyo-list-rows-container"
			}, {
				name: "lowerBuffer"
			}]
		},

		// ...........................
		// COMPUTED PROPERTIES

		// ...........................
		// PUBLIC METHODS
		
		// ...........................
		// PROTECTED METHODS

		//*@protected
		initComponents: function () {
			// we need the base class to complete its normal
			// init routine
			this.inherited(arguments);
			// now we can safely grab a reference to our new row-kind
			var $kind = this._child_kind;
			// we need to add selection support to the row kind if the
			// option is set
			if (false === enyo.hasMixin($kind, "enyo.SelectionRowSupport")) {
				enyo.applyMixin("enyo.SelectionRowSupport", $kind);
			}
			// we also need to ensure that it has specific properties that
			// every row needs to have such as the classes required
			if (false === enyo.hasMixin($kind, "enyo.DataListRowSupport")) {
				enyo.applyMixin("enyo.DataListRowSupport", $kind);
			}
		},
		
		//*@protected
		_init_container: function () {
			var $container = this.get("_container");
			var $options = this.get("scrollerOptions");
			var $defaults = enyo.DataList.defaultScrollerOptions;
			enyo.mixin($container, enyo.mixin($defaults, $options));
			this.inherited(arguments);
		}
		
	});
	
})(enyo);