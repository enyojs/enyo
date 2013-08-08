enyo.createMixin({
	name: "enyo.RepeaterChildSupport",
	handlers: {
		ontap: "__selectionHandler"
	},
	selected: false,
	selectedChanged: function () {
		if (this.repeater.selection) {
			this.addRemoveClass(this.selectionClass || "selected", this.selected);
			// for efficiency purposes we now directly call this method as opposed to
			// forcing a synchronous event dispatch
			if (this.selected && !this.repeater.isSelected(this.model)) {
				this.repeater.select(this.index);
			} else if (!this.selected && this.repeater.isSelected(this.model)) {
				this.repeater.deselect(this.index);
			}
		}
	},
	decorateEvent: function (sender, event) {
		event.model = this.model;
		event.child = this;
		event.index = this.index;
		this.inherited(arguments);
	},
	__selectionHandler: function (sender, event) {
		if (this.repeater.selection && !this.get("disabled")) {
			this.set("selected", !this.selected);
		}
	},
	create: function () {
		var r$ = this.repeater,
			s$ = r$.selectionProperty;
		if (s$) {
			this.__sbid = this.binding({from: ".model." + s$, to: ".selected", kind: "enyo.BooleanBinding", twoWay: true}).id;
		}
	},
	destroy: function () {
		if (this.__sbid) {
			var b$ = enyo.Binding.find(this.__sbid);
			if (b$) {
				b$.destroy();
			}
		}
	}
});
