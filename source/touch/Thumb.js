enyo.kind({
	name: "enyo.ScrollThumb",
	minSize: 4,
	cornerSize: 8,
	classes: "enyo-thumb",
	axis: "v",
	create: function() {
		this.inherited(arguments)
		var v = this.axis == "v";;
		this.dimension = v ? "height" : "width";
		this.offset = v ? "top" : "left";
		this.addClass("enyo-" + this.axis + "thumb");
		if (enyo.dom.canAccelerate()) {
			enyo.dom.transformValue(this, "translateZ", 0);
		}
	},
	sync: function(inStrategy) {
		this.scrollSize = inStrategy.container.getBounds();
		this.scrollBounds = inStrategy._getScrollBounds();
		this.update(inStrategy);
	},
	update: function(inStrategy) {
		var d = this.dimension, o = this.offset;
		var bd = this.scrollSize[d], sbd = this.scrollBounds[d];
		var overs = 0, overp = 0;
		if (bd >= sbd) {
			this.hide();
			return;
		}
		var sbo = o === "top" ? inStrategy.scrollTop : inStrategy.scrollLeft;
		if (inStrategy.isOverscrolling()) {
			var over = inStrategy.getOverScrollBounds()["over" + o];
			overs = Math.abs(over);
			overp = Math.max(over, 0);
		}
		// calc size & position
		var bdc = bd - this.cornerSize;
		var s = Math.floor((bd * bd / sbd) - overs);
		s = Math.max(this.minSize, s);
		var p = Math.floor((bdc * sbo / sbd) + overp);
		p = Math.max(0, Math.min(bdc - this.minSize, p));
		// apply thumb styling
		this.needed = s < bd;
		if (this.needed && this.hasNode()) {
			if (this._pos !== p) {
				this._pos = p;
				var to = "";
				if (o === "top") {
					to = "0, ";
				}
				to += p;
				enyo.dom.transformValue(this, "translate", to + "px");
			}
			if (this._size !== s) {
				this._size = s;
				this.node.style[d] = this.domStyles[d] = s + "px";
			}
		} else {
			this.hide();
		}
	},
	// implement set because showing is not changed while 
	// we delayHide but we want to cancel the hide.
	setShowing: function(inShowing) {
		if (this.hasNode()) {
			this.cancelDelayHide();
		}
		if (inShowing != this.showing) {
			var last = this.showing;
			this.showing = inShowing;
			this.showingChanged(last);
		}
	},
	delayHide: function(inDelay) {
		if (this.showing) {
			this.hideJob = setTimeout(enyo.bind(this, "hide"), inDelay || 0);
		}
	},
	cancelDelayHide: function() {
		clearTimeout(this.hideJob);
	}
});
