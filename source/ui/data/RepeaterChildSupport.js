//*@public
/**
	These methods and properties are automatically applied to all children
	of _enyo.DataRepeaters_ for assistance in _selection support_. See the documentation
	for _enyo.DataRepeater_ for more details on how to use _selection support_. It also
	adds the _model_, _child_ (control instance), and _index_ property to all events
	emitted from children of the _repeater_.
*/
enyo.RepeaterChildSupport = {
	name: "RepeaterChildSupport",
	/**
		This property is used to determine the selected state of the current
		child in the _repeater_.
	*/
	selected: false,
	//*@protected
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
	_selectionHandler: function (sender, event) {
		if (this.repeater.selection && !this.get("disabled")) {
			this.set("selected", !this.selected);
		}
	},
	dispatchEvent: enyo.super(function (sup) {
		return function (name, event, sender) {
			if (name == "ontap") {
				this._selectionHandler(sender, event);
			}
			return sup.apply(this, arguments);
		};
	}),
	create: enyo.super(function (sup) {
		return function () {
			sup.apply(this, arguments);
			var r = this.repeater,
				s = r.selectionProperty;
			// this property will only be set if the instance of the repeater needs
			// to track the selected state from the view and model and keep them in sync
			if (s) {
				var bnd = this.binding({from: ".model." + s, to: ".selected", oneWay: false, kind: enyo.BooleanBinding});
				this._selectionBindingId = bnd.id;
			}
		};
	}),
	destroy: enyo.super(function (sup) {
		return function () {
			if (this._selectionBindingId) {
				var b$ = enyo.Binding.find(this._selectionBindingId);
				if (b$) {
					b$.destroy();
				}
			}
			sup.apply(this, arguments);
		};
	}),
	_selectionBindingId: null
};
