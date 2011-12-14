//* @protected
enyo.kind({
	name: "enyo.BufferedScroller",
	kind: enyo.VirtualScroller,
	rowsPerPage: 1,
	events: {
		onGenerateRow: "generateRow",
		onAdjustTop: "",
		onAdjustBottom: ""
	},
	//* @protected
	constructor: function() {
		this.pages = [];
		this.inherited(arguments);
	},
	create: function() {
		this.inherited(arguments);
		this.createDomBuffer();
		this.createDisplayBuffer();
	},
	createDomBuffer: function() {
		this.domBuffer = this.createComponent({
			kind: enyo.DomBuffer,
			rowsPerPage: this.rowsPerPage,
			pages: this.pages,
			margin: 20,
			generateRow: enyo.hitch(this, "doGenerateRow")
		});
	},
	createDisplayBuffer: function() {
		this.displayBuffer = new enyo.DisplayBuffer({
			heights: this.heights,
			pages: this.pages
		});
	},
	rendered: function() {
		this.domBuffer.pagesNode = this.$.content.hasNode();
		this.inherited(arguments);
	},
	pageToTopRow: function(inPage) {
		return inPage * this.rowsPerPage;
	},
	pageToBottomRow: function(inPage) {
		return inPage * this.rowsPerPage + (this.rowsPerPage - 1);
	},
	//* @public
	adjustTop: function(inTop) {
		this.doAdjustTop(this.pageToTopRow(inTop));
		if (this.domBuffer.adjustTop(inTop) === false) {
			return false;
		}
		this.displayBuffer.adjustTop(inTop);
	},
	adjustBottom: function(inBottom) {
		this.doAdjustBottom(this.pageToBottomRow(inBottom));
		if (this.domBuffer.adjustBottom(inBottom) === false) {
			return false;
		}
		this.displayBuffer.adjustBottom(inBottom);
	},
	findBottom: function() {
		while (this.pushPage() !== false) {};
		this.contentHeight = this.displayBuffer.height;
		var bb = Math.min(-this.contentHeight + this.pageOffset + this.viewHeight, -1);
		this.$.scroll.bottomBoundary = this.$.scroll.y = this.$.scroll.y0 = bb;
		this.scroll();
	},
	refreshPages: function() {
		// flush all DOM nodes
		this.domBuffer.flush();
		// domBuffer top/bottom are linked to scroller top/bottom because
		// scroller shiftPages/popPages rely on top/bottom referring to known
		// regions
		this.bottom = this.top - 1;
		this.displayBuffer.bottom = this.domBuffer.bottom = this.bottom;
		this.displayBuffer.top = this.domBuffer.top = this.top;
		// clear metrics
		this.contentHeight = 0;
		this.displayBuffer.height = 0;
		this.heights = this.displayBuffer.heights = [];
		// rebuild pages
		this.updatePages();
	},
	punt: function() {
		this.$.scroll.stop();
		this.bottom = -1;
		this.top = 0;
		this.domBuffer.flush();
		this.displayBuffer.bottom = this.domBuffer.bottom = this.bottom;
		this.displayBuffer.top = this.domBuffer.top = this.top;
		this.contentHeight = 0;
		this.displayBuffer.height = 0;
		this.heights = this.displayBuffer.heights = [];
		this.pageOffset = 0;
		this.pageTop = 0;
		this.$.scroll.y = this.$.scroll.y0 = 0;
		// rebuild pages
		this.updatePages();
	}
});
