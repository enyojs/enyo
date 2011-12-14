enyo.kind({
	name: "SlideablePopup",
	kind: "Popup",
	published: {
		min: 0,
		max: 0,
		openTo: "max",
		draggable: true,
		clientClassName: ""
	},
	lazy: false,
	showing: true,
	className: "enyo-slideablepopup",
	showHideMode: "manual",
	chrome: [
		{name: "client", kind: "Slideable", className: "enyo-slideablepopup-client", onFinishAnimate: "finishAnimate"}
	],
	componentsReady: function() {
		//this.setShowing(this.showing);
		this.inherited(arguments);
		this.createChrome(this.chrome);
		this.clientClassNameChanged();
		this.minChanged();
		this.maxChanged();
		var t = this.openTo == "max" ? this.min: this.max;
		this.$.client.setValue(t);
		this.draggableChanged();
		enyo.asyncMethod(this, "render");
		this.applyZIndex();
	},
	clientClassNameChanged: function(inOldValue) {
		this.$.client.removeClass(inOldValue);
		this.$.client.addClass(this.clientClassName);
	},
	applyZIndex: function() {
		this.inherited(arguments);
		//this.$.client.applyStyle("z-index", this.getZIndex());
	},
	minChanged: function() {
		this.$.client.setMin(this.min);
	},
	maxChanged: function() {
		this.$.client.setMax(this.max);
	},
	draggableChanged: function() {
		this.$.client.setDraggable(this.draggable);
	},
	getAnimator: function() {
		return this.$.client.getAnimator();
	},
	renderOpen: function() {
		this.show();
		this.$.client.animateToMax();
	},
	renderClose: function() {
		if (!this.dragging) {
			this.$.client.animateToMin();
		}
	}
});