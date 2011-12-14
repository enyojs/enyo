//* @protected
enyo.kind({
	name: "enyo.Buffer",
	kind: enyo.Component,
	events: {
		onAcquirePage: "",
		onDiscardPage: ""
	},
	top: 0,
	bottom: -1,
	margin: 0,
	overbuffer: 0,
	//* @protected
	firstPage: null,
	lastPage: null,
	//* @public
	acquirePage: function(inPage) {
		return this.doAcquirePage(inPage);
	},
	discardPage: function(inPage) {
		return this.doDiscardPage(inPage);
	},
	flush: function() {
		while (this.bottom >= this.top) {
			this.pop();
		}
	},
	//* @protected
	adjustTop: function(inTop) {
		// DEBUG: diagnostic only
		this.specTop = inTop;
		// add overbuffering
		var tt = inTop - this.overbuffer;
		// if the new top inside the margin, we are good to go
		if (tt >= this.top && tt <= this.top + this.margin && tt <= this.bottom) {
			//this.log(this.name + ": inside margin test passed");
			return;
		}
		// margin-top
		var mt = tt - this.margin;
		// NOTE: our window can have a margin, to this.top will not generally be equivalent to inTop
		// discard pages off the top
		while (this.top < mt) {
			this.shift();
		}
		// ... or acquire pages on the top
		while (this.top > tt /*|| this.top >= this.bottom*/) {
			// attempt to acquire a new page
			if (this.unshift() === false) {
				// if we couldn't acquire a new page, the the current top is the 'hard top' (firstPage)
				// this value is only valid until the backing-store changes
				this.firstPage = this.top;
				//this.log("firstPage = ", this.firstPage);
				// return false if we were unable to load page inTop
				// aka, return true if our loaded top is above or at the requested top
				//this.log(this.name + ": unshift failed, returning (this.top <= inTop && this.bottom >= inTop) = ", this.top <= inTop && this.bottom >= inTop);
				return (this.top <= inTop && this.bottom >= inTop);
			}
			//this.log(this.name + ": unshift succeeded", this.top, tt, this.specTop);
		}
		//this.log(this.name + ": fallthrough (this.top <= tt)", this.top, tt, "(this.top < this.bottom)", this.top, this.bottom, this.specTop);
	},
	adjustBottom: function(inBottom) {
		// DEBUG: diagnostic only
		this.specBottom = inBottom;
		// add overbuffering
		var bb = inBottom + this.overbuffer;
		// if the new bottom inside the margin, we are good to go
		if (bb >= this.bottom - this.margin && bb <= this.bottom) {
			return;
		}
		// margin-bottom
		var mb = bb + this.margin;
		// NOTE: our window can have a margin, so this.bottom will not generally be equivalent to inBottom
		// discard pages off the bottom
		while (this.bottom > mb) {
			this.pop();
		}
		// ... or acquire pages on the bottom
		while (this.bottom < bb) {
			if (this.push() === false) {
				// if we couldn't acquire a new page, the the current bottom is the 'hard bottom' (lastPage)
				// this value is only valid until the backing-store changes
				this.lastPage = this.bottom;
				//this.log("lastPage = ", this.lastPage);
				// return false if we were unable to load page inBottom
				// aka, return true if our loaded bottom is below or at the requested bottom
				//console.log("hit bottom", this.bottom, inBottom);
				return (this.bottom >= inBottom);
			}
		}
	},
	shift: function() {
		this.discardPage(this.top++);
	},
	unshift: function() {
		if (this.acquirePage(this.top - 1) === false) {
			return false;
		}
		this.top--;
	},
	push: function() {
		if (this.acquirePage(this.bottom + 1) === false) {
			return false;
		}
		this.bottom++;
	},
	pop: function() {
		this.discardPage(this.bottom--);
	},
	refresh: function() {
		for (var i=this.top; i<=this.bottom; i++) {
			this.acquirePage(i);
		}
	}
});

//* @protected
enyo.kind({
	name: "enyo.BufferView",
	kind: enyo.Control,
	style: "font-size: 0.7em; border: 1px solid black;",
	components: [
		{name: "bufferName", content: "Buffer", style: "border-bottom: 1px dotted black; padding: 2px;"},
		{name: "first", content: "0", style: "color: green; padding: 2px;"}/*,
		{name: "top", content: "0", style: "border: 1px solid green; text-align: center;"},
		{content: "...", style: "color: silver; text-align: center;"},
		{name: "bottom", content: "0", style: "border: 1px solid red; text-align: center;"},
		{name: "last", content: "?", style: "color: red; text-align: right;"}*/
	],
	update: function(inBuffer) {
		this.$.bufferName.setContent(inBuffer.name);
		this.$.first.setContent(inBuffer.top + " (" + (inBuffer.specTop || "n/a") + ") - " + inBuffer.bottom + " (" + (inBuffer.specBottom || "n/a") + ")");
		/*
		this.$.top.setContent(inBuffer.top + " (" + inBuffer.specTop + ")");
		this.$.bottom.setContent(inBuffer.bottom + " (" + inBuffer.specBottom + ")");
		this.$.first.setContent(inBuffer.firstPage == null ? "?" : inBuffer.firstPage);
		this.$.last.setContent(inBuffer.lastPage == null ? "?" : inBuffer.lastPage);
		*/
	}
});
