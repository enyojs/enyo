enyo.kind({
	name: "Launcher",
	kind: "Control",
	layoutKind: "VBoxLayout",
	className: "launcher",
	published: {
		apps: ""
	},
	events: {
		onLaunch: ""
	},
	components: [
		{name: "tabbar", className: "launcher-tabbar", height: 40, layoutKind: "HBoxLayout"},
		{name: "pages", kind: "CarouselFitPanels", height: "fill", axis: "h", onTransitionEnd: "swipeTransitionEnd"}
	],
	create: function() {
		this.inherited(arguments);
		this.appPages = {};
		for (var i=0, p; p=app_pages[i]; i++) {
			this.createComponent({container: this.$.tabbar, className: "launcher-tab", content: p, width: 150, ontap: "tabSelect"});
			this.createComponent({kind: "LauncherPage", container: this.$.pages, name: p, onLaunch: "doLaunch"});
			this.appPages[p] = [];
		}
		this.tabSelect(this.$.tabbar.getClientControls()[0]);
	},
	showingChanged: function() {
		this.inherited(arguments);
		if (this.showing) {
			this.$.pages.render();
			this.$.pages.directToIndex(this.tabIndex);
		}
	},
	appsChanged: function() {
		for (var i=0, a; a=this.apps[i]; i++) {
			this.appPages[a.page || "apps"].push(a);
		}
		for (p in this.appPages) {
			this.$[p].setApps(this.appPages[p]);
		}
	},
	tabSelect: function(inTab) {
		for (var i=0, t, tabs=this.$.tabbar.getClientControls(); t=tabs[i]; i++) {
			if (inTab.content == t.content) {
				this.tabIndex = i;
				t.addClass("active");
				this.$.pages.directToIndex(i);
			} else {
				t.removeClass("active");
			}
		}
	},
	swipeTransitionEnd: function(inSender) {
		this.tabSelect(this.$.tabbar.getClientControls()[inSender.index]);
	},
	dragfinishHandler: function() {
		this.allowDragSwipe = true;
	},
	dragoverHandler: function(inSender, inEvent) {
		var w = this.getBounds().width;
		if (inEvent.pageX > w-100) {
			if (this.allowDragSwipe) {
				this.$.pages.transitionToIndex(this.$.pages.index+1);
				this.allowDragSwipe = false;
			}
		} else if (inEvent.pageX < 100) {
			if (this.allowDragSwipe) {
				this.$.pages.transitionToIndex(this.$.pages.index-1);
				this.allowDragSwipe = false;
			}
		} else {
			this.allowDragSwipe = true;
		}
	}
});

enyo.kind({
	name: "LauncherPage",
	kind: "Control",
	published: {
		apps: ""
	},
	events: {
		onLaunch: ""
	},
	components: [
		{name: "client", className: "fit"},
		{name: "empty", tagName: "img", src: "images/launcher-empty-page.png", className: "launcher-empty-page-image", attributes: {draggable: false}, showing: false}
	],
	create: function() {
		this.inherited(arguments);
		this.appsChanged();
	},
	appsChanged: function() {
		this.$.empty.setShowing(!this.apps.length);
		this.$.client.destroyClientControls();
		for (var i=0, a; a=this.apps[i]; i++) {
			this.createComponent(a, {app: a, kind: "LauncherButton", container: this.$.client, ontap: "launchButtonTap"});
		}
		if (this.$.client.generated) {
			this.$.client.render();
		}
	},
	removeApp: function(inApp) {
		for (var i=0, a; a=this.apps[i]; i++) {
			if (a == inApp) {
				this.apps.splice(i, 1);
				break;
			}
		}
		this.appsChanged();
	},
	launchButtonTap: function(inSender) {
		this.doLaunch(inSender);
	},
	dropHandler: function(inSender, inEvent) {
		var info = inEvent.dragInfo;
		if (info && info.source.kind == "LauncherPage") {
			this.apps.push(info.app);
			this.appsChanged();
			info.avatar.destroy();
			info.source.removeApp(info.app);
		}
	}
});

enyo.kind({
	name: "LauncherButton",
	kind: "LaunchButton",
	layoutKind: "VBoxLayout",
	className: "launcher-button",
	published: {
		icon: "images/icon.png",
		title: ""
	},
	components: [
		{name: "icon", kind: "LaunchIcon", height: "fill"},
		{name: "title", height: 20, className: "launcher-button-title"}
	],
	create: function() {
		this.inherited(arguments);
		this.titleChanged();
	},
	titleChanged: function() {
		this.$.title.setContent(this.title || "");
	}
});
