//*@public
/**
	_enyo.MultipleDispatchComponent_ is a purely abstract kind that simply
	provides a common ancestor for [enyo.Component](#enyo.Component) objects that
	need the [enyo.MultipleDispatchSupport](#enyo/source/kernel/mixins/MultipleDispatchSupport.js)
	mixin.
*/
enyo.kind({
	
	// ...........................
	// PUBLIC PROPERTIES

	//*@public
	name: "enyo.MultipleDispatchComponent",
	
	//*@public
	kind: "enyo.Component",
	
	//*@public
	mixins: [
		"enyo.MultipleDispatchSupport"
	]
	
});