/**
	Implements an HTML img element, and bubbles the onload, and onerror events
*/
enyo.kind({
	name: "enyo.Image",
	//* @protected
	tag: "img",
	attributes: {
		onload: enyo.bubbler,
		onerror: enyo.bubbler,
		// note: draggable attribute takes one of these String values: "true", "false", "auto"
		// (Boolean _false_ would remove the attribute)
		draggable: "false"
	}
});
