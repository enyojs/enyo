/**
	Implements an HTML &lt;img&gt; element and, optionally, bubbles the 
	_onload_ and _onerror_ events. This also surpresses image dragging
	so images won't interfere with touch interfaces.
*/
enyo.kind({
	name: "enyo.Image",
	//* When true, no onload or onerror event handlers will be created.
	noEvents: false,
	//* @protected
	tag: "img",
	attributes: {
		onload: enyo.bubbler,
		onerror: enyo.bubbler,
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
	}
});
