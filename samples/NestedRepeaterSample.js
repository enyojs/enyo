enyo.kind({
	name: "enyo.sample.NestedRepeaterSample",
	classes: "enyo-fit nested-repeater-sample",
	components: [
		{kind: "Repeater", name: "outer", onSetupItem:"setupGroup", count: 3, components: [
			{kind: "Repeater", name: "inner", onSetupItem:"setupItem", components: [
				{name:"item", classes:"nested-repeater-sample-item", components: [
					{tag:"span", name: "personNumber"},
					{tag:"span", name: "personName"}
				]}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
	},
	setupGroup: function(inSender, inEvent) {
		var item = inEvent.item;
		item.$.inner.setCount(this.people.length);
		return true;
	},
	setupItem: function(inSender, inEvent) {
		var group = inEvent.indices[1];
		var index = inEvent.index;
		var item = inEvent.item;
		var person = this.people[index];
		item.$.personNumber.setContent((group + 1) + ":" + (index+1) + ". ");
		item.$.personName.setContent(person.name);
		item.$.personName.applyStyle("color", person.sex == "male" ? "dodgerblue" : "deeppink");
		/* stop propagation */
		return true;
	},
	people: [
		{name: "Andrew", sex:"male"},
		{name: "Betty", sex:"female"},
		{name: "Christopher", sex:"male"},
		{name: "Donna", sex:"female"},
		{name: "Ephraim", sex:"male"},
		{name: "Frankie", sex:"male"},
		{name: "Gerald", sex:"male"},
		{name: "Heather", sex:"female"},
		{name: "Ingred", sex:"female"},
		{name: "Jack", sex:"male"},
		{name: "Kevin", sex:"male"},
		{name: "Lucy", sex:"female"},
		{name: "Matthew", sex:"male"},
		{name: "Noreen", sex:"female"},
		{name: "Oscar", sex:"male"},
		{name: "Pedro", sex:"male"},
		{name: "Quentin", sex:"male"},
		{name: "Ralph", sex:"male"},
		{name: "Steven", sex:"male"},
		{name: "Tracy", sex:"female"},
		{name: "Uma", sex:"female"},
		{name: "Victor", sex:"male"},
		{name: "Wendy", sex:"female"},
		{name: "Xin", sex:"male"},
		{name: "Yulia", sex:"female"},
		{name: "Zoltan"}
	]
});