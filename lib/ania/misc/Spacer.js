/**
A control that fills the space between other controls in a <a href="#enyo.FlexLayout">flex layout</a> by setting
its flex property to 1. For example:

	{kind: "HFlexBox", components: [
		{kind: "Button", content: "On the left"},
		{kind: "Spacer"},
		{kind: "Button", content: "On the right"}
	]}

*/
enyo.kind({
	name: "enyo.Spacer",
	kind: enyo.Control,
	className: "enyo-spacer",
	flex: 1
});
