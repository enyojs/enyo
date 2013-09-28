//*@public
/**
		_enyo.DataRepeater_ uses [enyo.Collection](#enyo.Collection) as its
		_controller_ to repeatedly render and synchronize records (instances of
		[enyo.Model](#enyo.Model)) to its own children. For any record in the
		collection, a new child will be rendered in this repeater. If the record is
		destroyed, the child will be destroyed. These controls will	automatically
		update when properties on the underlying record are modified if they have
		been bound using bindings (see [enyo.Binding](#enyo.Binding)).
*/
enyo.kind({
	name: "enyo.DataRepeater",
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
		This class will be applied to the repeater when _selection_ is enabled.
		The default is _selection-enabled_. If _multipleSelection_ is true, this
		class will also be applied.
	*/
	selectionClass: "selection-enabled",
	/**
		This class will be applied to the repeater when _multipleSelection_ is
		true. The default is _multiple-selection-enabled_. If _multipleSelection_
		is true, the _selectionClass_ will also be applied.
	*/
	multipleSelectionClass: "multiple-selection-enabled",
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
		Use this hash to define _defaultBindingProperties_ for _all_ children
		(even children of children) of this repeater. This can be eliminate the
		need to write the same paths many times. You can also use any	binding
		macros. Any property defined here will be superseded by the same property if
		defined for an individual binding.
	*/
	childBindingDefaults: null,
	//*@protected
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
			// if there is only one child, the properties will be the default kind of the repeater
			else {
				enyo.mixin(d, c[0]);
			}
			d.repeater = this;
			d.owner = o;
			d.mixins = d.mixins? d.mixins.concat(this.childMixins): this.childMixins;
		}
	},
	constructor: enyo.inherit(function (sup) {
		return function () {
			this._selection = [];
			// we need to pre-bind these methods so they can easily be added
			// and removed as listeners later
			var h = this._handlers = enyo.clone(this._handlers);
			for (var e in h) { h[e] = this.bindSafely(h[e]); }
			sup.apply(this, arguments);
		};
	}),
	create: enyo.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.selectionChanged();
		};
	}),
	observers: {
		selectionChanged: ["multipleSelection"]
	},
	selectionChanged: function () {
		this.addRemoveClass(this.selectionClass, this.selection);
		this.addRemoveClass(this.multipleSelectionClass, this.multipleSelection && this.selection);
	},
	//*@public
	/**
		Destroys any existing children in the repeater and creates all new children
		based on the current data.
	*/
	reset: function () {
		// use the facaded dataset because this could be any
		// collection of records
		var dd = this.get("data");
		// destroy the client controls we might already have
		this.destroyClientControls();
		// and now we create new ones for each new record we have
		for (var i=0, r; (r=dd.at(i)); ++i) { this.add(r, i); }
		this.hasReset = true;
	},
	/**
		Refreshes each control in the dataset.
	*/
	refresh: function () {
		if (!this.hasReset) { return this.reset(); }
		this.startJob("refreshing", function () {
			var dd = this.get("data"),
				cc = this.getClientControls();
			for (var i=0, c, d; (d=dd.at(i)); ++i) {
				c = cc[i];
				if (c) {
					c.set("model", d);
				} else {
					this.add(d, i);
				}
			}
			this.prune();
		}, 16);
	},
	//*@protected
	rendered: enyo.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			if (this.controller && this.length) { this.reset(); }
			this.hasRendered = true;
		};
	}),
	add: function (rec, i) {
		var c = this.createComponent({model: rec, index: i});
		if (this.generated && !this.batching) { c.render(); }
	},
	remove: function (i) {
		var g = this.getClientControls(),
			c = g[i || (Math.abs(g.length-1))];
		if (c) { c.destroy(); }
	},
	prune: function () {
		var g = this.getClientControls(), x;
		if (g.length > this.length) {
			x = g.slice(this.length);
			for (var i=0, c; (c=x[i]); ++i) { c.destroy(); }
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
	handlers: {onSelected: "childSelected", onDeselected: "childDeselected"},
	_handlers: {add: "modelsAdded", remove: "modelsRemoved", reset: "refresh"},
	controllerChanged: enyo.inherit(function (sup) {
		return function (p) {
			sup.apply(this, arguments);
			// if we have an instance of a controller then we need to register
			// for its specific events
			var c = this.controller,
				h = this._handlers, e;
			if (c && c.addListener) {
				for (e in h) { c.addListener(e, h[e]); }
			}
			// if there was a different one before then we need to unregister for
			// those events now
			if (p && p.removeListener) {
				for (e in h) { c.removeListener(e, h[e]); }
			}
		};
	}),
	modelsAdded: function (c, e, props) {
		if (c == this.controller) {
			this.set("batching", true);
			// note that these are indices when being added so they can be lazily
			// instantiated
			for (var i=0, r; (!isNaN(r=props.records[i])); ++i) { this.add(c.at(r), r); }
			this.set("batching", false);
		}
	},
	modelsRemoved: function (c, e, props) {
		if (c == this.controller) {
			// unfortunately we need to remove these in reverse order
			var idxs = enyo.keys(props.records);
			for (var i=idxs.length-1, idx; (idx=idxs[i]); --i) { this.remove(idx); }
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
	data: function () {
		return this.controller;
	},
	//*@public
	/**
		Selects the item at the given index.
	*/
	select: function (index) {
		var c = this.getChildForIndex(index),
			r = this.controller.at(index),
			s = this._selection, i;
		if (this.selection) {
			if (this.multipleSelection && (!~enyo.indexOf(r, s))) { s.push(r); }
			else if (!~enyo.indexOf(r, s)) {
				while (s.length) {
					i = this.controller.indexOf(s.pop());
					this.deselect(i);
				}
				s.push(r);
			}
			if (c) { c.set("selected", true); }
			if (this.selectionProperty) { (s=this.selectionProperty) && r.set(s, true); }
			this.notifyObservers("selected");
		}
	},
	/**
		De-selects the item at the given index.
	*/
	deselect: function (index) {
		var c = this.getChildForIndex(index),
			r = this.controller.at(index),
			s = this._selection, i;
		i = enyo.indexOf(r, s);
		if (!!~i) { s.splice(i, 1); }
		if (c) { c.set("selected", false); }
		if (this.selectionProperty) { (s=this.selectionProperty) && r.set(s, false); }
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
			for (var i=0; i<this.length; ++i) { this.select(i); }
			this.startNotifications();
		}
	},
	/**
		De-selects all items.
	*/
	deselectAll: function () {
		if (this.selection) {
			this.stopNotifications();
			var s = this._selection, m, i;
			while (s.length) {
				m = s.pop();
				i = this.controller.indexOf(m);
				this.deselect(i);
			}
			this.startNotifications();
		}
	},
	/**
		A computed property that returns the currently selected model
		(if _multipleSelection_ is false), or an immutable array of all currently
		selected models (if it is true).
	*/
	selected: function() {
		return this.multipleSelection ? this._selection : this._selection[0];
	},
	//*@protected
	dataChanged: function () {
		if (this.controller && this.hasRendered) {
			this.reset();
		}
	},
	computed: {selected: [], data: ["controller"]},
	noDefer: true,
	childMixins: [enyo.RepeaterChildSupport],
	concat: ["childMixins"],
	controlParentName: "container",
	containerName: "container",
	containerOptions: {name: "container", classes: "enyo-fill enyo-data-repeater-container"},
	bindings: [{from: ".controller.length", to: ".length"}],
	batching: false,
	_selection: null
});
