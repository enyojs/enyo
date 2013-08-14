//*@public
/**
	_enyo.Controller_ is the base kind for all controllers in Enyo. An
	abstract kind, it is a delegate/component that is designed to be a
	proxy for information.
*/
enyo.kind({
	//*@public
	name: "enyo.Controller",
	kind: "enyo.MultipleDispatchComponent",
	/**
		The default source of information for all instances of _enyo.Controller_
		and its subkinds. In some cases, this will be a computed property to
		facilitate overloading. It may contain any type of data.
	*/
	data: null,
	//*@protected
	_isController: true
});
