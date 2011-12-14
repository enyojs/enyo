enyo.kind({
	name: "enyo.FadeScroller",
	//* @protected
	kind: enyo.Scroller,
	initComponents: function() {
		this.createChrome([{kind: "ScrollFades"}]);
		this.inherited(arguments);
	},
	scroll: function(inSender) {
		this.inherited(arguments);
		this.$.scrollFades.showHideFades(this);
	}
});