(function (enyo) {

	//*@public
	/**
		_enyo.DataRepeater_ is an abstract kind that will repeat a defined kind for
		as many records as are in its _data_ array (automatically bound from a
		controller of the kind [enyo.Collection](#enyo.Collection)).
	*/
	enyo.kind({
		name: "enyo.DataRepeater",
		kind: "enyo.View",
		//*@public
		/**
			Set this to true to allow selection support to be enabled. Default
			is true for single-selection. Note that selection stores a reference to
			the model that is selected.
		*/
		selection: true,
		/**
			Set this to true to allow multiple children to be selected simultaneously.
			If this is true, then the _selection_ property will be set to true even if
			it has previously been set to false.
		*/
		multipleSelection: false,
		/**
			In cases where selection should be detected from the state of the model,
			this property should be set to the property that the repeater should
			observe for changes. If the model changes, the repeater will reflect the
			change without needing to interact directly with the model. Note that this
			property must be a part of the model's schema or its changes will not be
			detected properly.
		*/
		selectionProperty: "",
		/**
			Use this hash to define `defaultBindingProperties` for _all_ children
			(even children of children) for this _repeater_. This can be very convenient
			to keep from needing to write the same paths many times. You can use any
			binding macros as well. Any of the properties defined here will be superceded
			by the same property defined for an individual binding.
		*/
		childBindingDefaults: null,
		//*@protected
		childMixins: [
			enyo.RepeaterChildSupport,
			enyo.RepeaterChildModelSupport
		],
		concat: ["childMixins"],
		controlParentName: "container",
		containerName: "container",
		containerOptions: {
			name: "container",
			classes: "enyo-fill enyo-data-repeater-container"
		},
		handlers: {
			onModelAdded: "modelAdded",
			onModelsAdded: "modelsAdded",
			onModelRemoved: "modelRemoved",
			onModelsRemoved: "modelsRemoved",
			onSelected: "childSelected",
			onDeselected: "childDeselected",
			onModelChanged: "modelPropertyChanged"
		},
		bindings: [
			{from: ".controller.length", to: ".length"}
		],
		batching: false,
		_selection: null,
		initComponents: function () {
			this.initContainer();
			var c = this.kindComponents || this.components || [],
				o = this.getInstanceOwner(),
				d = this.defaultProps? enyo.clone(this.defaultProps): (this.defaultProps = {});
			// ensure that children know who their binding owner is
			d._bindingTransformOwner = this;
			d.bindingDefaults = this.childBindingDefaults;
			if (c) {
				// if there are multiple components in the components block they will become nested
				// children of the default kind set for the repeater
				if (c.length > 1) {
					d.components = c;
				}
				// if there is only one child the properties will be the default kind of the repeater
				else {
					enyo.mixin(d, c[0]);
				}
				d.repeater = this;
				d.owner = o;
				d.mixins = d.mixins? d.concat(this.childMixins): this.childMixins;
			}
		},
		constructor: enyo.super(function (sup) {
			return function () {
				this._selection = [];
				sup.apply(this, arguments);
			};
		}),
		create: enyo.super(function (sup) {
			return function () {
				sup.apply(this, arguments);
				if (this.multipleSelection) {
					this.selection = true;
				}
			};
		}),
		reset: function () {
			var d = this.get("data");
			this.destroyClientControls();
			for (var i=0, d$; (d$=d[i]); ++i) {
				this.add(d$, i);
			}
		},
		add: function (record, idx) {
			var c = this.createComponent({model: record, index: idx});
			if (this.generated && !this.batching) {
				c.render();
			}
		},
		remove: function (idx) {
			var g = this.getClientControls();
			var c = g[idx || (Math.abs(g.length-1))];
			if (c) {
				c.destroy();
			}
		},
		update: function (idx) {
			var d = this.get("data"),
				g = this.getClientControls(),
				c = g[idx];
			if (d[idx] && c) {
				c.set("model", d[idx]);
			}
		},
		prune: function () {
			var g = this.getClientControls(),
				x = g.slice(this.length);
			for (var i=0, c$; (c$=x[i]); ++i) {
				c$.destroy();
			}
		},
		initContainer: function () {
			var ops = this.get("containerOptions"),
				nom = ops.name || (ops.name = this.containerName);
			this.createChrome([ops]);
			this.discoverControlParent();
			if (nom != this.containerName) {
				this.$[this.containerName] = this.$[nom];
			}
		},
		modelAdded: function (sender, event) {
			if (sender == this.controller) {
				this.add(event.model, event.index);
			}
		},
		modelsAdded: function (sender, event) {
			if (sender == this.controller) {
				this.set("batching", true);
				for (var i=0, m$; (m$=event.models[i]); ++i) {
					this.add(m$.model, m$.index);
				}
				this.set("batching", false);
			}
		},
		modelRemoved: function (sender, event) {
			if (sender == this.controller) {
				this.remove(event.index);
			}
		},
		modelsRemoved: function (sender, event) {
			if (sender == this.controller) {
				for (var i=0, m$; (m$=event.models[i]); ++i) {
					this.remove(m$.index);
				}
			}
		},
		batchingChanged: function (prev, val) {
			if (this.generated && false === val) {
				this.$[this.containerName].renderReusingNode();
			}
		},
		getChildForIndex: function (i) {
			return this.$.container.children[i];
		},
		childSelected: function (sender, event) {
			this.select(event.index);
			return true;
		},
		childDeselected: function (sender, event) {
			this.deselect(event.index);
			return true;
		},
		data: function () {
			var c = this.controller;
			if (c && c.get) {
				return c.get("data");
			}
			return null;
		},
		//*@public
		/**
			Selects the item at the given index.
		*/
		select: function (index) {
			var c$ = this.getChildForIndex(index),
				m$ = this.controller.at(index),
				s = this._selection, i$;
			if (this.selection) {
				if (this.multipleSelection) {
					if (!~enyo.indexOf(m$, s)) {
						s.push(m$);
					}
				} else {
					if (!~enyo.indexOf(m$, s)) {
						while (s.length) {
							i$ = this.controller.indexOf(s.pop());
							this.deselect(i$);
						}
						s.push(m$);
					}
				}
				if (c$) {
					c$.set("selected", true);
				}
				if (this.selectionProperty) {
					s = this.selectionProperty;
					m$.set(s, true);
				}
				this.notifyObservers("selected");
			}
		},
		/**
			De-selects the item at the given index.
		*/
		deselect: function (index) {
			var c$ = this.getChildForIndex(index),
				m$ = this.controller.at(index),
				s = this._selection, i;
			i = enyo.indexOf(m$, s);
			if (!!~i) {
				s.splice(i, 1);
			}
			if (c$) {
				c$.set("selected", false);
			}
			if (this.selectionProperty) {
				s = this.selectionProperty;
				m$.set(s, false);
			}
			this.notifyObservers("selected");
		},
		/**
			Returns a Boolean indicating whether the given model is selected.
		*/
		isSelected: function (model) {
			return !!~enyo.indexOf(model, this._selection);
		},
		/**
			Selects all items (if _multipleSelection_ is true).
		*/
		selectAll: function () {
			if (this.multipleSelection) {
				this.stopNotifications();
				var s = this._selection;
				s.length = 0;
				for (var i=0; i<this.length; ++i) {
					this.select(i);
				}
				this.startNotifications();
			}
		},
		/**
			De-selects all items.
		*/
		deselectAll: function () {
			if (this.selection) {
				this.stopNotifications();
				var s = this._selection, m$, i$;
				while (s.length) {
					m$ = s.pop();
					i$ = this.controller.indexOf(m$);
					this.deselect(i$);
				}
				this.startNotifications();
			}
		},
		dataChanged: function () {
			var c = this.controller;
			if (c) {
				this.reset();
			}
		},
		computed: {
			selected: [],
			data: ["controller"]
		},
		/**
			Returns the currently selected model (if _multipleSelection_ is false),
			or an array of all currently selected models (if it is true).
		*/
		selected: function() {
			return this.multipleSelection ? this._selection : this._selection[0];
		}
		
	});

})(enyo);
