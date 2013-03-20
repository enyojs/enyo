//*@public
/**
	The _enyo.ApplicationSupport_ mixin adds generic support
	to any _enyo.Component_ so that any time the _createComponent_
	method(s) are called it will supply a reference to the
	application instance it belongs to as the _app_ property for
	relative pathing to application scoped controllers or state.
*/
enyo.createMixin({
	
	// ...........................
	// PUBLIC PROPERTIES
	
	//*@public
	name: "enyo.ApplicationSupport",
	
	//*@public
	app: null,
	
	// ...........................
	// PROTECTED PROPERTIES
	
	//*@protected
	_supports_applications: true,
	
	// ...........................
	// PROTECTED METHODS
	
	//*@protected
	/**
		Overload this method to add the _app_ property to
		all child components.
	*/
	adjustComponentProps: function (props) {
		// copy the reference of this component to the child component
		// properties hash
		props.app = this.app;
		return this.inherited(arguments, props);
	},
	
	//*@protected
	destroy: function () {
		delete this.app;
	}

});
