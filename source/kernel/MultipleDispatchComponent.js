//*@public
/**
	_enyo.MultipleDispatchComponent_ is a purely abstract kind that simply provides
	a common ancestor for [enyo.Component](#enyo.Component) objects that need the
	[MultipleDispatchSupport](#enyo/source/kernel/mixins/MultipleDispatchSupport.js)
	mixin.
*/
enyo.kind({
	//*@public
	name: "enyo.MultipleDispatchComponent",
	kind: "enyo.Component",
	mixins: [
		enyo.MultipleDispatchSupport
	]
});
