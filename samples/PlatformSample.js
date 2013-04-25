enyo.kind({
	name: "enyo.sample.PlatformSample",
	kind: "FittableRows",
	classes: "enyo-fit platform-sample",
	components: [
		{classes: "platform-sample-divider", content: "Enyo Platform Detection"},
		{kind: "onyx.Groupbox", components: [
			{kind: "onyx.GroupboxHeader", content: "User-Agent String"},
			{name: "uaString", content: "", style: "padding: 8px;"}
		]},
		{tag: "br"},
		{kind: "onyx.Groupbox", components: [
			{kind: "onyx.GroupboxHeader", content: "Window"},
			{name: "windowAttr", content: "", style: "padding: 8px;"}
		]},
		{tag: "br"},
		{kind: "onyx.Groupbox", components: [
			{kind: "onyx.GroupboxHeader", content: "enyo.platform"},
			{name: "enyoPlatformJSON", content: "", style: "padding: 8px;"}
		]}
	],
	updateWindowSize: function() {
		var width = window.innerWidth;
		if (width === undefined) {
			width = document.documentElement.clientWidth;
		}
		var height = window.innerHeight;
		if (height === undefined) {
			height = document.documentElement.clientHeight;
		}
		this.$.windowAttr.setContent("size: " + width + "x" + height +
			", devicePixelRatio: " + window.devicePixelRatio);
	},
	create: function() {
		this.inherited(arguments);
		this.$.uaString.setContent(navigator.userAgent);
		this.$.enyoPlatformJSON.setContent(JSON.stringify(enyo.platform, null, 1));
		this.updateWindowSize();
	},
	resizeHandler: function() {
		this.inherited(arguments);
		this.updateWindowSize();
	}
});