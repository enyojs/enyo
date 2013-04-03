//*@public
/**
	_enyo.Controller_ is the base kind for all controllers in Enyo. An
	abstract kind, it is a delegate/component that is designed to be a
	proxy for information.
*/
enyo.kind({

	// ...........................
	// PUBLIC PROPERTIES

	//*@public
	name: "enyo.Controller",

	//*@public
	kind: "enyo.Component",


	//*@protected
	mixins: [
		"enyo.MultipleDispatchSupport"
	],

	//*@public
	/**
		The default source of information for all instances of _enyo.Controller_
		and its subkinds. In some cases, this will be a computed property to
		facilitate overloading. It may contain any type of data.
	*/
	data: null,

	// ...........................
	// PROTECTED PROPERTIES

	//*@protected
	_is_controller: true

	// ...........................
	// COMPUTED PROPERTIES

	// ...........................
	// PUBLIC METHODS

	// ...........................
	// PROTECTED METHODS

	// ...........................
	// OBSERVERS

});
