/**
	_enyo.Layout_ is the base kind for layout kinds.  These are used by
	<a href="#enyo.UiComponent">enyo.UiComponent</a>-based controls to allow for
	arranging of the children by setting the _layoutKind_ property.

	Derived kinds will usually provide their own _layoutClass_ property to
	affect the CSS rules used, and may also implement the _flow_ and _reflow_
	methods. _flow_ is called during control rendering, while _reflow_ is called
	when the associated control is resized.
*/
enyo.kind({
	name: "enyo.Layout",
	kind: null,
	//* CSS class that's added to the control using this layout kind
	layoutClass: "",
	//* @protected
	constructor: function(inContainer) {
		this.container = inContainer;
		if (inContainer) {
			inContainer.addClass(this.layoutClass);
		}
	},
	destroy: function() {
		if (this.container) {
			this.container.removeClass(this.layoutClass);
		}
	},
	// static property layout
	flow: function() {
	},
	// dynamic measuring layout
	reflow: function() {
	}
});
