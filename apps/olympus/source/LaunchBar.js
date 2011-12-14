enyo.kind({
	name: "LaunchBar",
	kind: "Control",
	layoutKind: "HBoxLayout",
	className: "launchbar",
	published: {
		apps: ""
	},
	events: {
		onLaunch: "",
		onLauncher: ""
	},
	defaultKind: "LaunchBarButton",
	components: [
		{kind: "Control", width: "fill", components: [
			{name: "client", className: "launchbar-client"}
		]},
		{icon: "images/launcher.png", title: "Launcher", ontap: "doLauncher", draggable: false}
	],
	appsChanged: function() {
		for (var i=0, a; a=this.apps[i]; i++) {
			if (a.launchbar) {
				this.createLaunchButton(a);
			}
		}
		this.renderClient();
	},
	createLaunchButton: function(inApp) {
		this.createComponent(inApp, {container: this.$.client, ontap: "launchButtonTap", ondragfinish: "btnDragfinish"});
	},
	renderClient: function() {
		this.$.client.render();
		this.adjustClientWidth();
	},
	adjustClientWidth: function() {
		var w = 0;
		for (var i=0, c; c=this.$.client.getClientControls()[i]; i++) {
			w += c.hasNode().offsetWidth;
		}
		this.$.client.applyStyle("width", w+"px");
	},
	launchButtonTap: function(inSender) {
		this.doLaunch(inSender);
	},
	dropHandler: function(inSender, inEvent) {
		var info = inEvent.dragInfo;
		if (info && info.avatar) {
			info.target = this;
			if (info.source !== this) {
				this.createLaunchButton(inEvent.dragInfo.app);
				this.renderClient();
			}
		}
	},
	btnDragfinish: function(inSender, inEvent) {
		var info = inEvent.dragInfo;
		if (info.target !== this) {
			inSender.destroy();
			this.renderClient();
		}
	}
});

enyo.kind({
	name: "LaunchBarButton",
	kind: "LaunchButton",
	className: "launchbar-button"
})
