enyo.kind({
	name: "enyo.StringBinding",
	kind: enyo.Binding,
	transform: function (val, dir, bind) {
		if (!enyo.isString(val)) {
			return "";
		}
		return val;
	}
});
