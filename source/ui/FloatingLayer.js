/**
	_enyo.FloatingLayer_ is a control that provides a layer for controls that
	should be displayed above an application. 
	The FloatingLayer singleton can be set as a control parent to have the
	control float above an application. 

	Note: It's not intended that users create instances of _enyo.FloatingLayer_.

		create: function() {
			this.inherited(arguments);
			this.setParent(enyo.floatingLayer);
		}

*/
//@ protected
enyo.kind({
	name: "enyo.FloatingLayer",
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.setParent(null);
	},
	render: function() {
		this.parentNode = document.body;
		return this.inherited(arguments);
	},
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