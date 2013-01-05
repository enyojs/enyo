/**
_enyo.ScrollThumb_ is a helper kind used by
<a href="#enyo.TouchScrollStrategy">enyo.TouchScrollStrategy</a> and
<a href="#enyo.TranslateScrollStrategy">enyo.TranslateScrollStrategy</a> to
display a small visual scroll indicator.

_enyo.ScrollThumb_ is not typically created in application code.
*/

enyo.kind({
	name: "enyo.ScrollThumb",
	//* The orientation of the scroll indicator bar; "v" for vertical or "h" for horizontal
	axis: "v",
	//* @protected
	//* Minimum size of the indicator
	minSize: 4,
	//* Size of the corners of the indicator
	cornerSize: 6,
	classes: "enyo-thumb",
	create: function() {
		this.inherited(arguments);
		var v = this.axis == "v";
		this.dimension = v ? "height" : "width";
		this.offset = v ? "top" : "left";
		this.translation = v ? "translateY" : "translateX";
		this.positionMethod = v ? "getScrollTop" : "getScrollLeft";
		this.sizeDimension = v ? "clientHeight" : "clientWidth";
		this.addClass("enyo-" + this.axis + "thumb");
		this.transform = enyo.dom.canTransform();
		if (enyo.dom.canAccelerate()) {
			enyo.dom.transformValue(this, "translateZ", 0);
		}
	},
	//* Syncs the scroll indicator bar to the scroller size and position,
	//* as determined by the passed-in scroll strategy.
	sync: function(inStrategy) {
		this.scrollBounds = inStrategy._getScrollBounds();
		this.update(inStrategy);
	},
	update: function(inStrategy) {
		if (this.showing) {
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
					if(!this.transform) {
						//adjust top/left for browsers that don't support translations
						if(this.axis=="v") {
							this.setBounds({top:p + "px"});
						} else {
							this.setBounds({left:p + "px"});
						}
					} else {
						enyo.dom.transformValue(this, this.translation, p + "px");
					}
				}
				if (this._size !== s) {
					this._size = s;
					this.node.style[d] = this.domStyles[d] = s + "px";
				}
			} else {
				this.hide();
			}
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
