/**
	Implement a concrete item mechanism for AbstractPageScroller.
*/
enyo.kind({
	name: "enyo.List",
	kind: enyo.list.AbstractPageScroller,
	events: {
		onCreateItem: ""
	},
	itemsPerPage: 4,
	createPage: function(inIndex, inPrepend) {
		var items = this.fetchItems(inIndex, inPrepend);
		if (items) {
			var page = this.createComponent({components: items});
			page.prepend = this.bottomUp ? !inPrepend : inPrepend;
			page.render();
			this.pages[inIndex] = page;
			// forces a synchronous layout
			return page.hasNode().offsetHeight;
		}
	},
	fetchItems: function(inIndex, inPrepend) {
		//this.log(inIndex, inPrepend);
		// map page index to item index
		var ii = inIndex * this.itemsPerPage;
		var step = 1;
		// must traverse items in inverse direction if prepending
		if (inPrepend !== this.bottomUp) {
			ii += this.itemsPerPage - 1;
			step = -1;
		}
		// traverse rows
		var items = [];
		// we must traverse all possible items since only the first
		// or last item may exist
		// we can only conclude this page is empty after checking
		// all items
		var add = inPrepend ? "unshift" : "push";
		for (var i=0; i<this.itemsPerPage; i++, ii += step) {
			var item = this.doCreateItem(ii);
			if (item) {
				items[add](item);
			}
		}
		return items.length ? items : null;
	}
});