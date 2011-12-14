/**
A <a href="#enyo.CustomButton">Button</a> with Enyo styling,
an image in the button, and an optional text label below it.

	{kind: "IconButton", content: "I am a label", iconPath: "images/foo.png"}
*/
enyo.kind({
	name: "enyo.IconButton",
	kind: enyo.CustomButton,
	className: "enyo-button",
	published: {
		/**
			Path to icon image file.  Optional.
		*/
		iconPath: null,
		/**
			CSS class to apply to the icon. Optional.  
			May include the image itself (as a background-image style) if it's not specified in 'iconPath'.
		*/
		iconClass: "",
		hint: ""
	},
	components: [
		{name: "icon", className: "enyo-button-icon", showing: false},
		{name: "content", className: "enyo-button-icon-text"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.iconPathChanged();
		this.iconClassChanged();
		this.hintChanged();
	},
	hintChanged: function() {
		this.$.icon.setAttribute("title", this.hint);
	},
	iconPathChanged: function() {
		this.$.icon.setShowing(Boolean(this.iconPath || this.iconClass));
		var iconPath = this.iconPath ? "url(" + enyo.path.rewrite(this.iconPath) + ")" : null;
		this.$.icon.applyStyle("background-image", iconPath);
		this.$.icon.applyStyle("background-repeat", "no-repeat");
	},
	iconClassChanged: function(inOldValue) {
		this.$.icon.setShowing(Boolean(this.iconPath || this.iconClass));
		if (inOldValue) {
			this.$.icon.removeClass(inOldValue);
		}
		if (this.iconClass) {
			this.$.icon.addClass(this.iconClass);
		}
	},
	contentChanged: function() {
		this.$.content.setContent(this.content);
		this.$.content.setShowing(this.content);
	}
});
