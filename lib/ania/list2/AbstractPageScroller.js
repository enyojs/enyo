/**
	Implement a concrete paging mechanism for CustomAbstractPageScroller.
*/
enyo.kind({
	name: "enyo.list.AbstractPageScroller",
	kind: enyo.list.CustomAbstractPageScroller,
	top: 0,
	bottom: -1,
	//createPage: function(inIndex, inPrepend) // abstract
	create: function() {
		this.sizes = [];
		this.pages = [];
		this.inherited(arguments);
	},
	punt: function() {
		this.top = 0;
		this.bottom = -1;
		this.$.pageStrategy.punt();
		this.$.scroll.setScrollPosition(0);
		//this.refresh();
	},
	refresh: function() {
		// FIXME: hacky attempt and preventing intermediate rendering to be visible to the user.
		// Method update() has to render pages to measure them and the scroll positions are fixed
		// up after. This is all synchronous, so I don't actually expect paints, but I can
		// see out of position content briefly in some cases.
		this.$.client.applyStyle("visibility", "hidden");
		this.$.pageStrategy.refresh();
		this.flushConcretePages();
		this.update();
		this.$.client.applyStyle("visibility", null);
		// synchronize the scroller
		this.scroll();
	},
	flushConcretePages: function() {
		for (var i in this.pages) {
			this.pages[i].destroy();
		}
		this.pages = [];
		this.bottom = this.top - 1;
	},
	shiftPage: function(inSender, inSpace) {
		var s = this.sizes[this.top];
		if (s || s===0) {
			if (s < inSpace) {
				this.hidePage(this.top);
				this.top++;
				//this.log(this.top);
				return s;
			}
		}
	},
	unshiftPage: function() {
		if (this.pages[this.top - 1]) {
			this.top--;
			//this.log(this.top);
			this.showPage(this.top);
			return this.sizes[this.top];
		} else {
			var size = this.createPage(this.top-1, true);
			if (size || size === 0) {
				this.sizes[--this.top] = size;
				//this.log(this.top);
				return size;
			}
		}
	},
	popPage: function(inSender, inSpace) {
		var s = this.sizes[this.bottom];
		if (s || s===0) {
			if (s < inSpace) {
				this.hidePage(this.bottom);
				this.bottom--;
				//this.log(this.bottom);
				return s;
			}
		}
	},
	pushPage: function() {
		//this.log(this.bottom);
		if (this.pages[this.bottom + 1]) {
			this.bottom++;
			//this.log(this.bottom);
			this.showPage(this.bottom);
			return this.sizes[this.bottom];
		} else {
			var size = this.createPage(this.bottom+1, false);
			if (size || size === 0) {
				this.sizes[++this.bottom] = size;
				//this.log(this.bottom);
				return size;
			}
		}
		//this.log("push page failed at bottom " + this.bottom);
	},
	showPage: function(inIndex) {
		webosEvent.start('', 'enyo.AbstractPageScroller.showPage', '');
		this.pages[inIndex].show();
		webosEvent.stop('', 'enyo.AbstractPageScroller.showPage', '');
	},
	hidePage: function(inIndex) {
		webosEvent.start('', 'enyo.AbstractPageScroller.showPage', '');
		this.pages[inIndex].hide();
		webosEvent.stop('', 'enyo.AbstractPageScroller.showPage', '');
	}
});

