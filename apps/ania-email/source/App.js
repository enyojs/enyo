enyo.kind({
	name: "App",
	kind:"SlidingPane",
	components:[
		{layoutKind:"VFlexLayout", minWidth:"300px", fixedWidth: true, components:[
			{kind:"Toolbar", className:"enyo-toolbar-light", components: [
				{content:"Accounts", kind:"Control"}
			]},
			{name:"folders", flex: 1, kind:"VirtualList", onSetupRow:"loadFolders", components:[
				{kind:"Item", layoutKind:"HFlexLayout", onclick:"folderClick", components:[
					{name:"folderName", flex:1, style:"font-weight:bold; color:black;"},
					{name:"unreadCount", content:"200", className:"unread-label"}
				]}
			]},
			{kind:"Toolbar", className:"enyo-toolbar-light"}
		]},
		{layoutKind:"VFlexLayout", minWidth:"300px", fixedWidth: true, components:[
			{kind:"Toolbar", className:"enyo-toolbar-light", components:[
				{content:"Emails", kind:"Control"}
			]},
			{name:"emails", flex: 1, kind:"VirtualList", onSetupRow:"loadEmails", components: [
				{kind:"Item", onclick:"emailClick", components: [
					{name:"from"},
					{name:"emailSubject"}
				]}
			]},
			{kind:"Toolbar", className:"enyo-toolbar-light", components:[
				{kind:"GrabButton"}
			]}
		]},
		{layoutKind:"VFlexLayout", components: [
			{kind:"Toolbar", content:"", className:"enyo-toolbar-light"},
			{name:"header", className:"message-header", showing: false, components: [
				{layoutKind:"HFlexLayout", components: [
					{content:"From:", className:"header-label"},
					{name:"headerFrom"}
				]},
				{layoutKind:"HFlexLayout", components: [
					{content:"CC:", className:"header-label"},
					{name:"headerCC"}
				]},
				{layoutKind:"HFlexLayout", components: [
					{content:"BCC:", className:"header-label"},
					{name:"headerBCC"}
				]}
			]},
			{name:"message", flex: 1, className:"message message-placeholder"},
			{kind:"Toolbar", className:"enyo-toolbar-light", components:[
				{kind:"GrabButton"}
			]}
		]}
	],
	loadData: function() {
		if (!this.db) {
			var e = new enyo.Ajax({url:"emails.json"});
			e.response(this, "dataLoaded");
			e.error(this, "log");
			e.go();
		}
	},
	dataLoaded: function(inSender, inResponse) {
		this.db = inResponse;
		this.$.folders.punt();
	},
	loadFolders: function(inSender, inIndex) {
		if (!this.db) {
			this.loadData();
		} else {
			var f = this.db.folders[inIndex];
			if (f) {
				this.$.folderName.setContent(f.name);
				return true;
			}
		}
	},
	loadEmails: function(inSender, inIndex) {
		if (this.db && this.folder) {
			var e = this.folder.emails[inIndex];
			if (e) {
				e.from = this.randomName();
				if (~~(Math.random() * 2) > 0) {
					e.cc = this.randomName();
				}
				if (~~(Math.random() * 4) == 0) {
					e.bcc = this.randomName();
				}
				this.$.from.setContent(e.from);
				this.$.emailSubject.setContent(e.subject);
				return true;
			}
		}
	},
	folderClick: function(inSender, inEvent) {
		this.folder = this.db.folders[inEvent.rowIndex];
		this.$.emails.punt();
	},
	emailClick: function(inSender, inEvent) {
		var e = this.folder ? this.folder.emails[inEvent.rowIndex] : null;
		this.$.message.addRemoveClass("message-placeholder", !e);
		this.$.message.setContent(e ? e.body : null);
		this.$.header.setShowing(true);
		this.$.headerFrom.setShowing(e.from);
		this.$.headerFrom.setContent(e.from);
		this.$.headerCC.setShowing(e.cc);
		this.$.headerCC.setContent(e.cc);
		this.$.headerBCC.setShowing(e.bcc);
		this.$.headerBCC.setContent(e.bcc);
	},
	randomName: function() {
		return ["Squiz Nard", "Foo Bar", "Joe Baz", "Jimmie Quxx"][~~(Math.random()*4)];
	}
});
