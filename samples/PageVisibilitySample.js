enyo.kind({
	name: "enyo.sample.PageVisibilitySample",
	components: [
		{kind: "Signals", onvisibilitychange: "visibilitychanged"},
		{name: "text", allowHtml: true}
	],
	rendered: function () {
		this.inherited(arguments);
		this.visibilitychanged();
	},
	visibilitychanged: function(){
		this.$.text.setContent(this.$.text.content + (Date().toString()) + (enyo.hidden ? ": hidden" : ": visible") + "<br>");
	}
});
