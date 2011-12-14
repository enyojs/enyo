/**
The button control displays a themed button with a content. If you need to display a button with custom visual treatment, use a <a href="#base/controls/CustomButton.js">custom button</a>.
Initialize a button as follows:

	{kind: "Button", content: "OK", onclick: "buttonClick"}
*/
enyo.kind({
	name: "enyo.Button",
	kind: enyo.CustomButton,
	className: "enyo-button"
});