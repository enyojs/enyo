(function (enyo) {
	//*@public
	/**
		_enyo.RepeaterChildSupport_ contains methods and properties that are
		automatically applied to all children of _enyo.DataRepeater_ to assist in
		selection support. (See [enyo.DataRepeater](#enyo.DataRepeater) for details on
		how to use selection support.) _enyo.RepeaterChildSupport_ also adds the
		_model_, _child_ (control instance), and _index_ properties to all events
		emitted from the repeater's children.
	*/
	enyo.RepeaterChildSupport = {
		name: "RepeaterChildSupport",
		/**
			Indicates whether the current child is selected in the repeater.
		*/
		selected: false,
		//*@protected
		selectedChanged: enyo.inherit(function (sup) {
			return function () {
				if (this.repeater.selection) {
					this.addRemoveClass(this.selectedClass || "selected", this.selected);
					// for efficiency purposes, we now directly call this method as opposed to
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
		decorateEvent: enyo.inherit(function (sup) {
			return function (sender, event) {
				event.model = this.model;
				event.child = this;
				event.index = this.index;
				sup.apply(this, arguments);
			};
		}),
		_selectionHandler: function () {
			if (this.repeater.selection && !this.get("disabled")) {
				this.set("selected", !this.selected);
			}
		},
		/**
			Deliberately used to supersede the default method and set owner to this
			control so that there are no name collisions in the instance owner, and also
			so that bindings will correctly map to names.
		*/
		createClientComponents: enyo.inherit(function () {
			return function (components) {
				this.createComponents(components, {owner: this});
			};
		}),
		/**
			Used so that we don't stomp on any built-in handlers for the _ontap_ event.
		*/
		dispatchEvent: enyo.inherit(function (sup) {
			return function (name, event, sender) {
				if (!event._fromRepeaterChild) {
					if (!!~enyo.indexOf(name, this.repeater.selectionEvents)) {
						this._selectionHandler();
						event._fromRepeaterChild = true;
					}
				}
				return sup.apply(this, arguments);
			};
		}),
		constructed: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				var r = this.repeater,
					s = r.selectionProperty;
				// this property will only be set if the instance of the repeater needs
				// to track the selected state from the view and model and keep them in sync
				if (s) {
					var bnd = this.binding({
						from: ".model." + s,
						to: ".selected",
						oneWay: false,
						kind: enyo.BooleanBinding
					});
					this._selectionBindingId = bnd.id;
				}
			};
		}),
		destroy: enyo.inherit(function (sup) {
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
})(enyo);
