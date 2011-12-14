/**
A simple container with a content specified by the content property. By default, layoutKind is set to HFlexBox, and
thus the content is displayed to the left of the container's content. Change layoutKind to 
VFlexBox to place the content above the content. The content will fill any space not taken up by
the content.

NOTE: If additional control over the styling of the content or container content is required, use 
separate controls instead of a LabeledContainer.

	{kind: "LabeledContainer", content: "3 buttons", components: [
		{kind: "Button", content: "1"},
		{kind: "Button", content: "2"},
		{kind: "Button", content: "3"}
	]}
*/
enyo.kind({
	name: "enyo.LabeledContainer",
	kind: enyo.HFlexBox,
	//* @protected
	components: [
		{name: "content", flex: 1},
		{name: "client"}
	],
	align: "center",
	contentChanged: function() {
		this.$.content.setContent(this.content);
	}
});