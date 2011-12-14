apps = [
	{title: "Angry Birds", icon: "images/angrybird-icon.png", url: "http://chrome.angrybirds.com/"},
	{title: "FlickrTube", icon: "images/flickr-icon.png", url: "../flickrtube/", launchbar: true},
	{title: "Bing Maps", icon: "images/bingmaps-icon.png", url: "http://www.bing.com/maps/"},
	{title: "Email", icon: "images/email-icon.png", url: "../aura-email/", launchbar: true},
	{title: "App Catalog", icon: "images/appcatalog-icon.png", url: "http://www.hp.com/global/webos/ca/en/apps.html", page: "downloads"},
	{title: "Engadget", url: "http://www.engadget.com/", page: "favorites"},
	{title: "Verge", url: "http://www.theverge.com/", page: "favorites"}
];

app_pages = ["apps", "downloads", "favorites", "settings"];

enyo.kind({
	name: "App",
	kind: "Control",
	className: "fit app",
	components: [
		{layoutKind: "VBoxLayout", className: "fit", components: [
			{name: "toolbar", className: "toolbar", height: 28, layoutKind: "HBoxLayout", ontap: "homeAction", components: [
				{name: "title", className: "toolbar-title"},
				{width: "fill"},
				{width: 60, kind: "Clock"}
			]},
			{height: "fill", components: [
				{kind: "CardLand", className: "fit"},
				{kind: "Launcher", className: "fit", showing: false, onLaunch: "launchAction"}
			]}
			
		]},
		{kind: "LaunchBar", onLaunch: "launchAction", onLauncher: "toggleLauncher"}
	],
	touchmoveHandler: function(inSender, inEvent) {
		// FIXME: prevent over scrolling behavior on iOS
		inEvent.preventDefault();
	},
	rendered: function() {
		this.inherited(arguments);
		this.setTitle();
		this.$.launchBar.setApps(apps);
		this.$.launcher.setApps(apps);
	},
	setTitle: function(inTitle) {
		this.$.title.setContent(inTitle || "Olympus");
	},
	homeAction: function() {
		if (this.activeCard) {
			this.activeCard.setMinimized(true);
		}
	},
	launchAction: function(inSender, inApp) {
		this.showLauncher(false);
		this.makeCard(inApp);
	},
	makeCard: function(inApp) {
		var c = this.createComponent({
			container: this.$.cardLand,
			kind: "Card",
			url: inApp.url,
			title: inApp.title,
			icon: inApp.icon,
			minimized: true
		}).render();
		this.$.cardLand.refresh();
		c.launch();
		this.$.cardLand.directToIndex(this.$.cardLand.indexOfChild(c));
	},
	cardMaximized: function(inCard) {
		this.activeCard = inCard;
		this.setTitle(inCard.title);
		this.toggleToolbarSolid(true);
		this.$.launchBar.setShowing(false);
	},
	cardMinimized: function() {
		this.activeCard = null;
		this.setTitle();
		this.toggleToolbarSolid(false);
		this.$.launchBar.setShowing(true);
	},
	cardTossed: function(inCard) {
		inCard.destroy();
		this.$.cardLand.refresh();
		var l = this.$.cardLand.controls.length;
		if (this.$.cardLand.index == l) {
			this.$.cardLand.transitionToIndex(l-1);
		}
	},
	toggleToolbarSolid: function(inSolid) {
		this.$.toolbar.addRemoveClass("toolbar-solid", inSolid)
	},
	toggleLauncher: function() {
		this.showLauncher(this.$.cardLand.showing);
	},
	showLauncher: function(inShow) {
		this.$.cardLand.setShowing(!inShow);
		this.$.launcher.setShowing(inShow);
		this.setTitle(inShow ? "Launcher" : "");
		this.toggleToolbarSolid(inShow);
	}
});
