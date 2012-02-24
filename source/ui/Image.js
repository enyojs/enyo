enyo.kind({
	name: "Image",
	tag: "img",
	attributes: {
		onload: enyo.bubbler,
		onerror: enyo.bubbler,
		// note: draggable attribute takes one of these String values: "true", "false", "auto"
		// (Boolean _false_ would remove the attribute)
		draggable: "false"
	}
});
