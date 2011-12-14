enyo.kind({
	name: "App",
	kind: "SlidingPanels",
	className: "app bg fit theme-fu",
	layoutKind: "HBoxLayout",
	collapsesToEnd: false,
	components: [
		{width: 300, layoutKind: "VBoxLayout", components: [
			{height: 54, className: "aura-toolbar", components:[
				{content:"Accounts", className:"mail-label"}
			]},
			{name:"folders", height: "fill"},
			{height: 54, className: "aura-toolbar"}
		]},
		{width: 300, className: "panel-shadow bg", layoutKind: "VBoxLayout", components: [
			{height: 54, className: "aura-toolbar", components:[
				{content:"Emails", className:"mail-label"}
			]},
			{name:"emails", height: "fill"},
			{height: 54, className: "aura-toolbar", components: [
				{tagName: "img", src: "images/grabbutton.png", width: 46, attributes: {draggable: false}}
			]}
		]},
		{width: "fill", className: "panel-shadow bg", layoutKind: "VBoxLayout", components: [
			{height: 54, className: "aura-toolbar", components:[
			]},
			{name:"message", height: "fill", className:"message"},
			{height: 54, className: "aura-toolbar", components: [
				{tagName: "img", src: "images/grabbutton.png", width: 46, attributes: {draggable: false}}
			]}
		]},
	],
	rendered: function() {
		var e = new enyo.Ajax({url:"emails.json"});
		e.response(this, "loadFolders");
		e.error(this, "log");
		e.go();
	},
	loadFolders: function(inSender, inResponse) {
		this.$.folders.destroyClientControls();
		var folders = inResponse.folders;
		for (var i = 0, f; f = folders[i]; i++) {
			this.$.folders.createComponent({kind:"Folder", f:f, onLoadEmails:"loadEmails", owner: this});
		}
		this.$.folders.render();
		this.$.message.addClass("message-placeholder");
	},
	loadEmails: function(inSender) {
		this.$.emails.destroyClientControls();
		for (var i = 0, e; e = inSender.f.emails[i]; i++) {
			this.$.emails.createComponent({content:e.title, e:e, className:"email item-shadow", onclick:"loadBody", owner:this});
		}
		this.$.emails.render();
		this.$.message.addClass("message-placeholder");
	},
	loadBody: function(inSender) {
		this.$.message.removeClass("message-placeholder");
		this.$.message.setContent(inSender.e.body);
	}
});

enyo.kind({
	name:"Folder",
	kind:"Control",
	className:"folder item-shadow",
	events: {
		onLoadEmails: ""
	},
	layoutKind:"VBoxLayout",
	onclick:"doLoadEmails",
	style:"position: relative;",
	components: [
		{layoutKind:"HBoxLayout", height: 60, components:[
			{name:"folder", width:"fill"},
			{kind:"VBox", height: 60, width: 50, components:[
				{className:"unread-label", height: 20, content:"200"}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
		if (this.f) {
			this.$.folder.setContent(this.f.name);
		}
	}
});
