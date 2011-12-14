enyo.kind({
	name: "enyo.CarouselFitPanels",
	kind: "CarouselPanels",
	layoutKind: "FitLayout",
	updateSizes: function() {
		this.inherited(arguments);
		this.value = -(this.index || 0) * this.clientSize;
	},
	calcContentSize: function() {
		return this.getClientControls().length * this.clientSize;
	},
	applyValue: function(inValue) {
		var x = Math.floor(Math.abs(inValue) / this.clientSize);
		var v = inValue % this.clientSize;
		for (var i=0, c$=this.getClientControls(), c, m; c=c$[i]; i++) {
			if (i > x+1 || i < x-1) {
				this.$.transmorph.apply(c, this.transform + "(100%)");
			} else {
				m = i > x ? 1 : (i < x ? -1 : 0);
				m = v + (m * this.clientSize);
				this.$.transmorph.apply(c, this.transform + "(" + m + "px)");
			}
		}
	},
	calcIndexForValue: function(inValue, inMinimizing) {
		return Math[inMinimizing ? "ceil" : "floor"](Math.abs(this.value) / this.clientSize);
	},
	calcValueForIndex: function(inIndex) {
		return -inIndex * this.clientSize;
	},
	finishAnimate: function(inSender) {
		var x = Math.floor(Math.abs(this.value) / this.clientSize);
		for (var i=0, c$=this.getClientControls(), c; c=c$[i]; i++) {
			if (i != x) {
				this.$.transmorph.apply(c, this.transform + "(100%)");
			}
		}
		this.inherited(arguments);
	}
});


enyo.kind({
	name: "enyo.FitLayout",
	layoutClass: "enyo-fitlayout",
	flow: function () {},
	//* @protected
	constructor: function(inContainer) {
		this.container = inContainer;
		inContainer.addClass(this.layoutClass);
	},
	destroy: function() {
		if (this.container) {
			this.container.removeClass(this.layoutClass);
		}
	}
});

