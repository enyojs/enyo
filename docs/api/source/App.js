enyo.kind({
	name: "App",
	kind: "Control",
	className: "enyo-fit",
	layoutKind: "VBoxLayout",
	components: [
		{kind: "Doc", onFinish: "info", onReport: "report"},
		{kind: "Formatter"},
		{name: "header", height: 50, content: "Enyo API Viewer"},
		{layoutKind: "HBoxLayout", height: "fill", components: [
			{kind: "SimpleScroller", width: 300, style: "overflow: auto;", components: [
				{name: "index", className: "unselectable", allowHtml: true, style: "padding: 10px;"}
			]},
			{width: "fill", layoutKind: "VBoxLayout", components: [
				{height: 50, className: "unselectable", components: [
					{name: "group", kind: "SimpleScroller", className: "tabbar", style: "overflow: hidden; padding-bottom: 10px; background-color: #fff;", onmousedown: "tabbarSelect"},
					{name: "status", content: "Status", style: "background-color: black; color: yellow;", showing: false}
				]},
				{kind: "SimpleScroller", style: "padding: 10px; overflow: auto;", height: "fill", components: [
					{name: "docs", content: "<b>Loading...</b>", onclick: "docClick", className: "unselectable", allowHtml: true/*, ondragstart: "dragStart", ondragover: "dragover", ondragfinish: "dragFinish"*/}
				]}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.selectViewByIndex(0);
		window.onhashchange = enyo.bind(this, 'hashChange');
		enyo.asyncMethod(this.$.doc, "walkEnyo", enyo.path.rewrite("../../enyo/source"));
	},
	//
	/*dragStart: function() {
		this.st = this.$.docs.container.hasNode().scrollTop;
	},
	dragover: function(inSender, inEvent) {
		this.$.docs.container.hasNode().scrollTop = this.st - inEvent.dy;
		this.$.status.setContent("dragging");
	},
	dragFinish: function() {
	},*/
	//
	report: function(inSender, inAction, inName) {
		this.$.docs.setContent("<b>" + inAction + (inName ? "</b>: <span style='color: green;'>" + inName + "</span>" : ""));
	},
	info: function() {
		//this.$.toc.setContent(this.$.doc.buildToc());
		this.$.index.setContent(this.$.doc.buildIndex());
		this.selectTopic(window.location.hash.slice(1) || "enyo.Component");
	},
	hashChange: function(inEvent) {
		var topic = window.location.hash.slice(1);
		if (topic != this.topic) {
			this.selectTopic(topic);
		}
	},
	selectViewByIndex: function(inIndex) {
		this.$.docs.setShowing(false);
		//this.$.index.setShowing(false);
		//this.$.toc.setShowing(false);
		[this.$.docs, this.$.index, this.$.toc][inIndex].setShowing(true);
	},
	backClick: function() {
		window.history.back();
	},
	topicClick: function(inSender) {
		var item = inSender;
		if (item.topic) {
			window.location.href = "#" + item.topic;
		}
	},
	closeTopicClick: function(inSender) {
		inSender.destroy();
	},
	tocClick: function(inSender, inEvent) {
		try {
			this.selectTopic(inEvent.target.hash.slice(1));
		} catch(x) {
		}
	},
	docClick: function(inSender, inEvent) {
		try {
			this.selectTopic(inEvent.target.parentNode.hash.slice(1));
		} catch(x) {
		}
	},
	/*
	selectTopic: function(inTopic) {
		this.topic = inTopic;
		if (inTopic == "index") {
			this.selectViewByIndex(1);
		} else {
			this.selectViewByIndex(0);
			//
			var a, c = Module.topicMap[inTopic];
			if (c) {
				a = enyo.dom.byId("idx_" + inTopic);
			}
			else {
				c = this.$.walker.modules[inTopic];
				a = enyo.dom.byId("toc_" + inTopic);
			}
			var h = "(no topic)";
			if (c) {
				h = this.$.formatter.formatModule(c.path, c.module);
			}
			this.$.docs.setContent(h);
			a = document.anchors[inTopic];
			if (a) {
				a.scrollIntoView();
			}
			//
			var tab;
			var c$ = enyo.forEach(this.$.group.getClientControls(), function(inC) {
				if (inC.topic == inTopic) {
					tab = inC;
				}
			});
			if (!tab) {
				this.$.group.createComponent({kind: "TopicTab", topic: inTopic, onmousedown: "topicClick", onClose: "closeTopicClick", owner: this}).render();
			}
		}
		enyo.forEach(this.$.group.getClientControls(), function(inC, inIndex) {
			inC.addRemoveClass("active", inC.topic == inTopic);
		});
	},
	*/
	selectTopic: function(inTopic) {
		this.topic = inTopic;
		if (inTopic == "toc") {
			this.selectViewByIndex(0);
			this.$.docs.setContent(this.$.doc.buildToc());
		} else if (inTopic == "index") {
			// go to index view
			this.selectViewByIndex(1);
		} else {
			// go to content view
			this.selectViewByIndex(0);
			// find the topic object
			var c = Module.topicMap2[inTopic];
			//var c = Module.topicMap[inTopic];
			// locate the dom node in the index for this topic
			//var a = enyo.dom.byId("idx_" + inTopic);
			// text in-case-of-fail
			var h = "(no topic)";
			if (c) {
				h = this.$.formatter.format(c);
				//h = this.$.formatter.formatModule(c.path, c.module);
			}
			this.$.docs.setContent(h);
			// scroll the topic into view, if it's part of a larger document
			a = document.anchors[inTopic];
			if (a) {
				//a.scrollIntoView();
			}
		}
		// activate the correct tabs, create a new one
		var tab = null;
		enyo.forEach(this.$.group.getClientControls(), function(inC) {
			if (inC.topic == inTopic) {
				tab = inC;
			}
			inC.addRemoveClass("active", inC.topic == inTopic);
		});
		if (!tab) {
			tab = this.$.group.createComponent({kind: "TopicTab", className: "active", topic: inTopic, onclick: "topicClick", onClose: "closeTopicClick", owner: this}).render();
		}
		tab.hasNode().scrollIntoView();
	}
});

enyo.kind({
	name: "Tabbar",
	kind: "Control",
	className: "tabbar",
	removeControl: function() {
		this.inherited(arguments);
		if (!this.overflowed()) {
			this.hasNode().style.left = "0";
		}
	},
	overflowed: function() {
		var n = this.hasNode();
		return n.clientWidth - n.scrollWidth;
	},
	dragstartHandler: function() {
		this.x0 = this.hasNode().offsetLeft;
	},
	dragoverHandler: function(inSender, inEvent) {
		var l = this.x0 + inEvent.dx;
		var d = this.overflowed();
		this.hasNode().style.left = Math.min(0, Math.max(l, d)) + "px";
	},
	dragfinishHandler: function(inSender, inEvent) {
		//inEvent.preventClick();
	}
});

enyo.kind({
	name: "SimpleScroller",
	kind: "Control",
	dragstartHandler: function() {
		this.x0 = this.hasNode().scrollLeft;
		this.y0 = this.hasNode().scrollTop;
	},
	dragoverHandler: function(inSender, inEvent) {
		this.hasNode().scrollLeft = this.x0 - inEvent.dx;
		this.hasNode().scrollTop = this.y0 - inEvent.dy;
	}
});

enyo.kind({
	name: "TopicTab",
	kind: "Control",
	className: "tab",
	events: {
		onClose: ""
	},
	components: [
		{tagName: "span", name: "caption"},
		{tagName: "img", style: "margin: 0; padding: 0 0 2px 6px; vertical-align: middle;", src: "images/close.png", onmousedown: "closeDown", onclick: "doClose"}
	],
	create: function() {
		this.inherited(arguments);
		this.$.caption.setContent(this.topic);
	},
	closeDown: function(inSender, inEvent) {
		inEvent.stopPropagation();
	}
});
