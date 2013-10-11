enyo.kind({
	name: "enyo.sample.PositionSampleNested",
	defaultProps: {style: "padding: 10px; width: 100px; display: inline-block; text-align: right;"},
	text: "",
	create: function () {
		this.inherited(arguments);
		this.$.label.set("content", this.name);
	},
	components: [
		{name: "label", tag: "span"},
		{name: "text", tag: "span"}
	],
	bindings: [
		{from: ".text", to: ".$.text.content"}
	]
});

enyo.kind({
	name: "enyo.sample.PositionSample",
	defaultKind: "enyo.sample.PositionSampleNested",
	components: [
		{name: "clientX"},
		{name: "clientY"},
		{name: "pageX"},
		{name: "pageY"},
		{name: "screenX"},
		{name: "screenY"}
	],
	handlers: {"onmousemove": "mouseMoved"},
	rendered: function () {
		this.inherited(arguments);
		enyo.makeBubble("mousemove", this);
	},
	mouseMoved: function () {
		var p = enyo.getPosition();
		for (var k in p) {
			this.$[k].set("text", p[k]);
		}
	}
});
