/**
A <a href="#enyo.Button">Button</a> that has a
<a href="#enyo.Spinner">Spinner</a> as an activity indicator. Use
setActive() to start or stop the spinner.

	{kind: "ActivityButton", content: "Hit me to spin", onclick: "toggleActivity"}
	
	toggleActivity: function(inSender) {
		var a = inSender.getActive();
		inSender.setActive(!a);
	}
*/
enyo.kind({
	name: "enyo.ActivityButton", 
	kind: enyo.Button,
	published: {
		active: false
	},
	layoutKind: "HFlexLayout",
	components: [
		{name: "content", flex: 1},
		{name: "spinner", kind: "Spinner", className: "enyo-activitybutton-spinner"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.activeChanged();
	},
	activeChanged: function() {
		this.$.spinner.setShowing(this.active);
	},
	contentChanged: function() {
		this.$.content.setContent(this.content);
	}
});
