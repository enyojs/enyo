enyo.kind({
	name: "enyo.sample.DataListSample",
	classes: "enyo-fit",
	components: [
		{name: "repeater", classes: "data-repeater-sample", kind: "enyo.DataList", components: [
			{classes: "data-repeater-sample-container", components: [
				{classes: "data-repeater-sample-td-left", components: [
					{classes: "data-repeater-sample-item-index", bindFrom: ".index"}
				]},
				{components: [
					{classes: "data-repeater-sample-item-hex", bindFrom: ".hex"}
				]}
			]}
		]}
	],
	create: function () {
		this.inherited(arguments);
		var c = new enyo.Collection();
		for (var $i=0, r$=[]; r$.length<500; ++$i) {
			r$.push({index: $i, hex: "0x" + $i.toString(16).toUpperCase()});
		}
		c.add(r$);
		this.$.repeater.set("controller", c);
	}	
});
