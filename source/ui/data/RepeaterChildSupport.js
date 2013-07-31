enyo.createMixin({
	name: "enyo.RepeaterChildSupport",
	handlers: {
		ontap: "__selectionHandler"
	},
	selected: false,
	selectedChanged: function () {
		if (this.repeater.selection) {
			this.addRemoveClass(this.selectionClass || "selected", this.selected);
			if (this.selected) {
				this.bubble("onSelected");
			} else {
				this.bubble("onDeselected");
			}
		}
	},
	decorateEvent: function (sender, event) {
		event.model = this.model;
		event.child = this;
		this.inherited(arguments);
	},
	create: function () {
		this.__sbid = this.binding({from: ".model.selected", to: ".selected", twoWay: true, kind: "enyo.BooleanBinding"}).id;
	},
	destroy: function () {
		var $b = enyo.Binding.find(this.__sbid);
		if ($b) {
			$b.destroy();
		}
	},
	__selectionHandler: function (sender, event) {
		if (this.repeater.selection) {
			this.set("selected", !this.selected);
		}
	}
});
