enyo.kind({
	name: "enyo.sample.DrawerSample",
	classes: "drawer-sample",
	components: [
		{content: "Drawers", classes:"drawer-sample-divider"},
		{content: "Activate (V)", classes: "drawer-sample-box drawer-sample-mtb", ontap:"activateDrawer"},
		{name: "drawer", kind: "enyo.Drawer", components: [
			{content: "Vertical Drawer<br>Vertical Drawer<br>Vertical Drawer<br>Vertical Drawer", allowHtml: true, classes: "drawer-sample-box drawer-sample-mtb"},
			{components: [
				{kind: "enyo.Checkbox", name: "animateSetting", value: true},
				{content:"Animated", classes:"enyo-inline onyx-sample-animate-label"}
			]},
			{content: "Activate (V) (Toggled Animation)", classes: "drawer-sample-box drawer-sample-mtb", ontap:"activateDrawer2"},
			{name: "drawer2", kind: "enyo.Drawer", animated: true, components: [
				{content: "Vertical Drawer<br>Vertical Drawer<br>Vertical Drawer<br>Vertical Drawer", allowHtml: true, classes: "drawer-sample-box drawer-sample-mtb"}
			]},
			{content: "Vertical Drawer<br>Vertical Drawer<br>Vertical Drawer<br>Vertical Drawer", allowHtml: true, classes: "drawer-sample-box drawer-sample-mtb"}
		]},
		{content: "Foo<br>Foo", allowHtml: true, classes: "drawer-sample-box drawer-sample-mtb"},
		{kind: "FittableColumns", fit: true, ontap: "activateColumnsDrawer", classes: "drawer-sample-box drawer-sample-mtb drawer-sample-o", components: [
			{content: "Activate (H)", classes: "drawer-sample-box drawer-sample-mlr"},
			{name: "columnsDrawer", orient: "h", kind: "enyo.Drawer", open: false, components: [
				{content: "H-Drawer", classes: "drawer-sample-box drawer-sample-mlr"}
			]},
			{content: "Foo", fit: true, classes: "drawer-sample-box drawer-sample-mlr drawer-sample-o"},
			{content: "Foo", classes: "drawer-sample-box drawer-sample-mlr"}
		]},
		{content: "Foo", classes: "drawer-sample-box drawer-sample-mtb"}
	],
	activateDrawer: function() {
		this.$.drawer.setOpen(!this.$.drawer.open);
	},
	activateDrawer2: function() {
		this.$.drawer2.setAnimated(this.$.animateSetting.getValue());
		this.$.drawer2.setOpen(!this.$.drawer2.open);
	},
	activateColumnsDrawer: function() {
		this.$.columnsDrawer.setOpen(!this.$.columnsDrawer.open);
		return true;
	}
});
