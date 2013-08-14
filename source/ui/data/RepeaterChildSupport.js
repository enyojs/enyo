//*@protected
/**
	This is used internally to add the recursive "model" feature for children of
	_enyo.DataRepeaters_.
*/
enyo.RepeaterChildModelSupport = {
	name: "RepeaterChildModelSupport",
	constructed: enyo.super(function (sup) {
		return function () {
			// prior to create running which will begin the init components
			// path we check to make sure we know what level we are -- if
			// we have the repeater property we are the top level child of a
			// repeater and we are our own _modelOwner otherwise this needs to be
			// set to that top level repeater child
			var mo = this._modelOwner = this.repeater? this: this.getInstanceOwner();
			if (mo !== this) {
				this._modelOwnerObserver = mo.addObserver("model", this.modelOwnerObserver, this);
				this.notifyObservers("_modelOwner");
			}
			sup.apply(this, arguments);
		};
	}),
	destroy: enyo.super(function (sup) {
		return function () {
			var mo = this._modelOwner;
			if (mo !== this) {
				mo.removeObserver("model", this._modelOwnerObserver);
				this._modelOwnerObserver = null;
			}
			this._modelOwner = null;
			sup.apply(this, arguments);
		};
	}),
	adjustComponentProps: enyo.super(function (sup) {
		return function (props) {
			sup.apply(this, arguments);
			// if we have a model already we just set it
			props.model = this.model;
			// we want to ensure that all children recursively have this mixin so
			// they can register for model changed events without forcing a waterfall
			// for each child (and subsequently their children) of the repeater
			props.mixins = (props.mixins || []).concat([enyo.RepeaterChildModelSupport]);
		};
	}),
	modelOwnerObserver: function (p, c) {
		this.model = c;
		this.notifyObservers("model", p, c);
	},
	bindingMacros: {
		index: "._modelOwner.index"
	},
	/**
		We have to store a reference to the bound method so we can correctly
		remove it as an observer later.
	*/
	_modelOwnerObserver: null,
	_modelOwner: null
};
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
	/**
		Deliberately used to supercede the default method and set owner
		to this control so that there isn't name collision in the instance
		owner and also so that bindings will be able to correctly map to
		names.
	*/
	createClientComponents: enyo.super(function () {
		return function (components) {
			this.createComponents(components, {owner: this});
		};
	}),
	/**
		So we don't stomp on any built-in handlers for the ontap
		event.
	*/
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
