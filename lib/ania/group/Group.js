/**
A control used to show a series of controls visually grouped together. A group can optionally
describe itself with a content.

Here's an example:

	{kind: "Group", content: "Audio/Video Options", components: [
		{kind: "HFlexBox", components: [
			{content: "Sound", flex: 1},
			{kind: "ToggleButton"}
		]},
		{kind: "HFlexBox", components: [
			{content: "Video", flex: 1},
			{kind: "ToggleButton"}
		]}
	]}
*/
enyo.kind({
	name: "enyo.Group", 
	kind: enyo.Control,
	className: "enyo-group enyo-roundy",
	published: {
		content: "",
		/**
		If true, then the group's content is expanded to fit the size of the group. This 
		should be used when the group is given an explicit size and its content should fit to that size.
		*/
		contentFit: false
	},
	//* @protected
	components: [
		{name: "content", kind: "Control", className: "enyo-group-content"},
		{name: "client", kind: "Control", flex: 1, className: "enyo-group-inner"}
	],
	create: function() {
		this.inherited(arguments);
		this.contentChanged();
		this.contentFitChanged();
	},
	contentChanged: function() {
		this.$.content.setContent(this.content);
		this.$.content.setShowing(this.content);
		this.addRemoveClass("enyo-group-with-content", this.content);
	},
	contentFitChanged: function() {
		if (this.contentFit) {
			this.createLayoutFromKind("VFlexLayout");
		} else {
			this.destroyObject("layout");
		}
		this.$.content.addRemoveClass("enyo-group-fit", this.contentFit);
	},
	layoutKindChanged: function() {
		this.$.client.align = this.align;
		this.$.client.pack = this.pack;
		this.$.client.setLayoutKind(this.layoutKind);
	}
});
