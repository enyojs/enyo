/**
	A control which provides a layer for controls which should be displayed above an application. 
	The enyo.floatingLayer singleton can be set as a control parent to have the control float 
	above an application. 

	Note: it's not intended that users create an enyo.FloatingLayer.

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