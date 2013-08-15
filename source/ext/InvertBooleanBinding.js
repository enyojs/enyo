enyo.kind({
	name: "enyo.InvertBooleanBinding",
	kind: enyo.Binding,
	transform: function (value) {
		return ! value;
	}
});
