enyo.kind({
	name: "Clock",
	kind: "Control",
	className: "toolbar-clock",
	create: function() {
		this.inherited(arguments);
		this.update();
		setInterval(enyo.bind(this, "update"), 2*1000);
	},
	update: function() {
		var d = new Date();
		var h = d.getHours() % 12 || 12;
		var m = d.getMinutes();
		var s = d.getSeconds();
		this.blink = !this.blink;
		this.setContent(h + (this.blink ? ":" : "&nbsp;") + ("0" + m).slice(-2));
	}
});