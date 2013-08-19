//*@public
/**
	_enyo.NoMacroBinding_ is a special kind of binding used to disable macro
	expansion for performance reasons. While this may not always be necessary or
	useful, it is provided as an option for convenience.
*/
enyo.kind({
	name: "enyo.NoMacroBinding",
	kind: enyo.Binding,
	expandMacros: false
});
