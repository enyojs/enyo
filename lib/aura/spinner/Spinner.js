/**
A control that displays a spinner animation to indicate that activity is taking place.

It's typical to show and hide the spinner to indicate activity. The spinner animation 
will automatically start when the spinner is shown.

For example, to show a spinner while a service response is being requested:

	components: [
		{kind: "PalmService", onResponse: "serviceResponse"},
		{kind: "Button", content: "Call Service", onclick: "buttonClick"},
		{kind: "Spinner"}
	],
	buttonClick: function() {
		this.$.service.call();
		this.$.spinner.show();
	},
	serviceResponse: function() {
		this.$.spinner.hide();
	}

*/

enyo.kind({
	name: "enyo.Spinner", 
	kind: enyo.RotatingImage,
	className: "enyo-spinner enyo-rotating-image"
});

/**
 A control that displays a large spinner animation to indicate that activity is taking place.
 */
enyo.kind({
	name: "enyo.SpinnerLarge", 
	kind: enyo.Spinner,
	className: "enyo-spinner-large enyo-rotating-image",
});
