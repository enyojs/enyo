//*@public
/**
	The `enyo.MultipleDispatchComponent` is a purely abstract kind
	and simply adds a common ancestor for `enyo.Components` that
	need the `enyo.MultipleDispatchSupport` mixin.
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