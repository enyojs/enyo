//*@protected
/**
	_enyo.RepeaterChildModelSupport_ is used internally to add the recursive
	"model" feature to children of [enyo.DataRepeater](#enyo.DataRepeater).
*/
enyo.RepeaterChildModelSupport = {
	name: "RepeaterChildModelSupport",
	constructed: enyo.super(function (sup) {
		return function () {
			// prior to create running which will begin the init components
			// path, we check to make sure we know what level we are -- if
			// we have the repeater property, we are the top-level child of a
			// repeater and we are our own _modelOwner; otherwise this needs to be
			// set to that top-level repeater child
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
			// we need to not apply this to children if the children are of kind
			// DataRepeater or sub-kinds so special handling had to be put here to ensure
			// we could fairly conveniently figure this out
			var skip = false;
			if (props.kind) {
				var k = props.kind;
				if (enyo.isString(k)) {
					// resolve any deferred constructor for the kind
					k = enyo.constructorForKind(k);
				}
				if (enyo.isFunction(k) && k.prototype && k.prototype instanceof enyo.DataRepeater) {
					skip = true;
				}
			}
			if (!skip) {
				var bd = props.bindingDefaults;
				if (bd) {
					bd = this.bindingDefaults? enyo.mixin(enyo.clone(this.bindingDefaults), bd): bd;
				} else {
					bd = this.bindingDefaults;
				}
				props.bindingDefaults = bd;
				// we want to ensure that all children recursively have this mixin so
				// they can register for model changed events without forcing a waterfall
				// for each child (and subsequently their children) of the repeater
				props.mixins = (props.mixins || []).concat([enyo.RepeaterChildModelSupport]);
			}
			// if we have a model already we just set it
			props.model = this.model;
			sup.apply(this, arguments);
		};
	}),
	modelOwnerObserver: function (p, c) {
		this.model = c;
		this.notifyObservers("model", p, c);
	},
	bindingMacros: {
		index: "_modelOwnerIndex"
	},
	/**
		We have to store a reference to the bound method so we can correctly
		remove it as an observer later.
	*/
	_modelOwnerIndex: function (lex, token, macro, prop, binding) {
		// we will remove any given source as specified because
		// this is a meta property in the chain
		binding.source = null;
		// now we return the expanded correct path
		return "._modelOwner.index";
	},
	_modelOwnerObserver: null,
	_modelOwner: null
};
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
	selectedChanged: enyo.super(function (sup) {
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
		Deliberately used to supersede the default method and set owner to this
		control so that there are no name collisions in the instance owner, and also
		so that bindings will correctly map to names.
	*/
	createClientComponents: enyo.super(function () {
		return function (components) {
			this.createComponents(components, {owner: this});
		};
	}),
	/**
		Used so that we don't stomp on any built-in handlers for the _ontap_ event.
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
