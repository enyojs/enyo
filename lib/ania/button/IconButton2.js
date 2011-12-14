/* FIXME: this is an attempt at an Icon button that supports:
	- icon
	- text
	- spinner

The text will always be to the right of the icon. This seems like what's necessary to support the 80% case for button,
but this needs thoughtful review.

*/

/**
A <a href="#enyo.CustomButton">Button</a> with Enyo styling,
an image in the button, and an optional text label below it.

	{kind: "IconButton", content: "I am a label", icon: "images/foo.png"}
*/
enyo.kind({
	name: "enyo.IconButton2",
	kind: enyo.Button,
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
		hint: "",
		active: false
	},
	layoutKind: "HFlexLayout",
	align: "center",
	components: [
		{name: "content", flex: 1, className: "enyo-button-icon-text"}
	],
	iconChrome: [
		{name: "icon", className: "enyo-button-icon", prepend: true, showing: false},
	],
	spinnerChrome: [
		{name: "spinner", kind: "Spinner", className: "enyo-button-spinner"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.iconPathChanged();
		this.iconClassChanged();
		this.activeChanged();
		this.hintChanged();
	},
	initComponents: function() {
		this.inherited(arguments);
		if (this.icon) {
			this.validateIconChrome();
		}
		if (this.active) {
			this.validateSpinnerChrome();
		}
	},
	validateIconChrome: function() {
		if (!this.$.icon) {
			this.createChrome(this.iconChrome);
			if (this.generated) {
				this.render();
			}
		}
	},
	validateSpinnerChrome: function() {
		if (!this.$.spinner) {
			this.createChrome(this.spinnerChrome);
			if (this.generated) {
				this.render();
			}
		}
	},
	hintChanged: function() {
		this.setAttribute("title", this.hint);
	},
	activeChanged: function() {
		if (this.active || this.$.spinner) {
			this.validateSpinnerChrome();
			this.$.spinner.setShowing(this.active);
		}
	},
	iconPathChanged: function() {
		this.validateIconChrome();
		this.$.icon.setShowing(Boolean(this.iconPath || this.iconClass));
		var iconPath = this.iconPath ? "url(" + enyo.path.rewrite(this.iconPath) + ")" : null;
		this.$.icon.applyStyle("background-image", iconPath);
		this.$.icon.applyStyle("background-repeat", "no-repeat");
	},
	iconClassChanged: function(inOldValue) {
		this.validateIconChrome();
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
