/**
	Implements an HTML &lt;img&gt; element and bubbles the _onload_ and
	_onerror_ events.
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
