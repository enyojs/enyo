enyo.kind({
	name: "enyo.StringBinding",
	kind: enyo.Binding,
	transform: function (val) {
		if (!enyo.isString(val)) {
			return "";
		}
		return val;
	}
});
