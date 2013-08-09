enyo.RepeaterChildSupport = {
	name: "RepeaterChildSupport",
	handlers: {
		ontap: "__selectionHandler"
	},
	selected: false,
	selectedChanged: enyo.super(function (sup) {
		return function () {
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
			sup.apply(this, arguments);
		};
	}),
	decorateEvent: enyo.super(function (sup) {
		return function (sender, event) {
			event.model = this.model;
			event.child = this;
			event.index = this.index;
			sup.apply(this, arguments);
		};
	}),
	__selectionHandler: function (sender, event) {
		if (this.repeater.selection && !this.get("disabled")) {
			this.set("selected", !this.selected);
		}
	},
	create: enyo.super(function (sup) {
		return function () {
			var r$ = this.repeater,
				s$ = r$.selectionProperty;
			if (s$) {
				this.__sbid = this.binding({from: ".model." + s$, to: ".selected", kind: "enyo.BooleanBinding", twoWay: true}).id;
			}
			sup.apply(this, arguments);
		};
	}),
	destroy: enyo.super(function (sup) {
		return function () {
			if (this.__sbid) {
				var b$ = enyo.Binding.find(this.__sbid);
				if (b$) {
					b$.destroy();
				}
			}
			sup.apply(this, arguments);
		};
	})
};
