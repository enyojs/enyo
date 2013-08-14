//*@public
/**
	A special kind of binding used to disable macro expansion for
	performance reasons. This may not always be necessary or useful but
	is provided as an option for convenience.
*/
enyo.kind({
	name: "enyo.NoMacroBinding",
	kind: enyo.Binding,
	expandMacros: false
});
