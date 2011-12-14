//* @protected
enyo.kind({
	name: "enyo.DisplayBuffer",
	kind: enyo.Buffer,
	height: 0,
	acquirePage: function(inPage) {
		var node = this.pages[inPage];
		if (node) {
			node.style.display = "";
			if (!this.heights[inPage]) {
				this.heights[inPage] = node.offsetHeight;
			}
			this.height += this.heights[inPage];
		}
	},
	discardPage: function(inPage) {
		var node = this.pages[inPage];
		if (node) {
			node.style.display = "none";
		}
		this.height -= this.heights[inPage] || 0;
	}
});