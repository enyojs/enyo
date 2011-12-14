enyo.kind({
	name: "LaunchButton",
	kind: "Control",
	published: {
		icon: "images/icon.png",
		draggable: true
	},
	events: {
		ondragfinish: ""
	},
	components: [
		{name: "icon", kind: "LaunchIcon"}
	],
	create: function() {
		this.inherited(arguments);
		this.iconChanged();
	},
	iconChanged: function() {
		this.$.icon.setSrc(this.icon)
	},
	dragstartHandler: function(inSender, inEvent) {
		if (this.draggable) {
			this.dragging = true;
			inEvent.dragInfo = {
				avatar: this.createAvatar(this),
				app: this.app,
				control: this,
				source: this.owner
			};
			return true;
		}
	},
	createAvatar: function(inControl) {
		// FIXME: enyo.$.app
		return enyo.$.app.createComponent({
			kind: "LaunchButtonAvatar", 
			src: inControl.icon
		}).render();
	},
	dragHandler: function(inSender, inEvent) {
		if (this.dragging) {
			inEvent.dragInfo.avatar.drag(inEvent);
		}
	},
	dragfinishHandler: function(inSender, inEvent) {
		this.dragging = false;
		this.doDragfinish(inEvent);
		inEvent.dragInfo && inEvent.dragInfo.avatar && inEvent.dragInfo.avatar.destroy();
	}
});

enyo.kind({
	name: "LaunchIcon",
	kind: "Control",
	tagName: "img",
	attributes: {
		draggable: false
	},
	srcChanged: function() {
		this.setAttribute("src", enyo.path.rewrite(this.src));
	},
	mousedownHandler: function(inSender, inEvent) {
		if (inEvent.preventDefault) {
			inEvent.preventDefault();
		}
	}
});

enyo.kind({
	name: "LaunchButtonAvatar",
	kind: "LaunchIcon",
	className: "avatar",
	create: function() {
		this.inherited(arguments);
		this.setShowing(false);
	},
	drag: function(inEvent) {
		var s = this.hasNode().style;
		s.top = inEvent.pageY - 20 + "px";
		s.left = inEvent.pageX + 10 + "px";
		s.display = "";
	}
});
