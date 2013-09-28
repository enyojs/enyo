(function (enyo) {
	//*@protected
	function flattenTree (p, tree) {
		var t  = tree || p.tree || (p.tree=[]),
			ch = p.children;
		for (var i=0, c; (c=ch[i]); ++i) {
			t.push(c);
			flattenTree(c, t);
		}
	}
	function updateIds (p) {
		for (var i=0, t=p.tree, pr, c; (c=t[i]); ++i) {
			pr = c.id;
			c.id = c.makeId();
			c.idChanged(pr);
			if (!p.flyweighter) { c.node = document.getElementById(c.id); }
		}
	}
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
		createClientComponents: enyo.inherit(function () {
			return function (components) {
				this.createComponents(components, {owner: this});
			};
		}),
		/**
			Override this so each time we set an _id_ on a top-level child of a _list_
			it will properly update the _computed id_ of its own children recursively.
			It should be noted that the more complex and deep the child's component hierarchy
			(whose ownership is traced back to this child) the more expensive this method.
		*/
		idChanged: enyo.inherit(function (sup) {
			return function () {
				// now we update all of the id's so they are unique as far as the controls
				// we're aware of go
				if (this.tree) { updateIds(this); }
				sup.apply(this, arguments);
				// if we're not the flyweighter we need to grab our node now
				if (!this.flyweighter) { this.node = document.getElementById(this.id); }
			};
		}),
		/**
			Used so that we don't stomp on any built-in handlers for the _ontap_ event.
		*/
		dispatchEvent: enyo.inherit(function (sup) {
			return function (name, event, sender) {
				if (name == "ontap" && !event._fromRepeaterChild) {
					this._selectionHandler(sender, event);
					event._fromRepeaterChild = true;
				}
				return sup.apply(this, arguments);
			};
		}),
		create: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				// now that we will have (should have) initialized our component tree proper
				// we can cache a flattened version of this tree
				flattenTree(this);
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