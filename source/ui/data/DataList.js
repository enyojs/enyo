(function (enyo) {

	//*@public
	/**
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
		statics: {
			defaultScrollerOptions: {
				preventScrollPropagation: false
			}
		},
		
		//*@public
		handlers: {
			onScrollStart: "_didScrollStart",
			onScroll: "_didScroll",
			onScrollEnd: "_didScrollEnd"
		},

		// ...........................
		// PROTECTED PROPERTIES

		//*@protected
		controlParentName: "rows",

		//*@protected
		classes: "enyo-data-list",
		
		//*@protected
		containerOptions: {
			name: "scroller",
			kind: "enyo.Scroller",
			classes: "enyo-fill enyo-data-list-scroller",
			components: [
				{name: "upperBuffer"},
				{name: "rows", classes: "enyo-list-rows-container"},
				{name: "lowerBuffer"}
			]
		},

		// ...........................
		// PUBLIC METHODS
		
		//*@public
		adjustComponentProps: function (props) {
			this.inherited(arguments);
			props.list = this;
		},
		
		// ...........................
		// PROTECTED METHODS
		
		//*@protected
		_initContainer: function () {
			var $container = this.get("containerOptions");
			var $options = this.get("scrollerOptions") || {};
			var $defaults = enyo.DataList.defaultScrollerOptions;
			// enyo.mixin($container, enyo.mixin($options, $defaults, true), true);
			enyo.mixin($container, enyo.mixin($defaults, $options));
			this.inherited(arguments);
		},
		
		//_didScroll: function () {
		//	this.log();
		//	return true;
		//},
		//
		//_didScrollStart: function () {
		//	this.log();
		//	return true;
		//},
		//
		//_didScrollEnd: function () {
		//	this.log();
		//	return true;
		//}

	});

})(enyo);