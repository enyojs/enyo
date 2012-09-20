/**
	_enyo.Image_ implements an HTML &lt;img&gt; element and, optionally, bubbles
	the _onload_ and _onerror_ events. Image dragging is suppressed by default,
	so as not to interfere with touch interfaces.
*/
enyo.kind({
	name: "enyo.Image",
	//* When true, no _onload_ or _onerror_ event handlers will be created
	noEvents: false,
	//* @protected
	tag: "img",
	attributes: {
		// note: draggable attribute takes one of these String values: "true", "false", "auto"
		// (Boolean _false_ would remove the attribute)
		draggable: "false"
	},
	create: function() {
		if (this.noEvents) {
			delete this.attributes.onload;
			delete this.attributes.onerror;
		}
		this.inherited(arguments);
	},
	rendered: function() {
		this.inherited(arguments);
		enyo.makeBubble(this, "load", "error");
	}
});
