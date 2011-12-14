/**
	A control primitive that can add or remove a CSS class based on the boolean value of a given state.

	Stateful is a base kind that is typically not itself created.
*/
enyo.kind({
	name: "enyo.Stateful",
	kind: enyo.Control,
	published: {
		/**
		Prefix for css classes applied via setState.
		*/
		cssNamespace: "enyo"
	},
	/**
	Adds or removes a CSS state class specified by inState. If inValue is true, the class
	is added; if false, it is removed. The CSS class name is formed by combining the value
	of the cssNamespace property, a "-" character, and the value of inState. For example:

		this.$.stateful.setState("down", true);

	With the default cssNamespace of "enyo", this applies the CSS class "enyo-down" to this control.
	Note that multiple state classes may be applied.
	*/
	setState: function(inState, inValue) {
		this.addRemoveClass(this.cssNamespace + "-" + inState, Boolean(inValue));
	},
	//* @protected
	stateChanged: function(inState) {
		this.setState(inState, this[inState]);
	}
});
