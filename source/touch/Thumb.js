enyo.kind({
	name: "enyo.ScrollThumb",
	minSize: 4,
	cornerSize: 6,
	classes: "enyo-thumb",
	axis: "v",
	create: function() {
		this.inherited(arguments);
		var v = this.axis == "v";
		this.dimension = v ? "height" : "width";
		this.offset = v ? "top" : "left";
		this.translation = v ? "translateY" : "translateX";
		this.positionMethod = v ? "getScrollTop" : "getScrollLeft";
		this.sizeDimension = v ? "clientHeight" : "clientWidth";
		this.addClass("enyo-" + this.axis + "thumb");
		if (enyo.dom.canAccelerate()) {
			enyo.dom.transformValue(this, "translateZ", 0);
		}
	},
	sync: function(inStrategy) {
		this.scrollBounds = inStrategy._getScrollBounds();
		this.update(inStrategy);
	},
	update: function(inStrategy) {
		var d = this.dimension, o = this.offset;
		var bd = this.scrollBounds[this.sizeDimension], sbd = this.scrollBounds[d];
		var overs = 0, overp = 0, over = 0;
		if (bd >= sbd) {
			this.hide();
			return;
		}
		if (inStrategy.isOverscrolling()) {
			over = inStrategy.getOverScrollBounds()["over" + o];
			overs = Math.abs(over);
			overp = Math.max(over, 0);
		}
		var sbo = inStrategy[this.positionMethod]() - over;
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
				enyo.dom.transformValue(this, this.translation, p + "px");
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
		if (inShowing && inShowing != this.showing) {
			if (this.scrollBounds[this.sizeDimension] >= this.scrollBounds[this.dimension]) {
				return;
			}
		}
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
			enyo.job(this.id + "hide", enyo.bind(this, "hide"), inDelay || 0);
		}
	},
	cancelDelayHide: function() {
		enyo.job.stop(this.id + "hide");
	}
});
