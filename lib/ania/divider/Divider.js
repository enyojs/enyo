/**
A labeled divider with icon.
*/
enyo.kind({
	name: "enyo.Divider",
	kind: enyo.HFlexBox,
	align: "center",
	className: "enyo-divider",
	published: {
		/**
		URL for an image to be used as the divider's icon.
		*/
		icon: "",
		iconBorderCollapse: true,
		content: "Divider"
	},
	components: [
		{name: "rightCap", className: "enyo-divider-right-cap"},
		{name: "icon", className: "enyo-divider-icon", tagName: "img"},
		{name: "content", className: "enyo-divider-content"},
		{className: "enyo-divider-left-cap"},
		{name: "client", kind: enyo.HFlexBox, align: "center", className: "enyo-divider-client"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments)
		this.$.content.allowHtml = this.allowHtml;
		this.iconChanged();
	},
	iconChanged: function() {
		this.$.icon.setAttribute("src", this.icon);
		if (this.icon) {
			this.$.icon.show();
			if (this.iconBorderCollapse) {
				this.$.rightCap.hide();
				this.$.icon.setClassName("enyo-divider-icon");
			} else {
				this.$.icon.setClassName("enyo-divider-icon-collapse");
			}
		} else {
			this.$.icon.hide();
			this.$.rightCap.show();
		}
	},
	contentChanged: function() {
		this.$.content.setContent(this.content);
	}
});
