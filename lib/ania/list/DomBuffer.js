//* @protected
enyo.kind({
	name: "enyo.DomBuffer",
	kind: enyo.Buffer,
	rowsPerPage: 3,
	lastPage: 0,
	//* @protected
	constructor: function() {
		this.inherited(arguments);
		this.pool = [];
	},
	generateRows: function(inPage) {
		var h = [];
		for (var i=0, ri=this.rowsPerPage*inPage, r; i<this.rowsPerPage; i++, ri++) {
			r = this.generateRow(ri);
			if (r) {
				h.push(r);
			}
		}
		if (!h.length) {
			return false;
		}
		return h.join('');
	},
	preparePage: function(inPage) {
		//this.log(inPage);
		var div = this.pages[inPage] = this.pages[inPage] || (this.pool.length ? this.pool.pop() : document.createElement('div'));
		div.style.display = "none";
		div.className = "page";
		div.id = "page-" + inPage;
		return div;
	},
	installPage: function(inNode, inPage) {
		if (!inNode.parentNode) {
			var parentNode = this.pagesNode;
			if (inPage < this.bottom) {
				parentNode.insertBefore(inNode, parentNode.firstChild);
			} else {
				parentNode.appendChild(inNode);
			}
		}
	},
	//* @public
	acquirePage: function(inPage) {
		//this.log(inPage);
		var h = this.generateRows(inPage);
		if (h === false) {
			return false;
		}
		var node = this.preparePage(inPage);
		node.innerHTML = h;
		this.installPage(node, inPage);
	},
	discardPage: function(inPage) {
		//this.log(inPage);
		var n = this.pages[inPage];
		if (!n) {
			this.warn("bad page:", inPage);
		} else {
			n.parentNode.removeChild(n);
			this.pool.push(n);
			this.pages[inPage] = null;
		}
	}
});
