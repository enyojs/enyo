/**
	_enyo.Scroller_ provides touch-based scrolling for controls placed inside it.
	See <a href="#enyo.BasicScroller">enyo.BasicScroller</a> for more information.

	In addition to providing all the functionality of a BasicScroller, enyo.Scroller ensures
	that the dimensions of the scroller content are at least as large as the dimensions of the scroller itself.

	Since this is typically desirable--it allows a background image to expand to fit the scroller, for
	one thing--applications should generally use enyo.Scroller.
*/
enyo.kind({
	name: "enyo.Scroller",
	kind: enyo.BasicScroller,
	//* @protected
	scrollerChrome: null,
	// If there is only one user component, we can treat that component as the inner-client
	monoChrome: [
		{name: "client", className: "enyo-view"}
	],
	// otherwise, we need to collected all user components into a chrome inner-client
	multiChrome: [
		{name: "client", className: "enyo-view", components: [
			{name: "innerClient"}
		]}
	],
	initComponents: function() {
		// The differentiation between single and multiple chrome
		// setups is determined here at set-up time. It's not
		// designed to switch between these modes at runtime.
		if (!this.components || this.components.length !== 1 ) {
			this.controlParentName = "innerClient";
			this.createChrome(this.multiChrome);
		} else {
			this.createChrome(this.monoChrome);
		}
		this.inherited(arguments);
	},
	locateScrollee: function() {
		return this.$.innerClient || this.getClientControls()[0];
	}
});