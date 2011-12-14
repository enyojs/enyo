/**
	Applies a transform to a control
*/
enyo.kind({
	name: "enyo.Transmorph",
	kind: enyo.Component,
	apply: function(inControl, inTransform) {
		var ds = inControl.domStyles;
		ds["-webkit-transform"] = ds["-moz-transform"] = ds["-ms-transform"] = ds["transform"] = inTransform;
		if (inControl.hasNode()) {
			var s = inControl.node.style;
			s.webkitTransform = s.MozTransform = s.msTransform = s.transform = inTransform;
		}
	}
});