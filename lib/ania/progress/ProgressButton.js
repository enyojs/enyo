/**
A progress bar that looks like a list item.

	{kind: "ProgressButton"}

See <a href="#enyo.Progress">Progress</a> for usage examples.
*/
enyo.kind({
	name: "enyo.ProgressButton",
	kind: enyo.ProgressBar,
	className: "enyo-progress-button",
	events: {
		onCancel: "" //* Sent when cancel button is clicked.
	},
	published: {
		cancelable: true
	},
	barChrome: [
		{name: "animator", kind: enyo.Animator, onBegin: "beginAnimation", onAnimate: "stepAnimation", onEnd: "endAnimation", onStop: "stopAnimation"},
		{name: "bar", className: "enyo-progress-button-inner"},
		{name: "client", flex:1, align:"center", layoutKind:"HFlexLayout", className: "enyo-progress-button-client"},
		{name: "cancelButton", className: "enyo-progress-button-cancel", onclick:"doCancel"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.cancelableChanged();
	},
	cancelableChanged: function() {
		this.$.cancelButton.setShowing(this.cancelable);
	}
});
