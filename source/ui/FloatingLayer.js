/**
	_enyo.FloatingLayer_ is a control that provides a layer for controls that
	should be displayed above an application.
	The FloatingLayer singleton can be set as a control's parent to have the
	control float above an application, e.g.:

		create: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				this.setParent(enyo.floatingLayer);
			}
		})

	Note: It's not intended that users create instances of _enyo.FloatingLayer_.
*/
//* @protected
enyo.kind({
	name: "enyo.FloatingLayer",
	//* @protected
	create: enyo.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.setParent(null);
		};
	}),
	// detect when node is detatched due to document.body being stomped
	hasNode: enyo.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			if (this.node && !this.node.parentNode) {
				this.teardownRender();
			}
			return this.node;
		};
	}),
	render: enyo.inherit(function (sup) {
		return function() {
			this.parentNode = document.body;
			return sup.apply(this, arguments);
		};
	}),
	generateInnerHtml: function() {
		return "";
	},
	beforeChildRender: function() {
		if (!this.hasNode()) {
			this.render();
		}
	},
	teardownChildren: function() {
	}
});

enyo.floatingLayer = new enyo.FloatingLayer();