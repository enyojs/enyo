enyo.kind({
	name: "SearchDecorator",
	kind: "enyo.ToolDecorator",
	classes: "search-decorator",
	components: [
		{kind: "Image", src: "images/search.png", style: "padding: 4px;"},
		{name: "client", style: "padding: 0 4px; position: relative;"},
		{name: "x", tag: "img", src: "images/cancel-8.png", style: "padding: 4px;", ontap: "clearTap"}
	],
	handlers: {
		onInputChange: "inputChange",
		onfocus: "addFocus",
		onblur: "removeFocus"
	},
	inputChange: function(inSender, inEvent) {
		// the origin of this event is the input
		var input = inEvent.originator;
		this.log("[" + input.getValue() + "]");
		this.$.x.applyStyle("visibility", input.getValue() ? "visible" : "hidden");
	},
	clearTap: function() {
		// tell controls that a clear request was made
		this.$.client.waterfall("onclear");
	},
	addFocus: function() {
		this.addClass("focus");
	},
	removeFocus: function() {
		this.removeClass("focus");
	}
});
