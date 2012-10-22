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
			{kind: "onyx.GroupboxHeader", content: "enyo.platform"},
			{name: "enyoPlatformJSON", content: "", style: "padding: 8px;"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.$.uaString.setContent(navigator.userAgent);
		this.$.enyoPlatformJSON.setContent(JSON.stringify(enyo.platform));
	}
});